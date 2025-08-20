// js/utils.js

import { state } from './state.js';

export function playSequence(urls, btn) {
    if (state.isPlayingSequence) return;
    state.isPlayingSequence = true;
    if (btn) {
        btn.disabled = true;
        btn.textContent = '... جاري التشغيل ...';
    }
    
    state.audioQueue = [...urls];
    playNextInQueue(btn);
}

function playNextInQueue(btn) {
    if (state.audioQueue.length === 0) {
        state.isPlayingSequence = false;
        if (btn) {
            btn.disabled = false;
            btn.textContent = '▶️ إعادة تشغيل المقطع';
        }
        return;
    }

    const audioUrl = state.audioQueue.shift();
    const audio = new Audio(audioUrl);

    audio.play().catch(e => {
        console.error("Error playing audio:", e);
        // Skip to the next audio in case of an error
        playNextInQueue(btn);
    });

    audio.onended = () => playNextInQueue(btn);
    audio.onerror = () => {
        console.error(`Failed to load audio: ${audioUrl}`);
        playNextInQueue(btn); // Also skip on load error
    };
}
