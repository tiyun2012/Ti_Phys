import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Stats } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { SimulationConfig, EditorConfig, LevelObject, SimulationWarning } from '../types';
import World from './World';

interface SceneProps {
  config: SimulationConfig;
  editorConfig: EditorConfig;
  levelObjects: LevelObject[];
  onAddObject: (obj: LevelObject) => void;
  onUpdateObject: (id: string, updates: Partial<LevelObject>) => void;
  onSelectObject: (id: string | null) => void;
  onTriggerConflict: (type: SimulationWarning['type'], message: string) => void;
}

const Scene: React.FC<SceneProps> = ({ config, editorConfig, levelObjects, onAddObject, onUpdateObject, onSelectObject, onTriggerConflict }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 15, 25], fov: 50 }}
      className="w-full h-full bg-black"
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
        
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />

        <Physics 
          gravity={config.gravity} 
          paused={config.paused} 
          debug={config.debug}
        >
          <World 
            config={config} 
            editorConfig={editorConfig} 
            levelObjects={levelObjects} 
            onAddObject={onAddObject}
            onUpdateObject={onUpdateObject}
            onSelectObject={onSelectObject}
            onTriggerConflict={onTriggerConflict}
          />
        </Physics>
        
        <OrbitControls makeDefault enabled={!editorConfig.active || !editorConfig.selectedObjectId} />
        <Stats className="!left-auto !right-0 !top-auto !bottom-0 opacity-20 hover:opacity-100 transition-opacity" />
      </Suspense>
    </Canvas>
  );
};

export default Scene;