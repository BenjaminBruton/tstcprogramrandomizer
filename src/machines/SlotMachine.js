import * as THREE from 'three';
import gsap from 'gsap';
import { FRUITS, FRUIT_COLORS, COLORS } from '../constants.js';
import { Materials } from '../utils/Materials.js';

export class SlotMachine {
    constructor(scene, physicsWorld, position, numRollers = 5) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.position = position;
        this.numRollers = numRollers;
        this.rollers = [];
        this.lever = null;
        this.isSpinning = false;
        this.results = [];
        this.onComplete = null;
    }

    init() {
        console.log('🎰 SlotMachine.init() called with', this.numRollers, 'rollers');
        console.log('   Position:', this.position);
        
        this.createFrame();
        this.createRollers();
        this.createSpinButton();  // Simple button instead of lever
        this.createTrapdoor();
        
        console.log('✅ SlotMachine initialized');
    }

    createFrame() {
        console.log('  📦 Creating frame...');
        const frameGroup = new THREE.Group();
        
        // Create open-front frame (no front face!)
        // Top
        const topGeo = new THREE.BoxGeometry(this.numRollers * 2.5 + 2, 0.5, 3);
        const frameMat = Materials.createMetalMaterial(COLORS.GOLD);
        const top = new THREE.Mesh(topGeo, frameMat);
        top.position.y = 4;
        frameGroup.add(top);
        
        // Bottom
        const bottom = new THREE.Mesh(topGeo, frameMat);
        bottom.position.y = -4;
        frameGroup.add(bottom);
        
        // Left side
        const sideGeo = new THREE.BoxGeometry(0.5, 8, 3);
        const left = new THREE.Mesh(sideGeo, frameMat);
        left.position.x = -(this.numRollers * 2.5 + 2) / 2 + 0.25;
        frameGroup.add(left);
        
        // Right side
        const right = new THREE.Mesh(sideGeo, frameMat);
        right.position.x = (this.numRollers * 2.5 + 2) / 2 - 0.25;
        frameGroup.add(right);
        
        // Back panel
        const backGeo = new THREE.BoxGeometry(this.numRollers * 2.5 + 2, 8, 0.2);
        const backMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const back = new THREE.Mesh(backGeo, backMat);
        back.position.z = -1.4;
        frameGroup.add(back);
        
        console.log('     Open-front frame created');

        frameGroup.position.set(this.position.x, this.position.y + 4, this.position.z);
        this.scene.add(frameGroup);
        this.frame = frameGroup;
        console.log('     Frame added to scene at:', frameGroup.position);
    }

    createRollers() {
        console.log('  🎡 Creating', this.numRollers, 'rollers...');
        const rollerSpacing = 2.5;
        const startX = -((this.numRollers - 1) * rollerSpacing) / 2;

        for (let i = 0; i < this.numRollers; i++) {
            const roller = this.createRoller();
            const xPos = this.position.x + startX + (i * rollerSpacing);
            roller.position.set(
                xPos,
                this.position.y + 4.5,
                this.position.z
            );
            this.scene.add(roller);
            this.rollers.push({ mesh: roller, fruit: null });
            console.log(`     Roller ${i} at X: ${xPos}`);
        }
        console.log('     All rollers created');
    }

    createRoller() {
        const rollerGroup = new THREE.Group();
        
        // Create horizontal wheel backing (like a ferris wheel on its side)
        const cylinderGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.3, 32);
        cylinderGeo.rotateZ(Math.PI / 2); // Rotate to be horizontal
        const cylinderMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
        rollerGroup.add(cylinder);
        
        const radius = 1.2; // Radius of the wheel
        const anglesPerFruit = (Math.PI * 2) / FRUITS.length;

        // Place rectangle fruits around the wheel (like spokes)
        FRUITS.forEach((fruit, index) => {
            const fruitMesh = this.createRectangleFruit(fruit);
            const angle = index * anglesPerFruit;
            
            // Position around the wheel in Y-Z plane (vertical circle)
            fruitMesh.position.set(
                0,
                Math.sin(angle) * radius,  // Y position (up/down)
                Math.cos(angle) * radius   // Z position (forward/back)
            );
            
            // Rotate to face outward from center
            fruitMesh.rotation.x = -angle;
            
            rollerGroup.add(fruitMesh);
        });

        return rollerGroup;
    }

    createRectangleFruit(fruitType) {
        const fruitGroup = new THREE.Group();
        const color = FRUIT_COLORS[fruitType];
        
        // Create unique 3D shape for each fruit
        const fruitMesh = this.create3DFruitShape(fruitType, color);
        fruitMesh.castShadow = true;
        fruitMesh.position.y = 0.2; // Raise fruit up
        fruitGroup.add(fruitMesh);
        
        // Text label BELOW the fruit
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        
        // Transparent background
        ctx.clearRect(0, 0, 256, 80);
        
        // Fruit name with outline
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText(fruitType, 128, 40);
        ctx.fillText(fruitType, 128, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true
        });
        const labelGeometry = new THREE.PlaneGeometry(1.0, 0.3);
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(0, -0.25, 0.15); // Below fruit
        fruitGroup.add(label);
        
        fruitGroup.userData.fruitType = fruitType;
        
        return fruitGroup;
    }

    create3DFruitShape(fruitType, color) {
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
        
        switch(fruitType) {
            case 'Apple':
                const appleGeo = new THREE.SphereGeometry(0.3, 16, 16);
                const apple = new THREE.Mesh(appleGeo, new THREE.MeshStandardMaterial({
                    color: color, emissive: color, emissiveIntensity: 0.2
                }));
                const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.12);
                const stem = new THREE.Mesh(stemGeo, stemMat);
                stem.position.y = 0.3;
                apple.add(stem);
                return apple;
                
            case 'Banana':
                const bananaGeo = new THREE.TorusGeometry(0.22, 0.1, 8, 16, Math.PI);
                const banana = new THREE.Mesh(bananaGeo, new THREE.MeshStandardMaterial({
                    color: color, emissive: color, emissiveIntensity: 0.2
                }));
                banana.rotation.x = Math.PI / 2;
                return banana;
                
            case 'Cherry':
                const cherryGroup = new THREE.Group();
                const cherryGeo = new THREE.SphereGeometry(0.13, 12, 12);
                const cherryMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.2 });
                const cherry1 = new THREE.Mesh(cherryGeo, cherryMat);
                cherry1.position.x = -0.1;
                const cherry2 = new THREE.Mesh(cherryGeo, cherryMat);
                cherry2.position.x = 0.1;
                cherryGroup.add(cherry1, cherry2);
                const cherryStemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.18);
                const cherryStem = new THREE.Mesh(cherryStemGeo, stemMat);
                cherryStem.position.y = 0.18;
                cherryGroup.add(cherryStem);
                return cherryGroup;
                
            case 'Dragonfruit':
                const dragonGeo = new THREE.SphereGeometry(0.28, 12, 12);
                const dragon = new THREE.Mesh(dragonGeo, new THREE.MeshStandardMaterial({
                    color: color, emissive: color, emissiveIntensity: 0.2
                }));
                for (let i = 0; i < 6; i++) {
                    const spikeGeo = new THREE.ConeGeometry(0.04, 0.12, 6);
                    const spikeMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
                    const spike = new THREE.Mesh(spikeGeo, spikeMat);
                    const angle = (i / 6) * Math.PI * 2;
                    spike.position.set(Math.cos(angle) * 0.28, Math.sin(angle) * 0.28, 0);
                    spike.lookAt(0, 0, 0);
                    dragon.add(spike);
                }
                return dragon;
                
            case 'Elderberry':
                const elderGroup = new THREE.Group();
                for (let i = 0; i < 6; i++) {
                    const berryGeo = new THREE.SphereGeometry(0.07, 8, 8);
                    const berryMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.2 });
                    const berry = new THREE.Mesh(berryGeo, berryMat);
                    const angle = (i / 6) * Math.PI * 2;
                    berry.position.set(Math.cos(angle) * 0.13, Math.sin(angle) * 0.13, 0);
                    elderGroup.add(berry);
                }
                return elderGroup;
                
            case 'Fig':
                const figGeo = new THREE.SphereGeometry(0.23, 12, 12);
                const fig = new THREE.Mesh(figGeo, new THREE.MeshStandardMaterial({
                    color: color, emissive: color, emissiveIntensity: 0.2
                }));
                fig.scale.set(1, 1.3, 1);
                return fig;
                
            case 'Grape':
                const grapeGroup = new THREE.Group();
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 2; col++) {
                        const grapeGeo = new THREE.SphereGeometry(0.08, 8, 8);
                        const grapeMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.2 });
                        const grape = new THREE.Mesh(grapeGeo, grapeMat);
                        grape.position.set(col * 0.14 - 0.07, -row * 0.14, 0);
                        grapeGroup.add(grape);
                    }
                }
                return grapeGroup;
                
            default:
                const defaultGeo = new THREE.SphereGeometry(0.3, 16, 16);
                return new THREE.Mesh(defaultGeo, new THREE.MeshStandardMaterial({
                    color: color, emissive: color, emissiveIntensity: 0.2
                }));
        }
    }

    createSpinButton() {
        // Big red "SPIN" button
        const buttonGeometry = new THREE.BoxGeometry(3, 1, 0.5);
        const buttonMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.ERROR,
            emissive: COLORS.ERROR,
            emissiveIntensity: 0.5
        });
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.position.set(
            this.position.x,
            this.position.y + 0.5,
            this.position.z + 2
        );
        button.userData.interactive = true;
        button.userData.type = 'spin-button';
        button.castShadow = true;
        this.scene.add(button);

        // Add "SPIN" text
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SPIN', 256, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const labelGeometry = new THREE.PlaneGeometry(2.8, 0.8);
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.z = 0.26;
        label.raycast = () => {};  // Disable raycasting on label - click goes through to button
        button.add(label);

        this.spinButton = button;

        // Pulse animation
        gsap.to(buttonMaterial, { 
            emissiveIntensity: 1, 
            duration: 1, 
            repeat: -1, 
            yoyo: true 
        });
        
        console.log('🎮 SPIN button created at front of machine');
    }

    createTrapdoor() {
        const geometry = new THREE.BoxGeometry(this.numRollers * 2.3, 0.2, 2);
        const material = Materials.createWoodMaterial(COLORS.WOOD);
        const trapdoor = new THREE.Mesh(geometry, material);
        trapdoor.position.set(this.position.x, this.position.y, this.position.z);
        trapdoor.castShadow = true;
        this.scene.add(trapdoor);
        this.trapdoor = trapdoor;
    }

    onSpinButtonClick() {
        if (this.isSpinning) return;
        
        console.log('🎰 SPIN button clicked!');
        
        // Animate button press
        gsap.to(this.spinButton.position, {
            z: this.position.z + 1.8,
            duration: 0.1,
            onComplete: () => {
                gsap.to(this.spinButton.position, {
                    z: this.position.z + 2,
                    duration: 0.2,
                    ease: 'elastic.out(1, 0.5)'
                });
            }
        });
        
        this.spinRollers();
    }

    spinRollers() {
        this.isSpinning = true;
        this.results = [];
        
        console.log('🎰 Starting roller spin animation...');

        this.rollers.forEach((roller, index) => {
            const spins = 5 + Math.random() * 3;  // 5-8 full loops
            const randomFruitIndex = Math.floor(Math.random() * FRUITS.length);
            
            // Calculate rotation around X-axis (vertical spinning wheel)
            const anglesPerFruit = (Math.PI * 2) / FRUITS.length;
            const finalRotation = (spins * Math.PI * 2) + (randomFruitIndex * anglesPerFruit);
            
            console.log(`   Roller ${index}: spinning ${spins.toFixed(1)} times to ${FRUITS[randomFruitIndex]}`);

            // Spin around X-axis (wheel spinning up/down like real slots)
            gsap.to(roller.mesh.rotation, {
                x: finalRotation,
                duration: 3 + index * 0.4,  // 3-5 seconds, staggered
                ease: 'power2.out',
                onStart: () => {
                    console.log(`   🎡 Roller ${index} started spinning vertically (X-axis)`);
                },
                onComplete: () => {
                    // Normalize rotation to find which fruit is at front
                    const normalizedRotation = (roller.mesh.rotation.x % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
                    const fruitIndex = Math.round(normalizedRotation / anglesPerFruit) % FRUITS.length;
                    roller.fruit = FRUITS[fruitIndex];
                    this.results.push(roller.fruit);
                    
                    console.log(`   ✅ Roller ${index} stopped on: ${roller.fruit}`);

                    if (this.results.length === this.numRollers) {
                        this.onSpinComplete();
                    }
                }
            });
        });
    }

    onSpinComplete() {
        console.log('🎰 ALL ROLLERS STOPPED!');
        console.log('   Final results:', this.results);
        
        // Show big result display
        this.showResults();
        
        // Wait a moment, then open trapdoor
        setTimeout(() => {
            console.log('🚪 Opening trapdoor...');
            gsap.to(this.trapdoor.rotation, {
                x: -Math.PI / 2,
                duration: 1,
                ease: 'power2.inOut',
                onComplete: () => {
                    console.log('✅ Trapdoor open, triggering completion');
                    if (this.onComplete) this.onComplete(this.results);
                }
            });
        }, 3000);  // Wait 3 seconds so user can see results clearly
    }

    showResults() {
        // Create a HUGE display banner showing the results with 3D fruits inside
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 400; // Much taller to fit fruits + labels
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1024, 400);
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, 1024, 400);
        
        // Title
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('RESULTS:', 512, 70);
        
        // Draw fruit names at bottom with staggered Y positions to avoid overlap
        const spacing = 1024 / (this.results.length + 1);
        this.results.forEach((fruit, index) => {
            const x = spacing * (index + 1);
            // Stagger vertically - alternate high and low
            const yOffset = index % 2 === 0 ? 0 : 30;
            const y = 330 + yOffset;
            
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(fruit, x, y);
        });

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            side: THREE.DoubleSide 
        });
        const geometry = new THREE.PlaneGeometry(14, 5); // Wider and taller
        const banner = new THREE.Mesh(geometry, material);
        banner.position.set(this.position.x, this.position.y + 6.5, this.position.z + 3);
        this.scene.add(banner);
        
        // Animate banner entrance
        banner.scale.set(0, 0, 0);
        gsap.to(banner.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.5,
            ease: 'back.out(1.7)'
        });
        
        this.resultBanner = banner;
        
        // Add 3D fruit models INSIDE the banner (centered in white space)
        const fruitSpacing = 14 / (this.results.length + 1); // Match new banner width
        this.results.forEach((fruit, index) => {
            const fruitX = this.position.x - 7 + fruitSpacing * (index + 1);
            const fruit3D = this.create3DFruitShape(fruit, FRUIT_COLORS[fruit]);
            // Position fruits in the middle of the banner (Y + 6.5, slightly above center)
            fruit3D.position.set(fruitX, this.position.y + 7, this.position.z + 3.2);
            fruit3D.scale.set(2.5, 2.5, 2.5); // Bigger for visibility
            this.scene.add(fruit3D);
            
            // Animate fruit entrance
            fruit3D.scale.set(0, 0, 0);
            gsap.to(fruit3D.scale, {
                x: 2.5, y: 2.5, z: 2.5,
                duration: 0.5,
                delay: 0.1 * index,
                ease: 'back.out(1.7)'
            });
        });
        
        console.log('📊 Results banner with 3D fruits displayed:', this.results);
    }

    getSpinButton() {
        return this.spinButton;
    }
}
