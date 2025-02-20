import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import arTranslation from "./ar.translation.json";

i18next.use(initReactI18next).init({
    resources: {
        ar: { translation: arTranslation },
    },
    lng: "en",
    fallbackLng: 'en',
});

export default i18next;