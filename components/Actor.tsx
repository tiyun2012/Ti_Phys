import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, BallCollider, CuboidCollider, CylinderCollider, CollisionEnterHandler } from '@react-three/rapier';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { SceneObject, EngineState, SimulationWarning } from '../types';
import { MATERIAL_ASSETS, PHYSICS_ASSETS, MESH_ASSETS, LIGHT_ASSETS } from '../constants';

interface ActorProps {
  data: SceneObject;
  isSelected: boolean;
  engineState: EngineState;
  onSelect: () => void;
  onUpdate: (updates: Partial<SceneObject>) => void;
  onWarning: (type: SimulationWarning['type'], message: string) => void;
  vortexEnabled?: boolean;
  vortexStrength?: number;
  paused?: boolean;
}

const V_CENTER = new THREE.Vector3(0, 5, 0);
const V_FORCE = new THREE.Vector3();
const V_SWIRL = new THREE.Vector3();

const Actor: React.FC<ActorProps> = ({ data, isSelected, engineState, onSelect, onUpdate, onWarning, vortexEnabled, vortexStrength = 20, paused }) => {
  const rbRef = useRef<RapierRigidBody>(null);
  const dummyRef = useRef<THREE.Group>(null); // External controller target
  
  const [isDragging, setIsDragging] = useState(false);
  const engineMode = engineState.mode;

  const meshAsset = MESH_ASSETS.find(m => m.id === data.assetId);
  const lightAsset = LIGHT_ASSETS.find(l => l.id === data.assetId);
  const materialAsset = MATERIAL_ASSETS.find(m => m.id === data.materialId) || MATERIAL_ASSETS[0];
  const physicsAsset = PHYSICS_ASSETS.find(p => p.id === data.physicsId);

  // 1. Sync Dummy to Data initially or when not selected/dragging
  useEffect(() => {
    if (dummyRef.current && !isDragging) {
      dummyRef.current.position.set(...data.position);
      dummyRef.current.rotation.set(...data.rotation);
      dummyRef.current.scale.set(...data.scale);
    }
  }, [data.position, data.rotation, data.scale, isDragging]);

  // 2. Sync RigidBody to Data (Initial or external updates)
  useEffect(() => {
    if (rbRef.current && !isDragging && paused) {
       // If paused, we force the RB to the data position
       rbRef.current.setTranslation(new THREE.Vector3(...data.position), true);
       const euler = new THREE.Euler(...data.rotation);
       const quat = new THREE.Quaternion().setFromEuler(euler);
       rbRef.current.setRotation(quat, true);
    }
  }, [data.position, data.rotation, paused, isDragging]);

  // 3. Frame Loop
  useFrame(() => {
    if (!rbRef.current) return;

    // Control Logic
    if (isSelected && engineMode === 'EDITOR' && dummyRef.current) {
        if (isDragging) {
             // Dragging: Gizmo (Dummy) -> Physics (RB)
             const targetPos = dummyRef.current.position;
             const targetRot = dummyRef.current.rotation;
             const targetQuat = new THREE.Quaternion().setFromEuler(targetRot);
             
             if (paused) {
                 // Instant update if paused (teleport)
                 rbRef.current.setTranslation(targetPos, true);
                 rbRef.current.setRotation(targetQuat, true);
             } else {
                 // Kinematic update if running (physically interact)
                 rbRef.current.setNextKinematicTranslation(targetPos);
                 rbRef.current.setNextKinematicRotation(targetQuat);
             }
        } else if (!paused && rbRef.current.isDynamic()) {
            // Selected but NOT Dragging (and running): Physics (RB) -> Gizmo (Dummy)
            // Keep the gizmo attached to the moving object
            const t = rbRef.current.translation();
            const r = rbRef.current.rotation();
            dummyRef.current.position.set(t.x, t.y, t.z);
            dummyRef.current.quaternion.set(r.x, r.y, r.z, r.w);
        }
    }

    // Vortex Logic (Only when simulating and not being dragged)
    if (vortexEnabled && !paused && !isDragging) {
      const rb = rbRef.current;
      if (rb.isDynamic()) {
        const { x, y, z } = rb.translation();
        
        V_FORCE.set(V_CENTER.x - x, V_CENTER.y - y, V_CENTER.z - z);
        V_FORCE.normalize().multiplyScalar(vortexStrength * 0.15);
        
        V_SWIRL.set(-(V_CENTER.z - z), 0, V_CENTER.x - x);
        V_SWIRL.normalize().multiplyScalar(vortexStrength * 0.4);
        
        V_FORCE.add(V_SWIRL);
        rb.applyImpulse(V_FORCE, true);
      }
    }
  });

  const geometry = useMemo(() => {
    if (lightAsset) return new THREE.SphereGeometry(0.2, 8, 8);
    const shape = meshAsset?.shape || 'cube';
    switch (shape) {
      case 'cube': return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere': return new THREE.SphereGeometry(0.6, 32, 32);
      case 'rock': return new THREE.DodecahedronGeometry(0.7, 0);
      case 'torus': return new THREE.TorusGeometry(0.5, 0.2, 16, 32);
      case 'cylinder': return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      default: return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [meshAsset?.shape, lightAsset]);

  const material = useMemo(() => {
    if (lightAsset) return new THREE.MeshBasicMaterial({ color: data.color || '#ffffff', wireframe: true });
    return new THREE.MeshPhysicalMaterial({
      color: materialAsset.color,
      roughness: materialAsset.roughness,
      metalness: materialAsset.metalness,
      emissive: materialAsset.emissive || '#000000',
      emissiveIntensity: materialAsset.emissiveIntensity || 0,
      transparent: materialAsset.transparent,
      opacity: materialAsset.opacity ?? 1,
      clearcoat: 0.5,
    });
  }, [materialAsset, lightAsset, data.color]);

  const handleCollision = (event: any) => {
    if (paused || isDragging) return;
    const impulse = event.totalForceMagnitude || 0;
    if (impulse > 60) {
      onWarning('KINETIC', `Stress Peak: ${impulse.toFixed(0)}N on ${data.name}`);
    }
  };

  const handleDragStart = () => {
      setIsDragging(true);
      // Ensure we wake up the body if it was sleeping
      rbRef.current?.wakeUp();
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    if (dummyRef.current && rbRef.current) {
        const { position, rotation, scale } = dummyRef.current;
        onUpdate({
            position: [position.x, position.y, position.z],
            rotation: [rotation.x, rotation.y, rotation.z],
            scale: [scale.x, scale.y, scale.z]
        });
        
        // Wake up physics on release so it falls/moves immediately
        rbRef.current.wakeUp();
    }
  };

  // Logic: 
  // - If Paused: Kinematic (Frozen in place, but movable via Gizmo)
  // - If Dragging: Kinematic (Controlled by Gizmo)
  // - Otherwise: Dynamic (Controlled by Physics)
  const rigidBodyType = (isDragging || paused) ? 'kinematicPosition' : 'dynamic';

  return (
    <>
      {/* Dummy Object for Gizmo Control - Outside the Physics World */}
      {isSelected && engineMode === 'EDITOR' && (
        <group ref={dummyRef} position={data.position} rotation={data.rotation as any} scale={data.scale} />
      )}

      {/* Actual Physics Object */}
      <RigidBody
        ref={rbRef}
        position={data.position}
        rotation={data.rotation as any}
        type={rigidBodyType} 
        colliders={false} 
        density={physicsAsset?.density ?? 1}
        friction={physicsAsset?.friction ?? 0.5}
        restitution={physicsAsset?.restitution ?? 0.2}
        onCollisionEnter={handleCollision}
        onContactForce={handleCollision}
        // Force remount only if switching between play/editor to reset state, but keep stable during selection
        key={`${data.id}-${engineMode === 'PLAY' ? 'play' : 'edit'}`} 
      >
        <mesh
          geometry={geometry}
          material={material}
          scale={data.scale}
          castShadow={!lightAsset}
          receiveShadow={!lightAsset}
          onClick={(e) => {
            if (engineMode !== 'PLAY') {
               e.stopPropagation();
               // Immediate sync on click to prevent jumps if physics moved it
               if (rbRef.current) {
                  const t = rbRef.current.translation();
                  const r = rbRef.current.rotation();
                  const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w));
                  // We update the data, which updates the dummy position via useEffect
                  onUpdate({ 
                      position: [t.x, t.y, t.z], 
                      rotation: [euler.x, euler.y, euler.z] 
                  });
               }
               onSelect();
            }
          }}
        >
          {isSelected && engineMode !== 'PLAY' && (
             <mesh scale={[1.1, 1.1, 1.1]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#00ffff" wireframe />
             </mesh>
          )}
          
          {lightAsset?.lightType === 'point' && <pointLight intensity={data.intensity || 5} color={data.color || '#ffffff'} castShadow />}
          {lightAsset?.lightType === 'spot' && <spotLight intensity={data.intensity || 10} color={data.color || '#ffffff'} castShadow angle={0.5} />}
          {lightAsset?.lightType === 'directional' && <directionalLight intensity={data.intensity || 1} color={data.color || '#ffffff'} castShadow />}
        </mesh>

        {!lightAsset && (
          meshAsset?.shape === 'sphere' ? <BallCollider args={[0.6]} /> :
          meshAsset?.shape === 'cube' ? <CuboidCollider args={[0.5, 0.5, 0.5]} /> :
          meshAsset?.shape === 'cylinder' ? <CylinderCollider args={[0.5, 0.5]} /> :
          <BallCollider args={[0.7]} />
        )}
      </RigidBody>

      {/* Gizmo attached to Dummy */}
      {isSelected && engineMode === 'EDITOR' && dummyRef.current && (
        <TransformControls 
            object={dummyRef.current} 
            mode={engineState.transformMode} 
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
        />
      )}
    </>
  );
};

export default Actor;