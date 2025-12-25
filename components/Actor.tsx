
import React, { useMemo, useRef } from 'react';
import { RigidBody, RapierRigidBody, BallCollider, CuboidCollider, CylinderCollider } from '@react-three/rapier';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { SceneObject, EngineMode, EngineState } from '../types';
import { MATERIAL_ASSETS, PHYSICS_ASSETS, MESH_ASSETS, LIGHT_ASSETS } from '../constants';
import '../types';

interface ActorProps {
  data: SceneObject;
  isSelected: boolean;
  engineState: EngineState;
  onSelect: () => void;
  onUpdate: (updates: Partial<SceneObject>) => void;
}

const Actor: React.FC<ActorProps> = ({ data, isSelected, engineState, onSelect, onUpdate }) => {
  const rbRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const engineMode = engineState.mode;

  const meshAsset = MESH_ASSETS.find(m => m.id === data.assetId);
  const lightAsset = LIGHT_ASSETS.find(l => l.id === data.assetId);
  const materialAsset = MATERIAL_ASSETS.find(m => m.id === data.materialId) || MATERIAL_ASSETS[0];
  const physicsAsset = PHYSICS_ASSETS.find(p => p.id === data.physicsId);

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
    });
  }, [materialAsset, lightAsset, data.color]);

  const handleTransformChange = () => {
    if (!meshRef.current || !rbRef.current || !isSelected) return;
    
    // Sync Rapier body with visual mesh during interaction
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);
    
    const worldQuat = new THREE.Quaternion();
    meshRef.current.getWorldQuaternion(worldQuat);

    rbRef.current.setNextKinematicTranslation(worldPos);
    rbRef.current.setNextKinematicRotation(worldQuat);
  };

  const handleTransformEnd = () => {
    if (!meshRef.current) return;
    
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);
    
    const worldRot = new THREE.Euler();
    worldRot.setFromQuaternion(meshRef.current.quaternion);
    
    const scale = meshRef.current.scale;
    
    onUpdate({ 
        position: [worldPos.x, worldPos.y, worldPos.z],
        rotation: [worldRot.x, worldRot.y, worldRot.z],
        scale: [scale.x, scale.y, scale.z]
    });
    
    if (rbRef.current) {
        rbRef.current.setBodyType(physicsAsset && engineMode !== 'EDITOR' ? 0 : 1, true); 
    }
  };

  const showGizmo = isSelected && engineMode === 'EDITOR';

  const rotationArray: [number, number, number] = Array.isArray(data.rotation) 
    ? [data.rotation[0], data.rotation[1], data.rotation[2]] 
    : [0, 0, 0];

  return (
    <>
      <RigidBody
        ref={rbRef}
        position={data.position}
        rotation={rotationArray}
        type={physicsAsset && engineMode !== 'EDITOR' ? 'dynamic' : 'fixed'}
        colliders={false} 
        density={physicsAsset?.density ?? 1}
        friction={physicsAsset?.friction ?? 0.5}
        restitution={physicsAsset?.restitution ?? 0.2}
        key={`${data.id}-${engineMode}`}
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
                <meshBasicMaterial color="#0ea5e9" wireframe />
             </mesh>
          )}
          
          {lightAsset?.lightType === 'point' && (
            <pointLight 
              intensity={data.intensity || 5} 
              color={data.color || '#ffffff'} 
              castShadow 
              shadow-mapSize={[512, 512]} 
            />
          )}
          {lightAsset?.lightType === 'spot' && (
            <spotLight 
              intensity={data.intensity || 10} 
              color={data.color || '#ffffff'} 
              castShadow 
              angle={0.5} 
              penumbra={1}
            />
          )}
          {lightAsset?.lightType === 'directional' && (
            <directionalLight 
              intensity={data.intensity || 1} 
              color={data.color || '#ffffff'} 
              castShadow 
            />
          )}
        </mesh>

        {!lightAsset && physicsAsset && (
          meshAsset?.shape === 'sphere' ? <BallCollider args={[0.6]} /> :
          meshAsset?.shape === 'cube' ? <CuboidCollider args={[0.5, 0.5, 0.5]} /> :
          meshAsset?.shape === 'cylinder' ? <CylinderCollider args={[0.5, 0.5]} /> :
          meshAsset?.shape === 'rock' ? <BallCollider args={[0.7]} /> : 
          meshAsset?.shape === 'torus' ? <BallCollider args={[0.5]} /> : 
          <CuboidCollider args={[0.5, 0.5, 0.5]} />
        )}
      </RigidBody>

      {showGizmo && (
        <TransformControls 
            object={meshRef.current as any} 
            mode={engineState.transformMode} 
            onMouseUp={handleTransformEnd}
            onChange={handleTransformChange}
            onMouseDown={() => rbRef.current?.setBodyType(2, true)}
        />
      )}
    </>
  );
};

export default Actor;
