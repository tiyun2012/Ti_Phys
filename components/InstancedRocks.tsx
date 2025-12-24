import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { InstancedRigidBodies, InstancedRigidBodyProps, RapierRigidBody } from '@react-three/rapier';
import { PhysicsMaterial } from '../types';

interface InstancedRocksProps {
  count: number;
  materialType: PhysicsMaterial;
}

// Define material properties
const MATERIAL_PROPS = {
  rock: { 
    friction: 0.8, 
    restitution: 0.2, 
    density: 1.0, 
    roughness: 0.9, 
    metalness: 0.1,
    colorBase: new THREE.Color('#888888'),
    colorVar: 0.1 // Variance
  },
  ice: { 
    friction: 0.02, 
    restitution: 0.1, 
    density: 0.9, 
    roughness: 0.05, 
    metalness: 0.1,
    colorBase: new THREE.Color('#aaffff'),
    colorVar: 0.05
  },
  rubber: { 
    friction: 0.7, 
    restitution: 1.1, // Super bouncy
    density: 0.5, 
    roughness: 0.4, 
    metalness: 0.0,
    colorBase: new THREE.Color('#ff00aa'),
    colorVar: 0.2
  },
  metal: { 
    friction: 0.3, 
    restitution: 0.3, 
    density: 3.0, // Heavy
    roughness: 0.2, 
    metalness: 0.9,
    colorBase: new THREE.Color('#aaaaaa'),
    colorVar: 0.0
  }
};

const geometry = new THREE.DodecahedronGeometry(1, 0);

const InstancedRocks: React.FC<InstancedRocksProps> = ({ count, materialType }) => {
  const rigidBodies = useRef<RapierRigidBody[]>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const matProps = MATERIAL_PROPS[materialType];

  // Dynamic ThreeJS material based on selection
  const visualMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: matProps.roughness,
    metalness: matProps.metalness,
    flatShading: true
  }), [matProps.roughness, matProps.metalness]);

  // Generate instance data
  const instances = useMemo(() => {
    const instancesData: InstancedRigidBodyProps[] = [];
    const range = 25;

    for (let i = 0; i < count; i++) {
      instancesData.push({
        key: `rock_${i}`,
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

  // Apply colors based on material type
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const tempColor = new THREE.Color();
    const hsl = { h: 0, s: 0, l: 0 };
    matProps.colorBase.getHSL(hsl);
    
    for (let i = 0; i < count; i++) {
      // Vary Hue/Lightness slightly for variety
      const h = hsl.h + (Math.random() - 0.5) * matProps.colorVar;
      const s = hsl.s;
      const l = hsl.l + (Math.random() - 0.5) * matProps.colorVar;
      
      tempColor.setHSL(h, s, l);
      meshRef.current.setColorAt(i, tempColor);
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [count, matProps]);

  return (
    <InstancedRigidBodies
      ref={rigidBodies}
      instances={instances}
      restitution={matProps.restitution}
      friction={matProps.friction}
      density={matProps.density}
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