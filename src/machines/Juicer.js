import * as THREE from 'three';
import gsap from 'gsap';
import { COLORS } from '../constants.js';
import { Materials } from '../utils/Materials.js';

export class Juicer {
    constructor(scene, physicsWorld, position = { x: 36, y: 0, z: 0 }) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.position = position;
        this.onComplete = null;
    }

    init() {
        // Removed pipe - cleaner visual
        this.createJuicerChamber();
        this.createConveyor();
    }

    createJuicerChamber() {
        // No visible juicer chamber - just processing area
        // Keep reference for animations but don't add to scene
        this.juicer = new THREE.Group();
        this.juicer.position.set(this.position.x, this.position.y + 2, this.position.z);
    }

    createConveyor() {
        // Simple conveyor belt
        const geometry = new THREE.BoxGeometry(8, 0.3, 2);
        const material = Materials.createMetalMaterial(0x333333);
        const conveyor = new THREE.Mesh(geometry, material);
        conveyor.position.set(this.position.x + 6, this.position.y + 0.5, this.position.z);
        conveyor.castShadow = true;
        this.scene.add(conveyor);
        this.conveyor = conveyor;
    }

    processFruits(fruits) {
        console.log('🧃 Juicer processing fruits:', fruits);
        
        // Show fruits rolling in
        this.showFruitsRolling(fruits);
        
        // Shake animation
        setTimeout(() => {
            gsap.to(this.juicer.rotation, {
                x: '+=0.5',
                y: '+=0.5',
                duration: 0.1,
                repeat: 20,
                yoyo: true,
                onComplete: () => {
                    const letters = this.extractSmartLetters(fruits);
                    this.spitOutLetters(letters);
                }
            });
        }, 2000);
    }

    extractSmartLetters(fruits) {
        // Extract letters intelligently - avoid duplicates by using next available letter
        const usedLetters = new Set();
        const letters = [];
        
        fruits.forEach(fruit => {
            const fruitUpper = fruit.toUpperCase();
            let letterFound = false;
            
            // Try each letter in the fruit name
            for (let i = 0; i < fruitUpper.length; i++) {
                const letter = fruitUpper[i];
                
                // Skip spaces and special chars
                if (letter.match(/[A-Z]/)) {
                    if (!usedLetters.has(letter)) {
                        letters.push(letter);
                        usedLetters.add(letter);
                        letterFound = true;
                        console.log(`   ${fruit} → ${letter} (position ${i})`);
                        break;
                    }
                }
            }
            
            // If all letters are used, just take the first letter anyway
            if (!letterFound) {
                const fallback = fruitUpper[0];
                letters.push(fallback);
                console.log(`   ${fruit} → ${fallback} (duplicate fallback)`);
            }
        });
        
        console.log('📝 Smart letters extracted:', letters);
        return letters;
    }

    showFruitsRolling(fruits) {
        // Display fruit names rolling into juicer in a grid layout
        const itemsPerRow = 3; // Max 3 items per row
        
        fruits.forEach((fruit, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 256, 128);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(fruit, 128, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const geometry = new THREE.PlaneGeometry(2, 1);
            const fruitLabel = new THREE.Mesh(geometry, material);
            
            // Calculate grid position (3 per row)
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            
            fruitLabel.position.set(
                this.position.x - 4 + col * 2.5,  // Spread horizontally
                this.position.y + 5 - row * 1.5,   // Stack rows
                this.position.z
            );
            
            this.scene.add(fruitLabel);
            
            // Animate sliding in
            gsap.from(fruitLabel.position, {
                x: this.position.x - 10,
                duration: 0.5,
                delay: index * 0.3,
                ease: 'power2.out'
            });
        });
        
        console.log('🍎 Fruits displayed');
    }

    spitOutLetters(letters) {
        console.log('📝 Spitting out letter blocks:', letters);
        
        // Show letter blocks appearing on the conveyor belt
        const conveyorX = this.position.x + 6; // Same X as conveyor
        const conveyorY = this.position.y + 0.5 + 0.15; // Conveyor height + half block height
        const startX = conveyorX - (letters.length * 1.2) / 2;
        
        letters.forEach((letter, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, 0, 128, 128);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter, 64, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const geometry = new THREE.PlaneGeometry(1, 1);
            const letterBlock = new THREE.Mesh(geometry, material);
            letterBlock.position.set(
                startX + index * 1.2,  // Centered on conveyor
                conveyorY + 0.5,       // Sitting on top of conveyor
                this.position.z
            );
            
            this.scene.add(letterBlock);
            
            // Pop in animation
            letterBlock.scale.set(0, 0, 0);
            gsap.to(letterBlock.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.3,
                delay: index * 0.2,
                ease: 'back.out(1.7)'
            });
        });
        
        // Trigger completion after all animations
        setTimeout(() => {
            if (this.onComplete) {
                this.onComplete(letters);
            }
        }, 3000);
    }

    cleanup() {
        // Remove meshes if needed
    }
}
