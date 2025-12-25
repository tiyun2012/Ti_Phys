
import React from 'react';
import { SceneObject, PhysicsAsset, MaterialAsset, LightAsset } from '../types';
import { ALL_ASSETS, MATERIAL_ASSETS, PHYSICS_ASSETS, LIGHT_ASSETS } from '../constants';
import { Trash2, Move, Database, Zap, HardDrive, Sun } from 'lucide-react';

interface InspectorProps {
  selectedObject: SceneObject | null;
  onUpdate: (updates: Partial<SceneObject>) => void;
  onDelete: () => void;
}

const Inspector: React.FC<InspectorProps> = ({ selectedObject, onUpdate, onDelete }) => {
  if (!selectedObject) {
    return (
      <div className="w-80 h-full bg-[#1e1e1e] border-l border-black flex flex-col items-center justify-center p-8 text-center pt-12">
        <Database size={48} className="text-gray-800 mb-4" />
        <h3 className="text-gray-500 font-bold uppercase text-xs tracking-widest leading-loose">
          No Actor Selected
        </h3>
        <p className="text-gray-600 text-[10px] mt-2 italic">
          Select an actor in the viewport to modify its properties.
        </p>
      </div>
    );
  }

  const currentPhysics = PHYSICS_ASSETS.find(p => p.id === selectedObject.physicsId);
  const currentMaterial = MATERIAL_ASSETS.find(m => m.id === selectedObject.materialId);
  const currentLight = LIGHT_ASSETS.find(l => l.id === selectedObject.assetId);

  return (
    <div className="w-80 h-full bg-[#1e1e1e] border-l border-black flex flex-col pt-12 overflow-y-auto scrollbar-hide">
      <div className="p-4 border-b border-black flex justify-between items-center">
        <div>
            <h2 className="text-white font-black text-xs uppercase truncate w-40">{selectedObject.name}</h2>
            <div className="text-[9px] text-gray-600 font-mono italic">{selectedObject.id}</div>
        </div>
        <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors">
            <Trash2 size={14} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Transform */}
        <section>
            <header className="flex items-center gap-2 mb-3">
                <Move size={12} className="text-cyan-500" />
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Transform</span>
            </header>
            <div className="space-y-2">
                <TransformRow label="Pos" values={selectedObject.position} onChange={(v) => onUpdate({ position: v as any })} />
                <TransformRow label="Rot" values={selectedObject.rotation} onChange={(v) => onUpdate({ rotation: v as any })} />
                <TransformRow label="Sca" values={selectedObject.scale} onChange={(v) => onUpdate({ scale: v as any })} />
            </div>
        </section>

        {/* Light Settings */}
        {currentLight && (
          <section className="bg-black/20 p-3 rounded-lg border border-white/5">
              <header className="flex items-center gap-2 mb-3">
                  <Sun size={12} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Light Settings</span>
              </header>
              <div className="space-y-3">
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Intensity</span>
                      <input 
                        type="number"
                        value={selectedObject.intensity || 0}
                        onChange={(e) => onUpdate({ intensity: parseFloat(e.target.value) })}
                        className="bg-black text-[10px] p-1 w-16 text-right border border-white/5"
                      />
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Color</span>
                      <input 
                        type="color"
                        value={selectedObject.color || '#ffffff'}
                        onChange={(e) => onUpdate({ color: e.target.value })}
                        className="bg-transparent border-none w-8 h-6 cursor-pointer"
                      />
                  </div>
              </div>
          </section>
        )}

        {/* Visual Component */}
        {!currentLight && (
          <section className="bg-black/20 p-3 rounded-lg border border-white/5">
              <header className="flex items-center gap-2 mb-3">
                  <Zap size={12} className="text-pink-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Material</span>
              </header>
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border border-white/10" style={{ backgroundColor: currentMaterial?.color }} />
                  <div className="flex-1">
                      <div className="text-[10px] font-bold text-white uppercase">{currentMaterial?.name}</div>
                      <div className="text-[8px] text-gray-600 uppercase">PBR Shader</div>
                  </div>
              </div>
          </section>
        )}

        {/* Physics Component */}
        {!currentLight && (
          <section className="bg-black/20 p-3 rounded-lg border border-white/5">
              <header className="flex items-center gap-2 mb-3">
                  <HardDrive size={12} className="text-yellow-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Physics</span>
              </header>
              {selectedObject.physicsId ? (
                  <div className="space-y-3">
                      <div className="flex items-center gap-2">
                          <div className="flex-1">
                              <div className="text-[10px] font-bold text-white uppercase">{currentPhysics?.name}</div>
                          </div>
                          <button 
                              onClick={() => onUpdate({ physicsId: null })}
                              className="text-[9px] bg-red-500/10 text-red-400 px-2 py-1 rounded hover:bg-red-500/20 uppercase"
                          >
                              Disable
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="text-center py-2">
                      <select 
                          onChange={(e) => onUpdate({ physicsId: e.target.value })}
                          className="w-full bg-black border border-white/10 text-[10px] p-2 rounded focus:outline-none uppercase font-bold text-gray-500"
                      >
                          <option value="">Enable Physics...</option>
                          {PHYSICS_ASSETS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                  </div>
              )}
          </section>
        )}
      </div>
    </div>
  );
};

const TransformRow: React.FC<{ label: string, values: number[], onChange: (v: number[]) => void }> = ({ label, values, onChange }) => (
    <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono text-gray-600 w-6 uppercase font-black">{label}</span>
        {['X', 'Y', 'Z'].map((axis, i) => (
            <div key={axis} className="flex-1 flex bg-black border border-white/5 rounded overflow-hidden">
                <span className="text-[8px] bg-white/5 text-gray-600 px-1 flex items-center">{axis}</span>
                <input 
                    type="number" 
                    step="0.1"
                    value={parseFloat(values[i].toFixed(2))}
                    onChange={(e) => {
                        const newValues = [...values];
                        newValues[i] = parseFloat(e.target.value) || 0;
                        onChange(newValues);
                    }}
                    className="w-full bg-transparent text-[10px] p-1 text-gray-400 focus:outline-none"
                />
            </div>
        ))}
    </div>
);

export default Inspector;
