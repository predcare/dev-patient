import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageKey } from '../../config/i18n.config';
import { clearStorageExcept, STORAGE_KEYS } from '../../lib/common/asyncStorage';
import { IMyProfileDoc } from '../../typescripts/interfaces/profile.interfaces';

type TAuthState = {
  userData: IMyProfileDoc | null;
  isLoggedIn: boolean;
  setUserData: (user: IMyProfileDoc | null) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<TAuthState>()(
  persist(
    set => ({
      userData: null,
      isLoggedIn: false,
      activeWorkspace: null,
      setUserData: (user: IMyProfileDoc | null) => {
        if (!user) {
          set({
            userData: null,
            isLoggedIn: false,
          });
          return;
        }
        set({
          userData: user,
          isLoggedIn: true,
        });
      },

      logout: async () => {
        set({
          userData: null,
          isLoggedIn: false,
        });
        await clearStorageExcept([STORAGE_KEYS.FCM_TOKEN, STORAGE_KEYS.DEVICE_ID, storageKey]);
      },
    }),
    {
      name: STORAGE_KEYS.USER_DATA,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        userData: state.userData,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
