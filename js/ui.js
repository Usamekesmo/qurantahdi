import * as DOM from './domElements.js';
import { state } from './state.js';
import { checkAnswer, handleSelection } from './main.js';
import { playSequence } from './utils.js';

// --- دوال عرض أنواع الأسئلة (مُحسَّنة) ---

function displayFindTextQuestion(q) {
    DOM.questionArea.innerHTML = `<audio controls class="audio-player" src="${q.audio}"></audio>`;
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = opt.text;
        // استخدام data-value للمقارنة الدقيقة بدلاً من الاعتماد على النص الظاهر
        btn.dataset.value = opt.text;
        btn.onclick = () => handleSelection(btn, opt.text);
        DOM.optionsContainer.appendChild(btn);
    });
}

function displayFindOrderQuestion(q) {
    let html = `<p>الآية المرجعية:</p><audio controls class="audio-player" src="${q.referenceAudio}"></audio><p style="margin-top:20px;">المقطع الصوتي للخيارات:</p>`;
    DOM.questionArea.innerHTML = html;
    
    const playBtnContainer = document.createElement('div');
    playBtnContainer.className = 'action-buttons-container';
    const playBtn = document.createElement('button');
    playBtn.textContent = '▶️ تشغيل المقطع';
    playBtn.onclick = () => playSequence(q.audioSequence, playBtn);
    playBtnContainer.appendChild(playBtn);
    DOM.questionArea.appendChild(playBtnContainer);
    
    for (let i = 1; i <= 4; i++) {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.style.fontFamily = 'var(--font-main)';
        btn.textContent = `الخيار رقم ${i}`;
        btn.dataset.value = i; // استخدام data-value
        btn.onclick = () => handleSelection(btn, i);
        DOM.optionsContainer.appendChild(btn);
    }
}

function displayOrderScrambledQuestion(q) {
    const playBtnContainer = document.createElement('div');
    playBtnContainer.className = 'action-buttons-container';
    const playBtn = document.createElement('button');
    playBtn.textContent = '▶️ تشغيل المقطع الصوتي المبعثر';
    playBtn.onclick = () => playSequence(q.audioSequence, playBtn);
    playBtnContainer.appendChild(playBtn);
    DOM.questionArea.appendChild(playBtnContainer);

    DOM.questionArea.innerHTML += `<p style="margin-top:15px;">انقر على الأرقام لترتيبها:</p>`;
    let optionsHTML = `<div class="ordering-container" id="ordering-btns"><button class="option-btn order-btn">1</button><button class="option-btn order-btn">2</button><button class="option-btn order-btn">3</button><button class="option-btn order-btn">4</button></div><p>ترتيبك:</p><div id="user-sequence" style="font-size: 2em; font-weight: bold;"></div>`;
    DOM.optionsContainer.innerHTML = optionsHTML;

    let userSequence = [];
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
    const playBtnContainer = document.createElement('div');
    playBtnContainer.className = 'action-buttons-container';
    const playBtn = document.createElement('button');
    playBtn.textContent = '▶️ تشغيل المقطع الصوتي';
    playBtn.onclick = () => playSequence(q.audioSequence, playBtn);
    playBtnContainer.appendChild(playBtn);
    DOM.questionArea.appendChild(playBtnContainer);

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `${opt.text}   
<span style="font-family: var(--font-main); font-size:0.4em; color:#666;">(سورة ${opt.surah.name})</span>`;
        btn.dataset.value = opt.number; // استخدام data-value
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
    return displayers[type.split('_')[0]];
}

// --- دالة إرسال النتائج إلى Google Sheets ---
async function logResultsToGoogleSheet() {
    // !!! استبدل هذا الرابط بالرابط الذي نسخته من Google Apps Script !!!
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGGCEVJziYcO3StrnhOysQyAe9dn68jkMspc8G5ai0GeAhepPGSZ-wUSuVwklBLVUpcQ/exec'; 

    if (!SCRIPT_URL.includes('macros')) {
        console.warn("Google Sheet URL is not set. Skipping logging.");
        return;
    }

    const { name, startPage, endPage } = state.userSettings;
    const resultData = {
        userName: name,
        pageRange: `من ${startPage} إلى ${endPage}`,
        totalQuestions: state.quizQuestions.length,
        correctAnswers: state.score,
        score: `${state.score} / ${state.quizQuestions.length}`,
        mistakes: JSON.stringify(state.mistakes, null, 2)
    };

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(resultData)
        });
        console.log("Result logging request sent to Google Sheet.");
    } catch (error) {
        console.error("Failed to log result to Google Sheet:", error);
    }
}

// --- الدوال الرئيسية للواجهة ---

export function displayQuestion() {
    if (state.currentQuestionIndex >= state.quizQuestions.length) {
        showResults();
        return;
    }
    state.selectedAnswer = null;
    const question = state.quizQuestions[state.currentQuestionIndex];

    // تحديث شريط التقدم
    const progress = ((state.currentQuestionIndex) / state.quizQuestions.length) * 100;
    DOM.progressBar.style.width = `${progress}%`;

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

export function showResults() {
    DOM.quizScreen.classList.add('hidden');
    DOM.resultsScreen.classList.remove('hidden');
    
    const finalResult = `${state.score} / ${state.quizQuestions.length}`;
    DOM.finalUserName.textContent = `أحسنت يا ${state.userSettings.name}!`;
    DOM.finalScore.textContent = finalResult;

    // عرض قسم مراجعة الأخطاء
    DOM.mistakesList.innerHTML = ''; // مسح أي أخطاء سابقة
    if (state.mistakes.length > 0) {
        DOM.mistakesReview.classList.remove('hidden');
        state.mistakes.forEach(mistake => {
            const item = document.createElement('div');
            item.className = 'mistake-item';
            item.innerHTML = `
                <p><strong>السؤال:</strong> ${mistake.questionTitle}</p>
                <p><strong>إجابتك:</strong> <span style="color: var(--danger-color); font-weight: bold;">${mistake.userAnswer}</span></p>
                <p><strong>الإجابة الصحيحة:</strong> <span style="color: var(--success-color); font-weight: bold;">${mistake.correctAnswer}</span></p>
            `;
            DOM.mistakesList.appendChild(item);
        });
    } else {
        DOM.mistakesReview.classList.add('hidden');
    }

    // التعامل مع أعلى نتيجة مسجلة
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
    }

    // ربط زر إعادة التشغيل
    DOM.restartBtn.onclick = () => location.reload();

    // إرسال النتائج إلى جوجل شيت في الخلفية
    logResultsToGoogleSheet();
}

export function showError(message) {
    DOM.errorMessage.textContent = message;
    DOM.errorMessage.classList.remove('hidden');
}

export function hideError() {
    DOM.errorMessage.classList.add('hidden');
}
