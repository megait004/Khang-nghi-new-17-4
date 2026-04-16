const detectLangFromIp = async () => {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return data.languages?.split(',')[0]?.trim() ?? 'vi';
};

export default detectLangFromIp;
