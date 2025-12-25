
import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { InstancedRigidBodies, InstancedRigidBodyProps, RapierRigidBody } from '@react-three/rapier';
import { PhysicsMaterial, EngineMode } from '../types';
import { MATERIALS_TABLE } from '../constants';

interface InstancedRocksProps {
  count: number;
  materialType: PhysicsMaterial;
  engineMode: EngineMode;
  seed?: number;
  vortexEnabled?: boolean;
  vortexStrength?: number;
}

const geometries = [
  new THREE.DodecahedronGeometry(0.8, 0),
  new THREE.IcosahedronGeometry(0.7, 0),
  new THREE.OctahedronGeometry(0.9, 0)
];

// Pre-allocated vectors for high-performance loops (avoiding GC pressure)
const V_CENTER = new THREE.Vector3(0, 5, 0);
const V_TEMP_FORCE = new THREE.Vector3();
const V_TEMP_SWIRL = new THREE.Vector3();
const V_RB_POS = new THREE.Vector3();

const InstancedRocks: React.FC<InstancedRocksProps> = ({ count, materialType, engineMode, seed = 0.5, vortexEnabled, vortexStrength = 20 }) => {
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
      clearcoat: 0.3,
      flatShading: true,
    });
  }, [materialType]);

  const instances = useMemo(() => {
    const instancesData: InstancedRigidBodyProps[] = [];
    const range = 45;
    let currentSeed = seed;

    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      const x = (seededRandom(currentSeed++) - 0.5) * range;
      const y = 8 + seededRandom(currentSeed++) * 40;
      const z = (seededRandom(currentSeed++) - 0.5) * range;
      
      instancesData.push({
        key: `rock_${i}_${seed}`,
        position: [x, y, z],
        rotation: [seededRandom(currentSeed++) * Math.PI, seededRandom(currentSeed++) * Math.PI, seededRandom(currentSeed++) * Math.PI],
        scale: [
            0.5 + seededRandom(currentSeed++) * 0.7,
            0.5 + seededRandom(currentSeed++) * 0.7,
            0.5 + seededRandom(currentSeed++) * 0.7
        ],
      });
    }
    return instancesData;
  }, [count, seed]);

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
    meshRef.current.instanceColor.needsUpdate = true;
  }, [count, materialType]);

  // Efficient Physics Frame Loop
  useFrame(() => {
    if (!vortexEnabled || !rigidBodies.current || engineMode === 'EDITOR') return;

    const bodies = rigidBodies.current;
    const len = bodies.length;
    
    for (let i = 0; i < len; i++) {
      const rb = bodies[i];
      if (rb && rb.isDynamic()) {
        const { x, y, z } = rb.translation();
        
        // Direction to center
        V_TEMP_FORCE.set(V_CENTER.x - x, 0, V_CENTER.z - z);
        const distSq = V_TEMP_FORCE.lengthSq();
        
        if (distSq > 0.1) {
          V_TEMP_FORCE.normalize().multiplyScalar(vortexStrength * 0.4);
          
          // Tangential swirl (Vector cross product [0,1,0] x Dir)
          V_TEMP_SWIRL.set(- (V_CENTER.z - z), 0, V_CENTER.x - x);
          V_TEMP_SWIRL.normalize().multiplyScalar(vortexStrength * 0.8);
          
          V_TEMP_FORCE.add(V_TEMP_SWIRL);
          rb.applyImpulse(V_TEMP_FORCE, true);
        }
      }
    }
  });

  return (
    <InstancedRigidBodies
      ref={rigidBodies}
      instances={instances}
      restitution={matData.physics.restitution}
      friction={matData.physics.friction}
      density={matData.physics.density}
      colliders="ball"
      type={engineMode === 'EDITOR' ? 'fixed' : 'dynamic'}
      key={`rocks_${engineMode}_${seed}_${count}`}
    >
      <instancedMesh
        ref={meshRef}
        args={[geometries[0], visualMaterial, count]}
        castShadow
        receiveShadow
        frustumCulled={true}
      />
    </InstancedRigidBodies>
  );
};

export default InstancedRocks;
