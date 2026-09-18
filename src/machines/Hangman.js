import * as THREE from 'three';
import gsap from 'gsap';
import { SCHOOL_PROGRAMS, HANGMAN_CONFIG, COLORS } from '../constants.js';
import { Materials } from '../utils/Materials.js';

export class Hangman {
    constructor(scene, position = { x: 75, y: 0, z: 0 }, isMobile = false) {
        this.scene = scene;
        this.position = position;
        this.selectedProgram = null;
        this.normalizedProgram = '';
        this.revealedLetters = new Set();
        this.wrongGuesses = 0;
        this.tiles = [];
        this.onComplete = null;
        this.keyboardListener = null;
        this.gameOver = false; // Track if game has ended (win or lose)
        this.isMobile = isMobile;
        this.virtualKeyboard = null;
    }

    init(freebieLetters = []) {
        this.selectedProgram = SCHOOL_PROGRAMS[Math.floor(Math.random() * SCHOOL_PROGRAMS.length)];
        this.normalizedProgram = this.selectedProgram.toUpperCase();
        
        console.log('🎓 Selected TSTC program:', this.selectedProgram);
        console.log('🎁 Freebie letters:', freebieLetters);

        freebieLetters.forEach(letter => this.revealedLetters.add(letter));

        this.createPuzzleBoard();
        this.createDoomContraption();
        this.setupKeyboardInput();
        
        // Show virtual keyboard on mobile
        if (this.isMobile) {
            this.createVirtualKeyboard();
        }
    }

    createPuzzleBoard() {
        const letterSpacing = 0.8;
        const startX = -(this.normalizedProgram.length * letterSpacing) / 2;

        for (let i = 0; i < this.normalizedProgram.length; i++) {
            const char = this.normalizedProgram[i];
            const isSpace = HANGMAN_CONFIG.EXCLUDE_CHARS.includes(char);
            const isRevealed = this.revealedLetters.has(char) && !isSpace;
            
            // Handle special characters differently
            if (isSpace) {
                // For actual spaces, don't create tiles
                if (char === ' ') {
                    this.tiles.push({
                        mesh: null,
                        char: char,
                        revealed: true
                    });
                    continue;
                }
                
                // For other special chars (&, /, etc.), show them as revealed
                const tileGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.1);
                const tileMaterial = new THREE.MeshStandardMaterial({
                    color: COLORS.SUCCESS // Green since auto-revealed
                });
                const tile = new THREE.Mesh(tileGeometry, tileMaterial);
                tile.position.set(
                    this.position.x + startX + (i * letterSpacing),
                    this.position.y + 3,
                    this.position.z
                );
                tile.castShadow = true;
                this.scene.add(tile);
                
                // Show the special character
                this.addLetterLabel(tile, char);
                
                this.tiles.push({
                    mesh: tile,
                    char: char,
                    revealed: true
                });
                continue;
            }
            
            const tileGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.1);
            const tileMaterial = new THREE.MeshStandardMaterial({
                color: isRevealed ? COLORS.SUCCESS : 0xffffff
            });
            const tile = new THREE.Mesh(tileGeometry, tileMaterial);
            tile.position.set(
                this.position.x + startX + (i * letterSpacing),
                this.position.y + 3,
                this.position.z
            );
            tile.castShadow = true;
            this.scene.add(tile);

            // Add text label if revealed
            if (isRevealed) {
                this.addLetterLabel(tile, char);
            }

