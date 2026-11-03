import { Alert, Platform } from 'react-native';
import { getItem, setItem } from '../../lib/common/asyncStorage';
import { canShowSystemCall, setupCallKeepWithPrompt } from './callKeepSetup';

const LAST_PROMPT_KEY = '@call_account_prompted_at';
// Asks again at most every 3 days while the calling account is still off.
const PROMPT_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Android: explains why PRED Care needs to manage calls, then runs CallKeep's setup, which asks
 * for the phone permission and opens the calling-account settings. Does nothing once the account
 * is on, and nothing on iOS.
 */
export const promptCallAccountIfNeeded = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  if (await canShowSystemCall()) return;

  const lastPrompt = Number(await getItem(LAST_PROMPT_KEY)) || 0;
  if (Date.now() - lastPrompt < PROMPT_INTERVAL_MS) return;
  await setItem(LAST_PROMPT_KEY, String(Date.now()));

  Alert.alert(
    'Get doctor calls like a phone call',
    "Your doctor's video calls can ring on the full call screen, even when PRED Care is closed. Allow PRED Care to manage calls on the next screens.",
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Continue', onPress: () => setupCallKeepWithPrompt() },
    ],
    { cancelable: true },
  );
};
