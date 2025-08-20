// js/ui.js

import * as DOM from './domElements.js';
import { state } from './state.js';
import { checkAnswer, handleSelection } from './main.js';
import { playSequence } from './utils.js';

function displayFindTextQuestion(q) {
    DOM.questionArea.innerHTML = `<audio controls class="audio-player" src="${q.audio}"></audio>`;
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `${opt.text}`;
        btn.onclick = () => handleSelection(btn, opt.text);
        DOM.optionsContainer.appendChild(btn);
    });
}

function displayFindOrderQuestion(q) {
    let html = `<p>الآية المرجعية:</p><audio controls class="audio-player" src="${q.referenceAudio}"></audio><p style="margin-top:20px;">المقطع الصوتي للخيارات:</p><button id="play-seq-btn" style="background: var(--primary-color); color:white; padding: 10px 20px; font-size:1em; border:none; border-radius:8px; cursor:pointer;">▶️ تشغيل المقطع</button>`;
    DOM.questionArea.innerHTML = html;
    document.getElementById('play-seq-btn').onclick = () => playSequence(q.audioSequence, document.getElementById('play-seq-btn'));
    for (let i = 1; i <= 4; i++) {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.style.fontFamily = 'var(--font-main)';
        btn.textContent = `الخيار رقم ${i}`;
        btn.onclick = () => handleSelection(btn, i);
        DOM.optionsContainer.appendChild(btn);
    }
}

function displayOrderScrambledQuestion(q) {
    let userSequence = [];
    DOM.questionArea.innerHTML = `<button id="play-seq-btn" style="background: var(--primary-color); color:white; padding: 10px 20px; font-size:1em; border:none; border-radius:8px; cursor:pointer;">▶️ تشغيل المقطع الصوتي المبعثر</button>`;
    DOM.questionArea.innerHTML += `<p style="margin-top:15px;">انقر على الأرقام لترتيبها:</p>`;
    let optionsHTML = `<div class="ordering-container" id="ordering-btns"><button class="option-btn order-btn">1</button><button class="option-btn order-btn">2</button><button class="option-btn order-btn">3</button><button class="option-btn order-btn">4</button></div><p>ترتيبك:</p><div id="user-sequence"></div>`;
    DOM.optionsContainer.innerHTML = optionsHTML;
    document.querySelectorAll('#ordering-btns .order-btn').forEach(btn => {
        btn.onclick = () => {
            if (userSequence.length < 4) {
                btn.classList.add('selected');
                btn.disabled = true;
                userSequence.push(btn.textContent);
                document.getElementById('user-sequence').textContent = userSequence.join(' - ');
                if (userSequence.length === 4) {
                    handleSelection(btn, userSequence.join('-'));
                }
            }
        };
    });
}

function displayFindIntruderQuestion(q) {
    DOM.questionArea.innerHTML = `<button id="play-seq-btn" style="background: var(--primary-color); color:white; padding: 10px 20px; font-size:1em; border:none; border-radius:8px; cursor:pointer;">▶️ تشغيل المقطع الصوتي</button>`;
    document.getElementById('play-seq-btn').onclick = () => playSequence(q.audioSequence, document.getElementById('play-seq-btn'));
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `${opt.text} <span style="font-family: var(--font-main); font-size:0.5em; color:#888;">(سورة ${opt.surah.name})</span>`;
        btn.onclick = () => handleSelection(btn, opt.number);
        DOM.optionsContainer.appendChild(btn);
    });
}

function getQuestionDisplayer(type) {
    const displayers = {
        'find_text': displayFindTextQuestion,
        'find_order': displayFindOrderQuestion,
        'order_scrambled': displayOrderScrambledQuestion,
        'find_intruder': displayFindIntruderQuestion,
    };
    return displayers[type];
}

export function displayQuestion() {
    if (state.currentQuestionIndex >= state.quizQuestions.length) {
        showResults();
        return;
    }
    state.selectedAnswer = null;
    const question = state.quizQuestions[state.currentQuestionIndex];
    DOM.questionCounter.textContent = `السؤال: ${state.currentQuestionIndex + 1} / ${state.quizQuestions.length}`;
    DOM.questionTitle.textContent = question.title;
    DOM.questionArea.innerHTML = '';
    DOM.optionsContainer.innerHTML = '';
    
    const displayer = getQuestionDisplayer(question.type);
    if (displayer) {
        displayer(question);
    }

    DOM.actionButtonsContainer.innerHTML = `<button id="check-answer-btn" disabled>تحقق من الإجابة</button>`;
    document.getElementById('check-answer-btn').onclick = checkAnswer;
}
// --- دالة جديدة لإرسال البيانات ---
async function logResultsToGoogleSheet() {
    // !!! استبدل هذا الرابط بالرابط الذي نسخته من Google Apps Script !!!
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGGCEVJziYcO3StrnhOysQyAe9dn68jkMspc8G5ai0GeAhepPGSZ-wUSuVwklBLVUpcQ/exec';

    const { name, startPage, endPage, numQuestions } = state.userSettings;
    const resultData = {
        userName: name,
        pageRange: `من ${startPage} إلى ${endPage}`,
        totalQuestions: state.quizQuestions.length,
        correctAnswers: state.score,
        score: `${state.score} / ${state.quizQuestions.length}`,
        // نحول مصفوفة الأخطاء إلى نص JSON لتسهيل تخزينها في خلية واحدة
        mistakes: JSON.stringify(state.mistakes, null, 2 )
    };

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // مهم جداً لتجنب مشاكل CORS
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resultData)
        });
        console.log("Result logged to Google Sheet successfully.");
    } catch (error) {
        console.error("Failed to log result to Google Sheet:", error);
    }
}

export function showResults() {
    DOM.quizScreen.classList.add('hidden');
    DOM.resultsScreen.classList.remove('hidden');
    const finalResult = `${state.score} / ${state.quizQuestions.length}`;
    DOM.finalUserName.textContent = `أحسنت يا ${state.userSettings.name}!`;
    DOM.finalScore.textContent = finalResult;
    const highScore = localStorage.getItem('quranHighScore') || 0;
    const highScoreUser = localStorage.getItem('quranHighScoreUser') || 'لا يوجد';
    if (state.score > highScore) {
        DOM.highScoreDisplay.innerHTML = `🎉 رقم قياسي جديد! أعلى نتيجة سابقة كانت ${highScore} باسم (${highScoreUser}).`;
        localStorage.setItem('quranHighScore', state.score);
        localStorage.setItem('quranHighScoreUser', state.userSettings.name);
    } else if (state.score === highScore && state.score > 0) {
        DOM.highScoreDisplay.textContent = `لقد عادلت أعلى نتيجة مسجلة!`;
    } else {
        DOM.highScoreDisplay.textContent = `أعلى نتيجة مسجلة: ${highScore} باسم (${highScoreUser}).`;
        logResultsToGoogleSheet();
    }
}

export function showError(message) {
    DOM.errorMessage.textContent = message;
    DOM.errorMessage.classList.remove('hidden');
}

export function hideError() {
    DOM.errorMessage.classList.add('hidden');
}
