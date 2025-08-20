// js/api.js

import { state } from './state.js';

export async function populateSurahs(surahSelectElement) {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/meta' );
        const data = await response.json();
        state.surahData = data.data.surahs.references;
        state.surahData.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.number;
            option.textContent = `${surah.number}. ${surah.name} (${surah.englishName})`;
            surahSelectElement.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to fetch surahs metadata:", error);
        surahSelectElement.disabled = true;
    }
}

async function fetchPage(pageNumber) {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/${state.userSettings.reciter}` );
        const data = await response.json();
        return data.data?.ayahs || [];
    } catch (e) {
        console.error(`Failed to fetch page ${pageNumber}:`, e);
        return [];
    }
}

export async function fetchData() {
    const { startPage, endPage } = state.userSettings;
    let inScopePromises = [];
    for (let i = startPage; i <= endPage; i++) {
        inScopePromises.push(fetchPage(i));
    }
    state.allAyahsInScope = (await Promise.all(inScopePromises)).flat();

    let outOfScopePromises = [];
    if (startPage > 2) outOfScopePromises.push(fetchPage(startPage - 2));
    if (endPage < 603) outOfScopePromises.push(fetchPage(endPage + 2));
    state.allAyahsOutOfScope = (await Promise.all(outOfScopePromises)).flat();
}
