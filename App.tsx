import React, { useState, useCallback, useMemo } from 'react';
import Scene from './components/Scene';
import AssetBrowser from './components/AssetBrowser';
import Inspector from './components/Inspector';
import Outliner from './components/Outliner';
import { SceneObject, Asset, EngineState, EngineMode, SimulationConfig, TransformMode, SimulationWarning } from './types';
import { Play, Square, Terminal, Activity, Save, Settings, Gamepad2, Box, Move, RotateCcw, Maximize, AlertTriangle, RefreshCcw, Wind, Cpu } from 'lucide-react';

const App: React.FC = () => {
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([]);
  const [warnings, setWarnings] = useState<SimulationWarning[]>([]);
  const [simConfig, setSimConfig] = useState<SimulationConfig>({
    rockCount: 0,
    rockMaterial: 'default',
    clothEnabled: true,
    paused: false,
    vortexEnabled: false,
    vortexStrength: 25,
    precisionMode: true,
  });
  const [engineState, setEngineState] = useState<EngineState>({
    mode: 'EDITOR',
    transformMode: 'translate',
    selectedObjectId: null,
    draggedAsset: null,
  });

  const rockSeed = useMemo(() => Math.random(), []);

  const setMode = (mode: EngineMode) => {
    setEngineState(prev => ({ ...prev, mode, selectedObjectId: null }));
    // We no longer force pause/unpause based on mode to allow live-editing
  };

  const setTransformMode = (transformMode: TransformMode) => {
    setEngineState(prev => ({ ...prev, transformMode }));
  };

  const addWarning = useCallback((type: SimulationWarning['type'], message: string) => {
    const id = crypto.randomUUID();
    setWarnings(prev => [{ id, type, message }, ...prev].slice(0, 3));
    setTimeout(() => {
      setWarnings(prev => prev.filter(w => w.id !== id));
    }, 4000);
  }, []);

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

  const clearScene = () => {
    setSceneObjects([]);
    setEngineState(prev => ({ ...prev, selectedObjectId: null }));
  };

  const isEditor = engineState.mode === 'EDITOR';
  const isPlay = engineState.mode === 'PLAY';

  return (
    <div className="flex h-screen w-screen bg-[#050505] text-gray-300 font-sans overflow-hidden select-none">
      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full h-12 bg-[#0d0d0d]/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white font-black tracking-tighter text-xl cursor-pointer" onClick={() => window.location.reload()}>
            <Activity size={22} className="text-cyan-400 animate-pulse" />
            VORTEX<span className="text-cyan-400">LAB</span>
          </div>
          
          <div className="flex bg-black/60 rounded-lg p-1 border border-white/10">
             <button 
                onClick={() => setMode('EDITOR')}
                className={`flex items-center gap-2 px-4 py-1 text-[10px] font-bold uppercase rounded transition-all ${engineState.mode === 'EDITOR' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}
             >
                <Box size={12} /> Design
             </button>
             <button 
                onClick={() => setMode('SIMULATE')}
                className={`flex items-center gap-2 px-4 py-1 text-[10px] font-bold uppercase rounded transition-all ${engineState.mode === 'SIMULATE' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-gray-500 hover:text-gray-300'}`}
             >
                <Activity size={12} /> Viewport
             </button>
             <button 
                onClick={() => setMode('PLAY')}
                className={`flex items-center gap-2 px-4 py-1 text-[10px] font-bold uppercase rounded transition-all ${engineState.mode === 'PLAY' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-gray-500 hover:text-gray-300'}`}
             >
                <Gamepad2 size={12} /> Play
             </button>
          </div>

          {isEditor && (
            <div className="flex bg-black/60 rounded-lg p-1 border border-white/10 ml-4">
              <button onClick={() => setTransformMode('translate')} className={`p-1.5 rounded ${engineState.transformMode === 'translate' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-600'}`}><Move size={14}/></button>
              <button onClick={() => setTransformMode('rotate')} className={`p-1.5 rounded ${engineState.transformMode === 'rotate' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-600'}`}><RotateCcw size={14}/></button>
              <button onClick={() => setTransformMode('scale')} className={`p-1.5 rounded ${engineState.transformMode === 'scale' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-600'}`}><Maximize size={14}/></button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Main Simulation Control */}
          <button 
            onClick={() => setSimConfig(p => ({ ...p, paused: !p.paused }))}
            className={`flex items-center gap-2 px-3 py-1 rounded border transition-all ${simConfig.paused ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}
          >
            {simConfig.paused ? <Play size={14} fill="currentColor" /> : <Square size={14} fill="currentColor" />}
            <span className="text-[10px] font-bold uppercase">{simConfig.paused ? 'Run Simulation' : 'Pause'}</span>
          </button>

          <div className="flex items-center bg-black/60 px-3 py-1.5 rounded-md border border-white/5 gap-3">
             <Wind size={14} className={simConfig.vortexEnabled ? "text-cyan-400 animate-spin" : "text-gray-600"} />
             <button 
               onClick={() => setSimConfig(p => ({ ...p, vortexEnabled: !p.vortexEnabled }))}
               className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${simConfig.vortexEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-500'}`}
             >
               Vortex
             </button>
             <input 
               type="range" min="0" max="100" 
               value={simConfig.vortexStrength}
               onChange={(e) => setSimConfig(p => ({ ...p, vortexStrength: parseInt(e.target.value) }))}
               className="w-16 h-1 accent-cyan-500 cursor-pointer"
             />
          </div>
          
          <div className="flex items-center bg-black/60 px-3 py-1.5 rounded-md border border-white/5 gap-2">
             <Cpu size={14} className={simConfig.precisionMode ? "text-green-400" : "text-gray-600"} />
             <button 
               onClick={() => setSimConfig(p => ({ ...p, precisionMode: !p.precisionMode }))}
               className={`text-[9px] font-bold uppercase ${simConfig.precisionMode ? 'text-green-400' : 'text-gray-500'}`}
             >
               High-P
             </button>
          </div>

          <button className="p-2 text-gray-500 hover:text-white"><Save size={16}/></button>
          <button className="p-2 text-gray-500 hover:text-white"><Settings size={16}/></button>
        </div>
      </div>

      {isEditor && (
        <div className="w-64 h-full flex flex-col pt-12 animate-in slide-in-from-left duration-300">
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
          <Outliner 
            objects={sceneObjects}
            selectedId={engineState.selectedObjectId}
            onSelect={(id) => setEngineState(prev => ({ ...prev, selectedObjectId: id }))}
            onDelete={deleteObject}
            onClear={clearScene}
          />
        </div>
      )}

      <div className={`flex-1 relative bg-black mt-12 mb-8 overflow-hidden transition-all duration-500`}>
        <Scene 
          objects={sceneObjects}
          engineState={engineState}
          simConfig={simConfig}
          rockSeed={rockSeed}
          onSelect={(id) => setEngineState(prev => ({ ...prev, selectedObjectId: id }))}
          onUpdate={updateObject}
          onSpawn={spawnObject}
          onWarning={addWarning}
        />
        
        {/* Alerts HUD */}
        <div className="absolute top-16 right-4 w-72 flex flex-col gap-2 z-40">
          {warnings.map(warning => (
            <div key={warning.id} className="bg-red-500/20 border-l-4 border-red-500 backdrop-blur-md px-4 py-2 flex items-center gap-3 animate-in slide-in-from-right">
              <AlertTriangle size={16} className="text-red-500" />
              <div className="flex-1">
                <div className="text-[9px] font-black uppercase text-red-500">Conflict: {warning.type}</div>
                <div className="text-[10px] text-white font-medium">{warning.message}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Viewport Info */}
        <div className="absolute bottom-4 left-4 pointer-events-none space-y-1">
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-white/5 backdrop-blur-sm">
             <span className="text-[9px] font-mono text-cyan-400">SOLVER: RAPIER 1.3</span>
             <div className={`w-1 h-1 rounded-full ${simConfig.paused ? 'bg-red-500' : 'bg-cyan-400 animate-ping'}`} />
             <span className="text-[9px] font-mono text-gray-500 uppercase">{simConfig.paused ? 'Simulation Paused' : 'Live Physics'}</span>
             <span className="text-[9px] font-mono text-gray-500">| OBJS: {simConfig.rockCount + sceneObjects.length}</span>
          </div>
          {isPlay && (
             <div className="text-[9px] font-mono text-white/40 uppercase tracking-[0.3em]">
               LMB SHOOT | RMB ORBIT | SCROLL ZOOM
             </div>
          )}
        </div>

        {!isEditor && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 gap-4 shadow-2xl animate-in slide-in-from-bottom">
              <div className="flex flex-col items-end">
                <div className="text-[8px] font-black text-gray-500 uppercase">Buffer Load</div>
                <input 
                  type="range" min="0" max="3000" step="100"
                  value={simConfig.rockCount}
                  onChange={(e) => setSimConfig(p => ({ ...p, rockCount: parseInt(e.target.value) }))}
                  className="w-32 h-1 accent-amber-500"
                />
              </div>
              
              <button 
                onClick={() => setSimConfig(p => ({ ...p, paused: !p.paused }))}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-transform hover:scale-110 ${simConfig.paused ? 'bg-cyan-500 text-black' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}
              >
                {simConfig.paused ? <Play fill="black" size={20} /> : <Square fill="currentColor" size={20} />}
              </button>

              <button onClick={() => setMode('EDITOR')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white"><RefreshCcw size={18} /></button>
          </div>
        )}
      </div>

      {isEditor && (
        <Inspector 
          selectedObject={sceneObjects.find(o => o.id === engineState.selectedObjectId) || null}
          onUpdate={(updates) => engineState.selectedObjectId && updateObject(engineState.selectedObjectId, updates)}
          onDelete={() => engineState.selectedObjectId && deleteObject(engineState.selectedObjectId)}
        />
      )}

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 w-full h-8 bg-[#0d0d0d] border-t border-white/5 flex items-center px-4 justify-between z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${simConfig.paused ? 'bg-amber-500' : 'bg-green-500'}`} />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Operational</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <span className="text-[10px] font-mono text-cyan-700 uppercase italic">
            {simConfig.rockCount} Dynamic Nodes Simulated
          </span>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-black text-gray-600 uppercase tracking-tighter">
           <span>GPU_ACCEL: ON</span>
           <span>P_STEP: {simConfig.precisionMode ? '0.008s' : '0.016s'}</span>
           <span className="text-cyan-900">Vortex Kernel v3.11</span>
        </div>
      </div>
    </div>
  );
};

export default App;