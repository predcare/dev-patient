import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { _projectToken } from '../../../config/keys.constants';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { getUserProfile } from '../profile/profile.funcs';
import { UserQueryEnum } from '../query.keys';

const useAuthProfile = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  const setUserData = useAuthStore(state => state.setUserData);

  const profileDetails = useQuery({
    queryKey: [UserQueryEnum.PROFILE],
    queryFn: getUserProfile,
    enabled: !isTokenLoading && !!token,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (
      profileDetails.isSuccess &&
      profileDetails?.data?.data &&
      profileDetails?.data?.status === 200
    ) {
      setUserData(profileDetails.data.data);
    }
  }, [
    profileDetails.isSuccess,
    profileDetails.isError,
    profileDetails?.data,
    profileDetails.error,
    setUserData,
  ]);

  useEffect(() => {
    const fetchToken = async () => {
      setIsTokenLoading(true);
      try {
        const storedToken = await AsyncStorage.getItem(_projectToken);
        setToken(storedToken);
      } catch (error) {
        console.error('Failed to fetch token:', error);
      } finally {
        setIsTokenLoading(false);
      }
    };
    fetchToken();
  }, []);

  return {
    ...profileDetails.data,
    isPending: profileDetails.isPending || isTokenLoading,
    isFetching: profileDetails.isFetching,
    isSuccess: profileDetails.isSuccess,
  };
};

export default useAuthProfile;
