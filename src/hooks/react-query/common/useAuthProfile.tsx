import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getItem, STORAGE_KEYS } from '../../../lib/common/asyncStorage';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { getProfile } from '../profile/profile.funcs';
import { ProfileQueryKeys } from '../query.keys';

const useAuthProfile = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  const { setUserData, isLoggedIn } = useAuthStore(state => state);

  const profileDetails = useQuery({
    queryKey: [ProfileQueryKeys.Profile],
    queryFn: () => getProfile(),
    enabled: !isTokenLoading && !!token && isLoggedIn,
  });
  useEffect(() => {
    if (profileDetails.isSuccess && profileDetails?.data?.success) {
      const user = profileDetails?.data?.data;
      setUserData(user);
    }
  }, [profileDetails.isSuccess, profileDetails?.data, setUserData]);

  useEffect(() => {
    const fetchToken = async () => {
      setIsTokenLoading(true);
      try {
        const storedToken = await getItem(STORAGE_KEYS.AUTH_TOKEN);
        setToken(storedToken);
      } catch (error) {
        console.error('Failed to fetch token:', error);
      } finally {
        setIsTokenLoading(false);
      }
    };
    fetchToken();
  }, [isLoggedIn]);

  return {
    ...profileDetails.data,
    isPending: profileDetails.isPending || isTokenLoading,
    isFetching: profileDetails.isFetching,
    isSuccess: profileDetails.isSuccess,
  };
};

export default useAuthProfile;
