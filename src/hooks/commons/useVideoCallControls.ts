import { useMeeting } from '@videosdk.live/react-native-sdk';
import { useCallback, useEffect, useRef } from 'react';
import {
  AppState,
  AppStateStatus,
  DeviceEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import { showErrorToast, showInfoToast } from '../../lib/common/toast.utils';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';
import { AppointmemntQueryKey } from '../react-query/query.keys';

const { PiPModule } = NativeModules;

export const useVideoCallControls = (onLeaveCallback?: () => void) => {
  const hasJoinedRef = useRef(false);
  const isJoiningRef = useRef(false);
  const isLeavingRef = useRef(false);
  const isMountedRef = useRef(true);
  const callStartTimeRef = useRef<string | null>(null);
  const maxParticipantsRef = useRef<number>(1);
  const wasCameraOnBeforeCaptureRef = useRef<boolean>(false);
  const wasCameraOnBeforeInterruptionRef = useRef<boolean>(false);
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    setCallState,
    setErrorState,
    setMicState,
    setCameraState,
    setFacingMode,
    setRemoteParticipantId,
    resetMeetingStore,
    isMicOn,
    isCameraOn,
    facingMode,
  } = useMeetingStore();

  const {
    join,
    leave,
    toggleMic,
    toggleWebcam,
    changeWebcam,
    getWebcams,
    muteMic,
    unmuteMic,
    disableWebcam,
    enableWebcam,
    localParticipant,
    participants,
  } = useMeeting({
    onMeetingJoined: async () => {
      hasJoinedRef.current = true;
      isJoiningRef.current = false;
      callStartTimeRef.current = new Date().toISOString();
      if (!isMountedRef.current) return;
      setCallState('CONNECTING');

      // Camera setup is isolated — errors here must NOT propagate to onError
      // or set ERROR state. They are best-effort.
      try {
        if (getWebcams) {
          const webcams = await getWebcams();
          const frontCam = webcams?.find(
            w => w.facingMode === 'user' || w.label?.toLowerCase().includes('front')
          );
          if (frontCam && changeWebcam) {
            await changeWebcam(frontCam.deviceId);
          }
        }
        if (isMountedRef.current) {
          setFacingMode('front');
        }
      } catch (err) {
        // Swallow camera init errors — they are non-fatal and the SDK
        // will fall back to a default camera automatically.
        console.warn('[VideoSDK]: Non-fatal error selecting front camera on join:', err);
      }
    },
    onMeetingLeft: () => {
      hasJoinedRef.current = false;
      isJoiningRef.current = false;
      isLeavingRef.current = false;
      if (Platform.OS === 'android' && PiPModule?.setCallActive) {
        PiPModule.setCallActive(false).catch?.(() => {});
      }
      resetMeetingStore();
      if (onLeaveCallback) {
        onLeaveCallback();
      }
    },
    onParticipantJoined: participant => {
      if (participant && !participant.local && isMountedRef.current) {
        setRemoteParticipantId(participant.id);
      }
    },
    onParticipantLeft: () => {
      if (isMountedRef.current) {
        useMeetingStore.getState().setRemoteParticipantId(null);
      }
    },
    onError: (error: any) => {
      const errMsg = error?.message || error?.name || '';
      const errName = error?.name || '';
      const combinedError = `${errName} ${errMsg}`.toLowerCase();

      // These are transient/internal VideoSDK (mediasoup) errors that the SDK
      // recovers from automatically. They must NOT end the meeting session.
      const NON_FATAL_PATTERNS = [
        'consumer', // "consumer with id X not found" during SFU negotiation
        'set_quality', // SET_QUALITY_FAILED on stream quality adjustment
        'producer', // transient producer errors during track renegotiation
        'already closed', // transport/channel already closed during cleanup
      ];

      const isNonFatal = NON_FATAL_PATTERNS.some(pattern => combinedError.includes(pattern));

      if (isNonFatal) {
        console.warn('[VideoSDK Non-Fatal]:', errMsg || errName);
        return; // Don't crash the meeting — SDK handles recovery internally
      }

      // Truly fatal errors (auth failure, invalid token, network down)
      console.error('[VideoSDK Fatal Error]:', error);
      hasJoinedRef.current = false;
      isJoiningRef.current = false;
      isLeavingRef.current = false;
      if (isMountedRef.current) {
        setErrorState(errMsg || "'token' is empty or invalid or might have expired.");
      }
    },
  });

  const leaveRef = useRef(leave);
  useEffect(() => {
    leaveRef.current = leave;
  }, [leave]);

  // Cleanup on component unmount to ensure VideoSDK leaves session only when not in active call / PiP
  useEffect(() => {
    isMountedRef.current = true;
    if (localParticipant) {
      hasJoinedRef.current = true;
    }
    return () => {
      isMountedRef.current = false;
      const storeState = useMeetingStore.getState();

      // If active call is ongoing (In-App PiP, Native PiP, or active meeting session),
      // DO NOT call leave(). leave() is only called when endCall() is explicitly triggered.
      const isCallActive =
        storeState.isInAppPip ||
        storeState.isNativePip ||
        (storeState.token &&
          storeState.meetingId &&
          storeState.callState !== 'ENDED' &&
          storeState.callState !== 'IDLE');

      if (isCallActive) {
        return;
      }

      if (hasJoinedRef.current || isJoiningRef.current) {
        hasJoinedRef.current = false;
        isJoiningRef.current = false;
        try {
          if (leaveRef.current) {
            leaveRef.current();
          }
        } catch (e) {
          console.warn('[VideoSDK]: Cleanup leave error:', e);
        }
      }
    };
  }, [localParticipant]);

  useEffect(() => {
    if (participants && isMountedRef.current) {
      const totalCount = participants.size + 1;
      if (totalCount > maxParticipantsRef.current) {
        maxParticipantsRef.current = totalCount;
      }
      if (participants.size > 0) {
        const remote = Array.from(participants.values()).find((p: any) => !p.local);
        if (remote && remote.id) {
          const currentRemoteId = useMeetingStore.getState().remoteParticipantId;
          if (currentRemoteId !== remote.id) {
            useMeetingStore.getState().setRemoteParticipantId(remote.id);
          }
        }
      }
    }
  }, [participants]);

  const joinCall = useCallback(() => {
    if (localParticipant || hasJoinedRef.current) {
      return;
    }
    if (join && !hasJoinedRef.current && !isJoiningRef.current) {
      isJoiningRef.current = true;
      setTimeout(() => {
        if (!isMountedRef.current) {
          isJoiningRef.current = false;
          return;
        }
        try {
          join();
        } catch (err) {
          isJoiningRef.current = false;
          console.error('[VideoSDK]: Exception during join():', err);
        }
      }, 300);
    }
  }, [join, localParticipant]);

  const toggleAudio = useCallback(() => {
    if (!localParticipant) {
      showErrorToast('Microphone is initializing, please wait...');
      return;
    }
    if (toggleMic) {
      toggleMic();
      setMicState(!isMicOn);
    }
  }, [toggleMic, isMicOn, setMicState, localParticipant]);

  const muteAudio = useCallback(() => {
    if (muteMic) {
      muteMic();
      setMicState(false);
    }
  }, [muteMic, setMicState]);

  const unmuteAudio = useCallback(() => {
    if (unmuteMic) {
      unmuteMic();
      setMicState(true);
    }
  }, [unmuteMic, setMicState]);

  const toggleVideo = useCallback(() => {
    if (!localParticipant) {
      showErrorToast('Camera is initializing, please wait...');
      return;
    }
    if (toggleWebcam) {
      toggleWebcam();
      setCameraState(!isCameraOn);
    }
  }, [toggleWebcam, isCameraOn, setCameraState, localParticipant]);

  const stopCamera = useCallback(() => {
    if (disableWebcam) {
      disableWebcam();
      setCameraState(false);
    }
  }, [disableWebcam, setCameraState]);

  const startCamera = useCallback(() => {
    if (enableWebcam) {
      enableWebcam();
      setCameraState(true);
    }
  }, [enableWebcam, setCameraState]);

  const switchCamera = useCallback(async () => {
    if (changeWebcam) {
      const nextMode = facingMode === 'front' ? 'back' : 'front';
      try {
        if (getWebcams) {
          const webcams = await getWebcams();
          const targetCam = webcams?.find(w =>
            nextMode === 'front'
              ? w.facingMode === 'user' || w.label?.toLowerCase().includes('front')
              : w.facingMode === 'environment' || w.label?.toLowerCase().includes('back')
          );
          if (targetCam) {
            await changeWebcam(targetCam.deviceId);
          } else {
            await changeWebcam();
          }
        } else {
          await changeWebcam();
        }
      } catch (err) {
        await changeWebcam();
      }
      setFacingMode(nextMode);
    }
  }, [changeWebcam, getWebcams, facingMode, setFacingMode]);

  const isCameraPausedForCapture = useMeetingStore(state => state.isCameraPausedForCapture);

  const pauseCameraForCapture = useCallback(() => {
    const storeState = useMeetingStore.getState();
    if (storeState.isCameraOn) {
      wasCameraOnBeforeCaptureRef.current = true;
      if (disableWebcam) {
        disableWebcam();
      }
      setCameraState(false);
      storeState.setIsCameraPausedForCapture(true);
      showInfoToast('Camera paused while taking document photo...', '📷 Camera Paused');
    }
  }, [disableWebcam, setCameraState]);

  const resumeCameraAfterCapture = useCallback(() => {
    if (
      wasCameraOnBeforeCaptureRef.current ||
      useMeetingStore.getState().isCameraPausedForCapture
    ) {
      setTimeout(() => {
        if (!isMountedRef.current) return;
        if (enableWebcam) {
          enableWebcam();
        }
        setCameraState(true);
        wasCameraOnBeforeCaptureRef.current = false;
        useMeetingStore.getState().setIsCameraPausedForCapture(false);
        showInfoToast('Camera stream resumed.', '📷 Camera Resumed');
      }, 300);
    }
  }, [enableWebcam, setCameraState]);

  useEffect(() => {
    if (isCameraPausedForCapture) {
      const storeState = useMeetingStore.getState();
      if (storeState.isCameraOn) {
        wasCameraOnBeforeCaptureRef.current = true;
        if (disableWebcam) {
          disableWebcam();
        }
        setCameraState(false);
        showInfoToast('Camera paused while taking document photo...', '📷 Camera Paused');
      }
    } else if (wasCameraOnBeforeCaptureRef.current) {
      setTimeout(() => {
        if (!isMountedRef.current) return;
        if (enableWebcam) {
          enableWebcam();
        }
        setCameraState(true);
        wasCameraOnBeforeCaptureRef.current = false;
        showInfoToast('Camera stream resumed.', '📷 Camera Resumed');
      }, 300);
    }
  }, [isCameraPausedForCapture, disableWebcam, enableWebcam, setCameraState]);

  const recoverCameraStream = useCallback(() => {
    const store = useMeetingStore.getState();
    const shouldRecover =
      wasCameraOnBeforeInterruptionRef.current ||
      store.isCameraOn ||
      store.isExternalCameraInterrupted;

    if (!shouldRecover) return;

    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
    }

    recoveryTimeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;
      const currentStore = useMeetingStore.getState();
      const isCallActive =
        currentStore.callState === 'CONNECTED' ||
        currentStore.callState === 'CONNECTING' ||
        hasJoinedRef.current;

      if (!isCallActive) return;

      try {
        if (disableWebcam) {
          disableWebcam();
        }
      } catch (e) {
        // ignore
      }

      setTimeout(async () => {
        if (!isMountedRef.current) return;
        try {
          if (enableWebcam) {
            enableWebcam();
          }
          if (getWebcams && changeWebcam) {
            const webcams = await getWebcams();
            const currentMode = useMeetingStore.getState().facingMode;
            const targetCam = webcams?.find(w =>
              currentMode === 'front'
                ? w.facingMode === 'user' || w.label?.toLowerCase().includes('front')
                : w.facingMode === 'environment' || w.label?.toLowerCase().includes('back')
            );
            if (targetCam) {
              await changeWebcam(targetCam.deviceId);
            }
          }
          setCameraState(true);
          wasCameraOnBeforeInterruptionRef.current = false;
          useMeetingStore.getState().setIsExternalCameraInterrupted(false);
          console.log('[VideoSDK]: Camera capturer auto-recovered successfully');
        } catch (err) {
          console.warn('[VideoSDK]: Camera auto-recovery error:', err);
        }
      }, 350);
    }, 400);
  }, [disableWebcam, enableWebcam, getWebcams, changeWebcam, setCameraState]);

  // Listen to native hardware availability & focus events for camera auto-recovery
  useEffect(() => {
    const subInterrupted = DeviceEventEmitter.addListener('onCameraInterrupted', () => {
      const storeState = useMeetingStore.getState();
      if (storeState.isCameraOn) {
        wasCameraOnBeforeInterruptionRef.current = true;
      }
      storeState.setIsExternalCameraInterrupted(true);
      console.log('[VideoSDK]: Native camera interrupted by external app');
    });

    const subRestored = DeviceEventEmitter.addListener('onCameraAccessRestored', () => {
      console.log('[VideoSDK]: Native camera access restored, initiating stream recovery');
      recoverCameraStream();
    });

    const subFocus = DeviceEventEmitter.addListener('onActivityFocusRestored', () => {
      const storeState = useMeetingStore.getState();
      if (storeState.isExternalCameraInterrupted || wasCameraOnBeforeInterruptionRef.current) {
        console.log('[VideoSDK]: App/PiP regained top focus after external app, recovering camera');
        recoverCameraStream();
      }
    });

    const subPiP = DeviceEventEmitter.addListener('onPiPModeChanged', (isInPiP: boolean) => {
      if (!isInPiP) {
        const storeState = useMeetingStore.getState();
        if (storeState.isExternalCameraInterrupted || wasCameraOnBeforeInterruptionRef.current) {
          recoverCameraStream();
        }
      }
    });

    return () => {
      subInterrupted.remove();
      subRestored.remove();
      subFocus.remove();
      subPiP.remove();
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
    };
  }, [recoverCameraStream]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (wasCameraOnBeforeCaptureRef.current) {
          resumeCameraAfterCapture();
        }
        if (
          useMeetingStore.getState().isExternalCameraInterrupted ||
          wasCameraOnBeforeInterruptionRef.current
        ) {
          recoverCameraStream();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [resumeCameraAfterCapture, recoverCameraStream]);

  const endCall = useCallback(
    async (
      reason: 'time_up' | 'doctor_ended_early' | 'patient_left' | 'error' = 'doctor_ended_early'
    ) => {
      if (isLeavingRef.current) return;
      isLeavingRef.current = true;
      hasJoinedRef.current = false;
      isJoiningRef.current = false;

      useLoadingStore.getState().showLoader('Ending call and saving record...');

      const storeState = useMeetingStore.getState();
      const appointmentId = storeState.appointmentId;
      const callDurationSeconds = storeState.callDurationSeconds;

      try {
        if (appointmentId) {
          const callEndTime = new Date().toISOString();
          const callStartTime = callStartTimeRef.current || callEndTime;
          const startedMs = Date.parse(callStartTime);
          const accumulatedSeconds = !isNaN(startedMs)
            ? Math.max(0, Math.floor((Date.now() - startedMs) / 1000))
            : 0;

          const isTimeUp = reason === 'time_up';
          const scheduledSeconds = callDurationSeconds || 0;
          const markCompleted =
            isTimeUp || (scheduledSeconds > 0 && accumulatedSeconds >= scheduledSeconds);

          const payload = {
            appointment_id: appointmentId,
            call_start_time: callStartTime,
            call_end_time: callEndTime,
            call_duration_seconds: accumulatedSeconds,
            accumulated_call_seconds: accumulatedSeconds,
            call_end_reason: reason,
            max_participants: Math.max(1, maxParticipantsRef.current || 1),
            mark_completed: markCompleted,
            call_timer_started_at: callStartTime,
            call_elapsed_seconds: accumulatedSeconds,
            call_timer_paused: false,
            doctor_last_heartbeat: callEndTime,
            patient_last_heartbeat: null,
          };

          // await saveCall(payload);
          await queryClient.invalidateQueries({
            queryKey: [AppointmemntQueryKey.ALL_APPOINTMENTS],
          });
        }
      } catch (err) {
        console.warn('[saveCall Error]:', err);
      } finally {
        if (Platform.OS === 'android' && PiPModule?.setCallActive) {
          PiPModule.setCallActive(false).catch?.(() => {});
        }
        try {
          if (leave) {
            leave();
          }
        } catch (err) {
          console.warn('[VideoSDK]: Error executing leave():', err);
        }
        resetMeetingStore();
        useLoadingStore.getState().hideLoader();
        if (onLeaveCallback) {
          onLeaveCallback();
        }
      }
    },
    [leave, resetMeetingStore, onLeaveCallback]
  );

  return {
    joinCall,
    toggleAudio,
    muteAudio,
    unmuteAudio,
    toggleVideo,
    stopCamera,
    startCamera,
    switchCamera,
    pauseCameraForCapture,
    resumeCameraAfterCapture,
    endCall,
    localParticipant,
    participants,
  };
};
