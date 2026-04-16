import { useState } from 'react';
import PropTypes from 'prop-types';

const maskPhone = (raw, digitsToShow = 2) => {
    if (!raw) return '';
    const digits = String(raw).replaceAll(/\D/g, '');
    if (!digits) return '';
    const tail = digits.slice(-digitsToShow);
    return `******${tail}`;
};

const TryOtherMethodModal = ({ phone, onSelect, onBack }) => {
    const [selected, setSelected] = useState('authenticator');
    const maskedPhone = maskPhone(phone);

    const methods = [
        {
            id: 'authenticator',
            label: 'Ứng dụng xác thực',
            sub: 'Google Authenticator, Duo Mobile',
        },
        {
            id: 'whatsapp',
            label: 'WHATSAPP',
            sub: maskedPhone ? `Chúng tôi sẽ gửi mã đến số ${maskedPhone}` : 'Chúng tôi sẽ gửi mã qua WhatsApp',
        },
    ];

    const handleConfirm = () => {
        const found = methods.find((m) => m.id === selected);
        onSelect(found ? { id: found.id, label: found.label } : { id: selected, label: selected });
    };

    return (
        <div className="bg-white">
            <div className="bg-[#6d84b4] px-[10px] py-[10px] text-[14px] font-bold leading-[1.35] text-white">
                Chọn cách nhận mã xác nhận khác
            </div>

            <div className="px-[15px] py-[15px] text-[13px] leading-[1.5] text-[#333]">
                <div className="space-y-2">
                    {methods.map((method) => (
                        <label
                            key={method.id}
                            htmlFor={`method-${method.id}`}
                            aria-label={method.label}
                            className={[
                                'flex cursor-pointer items-center justify-between rounded-[8px] border px-4 py-3',
                                selected === method.id
                                    ? 'border-[#4267b2] bg-white'
                                    : 'border-[#ccc] bg-white hover:bg-[#f5f6f7]',
                            ].join(' ')}
                        >
                            <div>
                                <div className="text-[13px] font-semibold text-[#1c1e21]">
                                    {method.label}
                                </div>
                                <div className="text-[12px] text-[#606770]">{method.sub}</div>
                            </div>
                            <input
                                id={`method-${method.id}`}
                                type="radio"
                                name="try_other_method"
                                value={method.id}
                                checked={selected === method.id}
                                onChange={() => setSelected(method.id)}
                                className="h-4 w-4 accent-[#4267b2]"
                            />
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#ddd] bg-[#f5f6f7] px-[10px] py-[10px] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="w-full cursor-pointer rounded-[3px] border border-[#ccc] bg-[#e4e6eb] px-[12px] py-[6px] text-[13px] text-[#333] hover:opacity-90 sm:w-auto"
                >
                    Quay lại
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    className="w-full cursor-pointer rounded-[3px] border border-[#365899] bg-[#4267b2] px-[12px] py-[6px] text-[13px] text-white hover:opacity-90 sm:w-auto"
                >
                    Tiếp tục
                </button>
            </div>
        </div>
    );
};

TryOtherMethodModal.propTypes = {
    phone: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
};

export default TryOtherMethodModal;
