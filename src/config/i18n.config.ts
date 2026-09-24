import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { banglaTranslations } from '../resources/language/bn/translation';
import { englishTranslations } from '../resources/language/en/translation';
import { hindiTranslations } from '../resources/language/hi/translation';
import { kannadaTranslations } from '../resources/language/kn/translation';
import { tamilTranslations } from '../resources/language/ta/translation';
import { teluguTranslations } from '../resources/language/te/translation';
import { urduTranslations } from '../resources/language/ur/translation';
import { TSupportedLanguage } from '../typescripts/types/i18n.types';

export const defaultLanguage: TSupportedLanguage = 'en';

export const storageKey = 'app_preferred_language';

export const initializeI18n = (): void => {
  i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: englishTranslations,
      },
      hi: {
        translation: hindiTranslations,
      },
      kn: {
        translation: kannadaTranslations,
      },
      ta: {
        translation: tamilTranslations,
      },
      ur: {
        translation: urduTranslations,
      },
      te: {
        translation: teluguTranslations,
      },
      bn: {
        translation: banglaTranslations,
      },
    },
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};
