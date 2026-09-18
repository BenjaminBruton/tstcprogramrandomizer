import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneSetup {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.init();
    }

    init() {
        // Create Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.Fog(0x1a1a2e, 50, 150);

        // Create Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        // Position camera further back to see more
        this.camera.position.set(0, 10, 25);
        this.camera.lookAt(0, 3, 0);
        console.log('📷 Initial camera position: (0, 10, 25) looking at (0, 3, 0)');

        // Create Renderer
        const canvas = document.getElementById('three-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // OrbitControls disabled for gameplay (was used for debugging)
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enabled = false;  // Disabled!
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        console.log('🔒 OrbitControls disabled - camera controlled by game');

        // Add Lights
        this.setupLights();

        // Add Ground/Table
        this.createGround();
        
        // Add back wall
        this.createBackWall();
        
        // Background elements removed - cleaner look
        // this.createBackground();

        // Handle Window Resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    setupLights() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Main Directional Light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Fill Light
        const fillLight = new THREE.DirectionalLight(0x764ba2, 0.3);
        fillLight.position.set(-10, 10, -10);
        this.scene.add(fillLight);

        // Rim Light
        const rimLight = new THREE.DirectionalLight(0x667eea, 0.4);
        rimLight.position.set(0, 5, -15);
        this.scene.add(rimLight);
    }

    createGround() {
        // Create a large table/ground surface with wood texture - extended depth
        const groundGeometry = new THREE.PlaneGeometry(200, 150); // Extended from 30 to 150
        
        // Create wood grain texture using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Base wood color
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(0, 0, 512, 512);
        
        // Wood grain lines
        for (let i = 0; i < 100; i++) {
            const y = Math.random() * 512;
            const thickness = Math.random() * 2 + 0.5;
            const opacity = Math.random() * 0.3 + 0.1;
            ctx.strokeStyle = `rgba(30, 20, 10, ${opacity})`;
            ctx.lineWidth = thickness;
            ctx.beginPath();
            ctx.moveTo(0, y);
            // Slight wave for natural look
            ctx.bezierCurveTo(128, y + (Math.random() - 0.5) * 10, 384, y + (Math.random() - 0.5) * 10, 512, y);
            ctx.stroke();
        }
        
        // Wood knots
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = Math.random() * 15 + 10;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(20, 10, 5, 0.4)');
            gradient.addColorStop(1, 'rgba(20, 10, 5, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 2);
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add subtle grid lines for depth - extended to match ground
        const gridHelper = new THREE.GridHelper(200, 100, 0x5a4a38, 0x3a2a18);
        gridHelper.position.y = 0.01;
        gridHelper.material.opacity = 0.2; // Slightly more subtle
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // DEBUG: Add a test cube to verify rendering
        const testGeometry = new THREE.BoxGeometry(2, 2, 2);
        const testMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const testCube = new THREE.Mesh(testGeometry, testMaterial);
        testCube.position.set(0, 3, 0);
        testCube.castShadow = true;
        this.scene.add(testCube);
        console.log('🔴 DEBUG: Red test cube added at (0, 3, 0)');
        
        // Store texture for reuse
        this.woodTexture = texture;
    }

    createBackWall() {
        // Create back wall using same wood texture as floor
        const wallGeometry = new THREE.PlaneGeometry(200, 60); // Wide and tall
        
        // Reuse the wood texture from ground if available, or use simple material
        const wallMaterial = this.woodTexture ? 
            new THREE.MeshStandardMaterial({
                map: this.woodTexture.clone(),
                roughness: 0.9,
                metalness: 0.1
            }) :
            new THREE.MeshStandardMaterial({
                color: 0x4a3728,
                roughness: 0.9,
                metalness: 0.1
            });
        
        // Set texture repeat for wall if using texture
        if (this.woodTexture && wallMaterial.map) {
            wallMaterial.map.repeat.set(10, 3);
        }
        
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(0, 30, -75); // Far back, centered, at mid-height
        wall.receiveShadow = true;
        wall.castShadow = false;
        this.scene.add(wall);
        
        console.log('🧱 Back wall created with wood texture');
    }

    createBackground() {
        // Create TSTC-themed background elements
        console.log('🏗️ Creating background elements...');
        
        this.createBuildings();
        this.createConstructionEquipment();
        this.createVehicles();
        this.createSpecialtyAreas();
    }

    createBuildings() {
        // Main building (left side)
        const buildingGeo1 = new THREE.BoxGeometry(15, 20, 10);
        const buildingMat1 = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.8 
        });
        const building1 = new THREE.Mesh(buildingGeo1, buildingMat1);
        building1.position.set(-30, 10, -30);
        building1.castShadow = true;
        building1.receiveShadow = true;
        this.scene.add(building1);
        
        // Add windows to building 1
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                const windowGeo = new THREE.PlaneGeometry(1.5, 2);
                const windowMat = new THREE.MeshBasicMaterial({ 
                    color: 0x87ceeb,
                    emissive: 0x4a90e2,
                    emissiveIntensity: 0.3
                });
                const window = new THREE.Mesh(windowGeo, windowMat);
                window.position.set(-30 - 6 + col * 3, 5 + row * 5, -25.01);
                this.scene.add(window);
            }
        }
        
        // Workshop building (right side)
        const buildingGeo2 = new THREE.BoxGeometry(12, 15, 12);
        const buildingMat2 = new THREE.MeshStandardMaterial({ 
            color: 0x696969,
            roughness: 0.9,
            metalness: 0.2
        });
        const building2 = new THREE.Mesh(buildingGeo2, buildingMat2);
        building2.position.set(70, 7.5, -35);
        building2.castShadow = true;
        this.scene.add(building2);
    }

    createConstructionEquipment() {
        // Crane (far back)
        const craneBaseGeo = new THREE.BoxGeometry(2, 25, 2);
        const craneMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const craneBase = new THREE.Mesh(craneBaseGeo, craneMat);
        craneBase.position.set(50, 12.5, -40);
        craneBase.castShadow = true;
        this.scene.add(craneBase);
        
        // Crane arm
        const craneArmGeo = new THREE.BoxGeometry(20, 1, 1);
        const craneArm = new THREE.Mesh(craneArmGeo, craneMat);
        craneArm.position.set(55, 25, -40);
        craneArm.rotation.z = -0.2;
        craneArm.castShadow = true;
        this.scene.add(craneArm);
        
        // Wind Turbine (far back left)
        const turbineTowerGeo = new THREE.CylinderGeometry(0.5, 0.8, 30, 8);
        const turbineMat = new THREE.MeshStandardMaterial({ color: 0xEEEEEE });
        const turbineTower = new THREE.Mesh(turbineTowerGeo, turbineMat);
        turbineTower.position.set(-50, 15, -50);
        turbineTower.castShadow = true;
        this.scene.add(turbineTower);
        
        // Turbine blades
        const turbineGroup = new THREE.Group();
        for (let i = 0; i < 3; i++) {
            const bladeGeo = new THREE.BoxGeometry(0.3, 10, 1);
            const blade = new THREE.Mesh(bladeGeo, turbineMat);
            blade.position.y = 5;
            blade.rotation.z = (i * Math.PI * 2) / 3;
            turbineGroup.add(blade);
        }
        turbineGroup.position.set(-50, 30, -50);
        this.scene.add(turbineGroup);
        this.turbineGroup = turbineGroup; // Save for animation
    }

    createVehicles() {
        // Dump truck (left background)
        const truckBodyGeo = new THREE.BoxGeometry(5, 2.5, 3);
        const truckMat = new THREE.MeshStandardMaterial({ color: 0xFF6600 });
        const truckBody = new THREE.Mesh(truckBodyGeo, truckMat);
        truckBody.position.set(-20, 1.25, -15);
        truckBody.castShadow = true;
        this.scene.add(truckBody);
        
        // Truck bed
        const bedGeo = new THREE.BoxGeometry(3, 2, 2.8);
        const bed = new THREE.Mesh(bedGeo, truckMat);
        bed.position.set(-22, 2, -15);
        this.scene.add(bed);
        
        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        wheelGeo.rotateZ(Math.PI / 2);
        
        const wheelPositions = [[-19, 0.6, -16], [-19, 0.6, -14], [-21.5, 0.6, -16], [-21.5, 0.6, -14]];
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.position.set(...pos);
            wheel.castShadow = true;
            this.scene.add(wheel);
        });
        
        // Simple airplane silhouette in sky
        const planeBodyGeo = new THREE.BoxGeometry(8, 1.5, 1.5);
        const planeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const planeBody = new THREE.Mesh(planeBodyGeo, planeMat);
        planeBody.position.set(30, 35, -60);
        planeBody.rotation.y = -0.3;
        this.scene.add(planeBody);
        
        // Wings
        const wingGeo = new THREE.BoxGeometry(0.5, 6, 3);
        const wing = new THREE.Mesh(wingGeo, planeMat);
        wing.position.set(30, 35, -60);
        wing.rotation.y = -0.3;
        this.scene.add(wing);
    }

    createSpecialtyAreas() {
        // Welding area (right side)
        const tableGeo = new THREE.BoxGeometry(4, 0.3, 3);
        const tableMat = new THREE.MeshStandardMaterial({ 
            color: 0x555555,
            metalness: 0.8,
            roughness: 0.3
        });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.set(75, 1.5, -10);
        this.scene.add(table);
        
        // Welding sparks effect
        for (let i = 0; i < 3; i++) {
            const sparkGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const sparkMat = new THREE.MeshBasicMaterial({ 
                color: 0xFFA500,
                emissive: 0xFFA500,
                emissiveIntensity: 1
            });
            const spark = new THREE.Mesh(sparkGeo, sparkMat);
            spark.position.set(75 + (Math.random() - 0.5) * 2, 1.7 + Math.random() * 0.5, -10 + (Math.random() - 0.5) * 2);
            this.scene.add(spark);
        }
        
        // Server rack (IT Programs)
        const rackGeo = new THREE.BoxGeometry(2, 4, 1.5);
        const rackMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const rack = new THREE.Mesh(rackGeo, rackMat);
        rack.position.set(65, 2, -8);
        this.scene.add(rack);
        
        // LED indicators on rack
        for (let i = 0; i < 6; i++) {
            const ledGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const ledMat = new THREE.MeshBasicMaterial({ 
                color: i % 2 === 0 ? 0x00FF00 : 0x0000FF,
                emissive: i % 2 === 0 ? 0x00FF00 : 0x0000FF,
                emissiveIntensity: 1
            });
            const led = new THREE.Mesh(ledGeo, ledMat);
            led.position.set(64.2, 0.5 + i * 0.6, -8);
            this.scene.add(led);
        }
        
        console.log('✅ Background elements complete');
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }

    getControls() {
        return this.controls;
    }

    updateAnimations() {
        // Animate wind turbine if it exists
        if (this.turbineGroup) {
            this.turbineGroup.rotation.z += 0.005; // Slow rotation
        }
    }

    update() {
        // Controls disabled - no need to update
        // if (this.controls) {
        //     this.controls.update();
        // }
    }
}
