import * as THREE from 'three';
import { COLORS } from '../constants.js';

export class Materials {
    static createMetalMaterial(color = COLORS.METAL) {
        return new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.9,
            roughness: 0.1
        });
    }

    static createWoodMaterial(color = COLORS.WOOD) {
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0
        });
    }

    static createGlassMaterial(color = COLORS.GLASS, opacity = 0.3) {
        return new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: 0,
            roughness: 0,
            transparent: true,
            opacity: opacity,
            transmission: 0.9,
            thickness: 0.5
        });
    }

    static createGlowMaterial(color = COLORS.ACCENT) {
        return new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5
        });
    }

    static createPlasticMaterial(color) {
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.1
        });
    }

    static createToonMaterial(color) {
        return new THREE.MeshToonMaterial({
            color: color
        });
    }

    static createFruitMaterial(color) {
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.4,
            metalness: 0
        });
    }
}
