import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { InstancedRigidBodies, InstancedRigidBodyProps, RapierRigidBody } from '@react-three/rapier';
import { PhysicsMaterial } from '../types';
import { MATERIALS_TABLE } from '../constants';

interface InstancedRocksProps {
  count: number;
  materialType: PhysicsMaterial;
}

const geometry = new THREE.DodecahedronGeometry(1, 0);

const InstancedRocks: React.FC<InstancedRocksProps> = ({ count, materialType }) => {
  const rigidBodies = useRef<RapierRigidBody[]>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const matData = MATERIALS_TABLE[materialType];

  // Create material with rich physical properties
  const visualMaterial = useMemo(() => {
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
      flatShading: true,
    });
  }, [materialType]);

  // Generate instance positions (stable unless count changes)
  const instances = useMemo(() => {
    const instancesData: InstancedRigidBodyProps[] = [];
    const range = 25;

    for (let i = 0; i < count; i++) {
      instancesData.push({
        key: `obj_${i}`,
        position: [
          (Math.random() - 0.5) * range,
          10 + Math.random() * 50,
          (Math.random() - 0.5) * range,
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: [
            0.5 + Math.random() * 1.0,
            0.5 + Math.random() * 1.0,
            0.5 + Math.random() * 1.0
        ],
      });
    }
    return instancesData;
  }, [count]);

  // Apply color variance
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const tempColor = new THREE.Color();
    const baseColor = new THREE.Color(matData.visual.color);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    
    const variance = matData.visual.colorVar;

    for (let i = 0; i < count; i++) {
      // Vary Hue/Lightness slightly
      const h = hsl.h + (Math.random() - 0.5) * variance; // Hue shift
      const s = THREE.MathUtils.clamp(hsl.s + (Math.random() - 0.5) * variance, 0, 1);
      const l = THREE.MathUtils.clamp(hsl.l + (Math.random() - 0.5) * variance, 0, 1);
      
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
      colliders="hull"
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