const translateText = async (text, targetLang) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map((chunk) => chunk[0]).join('');
};

const translateLabels = async (defaultLabels, targetLang) => {
    if (targetLang === 'vi') return defaultLabels;

    const keys = Object.keys(defaultLabels);
    const values = Object.values(defaultLabels);

    const translated = await Promise.all(
        values.map((text) => translateText(text, targetLang).catch(() => text))
    );

    return Object.fromEntries(keys.map((k, i) => [k, translated[i]]));
};

export default translateLabels;
