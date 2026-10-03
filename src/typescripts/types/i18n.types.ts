export type TSupportedLanguage = 'en' | 'hi' | 'kn' | 'ta' | 'ur' | 'te' | 'bn';

export interface ILanguageContextState {
  currentLanguage: TSupportedLanguage;
  changeLanguage: (language: TSupportedLanguage) => Promise<void>;
  isChangingLanguage: boolean;
}
