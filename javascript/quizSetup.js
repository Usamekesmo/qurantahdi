// js/quizSetup.js

import { state, ALL_TEST_TYPES, setQuizQuestions } from './state.js';

function generateFindNextPreviousQuestion(direction) {
    const { allAyahsInScope } = state;
    const isNext = direction === 'next';
    const validIndices = allAyahsInScope.map((_, i) => i).filter(i => isNext ? i < allAyahsInScope.length - 1 : i > 0);
    if (validIndices.length < 4) return null;
    const randomIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
    const questionAyah = allAyahsInScope[randomIndex];
    const correctAyah = allAyahsInScope[isNext ? randomIndex + 1 : randomIndex - 1];
    const wrongOptions = allAyahsInScope.filter(a => a.number !== correctAyah.number && a.number !== questionAyah.number).sort(() => 0.5 - Math.random()).slice(0, 3);
    if (wrongOptions.length < 3) return null;
    return { type: 'find_text', title: `استمع للآية، ثم اختر الآية ال${isNext ? 'تالية' : 'سابقة'} لها:`, audio: questionAyah.audio, options: [correctAyah, ...wrongOptions].sort(() => 0.5 - Math.random()), correctAnswer: correctAyah.text };
}

function generateFindNextPreviousOrderQuestion(direction) {
    const { allAyahsInScope } = state;
    const isNext = direction === 'next';
    if (allAyahsInScope.length < 4) return null;
    const startIndex = Math.floor(Math.random() * (allAyahsInScope.length - 4));
    const sequence = allAyahsInScope.slice(startIndex, startIndex + 4);
    const questionAyah = isNext ? sequence[0] : sequence[3];
    const correctAyah = isNext ? sequence[1] : sequence[2];
    const shuffledSequence = [...sequence].sort(() => 0.5 - Math.random());
    const correctIndex = shuffledSequence.findIndex(a => a.number === correctAyah.number);
    return { type: 'find_order', title: `استمع للآية المرجعية، ثم استمع للمقطع، واختر ترتيب الآية ال${isNext ? 'تالية' : 'سابقة'}.`, referenceAudio: questionAyah.audio, audioSequence: shuffledSequence.map(a => a.audio), correctAnswer: correctIndex + 1 };
}

function generateOrderScrambledQuestion() {
    const { allAyahsInScope } = state;
    if (allAyahsInScope.length < 4) return null;
    const startIndex = Math.floor(Math.random() * (allAyahsInScope.length - 4));
    const correctSequence = allAyahsInScope.slice(startIndex, startIndex + 4);
    const scrambledSequence = [...correctSequence].sort(() => 0.5 - Math.random());
    return { type: 'order_scrambled', title: 'استمع للمقطع الصوتي، ثم قم بترتيب الآيات حسب سماعك لها.', audioSequence: scrambledSequence.map(a => a.audio), correctAnswer: scrambledSequence.map(a => correctSequence.indexOf(a) + 1).join('-') };
}

function generateFindIntruderQuestion(direction) {
    const { allAyahsInScope, allAyahsOutOfScope } = state;
    const isOut = direction === 'out';
    if (allAyahsInScope.length < 3 || allAyahsOutOfScope.length < 1) return null;
    const inScopeOptions = [...allAyahsInScope].sort(() => 0.5 - Math.random()).slice(0, 3);
    const outOfScopeOption = allAyahsOutOfScope[Math.floor(Math.random() * allAyahsOutOfScope.length)];
    let options, correctAnswer;
    if (isOut) {
        options = [...inScopeOptions, outOfScopeOption];
        correctAnswer = outOfScopeOption.number;
    } else {
        const inScopeOption = allAyahsInScope[Math.floor(Math.random() * allAyahsInScope.length)];
        const outOfScopeOptions = [...allAyahsOutOfScope].sort(() => 0.5 - Math.random()).slice(0, 3);
        if (outOfScopeOptions.length < 3) return null;
        options = [...outOfScopeOptions, inScopeOption];
        correctAnswer = inScopeOption.number;
    }
    const shuffledOptions = options.sort(() => 0.5 - Math.random());
    return { type: 'find_intruder', title: isOut ? 'اكتشف الآية التي ليست من النطاق المحدد.' : 'اكتشف الآية الوحيدة التي من النطاق المحدد.', audioSequence: shuffledOptions.map(a => a.audio), options: shuffledOptions, correctAnswer: correctAnswer };
}

function getQuestionGenerator(testType) {
    const generators = {
        'findNext_text': generateFindNextPreviousQuestion.bind(null, 'next'),
        'findPrevious_text': generateFindNextPreviousQuestion.bind(null, 'previous'),
        'findNext_order': generateFindNextPreviousOrderQuestion.bind(null, 'next'),
        'findPrevious_order': generateFindNextPreviousOrderQuestion.bind(null, 'previous'),
        'order_scrambled': generateOrderScrambledQuestion,
        'findIntruder_out': generateFindIntruderQuestion.bind(null, 'out'),
        'findIntruder_in': generateFindIntruderQuestion.bind(null, 'in'),
    };
    return generators[testType];
}

export function prepareQuiz() {
    const { numQuestions } = state.userSettings;
    const newQuizQuestions = [];
    let attempts = 0;
    for (let i = 0; i < numQuestions && attempts < 50; i++) {
        const randomTestType = ALL_TEST_TYPES[Math.floor(Math.random() * ALL_TEST_TYPES.length)];
        const generator = getQuestionGenerator(randomTestType);
        if (!generator) { attempts++; continue; }
        const question = generator();
        if (question) {
            newQuizQuestions.push(question);
        } else {
            i--;
            attempts++;
        }
    }
    setQuizQuestions(newQuizQuestions);
}
