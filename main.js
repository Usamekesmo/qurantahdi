// js/main.js

import * as DOM from './domElements.js';
import { state, incrementScore, setCurrentQuestionIndex } from './state.js';
import { populateSurahs, fetchData } from './api.js';
import { prepareQuiz } from './quizSetup.js';
import { displayQuestion, showError, hideError } from './ui.js';

function init() {
    document.addEventListener('DOMContentLoaded', () => {
        populateSurahs(DOM.surahSelect);
        DOM.startTestBtn.addEventListener('click', startTest);
        DOM.surahSelect.addEventListener('change', handleSurahChange);
    });
}

function handleSurahChange(event) {
    const surahNumber = parseInt(event.target.value);
    if (surahNumber === 0) {
        DOM.startPageInput.value = 1;
        DOM.endPageInput.value = 604;
    } else {
        const surahInfo = state.surahData.find(s => s.number === surahNumber);
        if (surahInfo) {
            // هذا تقدير تقريبي جداً للصفحات
            const estimatedStartPage = Math.floor((surahNumber - 1) * 2.1) + 1;
            DOM.startPageInput.value = estimatedStartPage > 0 ? estimatedStartPage : 1;
            DOM.endPageInput.value = estimatedStartPage + Math.ceil(surahInfo.numberOfAyahs / 15); // تقدير لعدد الصفحات
        }
    }
}

async function startTest() {
    hide
// js/main.js

import * as DOM from './domElements.js';
import { state, incrementScore, setCurrentQuestionIndex, resetQuizState } from './state.js';
import { populateSurahs, fetchData } from './api.js';
import { prepareQuiz } from './quizSetup.js';
import { displayQuestion, showError, hideError } from './ui.js';

// --- تهيئة التطبيق ---
function init() {
    // ننتظر حتى يتم تحميل محتوى الصفحة بالكامل قبل تشغيل الكود
    document.addEventListener('DOMContentLoaded', () => {
        populateSurahs(DOM.surahSelect);
        DOM.startTestBtn.addEventListener('click', startTest);
        DOM.surahSelect.addEventListener('change', handleSurahChange);
    });
}

// --- معالجات الأحداث ---
function handleSurahChange(event) {
    const surahNumber = parseInt(event.target.value);
    if (surahNumber === 0) {
        DOM.startPageInput.value = 1;
        DOM.endPageInput.value = 604;
    } else {
        const surahInfo = state.surahData.find(s => s.number === surahNumber);
        if (surahInfo) {
            // هذا تقدير تقريبي جداً للصفحات
            const estimatedStartPage = Math.floor((surahNumber - 1) * 2.1) + 1;
            DOM.startPageInput.value = estimatedStartPage > 0 ? estimatedStartPage : 1;
            // تقدير لعدد الصفحات بناءً على عدد الآيات (بافتراض 15 آية في الصفحة)
            DOM.endPageInput.value = estimatedStartPage + Math.ceil(surahInfo.numberOfAyahs / 15);
        }
    }
}

async function startTest() {
    hideError(); // إخفاء أي رسائل خطأ سابقة
    resetQuizState(); // إعادة تعيين حالة الاختبار السابق

    state.userSettings = {
        name: DOM.userNameInput.value.trim(),
        startPage: parseInt(DOM.startPageInput.value),
        endPage: parseInt(DOM.endPageInput.value),
        numQuestions: parseInt(DOM.numQuestionsInput.value),
        reciter: DOM.reciterSelect.value
    };

    if (!validateSettings()) return;

    DOM.settingsScreen.classList.add('hidden');
    DOM.loadingScreen.classList.remove('hidden');

    await fetchData();

    if (state.allAyahsInScope.length < 5 || state.allAyahsOutOfScope.length < 4) {
        showError("النطاق المحدد صغير جداً. الرجاء اختيار نطاق أوسع.");
        DOM.loadingScreen.classList.add('hidden');
        DOM.settingsScreen.classList.remove('hidden');
        return;
    }

    prepareQuiz();
    DOM.loadingScreen.classList.add('hidden');
    DOM.quizScreen.classList.remove('hidden');
    DOM.userNameDisplay.textContent = `المختبر: ${state.userSettings.name}`;
    displayQuestion();
}

// --- منطق الاختبار ---
export function checkAnswer() {
    if (!state.selectedAnswer) return;
    const question = state.quizQuestions[state.currentQuestionIndex];
    const isCorrect = (state.selectedAnswer.value == question.correctAnswer);
    
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

    if (isCorrect) {
        incrementScore();
        state.selectedAnswer.element.classList.add('correct');
    } else {
const mistakeDetails = {
            questionTitle: question.title,
            userAnswer: state.selectedAnswer.value,
            correctAnswer: question.correctAnswer,
            options: question.options ? question.options.map(opt => opt.text || opt) : 'N/A'
        };
        state.mistakes.push(mistakeDetails);
        state.selectedAnswer.element.classList.add('incorrect');

        // إظهار الإجابة الصحيحة في حالة الخطأ
        if (question.type === 'order_scrambled') {
            document.getElementById('user-sequence').textContent += ` (خطأ، الصحيح: ${question.correctAnswer})`;
        } else {
            document.querySelectorAll('.option-btn').forEach(btn => {
                let btnValue;
                if (btn.textContent.includes('الخيار رقم')) {
                    btnValue = parseInt(btn.textContent.replace('الخيار رقم ', ''));
                } else if (btn.innerHTML.includes('سورة')) {
                    const originalOption = question.options.find(opt => btn.innerHTML.includes(opt.text));
                    btnValue = originalOption ? originalOption.number : null;
                } else {
                    btnValue = btn.textContent;
                }
                if (btnValue == question.correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }
    }

    const actionButton = document.getElementById('check-answer-btn');
    actionButton.textContent = 'السؤال التالي';
    actionButton.onclick = nextQuestion;
}

function nextQuestion() {
    setCurrentQuestionIndex(state.currentQuestionIndex + 1);
    displayQuestion();
}

export function handleSelection(selectedButton, value) {
    document.querySelectorAll('.option-btn.selected').forEach(btn => btn.classList.remove('selected'));
    if (!selectedButton.classList.contains('order-btn')) {
        selectedButton.classList.add('selected');
    }
    state.selectedAnswer = { element: selectedButton, value: value };
    document.getElementById('check-answer-btn').disabled = false;
}

function validateSettings() {
    const { name, startPage, endPage, numQuestions } = state.userSettings;
    if (!name) { 
        showError("الرجاء إدخال اسمك."); 
        return false; 
    }
    if (isNaN(startPage) || isNaN(endPage) || startPage < 1 || endPage > 604 || startPage > endPage) {
        showError("نطاق الصفحات غير صحيح."); 
        return false;
    }
    if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 25) {
        showError("عدد الأسئلة غير صحيح (يجب أن يكون بين 1 و 25)."); 
        return false;
    }
    return true;
}

// --- بدء تشغيل التطبيق ---
init();
