
import React, { Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, ContactShadows, Sky } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { SceneObject, EngineState, Asset, SimulationConfig, SimulationWarning } from '../types';
import Actor from './Actor';
import InstancedRocks from './InstancedRocks';
import ClothNet from './ClothNet';
import MouseShooter from './MouseShooter';
import * as THREE from 'three';

interface SceneProps {
  objects: SceneObject[];
  engineState: EngineState;
  simConfig: SimulationConfig;
  rockSeed: number;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<SceneObject>) => void;
  onSpawn: (asset: Asset, pos: [number, number, number]) => void;
  onWarning: (type: SimulationWarning['type'], message: string) => void;
}

const StateBridge: React.FC<{ bridgeRef: React.MutableRefObject<any> }> = ({ bridgeRef }) => {
  const state = useThree();
  bridgeRef.current = state;
  return null;
};

const Scene: React.FC<SceneProps> = ({ objects, engineState, simConfig, rockSeed, onSelect, onUpdate, onSpawn, onWarning }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const threeBridgeRef = useRef<{ camera: THREE.Camera; gl: THREE.WebGLRenderer } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
    const t = -bridge.camera.position.y / dir.y;
    
    if (t > 0) {
      const pos = bridge.camera.position.clone().add(dir.multiplyScalar(t));
      onSpawn(asset, [pos.x, pos.y + 2, pos.z]); // Spawn slightly above floor
    }
  };

  // Physics is now ONLY paused if the user explicitly pauses it
  const isSimulating = !simConfig.paused;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Canvas
        shadows
        camera={{ position: [25, 20, 25], fov: 45 }}
        gl={{ 
            antialias: true, 
            powerPreference: 'high-performance', 
            stencil: false, 
            depth: true,
            alpha: false 
        }}
        dpr={[1, 1.5]}
      >
        <StateBridge bridgeRef={threeBridgeRef} />
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          
          <Grid 
            infiniteGrid 
            fadeDistance={120} 
            fadeStrength={8} 
            cellSize={1} 
            sectionSize={10} 
            sectionColor="#333" 
            cellColor="#111" 
            position={[0, -0.01, 0]}
          />

          <Physics 
            paused={!isSimulating} 
            gravity={[0, -9.81, 0]}
            timeStep={simConfig.precisionMode ? 1/120 : 1/60}
          >
            {objects.map((obj) => (
              <Actor 
                key={obj.id}
                data={obj}
                isSelected={engineState.selectedObjectId === obj.id}
                engineState={engineState}
                onSelect={() => onSelect(obj.id)}
                onUpdate={(updates) => onUpdate(obj.id, updates)}
                onWarning={onWarning}
                vortexEnabled={simConfig.vortexEnabled}
                vortexStrength={simConfig.vortexStrength}
                paused={simConfig.paused}
              />
            ))}

            <InstancedRocks 
              count={simConfig.rockCount} 
              materialType={simConfig.rockMaterial} 
              engineMode={engineState.mode}
              seed={rockSeed}
              vortexEnabled={simConfig.vortexEnabled}
              vortexStrength={simConfig.vortexStrength}
            />
            
            {simConfig.clothEnabled && (
              <ClothNet 
                position={[0, 18, 0]} 
                engineMode={engineState.mode === 'EDITOR' ? (simConfig.paused ? 'EDITOR' : 'SIMULATE') : engineState.mode} 
              />
            )}

            {engineState.mode === 'PLAY' && <MouseShooter />}

            <RigidBody type="fixed" restitution={0.2} friction={1}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#020202" roughness={1} metalness={0} />
              </mesh>
            </RigidBody>
          </Physics>

          {simConfig.vortexEnabled && (
            <group position={[0, 5, 0]}>
              <mesh>
                <torusGeometry args={[8, 0.05, 16, 100]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.1} />
              </mesh>
              <pointLight intensity={20} color="#00ffff" distance={30} />
            </group>
          )}

          <Environment preset="night" />
          <OrbitControls 
            makeDefault 
            enabled={engineState.mode !== 'PLAY'} 
            dampingFactor={0.1}
            maxPolarAngle={Math.PI / 2.1}
          />
          <ContactShadows opacity={0.7} scale={100} blur={3} far={20} color="#000" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
