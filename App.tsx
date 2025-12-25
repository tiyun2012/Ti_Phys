import React, { useState, useCallback } from 'react';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import { SimulationConfig, LevelObject, EditorConfig, SimulationWarning } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>({
    rockCount: 400,
    rockMaterial: 'rock',
    gravity: [0, -9.81, 0],
    paused: false,
    debug: false,
    clothEnabled: true,
  });

  const [editorConfig, setEditorConfig] = useState<EditorConfig>({
    active: false,
    selectedShape: 'cube',
    selectedMaterial: 'wood',
    selectedObjectId: null,
  });

  const [levelObjects, setLevelObjects] = useState<LevelObject[]>([]);
  const [warnings, setWarnings] = useState<SimulationWarning[]>([]);

  const addWarning = useCallback((type: SimulationWarning['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setWarnings((prev) => [{ id, type, message, timestamp: Date.now() }, ...prev].slice(0, 4));
    
    // Auto remove warning after 3 seconds
    setTimeout(() => {
      setWarnings((prev) => prev.filter((w) => w.id !== id));
    }, 3000);
  }, []);

  const updateConfig = (newConfig: Partial<SimulationConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const updateEditorConfig = (newConfig: Partial<EditorConfig>) => {
    setEditorConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const addLevelObject = (obj: LevelObject) => {
    setLevelObjects((prev) => [...prev, obj]);
    setEditorConfig(prev => ({ ...prev, selectedObjectId: obj.id }));
  };

  const updateLevelObject = (id: string, updates: Partial<LevelObject>) => {
    setLevelObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...updates } : obj));
  };

  const clearLevel = () => {
    setLevelObjects([]);
    updateEditorConfig({ selectedObjectId: null });
    setWarnings([]);
  };

  return (
    <div className="relative w-full h-full bg-gray-900 text-white font-sans overflow-hidden">
      <Scene 
        config={config} 
        editorConfig={editorConfig} 
        levelObjects={levelObjects} 
        onAddObject={addLevelObject}
        onUpdateObject={updateLevelObject}
        onSelectObject={(id) => updateEditorConfig({ selectedObjectId: id })}
        onTriggerConflict={addWarning}
      />
      <Overlay 
        config={config} 
        updateConfig={updateConfig} 
        editorConfig={editorConfig}
        updateEditorConfig={updateEditorConfig}
        onClearLevel={clearLevel}
        objectCount={levelObjects.length}
        warnings={warnings}
      />
    </div>
  );
};

export default App;