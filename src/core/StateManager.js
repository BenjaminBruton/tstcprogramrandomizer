import { PHASES } from '../constants.js';

export class StateManager {
    constructor() {
        this.currentPhase = PHASES.PLINKO;
        this.data = {
            plinkoResult: null,      // Number of rollers (4, 5, or 6)
            slotFruits: [],          // Array of winning fruits
            letterBlocks: [],        // Array of letters from fruits
            selectedProgram: null,   // The school program to guess
            revealedLetters: [],     // Letters revealed in hangman
            wrongGuesses: 0          // Number of wrong guesses
        };
        this.listeners = {};
    }

    setState(newPhase) {
        const oldPhase = this.currentPhase;
        this.currentPhase = newPhase;
        this.emit('phaseChange', { oldPhase, newPhase });
        this.updateUI();
    }

    getState() {
        return this.currentPhase;
    }

    canInteract(phase) {
        return this.currentPhase === phase;
    }

    setData(key, value) {
        this.data[key] = value;
        this.emit('dataChange', { key, value });
    }

    getData(key) {
        return this.data[key];
    }

    getAllData() {
        return this.data;
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }

    updateUI() {
        const phaseIndicator = document.getElementById('phase-indicator');
        const instructions = document.getElementById('instructions');

        if (phaseIndicator) {
            phaseIndicator.textContent = `Phase: ${this.currentPhase}`;
        }

        if (instructions) {
            const instructionTexts = {
                [PHASES.PLINKO]: 'Click the red button to start!',
                [PHASES.SLOT]: 'Click the SPIN button!',
                [PHASES.JUICER]: 'Watch the magic happen...',
                [PHASES.HANGMAN]: 'Type letters to guess the TSTC program!',
                [PHASES.REVEAL]: 'Congratulations! Press R to play again.'
            };
            instructions.textContent = instructionTexts[this.currentPhase] || '';
        }
    }

    reset() {
        this.currentPhase = PHASES.PLINKO;
        this.data = {
            plinkoResult: null,
            slotFruits: [],
            letterBlocks: [],
            selectedProgram: null,
            revealedLetters: [],
            wrongGuesses: 0
        };
        this.updateUI();
    }
}
