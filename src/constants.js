// Phase Constants
export const PHASES = {
    PLINKO: 'PLINKO_PHASE',
    SLOT: 'SLOT_PHASE',
    JUICER: 'JUICER_PHASE',
    HANGMAN: 'HANGMAN_PHASE',
    REVEAL: 'REVEAL_PHASE'
};

// TSTC Programs List
export const SCHOOL_PROGRAMS = [
    'Biology',
    'Developmental Education',
    'Liberal Arts',
    'Math/Natural Science',
    'Automation (ETT)',
    'Automation (MEC)',
    'Automation (AAC)',
    'Instrumentation/Process Ops',
    'Precision Machining',
    'Robotics',
    'Industrial Systems',
    'Welding',
    'Business Management',
    'Education & Training',
    'Culinary Arts',
    'Occupational Safety',
    'Drafting and Design',
    'Biomedical Equipment',
    'Associate Degree Nursing',
    'Chemical Dependency Counseling',
    'Dental Hygiene',
    'Health Information/ Pre-Allied Health',
    'Vocational Nursing',
    'Surgical Technology',
    'Emergency Medical Services',
    'Building Construction',
    'HVAC',
    'Plumbing',
    'Electrical Construction/Solar',
    'Electrical Power & Controls',
    'Electrical Lineworker',
    'Wind Energy',
    'Computer Networking',
    'Cybersecurity',
    'Computer Programming',
    'Web Design & Development',
    'Aviation Maintenance',
    'Aircraft Pilot Training',
    'Avionics',
    'Auto Collision',
    'Automotive',
    'Diesel'
];

// Fruit Types for Slot Machine
export const FRUITS = [
    'Apple',
    'Banana',
    'Cherry',
    'Dragonfruit',
    'Elderberry',
    'Fig',
    'Grape'
];

// Fruit Colors
export const FRUIT_COLORS = {
    Apple: 0xff0000,
    Banana: 0xffff00,
    Cherry: 0xcc0000,
    Dragonfruit: 0xff1493,
    Elderberry: 0x800080,
    Fig: 0x9370db,
    Grape: 0x6f2da8
};

// Camera Positions for Each Phase (must match PHASES keys!)
// Machines are 18 units apart for proper spacing without overlap
// Mobile gets pulled back for better fit
export const CAMERA_POSITIONS = {
    PLINKO_PHASE: { x: 0, y: 5, z: 15 },
    SLOT_PHASE: { x: 18, y: 5, z: 15 },
    JUICER_PHASE: { x: 36, y: 8, z: 18 },
    HANGMAN_PHASE: { x: 54, y: 6, z: 20 },
    REVEAL_PHASE: { x: 27, y: 25, z: 50 }  // Higher and further back to see all machines
};

export const CAMERA_POSITIONS_MOBILE = {
    PLINKO_PHASE: { x: 0, y: 8, z: 25 },     // Pulled back and up
    SLOT_PHASE: { x: 18, y: 8, z: 25 },
    JUICER_PHASE: { x: 36, y: 10, z: 28 },
    HANGMAN_PHASE: { x: 54, y: 10, z: 30 },
    REVEAL_PHASE: { x: 27, y: 30, z: 60 }    // Much further back
};

export const CAMERA_TARGETS = {
    PLINKO_PHASE: { x: 0, y: 3, z: 0 },
    SLOT_PHASE: { x: 18, y: 3, z: 0 },
    JUICER_PHASE: { x: 36, y: 3, z: 0 },
    HANGMAN_PHASE: { x: 54, y: 3, z: 0 },
    REVEAL_PHASE: { x: 27, y: 3, z: 0 }  // Look at center of all machines
};

// Hangman Configuration
export const HANGMAN_CONFIG = {
    MAX_WRONG_GUESSES: 5,  // 5 wrong guesses before game over
    EXCLUDE_CHARS: [' ', '-', '\'', '.', ',', '/', '&', '(', ')'],  // Auto-revealed special chars
    DOOM_PHRASE: "HERES YOUR MONEY BACK GUARANTEE",  // Phrase that gets revealed
    DOOM_WORDS: ["HERES", "YOUR", "MONEY", "BACK", "GUARANTEE"],
    LOSE_MESSAGE: "You couldn't secure student jobs and they got their money back :(",
    WIN_MESSAGE: "Your students landed high paying jobs in Texas!"
};

// Colors
export const COLORS = {
    PRIMARY: 0x667eea,
    SECONDARY: 0x764ba2,
    ACCENT: 0xff6b6b,
    SUCCESS: 0x51cf66,
    WARNING: 0xffd43b,
    ERROR: 0xff6b6b,
    METAL: 0x8c8c8c,
    GOLD: 0xffd700,
    WOOD: 0x8b4513,
    GLASS: 0x87ceeb
};

// Physics Configuration
export const PHYSICS_CONFIG = {
    GRAVITY: -9.82,
    TIME_STEP: 1 / 60
};
