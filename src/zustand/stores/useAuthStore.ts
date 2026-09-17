import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearStorageExcept, STORAGE_KEYS } from '../../lib/common/asyncStorage';

type TAuthState = {
  userData: any | null;
  isLoggedIn: boolean;
  isDoctor?: boolean;
  setUserData: (user: any | null) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<TAuthState>()(
  persist(
    set => ({
      userData: null,
      isLoggedIn: false,
      activeWorkspace: null,
      setUserData: (user: any | null) => {
        if (!user) {
          set({
            userData: null,
            isLoggedIn: false,
            isDoctor: false,
          });
          return;
        }
        set({
          userData: user,
          isLoggedIn: true,
          isDoctor: user?.role === 'doctor' ? true : false,
        });
      },

      logout: async () => {
        set({
          userData: null,
          isLoggedIn: false,
          isDoctor: false,
        });
        await clearStorageExcept([STORAGE_KEYS.FCM_TOKEN, STORAGE_KEYS.DEVICE_ID]);
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
