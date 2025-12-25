
import React, { useState } from 'react';
import { MESH_ASSETS, MATERIAL_ASSETS, PHYSICS_ASSETS, LIGHT_ASSETS } from '../constants';
import { Asset, AssetType } from '../types';
import { Folder, Box, Palette, Activity, ChevronRight, ChevronDown, Search, Sun, Lightbulb } from 'lucide-react';

interface AssetBrowserProps {
  onDragStart: (asset: Asset) => void;
  onAssetClick: (asset: Asset) => void;
}

const AssetBrowser: React.FC<AssetBrowserProps> = ({ onDragStart, onAssetClick }) => {
  const [search, setSearch] = useState('');

  const renderAsset = (asset: Asset) => (
    <div 
      key={asset.id}
      draggable
      onDragStart={() => onDragStart(asset)}
      onClick={() => onAssetClick(asset)}
      className="group flex flex-col items-center p-2 rounded-lg hover:bg-cyan-600/10 cursor-grab active:cursor-grabbing border border-transparent hover:border-cyan-500/20 transition-all"
    >
      <div className="w-12 h-12 bg-[#2d2d2d] rounded flex items-center justify-center mb-1 group-hover:scale-105 transition-transform shadow-inner">
        {asset.type === 'mesh' && <Box size={24} className="text-cyan-400" />}
        {asset.type === 'material' && <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: (asset as any).color }} />}
        {asset.type === 'physics' && <Activity size={24} className="text-yellow-500" />}
        {asset.type === 'light' && <Lightbulb size={24} className="text-orange-400" />}
      </div>
      <span className="text-[9px] text-center font-bold text-gray-500 group-hover:text-white truncate w-full uppercase">
        {asset.name}
      </span>
    </div>
  );

  return (
    <div className="w-full h-full bg-[#1e1e1e] flex flex-col overflow-hidden">
      <div className="p-3 border-b border-black">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search Assets..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121212] border border-white/5 rounded py-1 pl-7 pr-2 text-[10px] focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        <FolderItem name="Content" isOpen icon={<Folder size={14}/>}>
            <FolderItem name="Primitives" icon={<Box size={14} className="text-cyan-400"/>}>
                <div className="grid grid-cols-2 gap-1 p-2">
                    {MESH_ASSETS.map(renderAsset)}
                </div>
            </FolderItem>
            <FolderItem name="Lights" icon={<Sun size={14} className="text-orange-400"/>}>
                <div className="grid grid-cols-2 gap-1 p-2">
                    {LIGHT_ASSETS.map(renderAsset)}
                </div>
            </FolderItem>
            <FolderItem name="Materials" icon={<Palette size={14} className="text-pink-400"/>}>
                <div className="grid grid-cols-2 gap-1 p-2">
                    {MATERIAL_ASSETS.map(renderAsset)}
                </div>
            </FolderItem>
            <FolderItem name="Physics" icon={<Activity size={14} className="text-yellow-500"/>}>
                <div className="grid grid-cols-2 gap-1 p-2">
                    {PHYSICS_ASSETS.map(renderAsset)}
                </div>
            </FolderItem>
        </FolderItem>
      </div>
    </div>
  );
};

const FolderItem: React.FC<{ name: string, icon: React.ReactNode, isOpen?: boolean, children?: React.ReactNode }> = ({ name, icon, isOpen: initialOpen = false, children }) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    return (
        <div className="mt-1">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors group"
            >
                {isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                <span className="text-gray-500 group-hover:text-gray-300 transition-colors">{icon}</span>
                <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-200 uppercase tracking-widest">{name}</span>
            </div>
            {isOpen && <div className="ml-3 border-l border-white/5 pl-2">{children}</div>}
        </div>
    );
};

export default AssetBrowser;
