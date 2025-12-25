
import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { InstancedRigidBodies, InstancedRigidBodyProps, RapierRigidBody } from '@react-three/rapier';
import { PhysicsMaterial } from '../types';
import { MATERIALS_TABLE } from '../constants';
import '../types';

interface InstancedRocksProps {
  count: number;
  materialType: PhysicsMaterial;
}

const geometry = new THREE.DodecahedronGeometry(1, 0);

const InstancedRocks: React.FC<InstancedRocksProps> = ({ count, materialType }) => {
  const rigidBodies = useRef<RapierRigidBody[]>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const matData = MATERIALS_TABLE[materialType] || MATERIALS_TABLE.default;

  const visualMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(matData.visual.color),
      roughness: matData.visual.roughness,
      metalness: matData.visual.metalness,
      emissive: matData.visual.emissive ? new THREE.Color(matData.visual.emissive) : new THREE.Color(0x000000),
      emissiveIntensity: matData.visual.emissiveIntensity || 0,
      transparent: matData.visual.transparent || false,
      opacity: matData.visual.opacity ?? 1.0,
      clearcoat: 0.2,
      flatShading: true,
    });
  }, [materialType]);

  const instances = useMemo(() => {
    const instancesData: InstancedRigidBodyProps[] = [];
    const range = 40;

    for (let i = 0; i < count; i++) {
      instancesData.push({
        key: `rock_${i}_${materialType}`,
        position: [
          (Math.random() - 0.5) * range,
          10 + Math.random() * 40,
          (Math.random() - 0.5) * range,
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: [
            0.4 + Math.random() * 0.8,
            0.4 + Math.random() * 0.8,
            0.4 + Math.random() * 0.8
        ],
      });
    }
    return instancesData;
  }, [count, materialType]);

  useLayoutEffect(() => {
    if (!meshRef.current || !meshRef.current.instanceColor) return;
    const tempColor = new THREE.Color();
    const baseColor = new THREE.Color(matData.visual.color);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    
    const variance = matData.visual.colorVar || 0.1;

    for (let i = 0; i < count; i++) {
      const h = hsl.h + (Math.random() - 0.5) * (variance * 0.5);
      const s = Math.min(1, Math.max(0, hsl.s + (Math.random() - 0.5) * variance));
      const l = Math.min(1, Math.max(0, hsl.l + (Math.random() - 0.5) * variance));
      
      tempColor.setHSL(h, s, l);
      meshRef.current.setColorAt(i, tempColor);
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [count, materialType]);

  return (
    <InstancedRigidBodies
      ref={rigidBodies}
      instances={instances}
      restitution={matData.physics.restitution}
      friction={matData.physics.friction}
      density={matData.physics.density}
      colliders="ball" // Fixed: "hull" often crashes in specific environments; "ball" is a stable primitive.
    >
      <instancedMesh
        ref={meshRef}
        args={[geometry, visualMaterial, count]}
        castShadow
        receiveShadow
      />
    </InstancedRigidBodies>
  );
};

export default InstancedRocks;
