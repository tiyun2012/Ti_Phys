
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RigidBody, useSphericalJoint } from '@react-three/rapier';
import { EngineMode } from '../types';
import '../types';

const Link = React.forwardRef<any, { position: [number, number, number], fixed?: boolean, engineMode: EngineMode }>(({ position, fixed, engineMode }, ref) => {
  return (
    <RigidBody
      ref={ref}
      position={position}
      colliders="cuboid"
      // If in Editor, everything is fixed. If in Sim, only anchors are fixed.
      type={(fixed || engineMode === 'EDITOR') ? 'fixed' : 'dynamic'}
      linearDamping={0.5}
      angularDamping={0.5}
      density={0.5}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color={fixed ? '#ff4444' : '#44aaff'} roughness={0.3} metalness={0.6} />
      </mesh>
    </RigidBody>
  );
});

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
  engineMode: EngineMode;
}

const ClothNet: React.FC<ClothNetProps> = ({ position, engineMode }) => {
  const rows = 8;
  const cols = 8;
  const spacing = 0.6;
  
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

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isAnchor = r === 0; 
      const x = (c - cols / 2) * spacing;
      const y = -r * spacing; 
      const z = 0;
      
      nodes.push(
        <Link
          key={`node-${r}-${c}-${engineMode}`}
          ref={bodyRefs[r][c]}
          position={[position[0] + x, position[1] + y, position[2] + z]}
          fixed={isAnchor}
          engineMode={engineMode}
        />
      );

      if (c > 0) {
        joints.push(
          <JointConnection
            key={`joint-h-${r}-${c}-${engineMode}`}
            bodyA={bodyRefs[r][c - 1]}
            bodyB={bodyRefs[r][c]}
            anchorA={[spacing/2, 0, 0]} 
            anchorB={[-spacing/2, 0, 0]}
          />
        );
      }

      if (r > 0) {
        joints.push(
          <JointConnection
            key={`joint-v-${r}-${c}-${engineMode}`}
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
    <group key={`cloth-${engineMode}`}>
      {nodes}
      {joints}
    </group>
  );
};

export default ClothNet;
