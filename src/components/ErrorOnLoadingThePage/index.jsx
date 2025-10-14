import { PiSmileySad } from "react-icons/pi";
import AdminPanelHeader from "../AdminPanelHeader";
import { handleSelectUserLanguage } from "../../../public/global_functions/popular";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function ErrorOnLoadingThePage({ errorMsg }) {

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.adminDashboardlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : process.env.defaultLanguage, i18n.changeLanguage);
    }, []);

    return (
        <div className="error-on-loading-component">
            <AdminPanelHeader />
            <div className="error-msg-on-loading-the-page text-center fw-bold">
                <PiSmileySad className="error-icon mb-5" />
                <p className="error-msg-on-loading-box">{t(errorMsg)}</p>
            </div>
        </div>
    );
}