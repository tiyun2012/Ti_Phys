
import React, { useMemo, useRef, useState } from 'react';
import { RigidBody, RapierRigidBody, CollisionEnterHandler, BallCollider, CuboidCollider, ContactForceHandler } from '@react-three/rapier';
import { ThreeEvent } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { EditorConfig, LevelObject, SimulationWarning } from '../types';
import { MATERIALS_TABLE } from '../constants';
import '../types';

interface LevelEditorProps {
  config: EditorConfig;
  objects: LevelObject[];
  onAddObject: (obj: LevelObject) => void;
  onUpdateObject: (id: string, updates: Partial<LevelObject>) => void;
  onSelectObject: (id: string | null) => void;
  onTriggerConflict: (type: SimulationWarning['type'], message: string) => void;
}

const LevelEditor: React.FC<LevelEditorProps> = ({ config, objects, onAddObject, onUpdateObject, onSelectObject, onTriggerConflict }) => {
  
  const handleGroundClick = (e: ThreeEvent<PointerEvent>) => {
    if (!config.active) return;
    e.stopPropagation();

    if (config.selectedObjectId) {
      onSelectObject(null);
      return;
    }

    const spawnPos: [number, number, number] = [e.point.x, e.point.y + 0.75, e.point.z];
    const id = crypto.randomUUID();
    onAddObject({
      id,
      shape: config.selectedShape,
      material: config.selectedMaterial,
      position: spawnPos,
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    });
  };

  return (
    <>
      {config.active && (
        <>
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -1.9, 0]} 
              visible={false} 
              onPointerDown={handleGroundClick}
            >
              <planeGeometry args={[100, 100]} />
            </mesh>
            <gridHelper args={[100, 100, 0x444444, 0x222222]} position={[0, -1.95, 0]} />
        </>
      )}

      {objects.map((obj) => (
        <SingleLevelObject 
            key={obj.id} 
            data={obj} 
            isEditing={config.active}
            isSelected={config.selectedObjectId === obj.id}
            onSelect={() => config.active && onSelectObject(obj.id)}
            onUpdate={(updates) => onUpdateObject(obj.id, updates)}
            onTriggerConflict={onTriggerConflict}
        />
      ))}
    </>
  );
};

interface SingleLevelObjectProps {
    data: LevelObject;
    isEditing: boolean;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<LevelObject>) => void;
    onTriggerConflict: (type: SimulationWarning['type'], message: string) => void;
}

const SingleLevelObject: React.FC<SingleLevelObjectProps> = React.memo(({ data, isEditing, isSelected, onSelect, onUpdate, onTriggerConflict }) => {
    const rbRef = useRef<RapierRigidBody>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const matData = MATERIALS_TABLE[data.material];
    
    const geometry = useMemo(() => {
        switch (data.shape) {
            case 'cube': return new THREE.BoxGeometry(1, 1, 1);
            case 'sphere': return new THREE.SphereGeometry(0.6, 32, 32);
            case 'rock': return new THREE.DodecahedronGeometry(0.7, 0);
            default: return new THREE.BoxGeometry(1, 1, 1);
        }
    }, [data.shape]);

    const material = useMemo(() => {
        return new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(matData.visual.color),
            roughness: matData.visual.roughness,
            metalness: matData.visual.metalness,
            emissive: matData.visual.emissive ? new THREE.Color(matData.visual.emissive) : new THREE.Color(0x000000),
            emissiveIntensity: matData.visual.emissiveIntensity || 0,
            transparent: matData.visual.transparent || false,
            opacity: matData.visual.opacity ?? 1.0,
            clearcoat: matData.visual.clearcoat || 0,
            clearcoatRoughness: matData.visual.clearcoatRoughness || 0,
            flatShading: data.shape === 'rock',
        });
    }, [data.material, data.shape]);

    const onTransformChange = () => {
        if (!meshRef.current || !rbRef.current || !isDragging) return;
        const worldPos = new THREE.Vector3();
        meshRef.current.getWorldPosition(worldPos);
        rbRef.current.setNextKinematicTranslation(worldPos);
    };

    const onMouseDown = () => {
        setIsDragging(true);
        if (rbRef.current) rbRef.current.setBodyType(2, true); 
    };

    const onMouseUp = () => {
        setIsDragging(false);
        if (rbRef.current && meshRef.current) {
            rbRef.current.setBodyType(0, true); 
            const worldPos = new THREE.Vector3();
            meshRef.current.getWorldPosition(worldPos);
            onUpdate({ position: [worldPos.x, worldPos.y, worldPos.z] });
        }
    };

    // Fix: Using any type to allow shared usage of collision and force event data which contain different properties.
    const handleCollision = (event: any) => {
      const impulse = event.totalForceMagnitude || 0;
      if (impulse > 25) {
        onTriggerConflict('KINETIC', `Extreme Impact: ${impulse.toFixed(2)}N detected.`);
      }
      if (data.material === 'void') {
        onTriggerConflict('VOID', 'Singularity interaction detected in local space.');
      }
      if (data.material === 'magma' && impulse > 5) {
        onTriggerConflict('THERMAL', 'Thermal transfer overflow during collision.');
      }
    };

    return (
        <>
            <RigidBody
                ref={rbRef}
                position={data.position}
                rotation={data.rotation as any}
                restitution={matData.physics.restitution}
                friction={matData.physics.friction}
                density={matData.physics.density}
                colliders={false} // Disable auto-collider to avoid dispatcher errors
                onCollisionEnter={handleCollision}
                onContactForce={handleCollision}
            >
                <mesh 
                    ref={meshRef}
                    geometry={geometry} 
                    material={material} 
                    scale={data.scale}
                    castShadow 
                    receiveShadow
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        onSelect();
                    }}
                >
                    {isSelected && isEditing && (
                        <mesh scale={[1.1, 1.1, 1.1]}>
                            <boxGeometry args={[1, 1, 1]} />
                            <meshBasicMaterial color="#ef4444" wireframe />
                        </mesh>
                    )}
                </mesh>
                
                {/* Explicit Colliders */}
                {data.shape === 'sphere' ? <BallCollider args={[0.6]} /> :
                 data.shape === 'cube' ? <CuboidCollider args={[0.5, 0.5, 0.5]} /> :
                 <BallCollider args={[0.7]} /> // Default for rock/others
                }
            </RigidBody>

            {isSelected && isEditing && (
                <TransformControls 
                    object={meshRef.current as any} 
                    mode="translate"
                    onMouseDown={onMouseDown}
                    onMouseUp={onMouseUp}
                    onChange={onTransformChange}
                />
            )}
        </>
    );
});

export default LevelEditor;
