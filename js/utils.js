// js/utils.js
import { state } from './state.js';

export function playSequence(urls, btn) {
    if (state.isPlayingSequence) return;
    state.isPlayingSequence = true;
    if (btn) btn.disabled = true;
    state.audioQueue = [...urls];
    playNextInQueue(btn);
}

function playNextInQueue(btn) {
    if (state.audioQueue.length === 0) {
        state.isPlayingSequence = false;
        if (btn) btn.disabled = false;
        return;
    }
    const audio = new Audio(state.audioQueue.shift());
    audio.play().catch(e => {
        console.error("Error playing audio:", e);
        // في حالة حدوث خطأ، أكمل إلى التالي
        playNextInQueue(btn);
    });
    audio.onended = () => playNextInQueue(btn);
}
