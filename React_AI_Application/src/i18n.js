
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import km from "./locales/km/translation.json";
import fr from "./locales/fr/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    km: { translation: km },
    fr: { translation: fr },
  },
  lng: "en",        // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
