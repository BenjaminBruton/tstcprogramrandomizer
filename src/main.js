import gsap from 'gsap';
import { SceneSetup } from './core/SceneSetup.js';
import { PhysicsWorld } from './core/PhysicsWorld.js';
import { StateManager } from './core/StateManager.js';
import { Raycaster } from './core/Raycaster.js';
import { CameraController } from './utils/CameraController.js';
import { PlinkoMachine } from './machines/PlinkoMachine.js';
import { SlotMachine } from './machines/SlotMachine.js';
import { Juicer } from './machines/Juicer.js';
import { Hangman } from './machines/Hangman.js';
import { PHASES } from './constants.js';

class TSTCProgramRandomizer {
    constructor() {
        this.sceneSetup = null;
        this.physicsWorld = null;
        this.stateManager = null;
        this.raycaster = null;
        this.cameraController = null;
        this.plinkoMachine = null;
        this.slotMachine = null;
        this.juicer = null;
        this.hangman = null;
        this.frameCount = 0;
        this.gameStarted = false;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Super Cool Random TSTC Program Randomizer...');
        
        // Draw skyline on start screen
        this.drawSkyline();
        
        // Setup audio
        this.setupAudio();
        
        // Setup start button
        this.setupStartButton();
        
        // Show loading screen
        const loadingScreen = document.getElementById('loading-screen');

        // Initialize core systems
        console.log('Creating scene...');
        this.sceneSetup = new SceneSetup();
        console.log('Creating physics world...');
        this.physicsWorld = new PhysicsWorld();
        console.log('Creating state manager...');
        this.stateManager = new StateManager();
        console.log('Creating raycaster...');
        this.raycaster = new Raycaster(
            this.sceneSetup.getCamera(),
            this.sceneSetup.getRenderer().domElement
        );
        console.log('Creating camera controller...');
        this.cameraController = new CameraController(
            this.sceneSetup.getCamera(),
            this.sceneSetup.getControls()
        );

        // Setup interaction listeners
        this.setupInteractions();

        // Don't initialize machines yet - wait for START button

        // Hide loading screen
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            
            // Try to play start music (may be blocked by browser autoplay policy)
            this.playStartMusic();
        }, 500);

        // Start animation loop
        console.log('🎬 Starting animation loop...');
        this.animate();
        console.log('✅ Initialization complete!');
    }

    async initializeMachines() {
        // DEPRECATED: Moved to startGame() - triggered by START button
        console.log('🎰 Initializing Plinko Machine...');
        
        // Initialize Plinko Machine
        this.plinkoMachine = new PlinkoMachine(
            this.sceneSetup.getScene(),
            this.physicsWorld,
            { x: 0, y: 0, z: 0 }
        );
        
        console.log('Building Plinko Machine...');
        this.plinkoMachine.init();
        this.plinkoMachine.onComplete = (result) => this.onPlinkoComplete(result);

        // Add button to interactive objects
        const button = this.plinkoMachine.getButton();
        console.log('Plinko button:', button);
        if (button) {
            this.raycaster.addInteractiveObject(button);
            console.log('✅ Plinko button added to interactive objects');
        } else {
            console.error('❌ Plinko button is null!');
        }
        
        // Debug: Log camera and scene info
        const camera = this.sceneSetup.getCamera();
        console.log('📷 Camera position:', camera.position);
        console.log('📦 Scene children count:', this.sceneSetup.getScene().children.length);
    }

    setupInteractions() {
        // Handle clicks
        this.raycaster.on('click', (object) => {
            console.log('🖱️ Click detected on object:', object);
            console.log('   Type:', object.userData?.type);
            console.log('   Current phase:', this.stateManager.getState());
            
            if (!object.userData) {
                console.warn('   No userData on clicked object');
                return;
            }

            // Plinko button click
            if (object.userData.type === 'plinko-button' && 
                this.stateManager.canInteract(PHASES.PLINKO)) {
                console.log('✅ Plinko button clicked!');
                this.playButtonPunch(); // Play button sound
                this.plinkoMachine.onButtonClick();
            }
            
            // Spin button click
            if (object.userData.type === 'spin-button') {
                console.log('🎰 Spin button type detected!');
                console.log('   Can interact?', this.stateManager.canInteract(PHASES.SLOT));
                console.log('   Slot machine exists?', !!this.slotMachine);
                
                if (this.stateManager.canInteract(PHASES.SLOT) && this.slotMachine) {
                    console.log('✅ Calling spin!');
                    this.slotMachine.onSpinButtonClick();
                }
            }
        });

        // Handle hover effects
        this.raycaster.on('hover', (object) => {
            if (object.material && object.material.emissive) {
                gsap.to(object.material.emissive, {
                    r: 1,
                    g: 1,
                    b: 1,
                    duration: 0.3
                });
            }
        });

        this.raycaster.on('unhover', (object) => {
            if (object.material && object.material.emissive) {
                gsap.to(object.material.emissive, {
                    r: object.material.color.r,
                    g: object.material.color.g,
                    b: object.material.color.b,
                    duration: 0.3
                });
            }
        });
    }

    onPlinkoComplete(result) {
        console.log('🎯 Plinko complete! Result:', result);
        this.stateManager.setData('plinkoResult', result);
        
        // Transition to next phase
        console.log('⏱️ Waiting 1.5 seconds before transition...');
        setTimeout(() => {
            console.log('🎰 Transitioning to SLOT phase...');
            this.stateManager.setState(PHASES.SLOT);
            
            // Casino music already playing from game start
            
            console.log('📹 Requesting camera move...');
            this.cameraController.moveTo(PHASES.SLOT, 3, () => {
                console.log('🎰 Camera arrived at slot machine, initializing...');
                
                // Initialize slot machine
                this.slotMachine = new SlotMachine(
                    this.sceneSetup.getScene(),
                    this.physicsWorld,
                    { x: 18, y: 0, z: 0 },
                    result
                );
                this.slotMachine.init();
                this.slotMachine.onComplete = (fruits) => this.onSlotComplete(fruits);

                // Add spin button to interactive objects
                const spinButton = this.slotMachine.getSpinButton();
                if (spinButton) {
                    this.raycaster.addInteractiveObject(spinButton);
                    console.log('✅ Spin button added to interactive objects');
                }
            });
        }, 1500);
    }

    onSlotComplete(fruits) {
        console.log('Slot machine complete! Fruits:', fruits);
        this.stateManager.setData('slotFruits', fruits);
        
        // Extract first letters
        const letters = fruits.map(fruit => fruit[0].toUpperCase());
        this.stateManager.setData('letterBlocks', letters);
        
        // Transition to juicer phase
        setTimeout(() => {
            this.stateManager.setState(PHASES.JUICER);
            this.cameraController.moveTo(PHASES.JUICER, 3, () => {
                // Initialize juicer
                this.juicer = new Juicer(
                    this.sceneSetup.getScene(),
                    this.physicsWorld,
                    { x: 36, y: 0, z: 0 }
                );
                this.juicer.init();
                this.juicer.onComplete = (processedLetters) => this.onJuicerComplete(processedLetters);
                
                // Start juicing
                this.juicer.processFruits(fruits);
            });
        }, 2000);
    }

    onJuicerComplete(letters) {
        console.log('Juicer complete! Letters:', letters);
        
        // Transition to hangman phase
        setTimeout(() => {
            this.stateManager.setState(PHASES.HANGMAN);
            
            // Start game show music for hangman phase (plays to end)
            this.playGameShowMusic();
            
            this.cameraController.moveTo(PHASES.HANGMAN, 3, () => {
                // Initialize hangman
                this.hangman = new Hangman(
                    this.sceneSetup.getScene(),
                    { x: 54, y: 0, z: 0 }
                );
                this.hangman.init(letters);
                this.hangman.onComplete = (program) => this.onHangmanComplete(program);
            });
        }, 500);
    }

    onHangmanComplete(result) {
        console.log('Hangman complete! Result:', result);
        this.stateManager.setData('selectedProgram', result.program);
        this.stateManager.setData('won', result.won);
        
        // Transition to reveal phase
        setTimeout(() => {
            this.stateManager.setState(PHASES.REVEAL);
            this.cameraController.moveTo(PHASES.REVEAL, 3, () => {
                this.showFinalReveal(result);
            });
        }, 1000);
    }

    showFinalReveal(result) {
        console.log('🎉 FINAL REVEAL:', result);
        
        // Stop all music when final reveal appears
        this.stopAllMusic();
        console.log('🔇 All music stopped for final reveal');
        
        // Create big text
        const instructions = document.getElementById('instructions');
        if (instructions) {
            const bgColor = result.won ? 'rgba(81, 207, 102, 0.9)' : 'rgba(255, 107, 107, 0.9)';
            
            if (result.won) {
                // Win message
                instructions.innerHTML = `
                    <h2 style="font-size: 32px;">🎉 Congrats you guessed ${result.program} correctly! 🎉</h2>
                    <p style="margin-top: 30px;">Press R to play again!</p>
                `;
            } else {
                // Lose message
                instructions.innerHTML = `
                    <h2 style="font-size: 32px;">The answer was ${result.program} :(</h2>
                    <p style="font-size: 20px; margin-top: 20px;">Your boss isn't Karla's favorite Dean so you get to present.</p>
                    <p style="margin-top: 30px;">Press R to play again!</p>
                `;
            }
            
            instructions.style.background = bgColor;
            instructions.style.padding = '30px 50px';
        }

        // Listen for R key to restart
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') {
                location.reload();
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Log first few frames to confirm animation is running
        this.frameCount++;
        if (this.frameCount === 1) {
            console.log('🎞️ First frame rendered!');
        } else if (this.frameCount === 60) {
            console.log('🎞️ 60 frames rendered - animation loop confirmed');
        }

        // Update controls
        this.sceneSetup.update();

        // Update physics
        this.physicsWorld.update();
        
        // Update background animations (wind turbine, etc.)
        this.sceneSetup.updateAnimations();

        // Render scene
        this.sceneSetup.getRenderer().render(
            this.sceneSetup.getScene(),
            this.sceneSetup.getCamera()
        );
    }

    drawSkyline() {
        const canvas = document.getElementById('skyline-canvas');
        if (!canvas) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.5;
        const ctx = canvas.getContext('2d');
        
        // Sky gradient (already handled by CSS, but add stars)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.4;
            const radius = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Buildings
        const buildings = [];
        const numBuildings = 15;
        
        for (let i = 0; i < numBuildings; i++) {
            const width = 40 + Math.random() * 80;
            const height = 100 + Math.random() * 250;
            const x = (i * canvas.width) / numBuildings + Math.random() * 20;
            
            buildings.push({ x, width, height });
        }
        
        // Draw buildings
        buildings.forEach((building, index) => {
            // Building body
            const gradient = ctx.createLinearGradient(building.x, 0, building.x + building.width, 0);
            const baseColor = 40 + Math.random() * 60;
            gradient.addColorStop(0, `rgb(${baseColor}, ${baseColor}, ${baseColor + 20})`);
            gradient.addColorStop(1, `rgb(${baseColor - 20}, ${baseColor - 20}, ${baseColor})`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                building.x,
                canvas.height - building.height,
                building.width,
                building.height
            );
            
            // Windows
            const windowCols = Math.floor(building.width / 15);
            const windowRows = Math.floor(building.height / 20);
            
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    const wx = building.x + 7 + col * 15;
                    const wy = canvas.height - building.height + 10 + row * 20;
                    
                    // Randomly lit windows
                    if (Math.random() > 0.3) {
                        ctx.fillStyle = Math.random() > 0.7 ? '#ffeb3b' : '#ffe082';
                        ctx.fillRect(wx, wy, 8, 12);
                    }
                }
            }
        });
        
        console.log('🏙️ Skyline drawn');
    }

    setupAudio() {
        // Create audio elements (file names without spaces)
        this.audio = {
            startMusic: new Audio('/audio/funkdown.mp3'),
            buttonPunch: new Audio('/audio/ButtonPunch.wav'),
            casinoMusic: new Audio('/audio/Casino.mp3'),
            gameShowMusic: new Audio('/audio/GameShow2.wav')
        };
        
        // Configure start music
        this.audio.startMusic.loop = true;
        this.audio.startMusic.volume = 0.5;
        
        // Configure casino music (slot machine phase)
        this.audio.casinoMusic.loop = true;
        this.audio.casinoMusic.volume = 0.4;
        
        // Configure game show music (hangman phase to end)
        this.audio.gameShowMusic.loop = false; // Play once through
        this.audio.gameShowMusic.volume = 0.35; // Lowered by ~3dB from 0.5
        
        // Configure button sound effect
        this.audio.buttonPunch.volume = 0.6;
        
        console.log('🔊 Audio system initialized with all sounds');
    }

    playStartMusic() {
        // Play start music when loading completes
        if (this.audio && this.audio.startMusic) {
            this.audio.startMusic.play().catch(err => {
                console.log('⚠️ Audio autoplay blocked (expected in many browsers):', err.message);
                console.log('   Music will start when user clicks START button');
            });
        }
    }

    stopStartMusic() {
        if (this.audio && this.audio.startMusic) {
            this.audio.startMusic.pause();
            this.audio.startMusic.currentTime = 0;
        }
    }

    playButtonPunch() {
        if (this.audio && this.audio.buttonPunch) {
            this.audio.buttonPunch.currentTime = 0; // Restart if already playing
            this.audio.buttonPunch.play()
                .then(() => console.log('👊 Button punch sound played!'))
                .catch(err => console.error('❌ Button sound error:', err));
        } else {
            console.error('❌ Button punch audio not loaded!');
        }
    }

    playCasinoMusic() {
        // Stop other music first
        this.stopAllMusic();
        
        if (this.audio && this.audio.casinoMusic) {
            this.audio.casinoMusic.currentTime = 0;
            this.audio.casinoMusic.play().catch(err => console.log('Casino music error:', err));
            console.log('🎰 Casino music playing');
        }
    }

    playGameShowMusic() {
        // Stop other music first
        this.stopAllMusic();
        
        if (this.audio && this.audio.gameShowMusic) {
            this.audio.gameShowMusic.currentTime = 0;
            this.audio.gameShowMusic.play()
                .then(() => console.log('🎮 Game show music playing successfully!'))
                .catch(err => {
                    console.error('❌ Game show music error:', err);
                    console.error('   Audio src:', this.audio.gameShowMusic.src);
                    console.error('   Audio ready state:', this.audio.gameShowMusic.readyState);
                });
        } else {
            console.error('❌ Game show music not loaded!');
        }
    }

    stopAllMusic() {
        if (this.audio) {
            if (this.audio.startMusic) {
                this.audio.startMusic.pause();
            }
            if (this.audio.casinoMusic) {
                this.audio.casinoMusic.pause();
            }
            if (this.audio.gameShowMusic) {
                this.audio.gameShowMusic.pause();
            }
        }
    }

    setupStartButton() {
        const startButton = document.getElementById('start-button');
        const startScreen = document.getElementById('start-screen');
        
        if (startButton && startScreen) {
            // Add mouseenter event to play music on hover (user interaction)
            startButton.addEventListener('mouseenter', () => {
                if (this.audio && this.audio.startMusic && this.audio.startMusic.paused) {
                    console.log('🔊 Playing start music on hover...');
                    this.playStartMusic();
                }
            });
            
            startButton.addEventListener('click', () => {
                console.log('🎮 START button clicked!');
                
                // Ensure music is playing
                if (this.audio && this.audio.startMusic && this.audio.startMusic.paused) {
                    this.playStartMusic();
                }
                
                // Wait a moment to let music play, then fade out
                setTimeout(() => {
                    if (this.audio && this.audio.startMusic && !this.audio.startMusic.paused) {
                        const fadeOut = setInterval(() => {
                            if (this.audio.startMusic.volume > 0.05) {
                                this.audio.startMusic.volume -= 0.05;
                            } else {
                                clearInterval(fadeOut);
                                this.stopStartMusic();
                            }
                        }, 50);
                    }
                }, 200);
                
                // Fade out start screen
                startScreen.classList.add('hidden');
                
                // Start the game after transition
                setTimeout(() => {
                    this.gameStarted = true;
                    this.startGame();
                }, 500);
            });
        }
    }

    startGame() {
        console.log('🎮 Game starting...');
        
        // Start casino music right away
        this.playCasinoMusic();
        
        // Initialize Plinko machine
        this.plinkoMachine = new PlinkoMachine(
            this.sceneSetup.getScene(),
            this.physicsWorld,
            { x: 0, y: 0, z: 0 }
        );
        this.plinkoMachine.init();
        this.plinkoMachine.onComplete = (result) => this.onPlinkoComplete(result);

        // Add button to interactive objects
        const button = this.plinkoMachine.getButton();
        if (button) {
            button.userData.type = 'plinko-button';
            this.raycaster.addInteractiveObject(button);
        }

        // Start in Plinko phase
        this.stateManager.setState(PHASES.PLINKO);

        console.log('✅ Game started - Plinko machine ready!');
    }
}

// Start the application
new TSTCProgramRandomizer();
