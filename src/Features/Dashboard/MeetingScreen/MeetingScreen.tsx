import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import useMeetingPip from '../../../hooks/commons/meeting/useMeetingPip';
import meetingStyles from '../../../styled/MeetingScreen.styled';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

export const MeetingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { enterInAppPip } = useMeetingPip();

  const setPipMode = useMeetingStore(state => state.setPipMode);
  const callState = useMeetingStore(state => state.callState);
  const hasToken = useMeetingStore(state => Boolean(state.callInfo?.token));

  // On screen focus, ensure pipMode is NORMAL, unless the system PiP window is what brought
  // us back here and is still open.
  useFocusEffect(
    useCallback(() => {
      if (useMeetingStore.getState().pipMode !== 'NATIVE_PIP') {
        setPipMode('NORMAL');
      }
    }, [setPipMode])
  );

  // If call ended or no active session, go back
  useEffect(() => {
    if (!hasToken || callState === 'ENDED') {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [hasToken, callState, navigation]);

  // Intercept back button / swipe back to enter In-App PiP rather than dropping the call
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      const { callState: currentState, callInfo, pipMode } = useMeetingStore.getState();
      if (currentState === 'ENDED' || currentState === 'IDLE' || !callInfo?.token) {
        return;
      }

      // The system PiP window is already showing the call, so leave it alone.
      if (pipMode === 'NATIVE_PIP') {
        return;
      }

      // User pressed back or swiped back during active call -> minimize to In-App PIP
      e.preventDefault();
      enterInAppPip();
      navigation.dispatch(e.data.action);
    });

    return unsubscribe;
  }, [navigation, enterInAppPip]);

  return (
    <SafeAreaWrapper style={meetingStyles.container} backgroundColor="#0F172A">
      <StatusBar barStyle="light-content" />
      <View style={meetingStyles.videoContainer} />
    </SafeAreaWrapper>
  );
};

export default MeetingScreen;
