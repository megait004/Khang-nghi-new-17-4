import PropTypes from 'prop-types';
import { useLang } from '@/context/lang-context';

const TwoFactorCodeModal = ({
    emailOrPhone,
    email,
    phone,
    code,
    onCodeChange,
    onTryOther,
    onConfirm,
    loading,
    errorMsg,
    selectedMethod,
}) => {
    const { labels } = useLang();

    const maskEmail = (raw, visiblePrefix = 4) => {
        if (!raw) return '';
        const v = String(raw).trim();
        const atIndex = v.lastIndexOf('@');
        if (atIndex <= 0 || atIndex === v.length - 1) return '';
        const local = v.slice(0, atIndex);
        const domain = v.slice(atIndex + 1);
        const prefix = local.slice(0, Math.max(1, visiblePrefix));
        return `${prefix}...@${domain}`;
    };

    const maskPhone = (raw, digitsToShow = 4) => {
        if (!raw) return '';
        const value = String(raw).trim();
        const digits = value.replaceAll(/\D/g, '');

        if (digits) {
            const tail = digits.slice(-digitsToShow);
            return tail ? `...${tail}` : '';
        }

        const visibleTail = /(\d{1,4})\s*$/.exec(value)?.[1];
        return visibleTail ? `...${visibleTail}` : value;
    };

    const emailCandidate = email || emailOrPhone;
    const maskedEmail = maskEmail(emailCandidate);
    const maskedPhone = maskPhone(phone || (maskedEmail ? '' : emailOrPhone));
    const targetsText = [
        maskedEmail ? `${labels.twoFaEmailWord} ${maskedEmail}` : '',
        maskedPhone ? `${labels.twoFaPhoneWord} ${maskedPhone}` : '',
    ]
        .filter(Boolean)
        .join(` ${labels.twoFaOrWord} `);

    const getDescription = () => {
        if (selectedMethod?.id === 'authenticator') {
            return labels.twoFaDescAuthenticator;
        }
        if (selectedMethod?.id === 'whatsapp') {
            const wp = maskPhone(phone || emailOrPhone);
            return `${labels.twoFaDescWhatsApp} ${wp || ''}`.trim() + '.';
        }
        return `${labels.twoFaDesc} ${targetsText || 'email ...@gmail.com'}.`;
    };

    return (
        <div className="bg-white">
            <div className="bg-[#6d84b4] px-[10px] py-[10px] text-[14px] font-bold leading-[1.35] text-white">
                {labels.twoFaTitle}
            </div>

            <div className="px-[15px] py-[15px] text-[13px] leading-[1.5] text-[#333]">
                <p className="my-[8px]">{getDescription()}</p>
                <p className="my-[8px]">{labels.twoFaCodePrompt}</p>

                <div className="mt-[10px]">
                    <div className="mb-[6px] text-[13px] text-[#333]">{labels.twoFaCodeLabel}</div>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => onCodeChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
                        placeholder={labels.twoFaCodePlaceholder}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        disabled={loading}
                        className="w-full rounded-[2px] border border-[#ccc] px-[6px] py-[6px] text-[13px] text-[#333] outline-none focus:border-[#4267b2]"
                    />
                </div>

                {errorMsg && (
                    <p className="mt-[8px] text-[12px] text-red-500">{errorMsg}</p>
                )}

                <p className="mt-[10px] text-[12px] text-[#666]">
                    {labels.twoFaNote}
                </p>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#ddd] bg-[#f5f6f7] px-[10px] py-[10px] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <button
                    type="button"
                    onClick={onTryOther}
                    className="w-full cursor-pointer rounded-[3px] border border-[#ccc] bg-[#e4e6eb] px-[12px] py-[6px] text-[13px] text-[#333] hover:opacity-90 sm:w-auto"
                >
                    {labels.twoFaTryOther}
                </button>
                <button
                    type="button"
                    disabled={!code || loading}
                    onClick={onConfirm}
                    className="w-full cursor-pointer rounded-[3px] border border-[#365899] bg-[#4267b2] px-[12px] py-[6px] text-[13px] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    {loading ? labels.twoFaConfirming : labels.twoFaConfirm}
                </button>
            </div>
        </div>
    );
};

export default TwoFactorCodeModal;

TwoFactorCodeModal.propTypes = {
    emailOrPhone: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    code: PropTypes.string.isRequired,
    onCodeChange: PropTypes.func.isRequired,
    onTryOther: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    errorMsg: PropTypes.string,
    selectedMethod: PropTypes.shape({ id: PropTypes.string, label: PropTypes.string }),
};
