import * as DOM from './domElements.js';
import { state, incrementScore, setCurrentQuestionIndex, resetQuizState } from './state.js';
import { populateSurahs, fetchData } from './api.js';
import { prepareQuiz } from './quizSetup.js';
import { displayQuestion, showError, hideError } from './ui.js';

// --- تهيئة التطبيق ---
function init() {
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
            const estimatedStartPage = Math.floor((surahNumber - 1) * 2.1) + 1;
            DOM.startPageInput.value = estimatedStartPage > 0 ? estimatedStartPage : 1;
            DOM.endPageInput.value = estimatedStartPage + Math.ceil(surahInfo.numberOfAyahs / 15);
        }
    }
}

async function startTest() {
    hideError();
    resetQuizState();

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

// --- منطق الاختبار (مُحسَّن) ---
export function checkAnswer() {
    if (!state.selectedAnswer) return;

    const question = state.quizQuestions[state.currentQuestionIndex];
    const isCorrect = (state.selectedAnswer.value == question.correctAnswer);
    
    // تعطيل جميع الأزرار لمنع المزيد من الاختيارات
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

    if (isCorrect) {
        incrementScore();
        state.selectedAnswer.element.classList.add('correct');
    } else {
        // 1. تسجيل تفاصيل الخطأ
        const mistakeDetails = {
            questionTitle: question.title,
            userAnswer: state.selectedAnswer.value,
            correctAnswer: question.correctAnswer,
            options: question.options ? question.options.map(opt => typeof opt === 'object' ? opt.text : opt) : 'N/A'
        };
        state.mistakes.push(mistakeDetails);

        // 2. تلوين الإجابة الخاطئة
        state.selectedAnswer.element.classList.add('incorrect');

        // 3. إيجاد وتلوين الإجابة الصحيحة
        const correctButton = Array.from(document.querySelectorAll('.option-btn')).find(btn => {
            // استعادة القيمة الأصلية من الزر للمقارنة
            const btnValue = btn.dataset.value || btn.textContent;
            return btnValue == question.correctAnswer;
        });

        if (correctButton) {
            correctButton.classList.add('correct');
        }
    }

    // تغيير الزر إلى "السؤال التالي"
    const actionButton = document.getElementById('check-answer-btn');
    actionButton.textContent = 'السؤال التالي';
    actionButton.onclick = nextQuestion;
}

function nextQuestion() {
    setCurrentQuestionIndex(state.currentQuestionIndex + 1);
    displayQuestion();
}

export function handleSelection(selectedButton, value) {
    // إزالة التحديد السابق
    document.querySelectorAll('.option-btn.selected').forEach(btn => btn.classList.remove('selected'));
    
    // إضافة التحديد للزر الحالي
    selectedButton.classList.add('selected');
    
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
