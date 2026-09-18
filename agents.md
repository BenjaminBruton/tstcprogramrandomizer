Project Blueprint: Three.js Rube Goldberg Program Selector
Role: You are an expert Three.js and WebGL creative developer. Your task is to build a highly interactive, absurd, and physics-driven 3D Rube Goldberg machine that ultimately selects a random item from a predefined list of "School Programs".

Goal: Create a visually rich, multi-step 3D experience where the user initiates a chain reaction of bizarre mini-games and mechanical events to reveal a random school program.

Technical Stack & Libraries
Core: Three.js (vanilla or React Three Fiber, depending on user preference—assume vanilla JS + Vite unless specified otherwise).

Physics: Cannon.js or Rapier (essential for Plinko balls, fruit collisions, and bouncing letters).

Animations: GSAP (for camera movements, lever pulling, and UI transitions).

Models: Use basic Three.js primitives (spheres, cylinders, cubes) with distinctive materials/textures, or generate simple procedural shapes for fruits.

The Rube Goldberg Machine Flow (State Machine)
The application must follow a strict sequential flow, moving the 3D camera to different "stations" across a large virtual table as each step is completed.

Step 1: The Plinko Button (Initialization)
Action: The camera starts focused on a giant, cartoonish red 3D button. The user clicks it.

Reaction: Pressing the button releases a heavy metal sphere that drops into a vertical Plinko board.

Outcome: The sphere bounces down the pegs and lands in a numbered slot (e.g., 4, 5, or 6). This number defines exactly how many rollers the Slot Machine in Step 2 will have.

Transition: The camera pans smoothly along a glowing wire from the Plinko board to the Slot Machine.

Step 2: The Fruit Slot Machine
Setup: A 3D slot machine generates dynamically with the number of rollers determined in Step 1.

Action: The user must click and drag a physical 3D lever down and release it.

Reaction: The rollers spin rapidly. Each face of the roller has a 3D fruit attached to it (Apple, Banana, Cherry, Dragonfruit, Elderberry, Fig, Grape).

Outcome: The rollers stop one by one on random fruits.

Transition: A trapdoor opens beneath the slot machine.

Step 3: The Juicer Extractor (Intermediate Absurdity)
Action: The winning fruits drop through the trapdoor and roll down a spiraling PVC-style pipe.

Reaction: They land inside a comical, transparent "Juicer/Woodchipper" machine.

Outcome: The machine shakes violently, emits particle-effect smoke, and spits out physical 3D wooden alphabet blocks. The letters on these blocks correspond exactly to the first letters of the fruits that were rolled (e.g., Apple, Banana, Fig = A, B, F).

Transition: A mechanical conveyor belt carries these blocks to the Hangman stage.

Step 4: The 3D Hangman Game
Setup: A random "School Program" is selected from the backend array, but it is hidden. A 3D mechanical puzzle board appears with blank tiles representing the characters of the chosen program.

Action: The letter blocks from Step 3 fly off the conveyor belt and smash into the puzzle board, acting as "freebie" starting letters for the hangman puzzle.

Gameplay: The user types on their keyboard to guess the remaining missing letters.

Absurd Hangman Mechanic: Instead of drawing a stick figure, every incorrect guess builds a piece of a ridiculous doom contraption (e.g., an anvil tied to a rope, suspended over a glass box of fireworks).

Step 5: The Grand Reveal
Win State: If the user completes the word, the puzzle board rotates rapidly, glowing with neon particle effects. The doom contraption harmlessly retracts.

Fail State (Optional but fun): If the user fails the hangman, the anvil drops, causing a massive (but harmless) physics explosion of confetti, which then clears to reveal the answer anyway.

Final Output: A giant 3D banner unfurls from the ceiling displaying the winning School Program in large 3D text.

Agent Implementation Instructions
When writing the code for this project, adhere to the following guidelines:

Modular Architecture: Do not write a single massive main.js file. Break the scene into logical classes or components: SceneSetup.js, PlinkoMachine.js, SlotMachine.js, Juicer.js, Hangman.js, and PhysicsWorld.js.

State Management: Implement a simple state machine to track the current phase (PLINKO_PHASE, SLOT_PHASE, JUICER_PHASE, HANGMAN_PHASE, REVEAL_PHASE). Prevent users from interacting with elements outside the current phase.

Raycasting: Set up a robust raycaster for interaction. Ensure the lever requires a drag interaction (mousedown, mousemove, mouseup) rather than just a simple click.

Camera Control: Disable default OrbitControls during transitions. Use GSAP to animate the camera's position and target to guide the user's eye from one absurd machine to the next.

Data Structure: Keep the list of School Programs in a clean array at the top of your logic file or in a separate constants.js file so it can be easily updated. Ensure the random selector normalizes the text to match the Hangman logic.