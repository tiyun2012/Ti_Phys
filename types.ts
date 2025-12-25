export type PhysicsMaterial = 'rock' | 'ice' | 'rubber' | 'metal' | 'wood' | 'magma' | 'gold' | 'void';

export type ShapeType = 'cube' | 'sphere' | 'rock';

export interface LevelObject {
  id: string;
  shape: ShapeType;
  material: PhysicsMaterial;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SimulationWarning {
  id: string;
  type: 'KINETIC' | 'THERMAL' | 'VOID' | 'STRUCTURAL';
  message: string;
  timestamp: number;
}

export interface EditorConfig {
  active: boolean;
  selectedShape: ShapeType;
  selectedMaterial: PhysicsMaterial;
  selectedObjectId: string | null;
}

export interface SimulationConfig {
  rockCount: number;
  rockMaterial: PhysicsMaterial;
  gravity: [number, number, number];
  paused: boolean;
  debug: boolean;
  clothEnabled: boolean;
}