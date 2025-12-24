import React, { useState } from 'react';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import { SimulationConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>({
    rockCount: 600, // Balanced start for most devices
    rockMaterial: 'rock',
    gravity: [0, -9.81, 0],
    paused: false,
    debug: false,
    clothEnabled: true,
  });

  const updateConfig = (newConfig: Partial<SimulationConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  return (
    <div className="relative w-full h-full bg-gray-900 text-white font-sans">
      <Scene config={config} />
      <Overlay config={config} updateConfig={updateConfig} />
    </div>
  );
};

export default App;