import React, { useState, useEffect } from 'react';
import { SimulationConfig, PhysicsMaterial, EditorConfig, ShapeType, SimulationWarning } from '../types';
import { MATERIALS_TABLE } from '../constants';
import { Layers, Box, Play, Pause, RefreshCw, Cpu, Wind, Hexagon, Hammer, MousePointer2, Trash2, BoxSelect, Circle, Pyramid, Move, AlertTriangle } from 'lucide-react';

interface OverlayProps {
  config: SimulationConfig;
  updateConfig: (config: Partial<SimulationConfig>) => void;
  editorConfig: EditorConfig;
  updateEditorConfig: (config: Partial<EditorConfig>) => void;
  onClearLevel: () => void;
  objectCount: number;
  warnings: SimulationWarning[];
}

const Overlay: React.FC<OverlayProps> = ({ config, updateConfig, editorConfig, updateEditorConfig, onClearLevel, objectCount, warnings }) => {
  const [localRockCount, setLocalRockCount] = useState(config.rockCount);

  useEffect(() => {
    setLocalRockCount(config.rockCount);
  }, [config.rockCount]);

  const materials = Object.keys(MATERIALS_TABLE) as PhysicsMaterial[];
  const shapes: { type: ShapeType; icon: React.ReactNode }[] = [
      { type: 'cube', icon: <BoxSelect size={16} /> },
      { type: 'sphere', icon: <Circle size={16} /> },
      { type: 'rock', icon: <Pyramid size={16} /> }
  ];

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-10">
      {/* System Warning Notifications */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center w-full max-w-md pointer-events-none">
        {warnings.map((warning) => (
          <div 
            key={warning.id} 
            className="flex items-center gap-4 bg-red-600/20 backdrop-blur-xl border-y border-red-500/50 w-full py-2 px-4 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.3)]"
          >
            <div className="bg-red-500 p-1 rounded animate-bounce">
              <AlertTriangle size={16} className="text-white" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[10px] font-black text-red-400 tracking-[0.2em] uppercase">
                System Conflict: {warning.type}
              </div>
              <div className="text-sm font-bold text-white whitespace-nowrap overflow-hidden">
                {warning.message}
              </div>
            </div>
            <div className="text-[10px] font-mono text-red-500 font-bold">
              0x{Math.floor(Math.random() * 9999).toString(16)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-lg flex items-center gap-2">
            <Cpu className="w-8 h-8 text-cyan-400" />
            PHYSIX<span className="text-cyan-400">LAB</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-xs uppercase tracking-widest font-bold">
            Conflict Monitor v2.5
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 self-end">
                <button
                    onClick={() => updateEditorConfig({ active: !editorConfig.active, selectedObjectId: null })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold uppercase text-xs tracking-wider ${
                        editorConfig.active 
                        ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                >
                    <Hammer size={16} />
                    {editorConfig.active ? 'Exit Design' : 'Enter Design'}
                </button>
            </div>

            <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-4 w-72 max-h-[80vh] overflow-y-auto shadow-2xl">
            
            {editorConfig.active ? (
                 <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                        <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-2">
                            <Box size={12} /> Asset Browser
                        </span>
                        <div className="flex gap-2">
                            <span className="text-[10px] text-gray-500 font-mono">{objectCount} Assets</span>
                            <button onClick={onClearLevel} className="text-red-400 hover:text-red-300" title="Purge Level">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Structure Shape</div>
                        <div className="flex gap-2">
                            {shapes.map(s => (
                                <button
                                    key={s.type}
                                    onClick={() => updateEditorConfig({ selectedShape: s.type })}
                                    className={`flex-1 py-3 rounded-lg flex justify-center items-center transition-all ${
                                        editorConfig.selectedShape === s.type
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    {s.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Property Profile</div>
                        <div className="grid grid-cols-4 gap-1.5">
                            {materials.map((mat) => (
                            <button
                                key={mat}
                                onClick={() => updateEditorConfig({ selectedMaterial: mat })}
                                className={`text-[9px] uppercase font-bold py-2 rounded-md transition-all border border-transparent ${
                                    editorConfig.selectedMaterial === mat 
                                    ? 'bg-yellow-500/90 text-black border-yellow-400' 
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {mat}
                            </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-[10px] text-gray-400 leading-relaxed italic">
                        Lift objects with the translation gizmo to simulate kinetic energy stress. High impacts will trigger system warnings.
                    </div>

                 </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Engine Status</span>
                        <div className="flex gap-2">
                        <button
                            onClick={() => updateConfig({ paused: !config.paused })}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            {config.paused ? <Play size={16} /> : <Pause size={16} />}
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <RefreshCw size={16} />
                        </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-300 flex items-center gap-1"><Hexagon size={12}/> Global Context</span>
                            <span className="text-cyan-400 font-mono uppercase text-[10px]">{config.rockMaterial}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                            {materials.map((mat) => (
                            <button
                                key={mat}
                                onClick={() => updateConfig({ rockMaterial: mat })}
                                className={`text-[9px] uppercase font-bold py-2 rounded-md transition-all border border-transparent ${
                                config.rockMaterial === mat 
                                ? 'bg-cyan-500/90 text-black border-cyan-400' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {mat}
                            </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300 flex items-center gap-1"><Box size={12}/> Load Factor</span>
                            <span className="text-cyan-400 font-mono">{localRockCount}</span>
                        </div>
                        <input
                            type="range" min="0" max="2000" step="100"
                            value={localRockCount}
                            onChange={(e) => setLocalRockCount(parseInt(e.target.value))}
                            onPointerUp={() => updateConfig({ rockCount: localRockCount })}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-xs text-gray-300 flex items-center gap-1"><Layers size={12}/> Surface Tension</span>
                        <button 
                            onClick={() => updateConfig({ clothEnabled: !config.clothEnabled })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${config.clothEnabled ? 'bg-cyan-500' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.clothEnabled ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
            )}
            </div>
        </div>
      </div>

      <div className="text-center pb-6 pointer-events-auto">
        <div className="inline-block px-6 py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-sm text-gray-300 shadow-xl">
            {editorConfig.active ? (
                <span className="flex items-center gap-4">
                     <span className="text-yellow-500 font-bold">CLICK GROUND</span> to Deploy • <span className="text-yellow-500 font-bold">LIFT GIZMO</span> to Simulate Drop
                </span>
            ) : (
                <span className="flex items-center gap-4">
                    <span className="text-cyan-400 font-bold">RMB</span> Orbit • <span className="text-cyan-400 font-bold">SCROLL</span> Zoom • <span className="text-cyan-400 font-bold underline">DESIGN MODE</span> for Conflict Testing
                </span>
            )}
        </div>
      </div>
    </div>
  );
};

export default Overlay;