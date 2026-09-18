import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import gsap from 'gsap';
import { COLORS } from '../constants.js';
import { Materials } from '../utils/Materials.js';

export class PlinkoMachine {
    constructor(scene, physicsWorld, position = { x: 0, y: 0, z: 0 }) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.position = position;
        this.button = null;
        this.ball = null;
        this.ballBody = null;
        this.slots = [];
        this.result = null;
        this.onComplete = null;
    }

    init() {
        this.createButton();
        this.createPlinkoBoard();
        this.createSlots();
        // Removed connecting wire - cleaner look
    }

    createButton() {
        // Create a large cartoonish red button
        const buttonGroup = new THREE.Group();

        // Button base
        const baseGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.5, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.7,
            roughness: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.25;
        base.castShadow = true;
        buttonGroup.add(base);

        // Button top (the pressable part)
        const buttonGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.8, 32);
        const buttonMaterial = Materials.createGlowMaterial(COLORS.ERROR);
        const buttonTop = new THREE.Mesh(buttonGeometry, buttonMaterial);
        buttonTop.position.y = 1;
        buttonTop.castShadow = true;
        buttonTop.userData.interactive = true;
        buttonTop.userData.type = 'plinko-button';
        buttonGroup.add(buttonTop);

        // Add decorative ring
        const ringGeometry = new THREE.TorusGeometry(1.3, 0.1, 16, 32);
        const ringMaterial = Materials.createMetalMaterial(COLORS.GOLD);
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = 0.8;
        ring.rotation.x = Math.PI / 2;
        buttonGroup.add(ring);

        buttonGroup.position.set(this.position.x, this.position.y + 1, this.position.z - 3);
        this.scene.add(buttonGroup);

        this.button = buttonTop;

        // Add pulsing animation
        gsap.to(buttonTop.position, {
            y: 1.2,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });

        gsap.to(buttonMaterial, {
            emissiveIntensity: 1,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });
    }

    createPlinkoBoard() {
        const boardGroup = new THREE.Group();

        // Board frame
        const frameGeometry = new THREE.BoxGeometry(8, 12, 0.5);
        const frameMaterial = Materials.createWoodMaterial(0x8b6914);
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.castShadow = true;
        boardGroup.add(frame);

        // Back panel
        const backGeometry = new THREE.BoxGeometry(7.5, 11.5, 0.2);
        const backMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.9
        });
        const back = new THREE.Mesh(backGeometry, backMaterial);
        back.position.z = -0.15;
        boardGroup.add(back);

        // Add side walls to contain the ball
        const wallHeight = 12;
        const wallThickness = 0.3;
        
        // Left wall
        const leftWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, 1);
        const wallMat = Materials.createWoodMaterial(0x8b6914);
        const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
        leftWall.position.set(-3.85, 0, 0.5);
        leftWall.castShadow = true;
        boardGroup.add(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(leftWallGeo, wallMat);
        rightWall.position.set(3.85, 0, 0.5);
        rightWall.castShadow = true;
        boardGroup.add(rightWall);

        // Front wall (invisible but has physics)
        const frontWallGeo = new THREE.BoxGeometry(7.5, wallHeight, wallThickness);
        const frontWallMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            transparent: true,
            opacity: 0.1
        });
        const frontWall = new THREE.Mesh(frontWallGeo, frontWallMat);
        frontWall.position.set(0, 0, 0.65);
        boardGroup.add(frontWall);

        this.createPegs(boardGroup);
        this.createWallPhysics();

        boardGroup.position.set(this.position.x, this.position.y + 6, this.position.z);
        this.scene.add(boardGroup);
        this.board = boardGroup;
    }

    createWallPhysics() {
        const wallHeight = 12;
        
        // Left wall physics
        const leftWallBody = this.physicsWorld.createBoxBody(
            { x: 0.3, y: wallHeight, z: 1 },
            0,
            { x: this.position.x - 3.85, y: this.position.y + 6, z: this.position.z + 0.5 }
        );
        this.physicsWorld.addBody(leftWallBody);
        
        // Right wall physics
        const rightWallBody = this.physicsWorld.createBoxBody(
            { x: 0.3, y: wallHeight, z: 1 },
            0,
            { x: this.position.x + 3.85, y: this.position.y + 6, z: this.position.z + 0.5 }
        );
        this.physicsWorld.addBody(rightWallBody);
        
        // Front wall physics (glass)
        const frontWallBody = this.physicsWorld.createBoxBody(
            { x: 7.5, y: wallHeight, z: 0.3 },
            0,
            { x: this.position.x, y: this.position.y + 6, z: this.position.z + 0.65 }
        );
        this.physicsWorld.addBody(frontWallBody);
        
        // BACK wall physics (IMPORTANT - keeps ball from escaping!)
        const backWallBody = this.physicsWorld.createBoxBody(
            { x: 7.5, y: wallHeight, z: 0.3 },
            0,
            { x: this.position.x, y: this.position.y + 6, z: this.position.z - 0.35 }
        );
        this.physicsWorld.addBody(backWallBody);
        
        console.log('🧱 Plinko walls created with physics (4 walls: L, R, F, B)');
    }

    createPegs(boardGroup) {
        const pegRadius = 0.12;  // Smaller pegs
        const pegGeometry = new THREE.CylinderGeometry(pegRadius, pegRadius, 0.5, 16);
        const pegMaterial = Materials.createMetalMaterial(COLORS.METAL);

        const rows = 10;
        const pegSpacing = 1.0;  // Wider spacing (was 0.7)
        const startY = 5;
        const maxBoardWidth = 7.0;  // Board back panel is 7.5, leave margin

        for (let row = 0; row < rows; row++) {
            const pegsInRow = row + 3;
            const rowWidth = (pegsInRow - 1) * pegSpacing;
            
            // FIX: Skip this row if pegs would exceed board width
            if (rowWidth > maxBoardWidth) {
                console.log(`⚠️ Skipping row ${row} - too wide (${rowWidth.toFixed(2)} > ${maxBoardWidth})`);
                continue;
            }
            
            const startX = -rowWidth / 2;

            for (let col = 0; col < pegsInRow; col++) {
                const peg = new THREE.Mesh(pegGeometry, pegMaterial);
                peg.position.set(
                    startX + col * pegSpacing,
                    startY - row * 1.1,
                    0.2
                );
                peg.rotation.x = Math.PI / 2;
                peg.castShadow = true;
                boardGroup.add(peg);

                // Add physics body for peg
                const pegShape = new CANNON.Cylinder(pegRadius, pegRadius, 0.5, 8);
                const pegBody = new CANNON.Body({
                    mass: 0,
                    shape: pegShape,
                    position: new CANNON.Vec3(
                        this.position.x + peg.position.x,
                        this.position.y + 6 + peg.position.y,
                        this.position.z + peg.position.z
                    )
                });
                const quaternion = new CANNON.Quaternion();
                quaternion.setFromEuler(Math.PI / 2, 0, 0);
                pegBody.quaternion.copy(quaternion);
                this.physicsWorld.addBody(pegBody);
            }
        }
    }

    createSlots() {
        const slotValues = [4, 5, 6];
        const slotWidth = 2.5;  // Wider slots to match wider board
        const slotHeight = 1;
        const slotDepth = 0.5;
        const spacing = 0.5;  // More spacing
        const totalWidth = (slotValues.length * slotWidth) + ((slotValues.length - 1) * spacing);
        const startX = -totalWidth / 2 + slotWidth / 2;
        
        console.log('🎯 Creating slots with width:', slotWidth, 'total width:', totalWidth);

        slotValues.forEach((value, index) => {
            const slotGroup = new THREE.Group();

            // Slot container
            const slotGeometry = new THREE.BoxGeometry(slotWidth, slotHeight, slotDepth);
            const slotMaterial = new THREE.MeshStandardMaterial({
                color: 0x667eea,
                metalness: 0.5,
                roughness: 0.5,
                transparent: true,
                opacity: 0.8
            });
            const slot = new THREE.Mesh(slotGeometry, slotMaterial);
            slot.castShadow = true;
            slotGroup.add(slot);

            // Number label
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value.toString(), 64, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.MeshBasicMaterial({ map: texture });
            const labelGeometry = new THREE.PlaneGeometry(1, 1);
            const label = new THREE.Mesh(labelGeometry, labelMaterial);
            label.position.z = 0.26;
            slotGroup.add(label);

            const xPos = this.position.x + startX + (index * (slotWidth + spacing));
            slotGroup.position.set(xPos, this.position.y + 0.5, this.position.z);
            this.scene.add(slotGroup);

            const slotData = {
                value: value,
                mesh: slotGroup,
                bounds: {
                    minX: xPos - slotWidth / 2,
                    maxX: xPos + slotWidth / 2,
                    y: this.position.y + 0.5
                }
            };
            
            console.log(`   Slot ${value}: X range [${slotData.bounds.minX.toFixed(2)}, ${slotData.bounds.maxX.toFixed(2)}]`);
            this.slots.push(slotData);
        });
    }

    createConnectingWire() {
        const points = [
            new THREE.Vector3(this.position.x + 4, this.position.y + 3, this.position.z),
            new THREE.Vector3(this.position.x + 10, this.position.y + 3, this.position.z),
            new THREE.Vector3(20, this.position.y + 3, this.position.z),
            new THREE.Vector3(25, this.position.y + 3, this.position.z)
        ];

        const curve = new THREE.CatmullRomCurve3(points);
        const wireGeometry = new THREE.TubeGeometry(curve, 64, 0.1, 8, false);
        const wireMaterial = Materials.createGlowMaterial(COLORS.PRIMARY);
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);
        this.scene.add(wire);

        gsap.to(wireMaterial, {
            emissiveIntensity: 1,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });
    }

    onButtonClick() {
        if (this.ball) return;

        gsap.to(this.button.position, {
            y: 0.7,
            duration: 0.1,
            onComplete: () => {
                gsap.to(this.button.position, {
                    y: 1,
                    duration: 0.2,
                    ease: 'elastic.out(1, 0.5)'
                });
            }
        });

        setTimeout(() => this.dropBall(), 200);
    }

    dropBall() {
        const ballRadius = 0.25;  // Smaller ball (was 0.3)
        const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
        const ballMaterial = Materials.createMetalMaterial(0xcccccc);
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.castShadow = true;
        this.scene.add(this.ball);

        // Add randomness to starting position and initial velocity
        const randomX = (Math.random() - 0.5) * 1.5;  // Random X offset ±0.75
        const randomVelX = (Math.random() - 0.5) * 2;  // Random horizontal push
        
        this.ballBody = this.physicsWorld.createSphereBody(
            ballRadius, 
            8,  // Heavier (was 5) to help it fall through
            { x: this.position.x + randomX, y: this.position.y + 11, z: this.position.z }
        );
        this.ballBody.linearDamping = 0.05;  // Less damping (was 0.1) for more bouncing
        this.ballBody.angularDamping = 0.1;
        
        // Apply random initial velocity for variety
        this.ballBody.velocity.set(randomVelX, 0, 0);
        
        // FIX: Properly add to physics with mesh sync
        this.physicsWorld.addBody(this.ballBody, this.ball);
        
        // Ensure ball doesn't deform by locking scale
        this.ball.matrixAutoUpdate = true;

        console.log('⚽ Ball dropped at X offset:', randomX.toFixed(2), 'with velocity:', randomVelX.toFixed(2));
        this.checkSlotInterval = setInterval(() => this.detectSlot(), 100);
    }

    detectSlot() {
        if (!this.ballBody) return;

        const ballY = this.ballBody.position.y;
        const ballX = this.ballBody.position.x;
        const ballVelocity = this.ballBody.velocity.length();

        // Check if ball is at ground level (instant detection)
        if (ballY < 1.2) {
            // Ball is at slot level - check which slot immediately
            for (const slot of this.slots) {
                const inSlot = ballX >= slot.bounds.minX && ballX <= slot.bounds.maxX;
                
                if (inSlot && !this.result) {  // Only trigger once
                    console.log(`✅ Ball hit ground in slot ${slot.value}!`);
                
                    this.result = slot.value;
                    clearInterval(this.checkSlotInterval);
                    
                    // Light up immediately
                    gsap.to(slot.mesh.children[0].material, {
                        emissive: new THREE.Color(COLORS.SUCCESS),
                        emissiveIntensity: 0.5,
                        duration: 0.1
                    });

                    if (this.onComplete) {
                        console.log(`⏱️ Calling onComplete in 0.5 seconds...`);
                        setTimeout(() => {
                            console.log(`🎬 Executing onComplete callback now!`);
                            this.onComplete(this.result);
                        }, 500);
                    } else {
                        console.error('❌ onComplete callback is null!');
                    }
                    break;
                }
            }
        }
    }

    getButton() {
        return this.button;
    }

    getResult() {
        return this.result;
    }

    cleanup() {
        if (this.ball) this.scene.remove(this.ball);
        if (this.ballBody) this.physicsWorld.removeBody(this.ballBody);
    }
}
