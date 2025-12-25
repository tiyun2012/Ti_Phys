
// Fix: Use consolidated React namespace augmentation for React Three Fiber intrinsic elements.
// This ensures that Three.js elements like 'mesh' and 'boxGeometry' are available in JSX 
// without overriding or shadowing standard HTML tags like 'div', 'span', and 'button'.
import { ThreeElements } from '@react-three/fiber';
import * as React from 'react';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

export type EngineMode = 'EDITOR' | 'SIMULATE' | 'PLAY';
export type TransformMode = 'translate' | 'rotate' | 'scale';
export type AssetType = 'mesh' | 'material' | 'physics' | 'light';
export type ShapeType = 'cube' | 'sphere' | 'rock' | 'torus' | 'cylinder';
export type LightType = 'point' | 'spot' | 'directional';

export interface MeshAsset {
  id: string;
  type: 'mesh';
  name: string;
  shape: ShapeType;
}

export interface MaterialAsset {
  id: string;
  type: 'material';
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  transparent?: boolean;
}

export interface PhysicsAsset {
  id: string;
  type: 'physics';
  name: string;
  density: number;
  friction: number;
  restitution: number;
}

export interface LightAsset {
  id: string;
  type: 'light';
  name: string;
  lightType: LightType;
  color: string;
  intensity: number;
}

export type Asset = MeshAsset | MaterialAsset | PhysicsAsset | LightAsset;

export interface SceneObject {
  id: string;
  name: string;
  assetId: string; // Refers to mesh or light
  materialId: string;
  physicsId: string | null;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  // Light specific props if asset is light
  intensity?: number;
  color?: string;
}

export interface EngineState {
  mode: EngineMode;
  transformMode: TransformMode;
  selectedObjectId: string | null;
  draggedAsset: Asset | null;
}

export type PhysicsMaterial = 'default' | 'gold' | 'ice' | 'magma' | 'obsidian' | 'rubber' | 'void' | 'wood' | 'heavy' | 'bouncy';

export interface SimulationConfig {
  rockCount: number;
  rockMaterial: PhysicsMaterial;
  clothEnabled: boolean;
  paused: boolean;
}

export interface EditorConfig {
  active: boolean;
  selectedObjectId: string | null;
  selectedShape: ShapeType;
  selectedMaterial: PhysicsMaterial;
}

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
  type: 'KINETIC' | 'VOID' | 'THERMAL';
  message: string;
}
