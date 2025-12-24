import React, { useState, useEffect } from 'react';
import { SimulationConfig, PhysicsMaterial } from '../types';
import { Layers, Box, Play, Pause, RefreshCw, Cpu, Wind, Hexagon } from 'lucide-react';

interface OverlayProps {
  config: SimulationConfig;
  updateConfig: (config: Partial<SimulationConfig>) => void;
}

const Overlay: React.FC<OverlayProps> = ({ config, updateConfig }) => {
  // Local state for slider to prevent heavy re-renders while dragging
  const [localRockCount, setLocalRockCount] = useState(config.rockCount);

  // Sync local state if config changes externally (e.g. reset)
  useEffect(() => {
    setLocalRockCount(config.rockCount);
  }, [config.rockCount]);

  const materials: PhysicsMaterial[] = ['rock', 'ice', 'rubber', 'metal'];

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-10">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-lg flex items-center gap-2">
            <Cpu className="w-8 h-8 text-cyan-400" />
            PHYSIX<span className="text-cyan-400">LAB</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-xs">
            High-performance Rapier physics engine demo with instanced rendering.
          </p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-4 w-72">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">System</span>
            <div className="flex gap-2">
              <button
                onClick={() => updateConfig({ paused: !config.paused })}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title={config.paused ? "Resume" : "Pause"}
              >
                {config.paused ? <Play size={16} /> : <Pause size={16} />}
              </button>
               <button
                onClick={() => window.location.reload()}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Restart"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Material Selector */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                 <span className="text-gray-300 flex items-center gap-1"><Hexagon size={12}/> Material</span>
                 <span className="text-cyan-400 font-mono uppercase">{config.rockMaterial}</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {materials.map((mat) => (
                  <button
                    key={mat}
                    onClick={() => updateConfig({ rockMaterial: mat })}
                    className={`text-[10px] uppercase font-bold py-1.5 rounded-md transition-all ${
                      config.rockMaterial === mat 
                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
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
                <span className="text-gray-300 flex items-center gap-1"><Box size={12}/> Object Count</span>
                <span className="text-cyan-400 font-mono">{localRockCount}</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={localRockCount}
                onChange={(e) => setLocalRockCount(parseInt(e.target.value))}
                onPointerUp={() => updateConfig({ rockCount: localRockCount })}
                onKeyUp={(e) => e.key === 'ArrowLeft' || e.key === 'ArrowRight' ? updateConfig({ rockCount: localRockCount }) : null}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
               <div className="flex justify-between text-xs mb-1">
                 <span className="text-gray-300 flex items-center gap-1"><Wind size={12}/> Gravity Y</span>
                 <span className="text-cyan-400 font-mono text-xs">{config.gravity[1].toFixed(1)}</span>
               </div>
               <input
                  type="range"
                  min="-20"
                  max="10"
                  step="0.5"
                  value={config.gravity[1]}
                  onChange={(e) => {
                     const val = parseFloat(e.target.value);
                     updateConfig({ gravity: [0, val, 0] });
                  }}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
            </div>

             <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs text-gray-300 flex items-center gap-1"><Layers size={12}/> Cloth Net</span>
                <button 
                  onClick={() => updateConfig({ clothEnabled: !config.clothEnabled })}
                  className={`w-10 h-5 rounded-full relative transition-colors ${config.clothEnabled ? 'bg-cyan-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.clothEnabled ? 'left-6' : 'left-1'}`} />
                </button>
             </div>
             
             <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Debug View</span>
                <button 
                  onClick={() => updateConfig({ debug: !config.debug })}
                  className={`w-10 h-5 rounded-full relative transition-colors ${config.debug ? 'bg-orange-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.debug ? 'left-6' : 'left-1'}`} />
                </button>
             </div>

          </div>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="text-center pb-6 pointer-events-auto">
        <div className="inline-block px-6 py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-sm text-gray-300 shadow-xl">
          <span className="text-cyan-400 font-bold">LMB</span> to shoot • <span className="text-cyan-400 font-bold">RMB</span> to rotate camera • <span className="text-cyan-400 font-bold">Scroll</span> to zoom
        </div>
      </div>
    </div>
  );
};

export default Overlay;