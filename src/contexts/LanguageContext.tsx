import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { defaultLanguage, storageKey } from '../config/i18n.config';
import { TLanguage } from '../typescripts/enums';
import { ILanguageContextState, TSupportedLanguage } from '../typescripts/types/i18n.types';

const LanguageContext = createContext<ILanguageContextState | undefined>(undefined);

interface ILanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<ILanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<TSupportedLanguage>(defaultLanguage);
  const [isChangingLanguage, setIsChangingLanguage] = useState<boolean>(false);

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(storageKey);

        if (savedLanguage && Object.values(TLanguage).includes(savedLanguage as TLanguage)) {
          const validLang = savedLanguage as TSupportedLanguage;
          setCurrentLanguage(validLang);
          await i18n.changeLanguage(validLang);
        }
      } catch (error) {
        console.error('Failed to load saved language from storage:', error);
      }
    };

    loadSavedLanguage();
  }, []);

  const changeLanguage = useCallback(
    async (language: TSupportedLanguage): Promise<void> => {
      if (language === currentLanguage) return;

      setIsChangingLanguage(true);

      try {
        await i18n.changeLanguage(language);
        setCurrentLanguage(language);
        await AsyncStorage.setItem(storageKey, language);
      } catch (error) {
        console.error('Failed to change language:', error);
        throw error;
      } finally {
        setIsChangingLanguage(false);
      }
    },
    [currentLanguage]
  );

  const contextValue: ILanguageContextState = {
    currentLanguage,
    changeLanguage,
    isChangingLanguage,
  };

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

export const useLanguageContext = (): ILanguageContextState => {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }

  return context;
};
