import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import arTranslation from "../locals/ar/index";

i18next.use(initReactI18next).init({
    resources: {
        ar: { translation: arTranslation },
    },
    lng: process.env.defaultLanguage,
    fallbackLng: "en",
});

export default i18next;