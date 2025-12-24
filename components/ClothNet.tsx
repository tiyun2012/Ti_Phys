import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useRapier, RigidBody, useSphericalJoint } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';

// A single link in the chain/net
const Link = React.forwardRef<any, { position: [number, number, number], fixed?: boolean }>(({ position, fixed }, ref) => {
  return (
    <RigidBody
      ref={ref}
      position={position}
      colliders="cuboid"
      type={fixed ? 'fixed' : 'dynamic'}
      linearDamping={0.5}
      angularDamping={0.5}
      density={0.5}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color={fixed ? '#ff4444' : '#44aaff'} />
      </mesh>
    </RigidBody>
  );
});

// Helper component to connect two bodies with a joint
interface JointConnectionProps {
  bodyA: React.RefObject<any>;
  bodyB: React.RefObject<any>;
  anchorA: [number, number, number];
  anchorB: [number, number, number];
}

const JointConnection: React.FC<JointConnectionProps> = ({ bodyA, bodyB, anchorA, anchorB }) => {
  useSphericalJoint(bodyA, bodyB, [anchorA, anchorB]);
  return null;
};

interface ClothNetProps {
  position: [number, number, number];
}

const ClothNet: React.FC<ClothNetProps> = ({ position }) => {
  const rows = 8;
  const cols = 8;
  const spacing = 0.6;
  
  // We need refs for all bodies to connect them
  // Creating a 2D array of refs
  const bodyRefs = useMemo(() => {
    const refs: React.RefObject<any>[][] = [];
    for (let r = 0; r < rows; r++) {
      const rowRefs = [];
      for (let c = 0; c < cols; c++) {
        rowRefs.push(React.createRef());
      }
      refs.push(rowRefs);
    }
    return refs;
  }, [rows, cols]);

  const nodes = [];
  const joints = [];

  // Generate Nodes
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isFixed = r === 0; // Top row fixed
      const x = (c - cols / 2) * spacing;
      const y = -r * spacing; // Hang down
      const z = 0;
      
      nodes.push(
        <Link
          key={`node-${r}-${c}`}
          ref={bodyRefs[r][c]}
          position={[position[0] + x, position[1] + y, position[2] + z]}
          fixed={isFixed}
        />
      );

      // Connect to left neighbor
      if (c > 0) {
        joints.push(
          <JointConnection
            key={`joint-h-${r}-${c}`}
            bodyA={bodyRefs[r][c - 1]}
            bodyB={bodyRefs[r][c]}
            anchorA={[spacing/2, 0, 0]} 
            anchorB={[-spacing/2, 0, 0]}
          />
        );
      }

      // Connect to top neighbor
      if (r > 0) {
        joints.push(
          <JointConnection
            key={`joint-v-${r}-${c}`}
            bodyA={bodyRefs[r - 1][c]}
            bodyB={bodyRefs[r][c]}
            anchorA={[0, -spacing/2, 0]} 
            anchorB={[0, spacing/2, 0]}
          />
        );
      }
    }
  }

  return (
    <group>
      {nodes}
      {joints}
    </group>
  );
};

export default ClothNet;