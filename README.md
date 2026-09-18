# 🎰 Super Cool Random TSTC Program Randomizer

An absurd, physics-driven 3D interactive experience built with Three.js that selects a random TSTC program through a multi-stage interactive machine.

## 🎮 How It Works

The experience flows through 5 sequential phases:

### 1. **Plinko Phase** 🔴
- Click the giant red button to drop a metal ball
- The ball bounces through pegs on a Plinko board
- It lands in a slot numbered 4, 5, or 6
- This number determines how many rollers the slot machine will have

### 2. **Slot Machine Phase** 🎰
- A slot machine with the determined number of rollers appears
- Drag and release the lever to spin the rollers
- Each roller has 7 fruits: Apple, Banana, Cherry, Dragonfruit, Elderberry, Fig, Grape
- The winning fruits are revealed

### 3. **Juicer Phase** 🧃
- Fruits drop through a trapdoor and roll down a spiral pipe
- They enter a transparent juicer chamber
- The juicer shakes violently and extracts letter blocks
- Each block has the first letter of a fruit (e.g., A for Apple)

### 4. **Hangman Phase** ✏️
- A random TSTC program is secretly selected
- Letter blocks from the juicer smash into the puzzle board as "freebies"
- Type letters on your keyboard to guess the program
- Wrong guesses build a "doom contraption"
- 6 wrong guesses = game over (but the answer is revealed anyway)

### 5. **Reveal Phase** 🎉
- The selected TSTC program is displayed in large text
- Press **R** to play again

## 🛠️ Technology Stack

- **Three.js** - 3D rendering and scene management
- **Cannon-es** - Physics simulation for balls, collisions, and dynamics
- **GSAP** - Smooth animations and camera transitions
- **Vite** - Fast build tool and dev server

## 📁 Project Structure

```
RandomSelector/
├── public/                 # Static assets
├── src/
│   ├── main.js            # Main application orchestrator
│   ├── constants.js       # Configuration and data
│   ├── styles.css         # UI styling
│   ├── core/              # Core systems
│   │   ├── SceneSetup.js     # Three.js scene, camera, renderer
│   │   ├── PhysicsWorld.js   # Cannon.js physics engine
│   │   ├── StateManager.js   # State machine for phases
│   │   └── Raycaster.js      # Mouse interaction handler
│   ├── machines/          # Individual Rube Goldberg components
│   │   ├── PlinkoMachine.js
│   │   ├── SlotMachine.js
│   │   ├── Juicer.js
│   │   └── Hangman.js
│   └── utils/             # Helper utilities
│       ├── CameraController.js  # GSAP camera animations
│       └── Materials.js         # Reusable Three.js materials
├── index.html
├── package.json
└── AGENTS.md              # Original project blueprint
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. Clone or navigate to the project directory:
```bash
cd /Users/benjaminbruton/Desktop/RandomSelector
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

## 🎮 Controls

- **Mouse Click**: Interact with buttons
- **Mouse Drag**: Pull the slot machine lever
- **Keyboard A-Z**: Guess letters in Hangman
- **R Key**: Restart the experience (on final reveal screen)

## 🎨 Customization

### Adding More TSTC Programs

Edit `/src/constants.js` and add programs to the `SCHOOL_PROGRAMS` array:

```javascript
export const SCHOOL_PROGRAMS = [
    'Computer Science',
    'Engineering',
    'Your New Program Here',
    // ... more programs
];
```

### Changing Fruits

Modify the `FRUITS` and `FRUIT_COLORS` arrays in `/src/constants.js`:

```javascript
export const FRUITS = [
    'Apple',
    'Banana',
    // ... add or modify fruits
];
```

### Adjusting Difficulty

Change the max wrong guesses in `/src/constants.js`:

```javascript
export const HANGMAN_CONFIG = {
    MAX_WRONG_GUESSES: 6,  // Increase or decrease
    EXCLUDE_CHARS: [' ', '-', '\'', '.', ',']
};
```

## 🏗️ Architecture

The project follows a **modular, event-driven architecture**:

1. **SceneSetup**: Initializes the Three.js environment
2. **PhysicsWorld**: Manages Cannon.js simulation and syncs with Three.js meshes
3. **StateManager**: Controls phase transitions and data flow between machines
4. **Raycaster**: Handles all mouse interactions with 3D objects
5. **CameraController**: Smoothly moves the camera between stations
6. **Machines**: Independent modules that communicate via callbacks

### State Flow

```
PLINKO_PHASE → (result: number)
  ↓
SLOT_PHASE → (fruits: string[])
  ↓
JUICER_PHASE → (letters: string[])
  ↓
HANGMAN_PHASE → (program: string)
  ↓
REVEAL_PHASE → Press R to restart
```

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- Simplified fruit models (spheres) - could be more detailed 3D models
- Basic text rendering - could use TextGeometry for 3D letters
- No sound effects (commented in AGENTS.md)
- Doom contraption is placeholder boxes

### Planned Features
- [ ] 3D TextGeometry for letter blocks and final reveal
- [ ] More elaborate fruit 3D models
- [ ] Sound effects and background music
- [ ] Particle effects for explosions and celebrations
- [ ] Mobile touch support
- [ ] Save high scores or play statistics

## 📄 License

ISC

## 🙏 Credits

Built following the specifications in `AGENTS.md` - a comprehensive blueprint for creating absurd, interactive Rube Goldberg machines in Three.js.

---

**Enjoy the chaos! 🎉**
