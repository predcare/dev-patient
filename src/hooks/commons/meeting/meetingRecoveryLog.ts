/**
 * One prefix for every video recovery step (tiers, limitations, consume), so a bad call can be
 * read back from `adb logcat` / Xcode. Failures use console.warn, everything else console.log.
 */
export const logMeetingRecovery = (event: string, details?: Record<string, unknown>) => {
  console.log(`[MeetingRecovery] ${event}`, details ?? '');
};

export const warnMeetingRecovery = (event: string, details?: Record<string, unknown>) => {
  console.warn(`[MeetingRecovery] ${event}`, details ?? '');
};
