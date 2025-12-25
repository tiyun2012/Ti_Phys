
import React, { useState, useCallback } from 'react';
import Scene from './components/Scene';
import AssetBrowser from './components/AssetBrowser';
import Inspector from './components/Inspector';
import Outliner from './components/Outliner';
import { SceneObject, Asset, EngineState, EngineMode, SimulationConfig, TransformMode } from './types';
import { Play, Square, Terminal, Activity, Save, Settings, Database, Gamepad2, Box, Move, RotateCcw, Maximize } from 'lucide-react';

const App: React.FC = () => {
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([]);
  const [simConfig, setSimConfig] = useState<SimulationConfig>({
    rockCount: 500,
    rockMaterial: 'default',
    clothEnabled: true,
    paused: false,
  });
  const [engineState, setEngineState] = useState<EngineState>({
    mode: 'EDITOR',
    transformMode: 'translate',
    selectedObjectId: null,
    draggedAsset: null,
  });

  const setMode = (mode: EngineMode) => {
    setEngineState(prev => ({ ...prev, mode, selectedObjectId: null }));
  };

  const setTransformMode = (transformMode: TransformMode) => {
    setEngineState(prev => ({ ...prev, transformMode }));
  };

  const spawnObject = useCallback((asset: Asset, position: [number, number, number]) => {
    const newObj: SceneObject = {
      id: crypto.randomUUID(),
      name: `${asset.name}_${sceneObjects.length}`,
      assetId: asset.id,
      materialId: asset.type === 'material' ? asset.id : 'mat_default',
      physicsId: asset.type === 'mesh' ? 'phys_wood' : null,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      ...(asset.type === 'light' ? { intensity: (asset as any).intensity, color: (asset as any).color } : {})
    };
    setSceneObjects(prev => [...prev, newObj]);
    setEngineState(prev => ({ ...prev, selectedObjectId: newObj.id }));
  }, [sceneObjects.length]);

  const updateObject = (id: string, updates: Partial<SceneObject>) => {
    setSceneObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...updates } : obj));
  };

  const deleteObject = (id: string) => {
    setSceneObjects(prev => prev.filter(o => o.id !== id));
    setEngineState(prev => ({ ...prev, selectedObjectId: null }));
  };

  const isEditor = engineState.mode === 'EDITOR';
  const isPlay = engineState.mode === 'PLAY';
  const isSimulate = engineState.mode === 'SIMULATE';

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden select-none">
      {/* Top Header / Mode Switcher */}
      <div className="absolute top-0 left-0 w-full h-12 bg-[#121212] border-b border-white/5 flex items-center px-4 justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white font-black tracking-tighter text-lg">
            <Activity size={20} className="text-cyan-500" />
            VORTEX<span className="text-cyan-500">PRO</span>
          </div>
          <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
             <button 
                onClick={() => setMode('EDITOR')}
                className={`flex items-center gap-2 px-4 py-1 text-[10px] font-bold uppercase rounded transition-all ${engineState.mode === 'EDITOR' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-gray-500 hover:text-gray-300'}`}
             >
                <Box size={12} /> Editor
             </button>
             <button 
                onClick={() => setMode('SIMULATE')}
                className={`flex items-center gap-2 px-4 py-1 text-[10px] font-bold uppercase rounded transition-all ${engineState.mode === 'SIMULATE' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-gray-500 hover:text-gray-300'}`}
             >
                <Activity size={12} /> Simulate
             </button>
             <button 
                onClick={() => setMode('PLAY')}
                className={`flex items-center gap-2 px-4 py-1 text-[10px] font-bold uppercase rounded transition-all ${engineState.mode === 'PLAY' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-gray-500 hover:text-gray-300'}`}
             >
                <Gamepad2 size={12} /> Play
             </button>
          </div>

          {/* Transform Tool Switcher (only in Editor mode) */}
          {isEditor && (
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 ml-4">
              <button 
                onClick={() => setTransformMode('translate')}
                className={`p-1.5 rounded transition-all ${engineState.transformMode === 'translate' ? 'bg-white/10 text-cyan-400' : 'text-gray-600 hover:text-gray-400'}`}
                title="Move (W)"
              >
                <Move size={14} />
              </button>
              <button 
                onClick={() => setTransformMode('rotate')}
                className={`p-1.5 rounded transition-all ${engineState.transformMode === 'rotate' ? 'bg-white/10 text-cyan-400' : 'text-gray-600 hover:text-gray-400'}`}
                title="Rotate (E)"
              >
                <RotateCcw size={14} />
              </button>
              <button 
                onClick={() => setTransformMode('scale')}
                className={`p-1.5 rounded transition-all ${engineState.transformMode === 'scale' ? 'bg-white/10 text-cyan-400' : 'text-gray-600 hover:text-gray-400'}`}
                title="Scale (R)"
              >
                <Maximize size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/40 px-3 py-1.5 rounded-md border border-white/5 gap-3">
             <span className="text-[9px] font-bold uppercase text-gray-500">Simulation Load</span>
             <input 
               type="range" min="0" max="2000" step="100"
               value={simConfig.rockCount}
               onChange={(e) => setSimConfig(p => ({ ...p, rockCount: parseInt(e.target.value) }))}
               className="w-24 h-1 accent-cyan-500 cursor-pointer"
             />
             <span className="text-[10px] font-mono text-cyan-400 w-8">{simConfig.rockCount}</span>
          </div>
          <button className="p-2 text-gray-500 hover:text-white transition-colors"><Save size={16}/></button>
          <button className="p-2 text-gray-500 hover:text-white transition-colors"><Settings size={16}/></button>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Core Stable</span>
          </div>
        </div>
      </div>

      {/* Sidebars visible only in non-Play modes */}
      {!isPlay && (
        <div className="w-64 h-full flex flex-col pt-12">
          <div className="flex-1 overflow-hidden border-r border-black">
             <AssetBrowser 
                onDragStart={(asset) => setEngineState(prev => ({ ...prev, draggedAsset: asset }))}
                onAssetClick={(asset) => {
                  if (engineState.selectedObjectId) {
                     const updates: any = {};
                     if (asset.type === 'material') updates.materialId = asset.id;
                     if (asset.type === 'physics') updates.physicsId = asset.id;
                     updateObject(engineState.selectedObjectId, updates);
                  }
                }}
              />
          </div>
          <div className="h-[40%] border-r border-black">
             <Outliner 
               objects={sceneObjects}
               selectedId={engineState.selectedObjectId}
               onSelect={(id) => setEngineState(prev => ({ ...prev, selectedObjectId: id }))}
               onDelete={deleteObject}
             />
          </div>
        </div>
      )}

      {/* Viewport Area */}
      <div className="flex-1 relative bg-black mt-12 mb-8 overflow-hidden">
        <Scene 
          objects={sceneObjects}
          engineState={engineState}
          simConfig={simConfig}
          onSelect={(id) => setEngineState(prev => ({ ...prev, selectedObjectId: id }))}
          onUpdate={updateObject}
          onSpawn={spawnObject}
        />
        
        {/* Viewport HUD Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none space-y-2">
          <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.2em] bg-black/40 px-2 py-1 border-l-2 border-cyan-500 backdrop-blur-sm">
            Mode: {engineState.mode} // Latency: 1.2ms // VRAM: 4.2GB
          </div>
          {isPlay && (
            <div className="text-[10px] font-mono text-white uppercase tracking-widest bg-red-500/40 px-2 py-1 border-l-2 border-red-500 backdrop-blur-sm">
              [ LMB ] Shoot Particle • [ RMB ] Control Camera
            </div>
          )}
        </div>

        {/* Playback Controls */}
        {(isSimulate || isPlay) && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-2 gap-2 shadow-2xl">
              <button 
                onClick={() => setSimConfig(p => ({ ...p, paused: !p.paused }))}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-500 text-black hover:scale-110 transition-transform"
              >
                {simConfig.paused ? <Play fill="black" size={20} /> : <Square fill="black" size={20} />}
              </button>
              <div className="flex flex-col justify-center px-4">
                 <div className="text-[9px] font-black uppercase text-gray-500">Live Feed</div>
                 <div className="text-[10px] font-mono text-cyan-400">FPS: 144 // TRI: 1.2M</div>
              </div>
          </div>
        )}
      </div>

      {!isPlay && (
        <Inspector 
          selectedObject={sceneObjects.find(o => o.id === engineState.selectedObjectId) || null}
          onUpdate={(updates) => engineState.selectedObjectId && updateObject(engineState.selectedObjectId, updates)}
          onDelete={() => engineState.selectedObjectId && deleteObject(engineState.selectedObjectId)}
        />
      )}

      {/* Footer Status Bar */}
      <div className="absolute bottom-0 left-0 w-full h-8 bg-[#121212] border-t border-white/5 flex items-center px-4 gap-4 z-50">
        <Terminal size={14} className="text-cyan-500" />
        <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Kernel Ready</span>
        <div className="w-px h-3 bg-white/10 mx-2" />
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Instance Group Count: {simConfig.rockCount}</span>
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Placed Actors: {sceneObjects.length}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">GPU ACCEL</span>
           </div>
           <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">MULTI-THREAD</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;
