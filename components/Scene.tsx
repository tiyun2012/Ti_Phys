import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Stats } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { SimulationConfig } from '../types';
import World from './World';

interface SceneProps {
  config: SimulationConfig;
}

const Scene: React.FC<SceneProps> = ({ config }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 15, 25], fov: 50 }}
      className="w-full h-full bg-black"
      dpr={[1, 1.5]} // Optimize pixel ratio for performance
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
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        <Physics 
          gravity={config.gravity} 
          paused={config.paused} 
          debug={config.debug}
          timeStep="vary" // Smoother visual on variable framerates
        >
          <World config={config} />
        </Physics>
        
        <OrbitControls makeDefault />
        <Stats className="!left-auto !right-0 !top-auto !bottom-0" />
      </Suspense>
    </Canvas>
  );
};

export default Scene;