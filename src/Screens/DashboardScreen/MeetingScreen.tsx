import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import CommonErrorCard from '../../components/commons/CommonErrorCard/CommonErrorCard';
import { SafeAreaWrapper } from '../../Layout/SafeAreaWrapper';
import { showErrorToast } from '../../lib/common/toast.utils';
import { AppRoute, type MeetingScreenProps } from '../../route';
import PatientMeetingScreenStyles from '../../styled/PatientMeetingScreen.styled';
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';

export const MeetingScreen: React.FC<MeetingScreenProps> = ({ navigation }) => {
  const {
    token: callToken,
    meetingId: callmeetingId,
    callState,
    errorMessage,
    resetMeetingStore,
    setIsInAppPip,
  } = useMeetingStore(state => state);

  // When focused on MeetingScreen, ensure In-App PiP overlay is hidden
  useEffect(() => {
    setIsInAppPip(false);
  }, [setIsInAppPip]);

  // Intercept navigation pop (back gesture / header back) to switch active call to In-App PiP mode
  useEffect(() => {
    if (!navigation) return;

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      const state = useMeetingStore.getState();
      const isCallActive =
        (state.callState === 'CONNECTED' || state.callState === 'CONNECTING') &&
        Boolean(state.token && state.meetingId);

      if (isCallActive && !state.isInAppPip) {
        state.setIsInAppPip(true);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const isMissingSession = !callToken || !callmeetingId;
  const isErrorState = callState === 'ERROR';

  useEffect(() => {
    if (isMissingSession && !isErrorState) {
      // Normal call end or store reset — exit gracefully without error card or toast
      navigation?.replace(AppRoute.SCHEDULE);
    } else if (isErrorState) {
      showErrorToast(errorMessage || "'token' is empty or invalid or might have expired.");
      const timer = setTimeout(() => {
        resetMeetingStore();
        navigation?.replace(AppRoute.SCHEDULE);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isMissingSession, isErrorState, errorMessage, navigation, resetMeetingStore]);

  if (isErrorState) {
    return (
      <SafeAreaWrapper>
        <View style={PatientMeetingScreenStyles.container}>
          <View style={[PatientMeetingScreenStyles.stageContainer, { paddingHorizontal: 16 }]}>
            <CommonErrorCard
              title="Invalid Meeting Token"
              message={errorMessage || "'token' is empty or invalid or might have expired."}
              onRetry={() => {
                resetMeetingStore();
                navigation?.replace(AppRoute.SCHEDULE);
              }}
              retryText="Return to Appointments"
            />
            <Text
              style={[
                PatientMeetingScreenStyles.waitingSubtitle,
                { marginTop: 8, color: '#EF4444' },
              ]}
            >
              Redirecting back in 5 seconds...
            </Text>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
};

export default MeetingScreen;
