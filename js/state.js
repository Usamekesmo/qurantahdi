// js/state.js

export const state = {
    allAyahsInScope: [],
    allAyahsOutOfScope: [],
    quizQuestions: [],
    currentQuestionIndex: 0,
    score: 0,
    userSettings: {},
    selectedAnswer: null,
    surahData: [],
    isPlayingSequence: false,
    audioQueue: [],
    mistakes: [],
};

export const ALL_TEST_TYPES = [
    'findNext_text', 'findPrevious_text', 'findNext_order', 'findPrevious_order',
    'order_scrambled', 'findIntruder_out', 'findIntruder_in'
];

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
    state.mistakes = [];
}
