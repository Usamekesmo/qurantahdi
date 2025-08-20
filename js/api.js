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
        surahSelectElement.innerHTML = '<option>فشل تحميل السور</option>';
    }
}

async function fetchPage(pageNumber) {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/${state.userSettings.reciter}` );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data?.ayahs || [];
    } catch (e) {
        console.error(`Failed to fetch page ${pageNumber}:`, e);
        return []; // Return empty array on failure to not break Promise.all
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
    // Fetch pages outside the scope for the "intruder" questions
    if (startPage > 2) outOfScopePromises.push(fetchPage(startPage - 2));
    if (endPage < 603) outOfScopePromises.push(fetchPage(endPage + 2));
    state.allAyahsOutOfScope = (await Promise.all(outOfScopePromises)).flat();
}
