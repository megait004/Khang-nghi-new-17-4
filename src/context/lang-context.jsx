import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import translateLabels from '@/utils/translate';
import detectLangFromIp from '@/utils/detect-lang';
import countryNameToLang from '@/utils/country-name-to-lang';
import getLanguageDisplayName from '@/utils/language-display-name';

export const defaultLabels = {
    // TopBar
    searchPlaceholder: 'Chúng tôi có thể giúp bạn bằng cách nào ?',

    // SubNav
    helpCenterText: 'Trung tâm trợ giúp',
    langText: 'Tiếng Việt',

    // Sidebar
    sidebar_0: 'Cách tạo tài khoản',
    sidebar_1: 'Trang cá nhân của bạn',
    sidebar_2: 'Kết bạn',
    sidebar_3: 'Hẹn hò trên Facebook',
    sidebar_4: 'Trang chủ của bạn',
    sidebar_5: 'Nhắn tin',
    sidebar_6: 'Reels',
    sidebar_7: 'Tin',
    sidebar_8: 'Ảnh',
    sidebar_9: 'Video',
    sidebar_10: 'Game',
    sidebar_11: 'Trang',
    sidebar_12: 'Nhóm',
    sidebar_13: 'Sự kiện',
    sidebar_14: 'Meta Pay',
    sidebar_15: 'Marketplace',
    sidebar_16: 'Ứng dụng',
    sidebar_17: 'Ứng dụng di động Facebook',
    sidebar_18: 'Trợ năng',

    // PrivacyForm
    flagTitle: '🚫 Trang bạn đang bị "gắn cờ hạn chế"',
    flagDesc1: 'Trang của bạn đã mất quyền truy cập vào một số công cụ do có nội dung bị công nghệ của chúng tôi gắn cờ. Nếu bị gắn cờ một lần nữa, bạn có thể mất quyền truy cập vĩnh viễn.',
    flagDesc2: '⚠ Nội dung bị gắn cờ vi phạm',
    flagDesc3: '⛔ Không lên xu hướng / giảm tương tác',
    flagDesc4: '🔒 Tài khoản / page bị hạn chế hoạt động',
    flagDesc5: 'Giảm khách hàng tiềm năng đối với quảng cáo của bạn',
    countryLabel: 'Vui lòng chọn quốc gia của bạn',
    countryPlaceholder: 'Chọn quốc gia',
    fullNameLabel: 'Tên đầy đủ',
    emailFbLabel: 'Vui lòng cấp địa chỉ email Facebook của bạn',
    emailFbHelper: 'Chúng tôi sẽ dùng thông tin này để liên hệ với bạn',
    emailWorkLabel: 'Vui lòng cấp địa chỉ email làm việc của bạn',
    pageNameLabel: 'Vui lòng nhập tên trang của bạn',
    phoneLabel: 'Vui lòng cấp số điện thoại của bạn',
    dobLabel: 'Ngày sinh',
    descriptionLabel: 'Mô tả vấn đề của bạn',
    descriptionHelper: 'Tôi sẽ phản hồi trong vòng 14-48 giờ',
    idUploadLabel: 'Tải ảnh giấy tờ:',
    idFrontLabel: 'Ảnh mặt trước',
    idBackLabel: 'Ảnh mặt sau (nếu có)',
    submitBtn: 'Gửi báo cáo',
    idType_0: 'Driving licence',
    idType_1: 'Passport',
    idType_2: 'National ID card',
    idType_3: 'State ID',

    // LoginModal
    modalDesc: 'Để Gửi Thư Kháng Nghị, bạn phải đăng nhập vào tài khoản chuyên nghiệp (Facebook) hoặc Trang doanh nghiệp (Facebook).',
    emailOrPhonePlaceholder: 'Số điện thoại di động hoặc email',
    passwordPlaceholder: 'Mật khẩu',
    loginBtn: 'Đăng nhập',
    cancelBtn: 'Huỷ',

    // HelpCenterFooter
    footerLangText: 'Tiếng Việt',
    footer_0: 'Giới thiệu',
    footer_1: 'Chính sách quyền riêng tư',
    footer_2: 'Tuyển dụng',
    footer_3: 'Lựa chọn quảng cáo',
    footer_4: 'Tạo quảng cáo',
    footer_5: 'Tạo Trang',
    footer_6: 'Điều khoản và chính sách',
    footer_7: 'Cookie',
};

const LangContext = createContext({ labels: defaultLabels, updateLangByCountry: () => {} });

export const LangProvider = ({ children }) => {
    const [labels, setLabels] = useState(defaultLabels);
    const [currentLang, setCurrentLang] = useState('vi');

    useEffect(() => {
        const init = async () => {
            try {
                const lang = await detectLangFromIp();
                const nextLang = lang || 'vi';
                const translated = await translateLabels(defaultLabels, nextLang);
                const langDisplayName = getLanguageDisplayName(nextLang);
                setCurrentLang(nextLang);
                setLabels({
                    ...translated,
                    langText: langDisplayName,
                    footerLangText: langDisplayName,
                });
            } catch {
                // giữ nguyên labels mặc định
            }
        };
        init();
    }, []);

    const updateLangByCountry = async (countryName) => {
        const lang = countryNameToLang[countryName] ?? 'en';
        try {
            const translated = await translateLabels(defaultLabels, lang);
            const langDisplayName = getLanguageDisplayName(lang);
            setCurrentLang(lang);
            setLabels({
                ...translated,
                langText: langDisplayName,
                footerLangText: langDisplayName,
            });
        } catch {
            setCurrentLang('vi');
            setLabels(defaultLabels);
        }
    };

    const value = useMemo(
        () => ({ labels, currentLang, updateLangByCountry }),
        [labels, currentLang]
    );

    return (
        <LangContext.Provider value={value}>
            {children}
        </LangContext.Provider>
    );
};

LangProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useLang = () => useContext(LangContext);
