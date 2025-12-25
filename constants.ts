import { PhysicsMaterial } from './types';

interface MaterialData {
  physics: {
    density: number;
    friction: number;
    restitution: number;
  };
  visual: {
    color: string;
    roughness: number;
    metalness: number;
    emissive?: string;
    emissiveIntensity?: number;
    transparent?: boolean;
    opacity?: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
    colorVar: number; // 0-1 variance
  };
}

export const MATERIALS_TABLE: Record<PhysicsMaterial, MaterialData> = {
  rock: {
    physics: { density: 2.0, friction: 0.8, restitution: 0.05 },
    visual: { color: '#888888', roughness: 0.9, metalness: 0.1, colorVar: 0.15 }
  },
  wood: {
    physics: { density: 0.7, friction: 0.7, restitution: 0.2 },
    visual: { color: '#8b5a2b', roughness: 0.8, metalness: 0.0, colorVar: 0.2 }
  },
  metal: {
    physics: { density: 7.8, friction: 0.4, restitution: 0.2 },
    visual: { color: '#a0a0a0', roughness: 0.3, metalness: 0.9, colorVar: 0.05 }
  },
  ice: {
    physics: { density: 0.9, friction: 0.02, restitution: 0.1 },
    visual: { color: '#aaddff', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.7, clearcoat: 1.0, colorVar: 0.05 }
  },
  rubber: {
    physics: { density: 1.1, friction: 0.9, restitution: 0.95 },
    visual: { color: '#ff0055', roughness: 0.4, metalness: 0.0, colorVar: 0.1 }
  },
  magma: {
    physics: { density: 2.5, friction: 0.5, restitution: 0.1 },
    visual: { color: '#ff4400', roughness: 0.5, metalness: 0.2, emissive: '#ff2200', emissiveIntensity: 2.5, colorVar: 0.15 }
  },
  gold: {
    physics: { density: 19.3, friction: 0.4, restitution: 0.2 },
    visual: { color: '#ffcc00', roughness: 0.1, metalness: 1.0, clearcoat: 1.0, colorVar: 0.05 }
  },
  void: {
    physics: { density: 0.1, friction: 0.0, restitution: 1.2 }, // Super bouncy, light
    visual: { color: '#1a0033', roughness: 0.2, metalness: 0.8, emissive: '#6600ff', emissiveIntensity: 1.5, transparent: true, opacity: 0.8, colorVar: 0.2 }
  }
};