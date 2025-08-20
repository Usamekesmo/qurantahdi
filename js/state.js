// js/state.js

export const state = {
    // Data fetched from API
    allAyahsInScope: [],
    allAyahsOutOfScope: [],
    surahData: [],

    // Quiz state
    quizQuestions: [],
    currentQuestionIndex: 0,
    score: 0,
    selectedAnswer: null,
    mistakes: [], // Array to store details of incorrect answers

    // User settings
    userSettings: {},

    // Audio player state
    isPlayingSequence: false,
    audioQueue: [],
};

// All available test types for random selection
export const ALL_TEST_TYPES = [
    'findNext_text', 
    'findPrevious_text', 
    'findNext_order', 
    'findPrevious_order',
    'order_scrambled', 
    'findIntruder_out', 
    'findIntruder_in'
];

// --- State Modifiers ---

export function setQuizQuestions(questions) {
    state.quizQuestions = questions;
}

export function setCurrentQuestionIndex(index) {
    state.currentQuestionIndex = index;
}

export function incrementScore() {
    state.score++;
}

export function resetQuizState() {
    state.quizQuestions = [];
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.selectedAnswer = null;
    state.mistakes = []; // Reset mistakes for the new quiz
}
