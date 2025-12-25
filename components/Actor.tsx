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
  const meshRef = useRef<THREE.Mesh>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const engineMode = engineState.mode;

  const meshAsset = MESH_ASSETS.find(m => m.id === data.assetId);
  const lightAsset = LIGHT_ASSETS.find(l => l.id === data.assetId);
  const materialAsset = MATERIAL_ASSETS.find(m => m.id === data.materialId) || MATERIAL_ASSETS[0];
  const physicsAsset = PHYSICS_ASSETS.find(p => p.id === data.physicsId);

  // Sync position from state ONLY if we are paused or transforming
  useEffect(() => {
    if (rbRef.current && (paused || isTransforming)) {
      rbRef.current.setTranslation(new THREE.Vector3(...data.position), true);
      const euler = new THREE.Euler(...data.rotation);
      const quat = new THREE.Quaternion().setFromEuler(euler);
      rbRef.current.setRotation(quat, true);
    }
  }, [data.position, data.rotation, paused, isTransforming]);

  useFrame(() => {
    if (!vortexEnabled || paused || isTransforming || !rbRef.current) return;
    
    const rb = rbRef.current;
    if (rb.isDynamic()) {
      const { x, y, z } = rb.translation();
      
      // Calculate pull
      V_FORCE.set(V_CENTER.x - x, V_CENTER.y - y, V_CENTER.z - z);
      V_FORCE.normalize().multiplyScalar(vortexStrength * 0.15);
      
      // Calculate swirl
      V_SWIRL.set(-(V_CENTER.z - z), 0, V_CENTER.x - x);
      V_SWIRL.normalize().multiplyScalar(vortexStrength * 0.4);
      
      V_FORCE.add(V_SWIRL);
      rb.applyImpulse(V_FORCE, true);
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
    if (paused || isTransforming) return;
    const impulse = event.totalForceMagnitude || 0;
    if (impulse > 60) {
      onWarning('KINETIC', `Stress Peak: ${impulse.toFixed(0)}N on ${data.name}`);
    }
  };

  const handleTransformStart = () => {
    setIsTransforming(true);
    if (rbRef.current) {
      // Set to kinematic to prevent physics simulation fighting the user drag
      rbRef.current.setBodyType(2, true);
    }
  };

  const handleTransformEnd = () => {
    setIsTransforming(false);
    if (!meshRef.current || !rbRef.current) return;
    
    // 1. Get the final world transform of the dragged mesh
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);
    
    const worldQuat = new THREE.Quaternion();
    meshRef.current.getWorldQuaternion(worldQuat);
    
    const worldRot = new THREE.Euler();
    worldRot.setFromQuaternion(worldQuat);
    
    const scale = meshRef.current.scale.clone();
    
    // 2. Move the parent RigidBody to this new world position/rotation
    rbRef.current.setTranslation(worldPos, true);
    rbRef.current.setRotation(worldQuat, true);
    
    // 3. Reset the mesh local transform to zero. 
    // Since the mesh is a child of the RigidBody, if we don't reset this, 
    // the mesh will have the local offset + the new parent position, causing a double-move.
    meshRef.current.position.set(0, 0, 0);
    meshRef.current.rotation.set(0, 0, 0);
    meshRef.current.quaternion.set(0, 0, 0, 1);
    
    // 4. Update state
    onUpdate({ 
        position: [worldPos.x, worldPos.y, worldPos.z],
        rotation: [worldRot.x, worldRot.y, worldRot.z],
        scale: [scale.x, scale.y, scale.z]
    });
    
    // 5. Restore physics
    const type = (physicsAsset && !paused) ? 0 : 1; 
    rbRef.current.setBodyType(type, true); 
  };

  // Logic: In Editor Mode, objects are Dynamic if sim is not paused, unless being transformed.
  const isDynamic = physicsAsset && !paused && !isTransforming;

  return (
    <>
      <RigidBody
        ref={rbRef}
        position={data.position}
        rotation={data.rotation as any}
        type={isDynamic ? 'dynamic' : (isTransforming ? 'kinematicPosition' : 'fixed')}
        colliders={false} 
        density={physicsAsset?.density ?? 1}
        friction={physicsAsset?.friction ?? 0.5}
        restitution={physicsAsset?.restitution ?? 0.2}
        onCollisionEnter={handleCollision}
        onContactForce={handleCollision}
        key={`${data.id}-${paused ? 'paused' : 'live'}`}
      >
        <mesh
          ref={meshRef}
          geometry={geometry}
          material={material}
          scale={data.scale}
          castShadow={!lightAsset}
          receiveShadow={!lightAsset}
          onClick={(e) => {
            if (engineMode !== 'PLAY') {
               e.stopPropagation();
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

      {isSelected && engineMode === 'EDITOR' && (
        <TransformControls 
            object={meshRef.current as any} 
            mode={engineState.transformMode} 
            onMouseDown={handleTransformStart}
            onMouseUp={handleTransformEnd}
        />
      )}
    </>
  );
};

export default Actor;