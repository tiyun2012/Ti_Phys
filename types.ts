export type PhysicsMaterial = 'rock' | 'ice' | 'rubber' | 'metal';

export interface SimulationConfig {
  rockCount: number;
  rockMaterial: PhysicsMaterial;
  gravity: [number, number, number];
  paused: boolean;
  debug: boolean;
  clothEnabled: boolean;
}

export interface RockData {
  key: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}