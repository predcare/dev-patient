import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { _projectToken } from '../../config/keys.constants';
import { IMyProfileDoc } from '../../typescripts/interfaces/myProfile.interfaces';

type TAuthState = {
  userData: IMyProfileDoc | null;
  isLoggedIn: boolean;
  isDoctor?: boolean;
  setUserData: (user: IMyProfileDoc) => void;
  logout: () => void;
  isProfileCompleted?: boolean;
};

export const useAuthStore = create<TAuthState>()(
  persist(
    set => ({
      userData: null,
      isLoggedIn: false,
      activeWorkspace: null,
      setUserData: (user: IMyProfileDoc) => {
        if (!user) {
          set({
            userData: null,
            isLoggedIn: false,
            isDoctor: false,
            isProfileCompleted: false,
          });
          return;
        }
        set({
          userData: user,
          isLoggedIn: true,
          isDoctor: user?.user_type === 'doctor' ? true : false,
          isProfileCompleted: Boolean(
            user?.phone_number &&
              user?.gender &&
              user?.date_of_birth &&
              user?.address &&
              user?.city &&
              user?.state &&
              user?.postal_code &&
              user?.country
          ),
        });
      },

      logout: () => {
        set({
          userData: null,
          isLoggedIn: false,
          isDoctor: false,
          isProfileCompleted: false,
        });
        AsyncStorage.removeItem(_projectToken);
      },
    }),
    {
      name: '_auth_storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        userData: state.userData,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