            this.tiles.push({
                mesh: tile,
                char: char,
                revealed: isRevealed
            });
        }
        
        console.log('📋 Puzzle board created');
        console.log('   Revealed letters:', Array.from(this.revealedLetters).join(', '));
    }

    addLetterLabel(tile, letter) {
        // Create a canvas texture with the letter
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const labelGeometry = new THREE.PlaneGeometry(0.6, 0.6);
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.z = 0.06;
        tile.add(label);
    }

    createDoomContraption() {
        this.doomParts = [];
        this.doomWords = HANGMAN_CONFIG.DOOM_WORDS;
        
        // Create text meshes for each word in "HERES YOUR MONEY BACK GUARANTEE"
        let yOffset = 0;
        this.doomWords.forEach((word, wordIndex) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(word, 256, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            const geometry = new THREE.PlaneGeometry(4, 1);
            const wordMesh = new THREE.Mesh(geometry, material);
            wordMesh.position.set(
                this.position.x - 5,
                this.position.y + 6 - yOffset,
                this.position.z
            );
            wordMesh.visible = false;
            this.scene.add(wordMesh);
            this.doomParts.push(wordMesh);
            
            yOffset += 1.2;
        });
        
        console.log('💀 Doom phrase system created:', this.doomWords.length, 'words');
    }

    setupKeyboardInput() {
        this.keyboardListener = (event) => {
            const key = event.key.toUpperCase();
            if (key.length === 1 && key.match(/[A-Z]/)) {
                this.guessLetter(key);
            }
        };
        window.addEventListener('keydown', this.keyboardListener);
    }

    guessLetter(letter) {
        // Don't accept input if game is over
        if (this.gameOver) {
            console.log('⚠️ Game over, ignoring input');
            return;
        }
        
        if (this.revealedLetters.has(letter)) {
            console.log('⚠️ Letter already guessed:', letter);
            return;
        }
        
        this.revealedLetters.add(letter);

        if (this.normalizedProgram.includes(letter)) {
            console.log('✅ Correct:', letter);
            this.revealLetter(letter);
        } else {
            console.log('❌ Wrong:', letter);
            this.wrongGuesses++;
            this.buildDoomPiece();
        }
        this.checkWin();
    }

    revealLetter(letter) {
        this.tiles.forEach((tile) => {
            if (tile.char === letter && !tile.revealed && tile.mesh) {
                tile.revealed = true;
                gsap.to(tile.mesh.material.color, {
                    r: (COLORS.SUCCESS >> 16) / 255,
                    g: ((COLORS.SUCCESS >> 8) & 255) / 255,
                    b: (COLORS.SUCCESS & 255) / 255,
                    duration: 0.3
                });
                
                // Add the letter text
                this.addLetterLabel(tile.mesh, letter);
            }
        });
    }

    buildDoomPiece() {
        if (this.wrongGuesses <= HANGMAN_CONFIG.MAX_WRONG_GUESSES) {
            const wordIndex = this.wrongGuesses - 1;
            const wordMesh = this.doomParts[wordIndex];
            if (wordMesh) {
                wordMesh.visible = true;
                console.log(`💀 Revealed word ${wordIndex + 1}:`, this.doomWords[wordIndex]);
                gsap.from(wordMesh.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
            }
        }
        if (this.wrongGuesses >= HANGMAN_CONFIG.MAX_WRONG_GUESSES) {
            this.triggerGameOver();
        }
    }

    checkWin() {
        // Don't check for win if already game over
        if (this.gameOver) {
            return;
        }
        
        const allRevealed = this.tiles.every(tile => 
            tile.revealed || HANGMAN_CONFIG.EXCLUDE_CHARS.includes(tile.char)
        );
        if (allRevealed) {
            this.triggerWin();
        }
    }

    triggerWin() {
        console.log('🎉 YOU WIN!', HANGMAN_CONFIG.WIN_MESSAGE);
        this.gameOver = true; // Mark game as over
        window.removeEventListener('keydown', this.keyboardListener);
        if (this.onComplete) {
            setTimeout(() => this.onComplete({
                program: this.selectedProgram,
                won: true,
                message: HANGMAN_CONFIG.WIN_MESSAGE
            }), 1000);
        }
    }

    triggerGameOver() {
        console.log('💀 GAME OVER!', HANGMAN_CONFIG.LOSE_MESSAGE);
        console.log('   Answer was:', this.selectedProgram);
        this.gameOver = true; // Mark game as over to prevent win condition from triggering
        
        // Reveal all remaining letters
        this.tiles.forEach(tile => {
            if (!tile.revealed && tile.mesh) {
                tile.revealed = true;
                gsap.to(tile.mesh.material.color, {
                    r: (COLORS.WARNING >> 16) / 255,
                    g: ((COLORS.WARNING >> 8) & 255) / 255,
                    b: (COLORS.WARNING & 255) / 255,
                    duration: 0.5
                });
                // Add letter text
                this.addLetterLabel(tile.mesh, tile.char);
            }
        });
        
        window.removeEventListener('keydown', this.keyboardListener);
        if (this.onComplete) {
            setTimeout(() => this.onComplete({
                program: this.selectedProgram,
                won: false,
                message: HANGMAN_CONFIG.LOSE_MESSAGE
            }), 2000);
        }
    }

    createVirtualKeyboard() {
        const keyboard = document.getElementById('virtual-keyboard');
        if (!keyboard) {
            console.error('❌ Virtual keyboard element not found!');
            return;
        }
        
        keyboard.innerHTML = '';
        keyboard.style.display = 'flex';
        
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        
        console.log('⌨️ Creating virtual keyboard with', letters.length, 'keys');
        console.log('   Program to guess:', this.normalizedProgram);
        
        letters.forEach(letter => {
            const key = document.createElement('div');
            key.className = 'virtual-key';
            key.textContent = letter;
            key.dataset.letter = letter;
            
            // Use touchstart for better mobile response
            const handleKeyPress = (e) => {
                e.preventDefault(); // Prevent double-tap zoom
                
                if (key.classList.contains('used')) {
                    console.log('⚠️ Key already used:', letter);
                    return;
                }
                
                console.log('📱 Virtual key pressed:', letter);
                
                // Mark as used immediately
                key.classList.add('used');
                
                // Check if correct and add visual feedback
                const isCorrect = this.normalizedProgram.includes(letter);
                console.log('   Is correct?', isCorrect);
                
                if (isCorrect) {
                    key.classList.add('correct');
                } else {
                    key.classList.add('wrong');
                }
                
                // Actually process the guess
                this.guessLetter(letter);
            };
            
            key.addEventListener('click', handleKeyPress);
            key.addEventListener('touchstart', handleKeyPress);
            
            keyboard.appendChild(key);
        });
        
        this.virtualKeyboard = keyboard;
        console.log('✅ Virtual keyboard created with', keyboard.children.length, 'keys');
    }

    cleanup() {
        if (this.keyboardListener) {
            window.removeEventListener('keydown', this.keyboardListener);
        }
        if (this.virtualKeyboard) {
            this.virtualKeyboard.style.display = 'none';
        }
    }
}
