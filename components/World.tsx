import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { SimulationConfig } from '../types';
import InstancedRocks from './InstancedRocks';
import ClothNet from './ClothNet';
import MouseShooter from './MouseShooter';

interface WorldProps {
  config: SimulationConfig;
}

const World: React.FC<WorldProps> = ({ config }) => {
  return (
    <>
      <MouseShooter />

      {/* Floor */}
      <RigidBody type="fixed" restitution={0.2} friction={1}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
        </mesh>
      </RigidBody>

      {/* Invisible walls to keep objects in bounds */}
      <RigidBody type="fixed">
         <CuboidCollider args={[50, 20, 1]} position={[0, 10, -50]} />
         <CuboidCollider args={[50, 20, 1]} position={[0, 10, 50]} />
         <CuboidCollider args={[1, 20, 50]} position={[-50, 10, 0]} />
         <CuboidCollider args={[1, 20, 50]} position={[50, 10, 0]} />
      </RigidBody>

      {/* Adding material to key ensures complete rebuild when physics props change */}
      <InstancedRocks 
        key={`${config.rockCount}-${config.rockMaterial}`} 
        count={config.rockCount} 
        materialType={config.rockMaterial}
      />
      
      {config.clothEnabled && <ClothNet position={[0, 10, 0]} />}
    </>
  );
};

export default World;