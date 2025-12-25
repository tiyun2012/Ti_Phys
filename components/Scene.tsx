
import React, { Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, ContactShadows, Sky } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { SceneObject, EngineState, Asset, SimulationConfig } from '../types';
import Actor from './Actor';
import InstancedRocks from './InstancedRocks';
import ClothNet from './ClothNet';
import MouseShooter from './MouseShooter';
import * as THREE from 'three';
import '../types';

interface SceneProps {
  objects: SceneObject[];
  engineState: EngineState;
  simConfig: SimulationConfig;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<SceneObject>) => void;
  onSpawn: (asset: Asset, pos: [number, number, number]) => void;
}

/**
 * Internal component to sync Three.js state with a ref accessible to the DOM drop handler.
 */
const StateBridge: React.FC<{ bridgeRef: React.MutableRefObject<any> }> = ({ bridgeRef }) => {
  const state = useThree();
  bridgeRef.current = state;
  return null;
};

const Scene: React.FC<SceneProps> = ({ objects, engineState, simConfig, onSelect, onUpdate, onSpawn }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const threeBridgeRef = useRef<{ camera: THREE.Camera; gl: THREE.WebGLRenderer } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const asset = engineState.draggedAsset;
    const bridge = threeBridgeRef.current;
    
    if (!asset || !bridge || !containerRef.current || (asset.type !== 'mesh' && asset.type !== 'light')) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(bridge.camera);
    const dir = vector.sub(bridge.camera.position).normalize();
    
    // Intersection with Y=0 plane
    // Plane: n.(p - p0) = 0 where n=[0,1,0] and p0=[0,0,0]
    // Ray: p = origin + dir * t
    // t = - (origin.y) / dir.y
    const t = -bridge.camera.position.y / dir.y;
    
    if (t > 0) {
      const pos = bridge.camera.position.clone().add(dir.multiplyScalar(t));
      onSpawn(asset, [pos.x, 0.5, pos.z]);
    }
  };

  const isSimulating = engineState.mode !== 'EDITOR' && !simConfig.paused;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Canvas
        shadows
        camera={{ position: [20, 15, 20], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <StateBridge bridgeRef={threeBridgeRef} />
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          
          <Grid 
            infiniteGrid 
            fadeDistance={100} 
            fadeStrength={5} 
            cellSize={1} 
            sectionSize={10} 
            sectionColor="#222" 
            cellColor="#111" 
            position={[0, -0.01, 0]}
          />

          <Physics 
            paused={!isSimulating} 
            gravity={[0, -9.81, 0]}
            timeStep="variadic"
          >
            {/* Placed Actors */}
            {objects.map((obj) => (
              <Actor 
                key={obj.id}
                data={obj}
                isSelected={engineState.selectedObjectId === obj.id}
                engineState={engineState}
                onSelect={() => onSelect(obj.id)}
                onUpdate={(updates) => onUpdate(obj.id, updates)}
              />
            ))}

            {/* High Volume Simulation Objects */}
            {(engineState.mode === 'SIMULATE' || engineState.mode === 'PLAY') && (
               <>
                  <InstancedRocks 
                    count={simConfig.rockCount} 
                    materialType={simConfig.rockMaterial} 
                  />
                  {simConfig.clothEnabled && <ClothNet position={[0, 15, 0]} />}
               </>
            )}

            {/* Game Mode Features */}
            {engineState.mode === 'PLAY' && <MouseShooter />}

            {/* Ground Collision */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
              <planeGeometry args={[1000, 1000]} />
              <meshStandardMaterial color="#050505" roughness={1} metalness={0} />
            </mesh>
          </Physics>

          <Environment preset="night" />
          <OrbitControls 
            makeDefault 
            enabled={engineState.mode !== 'PLAY'} 
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2.05}
          />
          <ContactShadows opacity={0.6} scale={100} blur={2} far={15} color="#000" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
