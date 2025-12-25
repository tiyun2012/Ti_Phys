
import React, { useState } from 'react';
import { SceneObject } from '../types';
import { Box, Sun, Search, Trash2, Eye, EyeOff, Hash } from 'lucide-react';

interface OutlinerProps {
  objects: SceneObject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const Outliner: React.FC<OutlinerProps> = ({ objects, selectedId, onSelect, onDelete, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredObjects = objects.filter(obj => 
    obj.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    obj.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-black">
      <div className="p-2 bg-[#181818] flex items-center justify-between border-b border-black">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
          <Hash size={10} /> Outliner
        </span>
        <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-cyan-600 bg-cyan-600/10 px-1.5 rounded">
                {objects.length} Actors
            </span>
            <button 
                onClick={onClear} 
                className="text-gray-600 hover:text-red-500 transition-colors p-1"
                title="Clear All Objects"
            >
                <Trash2 size={12} />
            </button>
        </div>
      </div>

      <div className="p-2">
        <div className="relative">
          <Search size={10} className="absolute left-2 top-2.5 text-gray-600" />
          <input 
            type="text" 
            placeholder="Filter hierarchy..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded py-1.5 pl-7 pr-2 text-[10px] focus:outline-none focus:border-cyan-500/50 text-gray-300 placeholder:text-gray-700"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredObjects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[10px] text-gray-700 italic">No actors in scene</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredObjects.map((obj) => {
              const isSelected = selectedId === obj.id;
              const isLight = obj.assetId.startsWith('l_');
              
              return (
                <div 
                  key={obj.id}
                  onClick={() => onSelect(obj.id)}
                  className={`group flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-white/5 ${isSelected ? 'bg-cyan-500/10 border-l-2 border-cyan-500' : 'border-l-2 border-transparent'}`}
                >
                  <div className={`p-1 rounded ${isSelected ? 'text-cyan-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    {isLight ? <Sun size={12} /> : <Box size={12} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-bold truncate uppercase tracking-tight ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                      {obj.name}
                    </div>
                    <div className="text-[8px] font-mono text-gray-700 truncate">
                      {obj.id.split('-')[0]}..
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(obj.id); }}
                      className="p-1 hover:text-red-500 text-gray-600 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Outliner;
