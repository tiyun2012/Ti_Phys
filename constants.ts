
import { Asset, MeshAsset, MaterialAsset, PhysicsAsset, LightAsset, PhysicsMaterial } from './types';

export const MESH_ASSETS: MeshAsset[] = [
  { id: 'm_cube', type: 'mesh', name: 'Cube', shape: 'cube' },
  { id: 'm_sphere', type: 'mesh', name: 'Sphere', shape: 'sphere' },
  { id: 'm_rock', type: 'mesh', name: 'Rough Rock', shape: 'rock' },
  { id: 'm_torus', type: 'mesh', name: 'Torus', shape: 'torus' },
  { id: 'm_cylinder', type: 'mesh', name: 'Cylinder', shape: 'cylinder' },
];

export const LIGHT_ASSETS: LightAsset[] = [
  { id: 'l_point', type: 'light', name: 'Point Light', lightType: 'point', color: '#ffffff', intensity: 10 },
  { id: 'l_spot', type: 'light', name: 'Spot Light', lightType: 'spot', color: '#ffffff', intensity: 20 },
  { id: 'l_dir', type: 'light', name: 'Directional', lightType: 'directional', color: '#ffffff', intensity: 1 },
];

export const MATERIAL_ASSETS: MaterialAsset[] = [
  { id: 'mat_default', type: 'material', name: 'Standard Grey', color: '#888888', roughness: 0.5, metalness: 0.1 },
  { id: 'mat_gold', type: 'material', name: 'Polished Gold', color: '#ffcc00', roughness: 0.1, metalness: 1.0 },
  { id: 'mat_ice', type: 'material', name: 'Clear Ice', color: '#aaddff', roughness: 0.05, metalness: 0.1, opacity: 0.6, transparent: true },
  { id: 'mat_magma', type: 'material', name: 'Glow Magma', color: '#ff4400', roughness: 0.9, metalness: 0.0, emissive: '#ff2200', emissiveIntensity: 2.0 },
  { id: 'mat_obsidian', type: 'material', name: 'Obsidian', color: '#111111', roughness: 0.2, metalness: 0.8 },
  { id: 'mat_rubber', type: 'material', name: 'Red Rubber', color: '#ff0055', roughness: 0.8, metalness: 0.0 },
];

export const PHYSICS_ASSETS: PhysicsAsset[] = [
  { id: 'phys_heavy', type: 'physics', name: 'High Mass', density: 10.0, friction: 0.8, restitution: 0.1 },
  { id: 'phys_bouncy', type: 'physics', name: 'Super Bouncy', density: 1.0, friction: 0.2, restitution: 0.95 },
  { id: 'phys_ice', type: 'physics', name: 'No Friction', density: 1.0, friction: 0.01, restitution: 0.05 },
  { id: 'phys_wood', type: 'physics', name: 'Standard Wood', density: 0.7, friction: 0.6, restitution: 0.3 },
];

export const ALL_ASSETS = [...MESH_ASSETS, ...MATERIAL_ASSETS, ...PHYSICS_ASSETS, ...LIGHT_ASSETS];

export const MATERIALS_TABLE: Record<PhysicsMaterial, { visual: any, physics: any }> = {
  default: {
    visual: { color: '#888888', roughness: 0.5, metalness: 0.1, colorVar: 0.1 },
    physics: { density: 1.0, friction: 0.5, restitution: 0.5 }
  },
  gold: {
    visual: { color: '#ffcc00', roughness: 0.1, metalness: 1.0, colorVar: 0.05 },
    physics: { density: 19.3, friction: 0.2, restitution: 0.1 }
  },
  ice: {
    visual: { color: '#aaddff', roughness: 0.05, metalness: 0.1, opacity: 0.6, transparent: true, colorVar: 0.1 },
    physics: { density: 0.9, friction: 0.01, restitution: 0.05 }
  },
  magma: {
    visual: { color: '#ff4400', roughness: 0.9, metalness: 0.0, emissive: '#ff2200', emissiveIntensity: 2.0, colorVar: 0.2 },
    physics: { density: 3.0, friction: 0.8, restitution: 0.1 }
  },
  obsidian: {
    visual: { color: '#111111', roughness: 0.2, metalness: 0.8, colorVar: 0.05 },
    physics: { density: 2.6, friction: 0.4, restitution: 0.1 }
  },
  rubber: {
    visual: { color: '#ff0055', roughness: 0.8, metalness: 0.0, colorVar: 0.1 },
    physics: { density: 1.1, friction: 0.9, restitution: 0.8 }
  },
  void: {
    visual: { color: '#000000', roughness: 0, metalness: 0, opacity: 0.8, transparent: true, colorVar: 0 },
    physics: { density: 100, friction: 1, restitution: 0 }
  },
  wood: {
    visual: { color: '#8b4513', roughness: 0.8, metalness: 0.0, colorVar: 0.15 },
    physics: { density: 0.7, friction: 0.6, restitution: 0.3 }
  },
  heavy: {
    visual: { color: '#444444', roughness: 0.5, metalness: 0.5, colorVar: 0.1 },
    physics: { density: 10.0, friction: 0.8, restitution: 0.1 }
  },
  bouncy: {
    visual: { color: '#00ff00', roughness: 0.5, metalness: 0.1, colorVar: 0.1 },
    physics: { density: 1.0, friction: 0.2, restitution: 0.95 }
  }
};
