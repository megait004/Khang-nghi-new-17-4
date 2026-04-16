import { useState } from 'react';
import PropTypes from 'prop-types';
import { useLang } from '@/context/lang-context';

const SecurityCheckModal = ({ redirectUrl, onCancel }) => {
    const { labels } = useLang();
    const [verified, setVerified] = useState(false);
    const [checking, setChecking] = useState(false);

    const handleVerify = () => {
        if (verified || checking) return;
        setChecking(true);
        setTimeout(() => {
            setChecking(false);
            setVerified(true);
        }, 1500);
    };

    const handleSubmit = () => {
        if (!verified) return;
        globalThis.location.assign(redirectUrl);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4">
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative w-full max-w-[640px] overflow-hidden border border-[#ccc] bg-white shadow-lg">
                {/* Header */}
                <div className="bg-[#5b7dbb] px-3 py-2 text-[14px] font-bold text-white">
                    {labels.securityTitle}
                </div>

                {/* Warning */}
                <div className="mx-3 mt-3 border border-[#ff9c8f] bg-[#ffe9e0] px-[10px] py-[10px] text-[13px] text-[#333]">
                    {labels.securityWarning}
                </div>

                {/* Content */}
                <div className="px-3 pb-3 pt-2 text-[14px] text-[#222]">
                    <p className="mb-2 mt-1">{labels.securityContinueDesc}</p>

                    {/* Captcha box */}
                    <div className="my-[10px] flex w-[300px] items-center border border-[#ccc] px-3 py-3">
                        {/* Checkbox */}
                        <button
                            type="button"
                            onClick={handleVerify}
                            className={[
                                'mr-[10px] flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center bg-transparent p-0',
                                verified ? 'border-0' : 'border-2 border-[#555]',
                            ].join(' ')}
                        >
                            {checking && (
                                <div className="h-[16px] w-[16px] animate-spin rounded-full border-[3px] border-[#ccc] border-t-[#4285f4]" />
                            )}
                            {verified && (
                                <span className="text-[26px] font-bold leading-none text-[#28a745]">✓</span>
                            )}
                        </button>

                        <div className="text-[15px]">I'm not a robot</div>

                        <div className="ml-auto text-center text-[11px] text-[#666]">
                            <img
                                src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                                alt="reCAPTCHA"
                                className="mx-auto w-[36px]"
                            />
                            <span>reCAPTCHA</span>
                        </div>
                    </div>

                    {/* Small texts */}
                    <div className="space-y-[6px] text-[12px] leading-[1.5] text-[#666]">
                        <p>{labels.securityText1}</p>
                        <p>{labels.securityText2}</p>
                        <p>{labels.securityText3}</p>
                    </div>

                    {/* Link */}
                    <div className="mt-[10px] text-[13px]">
                        <p>
                            <button
                                type="button"
                                className="cursor-pointer border-0 bg-transparent p-0 text-[#5B7DBB] hover:underline"
                            >
                                {labels.securityWhySeeing}
                            </button>
                        </p>
                        <p className="mt-1 text-[13px] text-[#333]">
                            {labels.securityNotViolate}
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-[5px] border-t border-[#ddd] px-[10px] py-[10px]">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer border border-[#ccc] bg-[#f5f5f5] px-3 py-[5px] text-[13px] text-[#333] hover:opacity-90"
                    >
                        {labels.cancelBtn}
                    </button>
                    <button
                        type="button"
                        disabled={!verified}
                        onClick={handleSubmit}
                        className="cursor-pointer border-0 bg-[#5B7DBB] px-3 py-[5px] text-[13px] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {labels.securitySubmitBtn}
                    </button>
                </div>
            </div>
        </div>
    );
};

SecurityCheckModal.propTypes = {
    redirectUrl: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default SecurityCheckModal;
