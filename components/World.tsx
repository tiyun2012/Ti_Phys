
import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { SimulationConfig, EditorConfig, LevelObject, SimulationWarning, EngineMode } from '../types';
import InstancedRocks from './InstancedRocks';
import ClothNet from './ClothNet';
import LevelEditor from './LevelEditor';
// Import types to ensure global JSX augmentation for Three.js elements is active
import '../types';

interface WorldProps {
  config: SimulationConfig;
  editorConfig: EditorConfig;
  levelObjects: LevelObject[];
  onAddObject: (obj: LevelObject) => void;
  onUpdateObject: (id: string, updates: Partial<LevelObject>) => void;
  onSelectObject: (id: string | null) => void;
  onTriggerConflict: (type: SimulationWarning['type'], message: string) => void;
  // Fix: Added engineMode to WorldProps to satisfy child component requirements.
  engineMode: EngineMode;
}

const World: React.FC<WorldProps> = ({ config, editorConfig, levelObjects, onAddObject, onUpdateObject, onSelectObject, onTriggerConflict, engineMode }) => {
  return (
    <>
      <LevelEditor 
        config={editorConfig} 
        objects={levelObjects} 
        onAddObject={onAddObject} 
        onUpdateObject={onUpdateObject}
        onSelectObject={onSelectObject}
        onTriggerConflict={onTriggerConflict}
      />

      {/* Floor */}
      <RigidBody type="fixed" restitution={0.2} friction={1}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.2} />
        </mesh>
      </RigidBody>

      {/* Invisible walls */}
      <RigidBody type="fixed">
         <CuboidCollider args={[50, 20, 1]} position={[0, 10, -50]} />
         <CuboidCollider args={[50, 20, 1]} position={[0, 10, 50]} />
         <CuboidCollider args={[1, 20, 50]} position={[-50, 10, 0]} />
         <CuboidCollider args={[1, 20, 50]} position={[50, 10, 0]} />
      </RigidBody>

      <InstancedRocks 
        key={`${config.rockCount}-${config.rockMaterial}`} 
        count={config.rockCount} 
        materialType={config.rockMaterial}
        engineMode={engineMode}
      />
      
      {config.clothEnabled && <ClothNet position={[0, 10, 0]} engineMode={engineMode} />}
    </>
  );
};

export default World;
