import { getObject, setObject } from '../../lib/common/asyncStorage';

// Calls this phone has already dealt with, kept across app restarts. Android hands the old ring
// notification back as the "launch" notification after a JS reload or a relaunch, and iOS can
// return an old call alert. Without this list such a call looks new and would join again.
//
// 'answered': the patient pressed Answer and the app is about to join (Android stops the ring
// first, so the join may run in a newer JS instance).
// 'done': joined, declined, cancelled, expired or timed out. Never acted on again.
export type HandledState = 'answered' | 'done';
type HandledRecord = { state: HandledState; at: number };

const STORAGE_KEY = '@handled_calls';
// Long enough to cover any replay of an old notification; call uuids are unique per call.
const KEEP_MS = 12 * 60 * 60 * 1000;
const MAX_RECORDS = 50;

let records: Record<string, HandledRecord> = {};
let loading: Promise<void> | null = null;

const prune = (all: Record<string, HandledRecord>) => {
  const now = Date.now();
  return Object.fromEntries(
    Object.entries(all)
      .filter(([, record]) => now - record.at < KEEP_MS)
      .sort(([, a], [, b]) => b.at - a.at)
      .slice(0, MAX_RECORDS),
  );
};

/** Reads the saved list once per JS instance. Safe to await many times; never rejects. */
export const loadHandledCalls = (): Promise<void> => {
  loading ??= getObject<Record<string, HandledRecord>>(STORAGE_KEY)
    .then(saved => {
      // Records written before the load finished win over the saved copy.
      records = prune({ ...(saved ?? {}), ...records });
    })
    .catch(() => {});
  return loading;
};

export const getHandledCall = (callId: string): HandledRecord | undefined => records[callId];

export const isCallHandled = (callId: string): boolean => Boolean(records[callId]);

/** Saves the call's state. 'done' is final and is never changed back to 'answered'. */
export const markCallHandled = (callId: string, state: HandledState, at = Date.now()): void => {
  const current = records[callId];
  if (current?.state === 'done') return;
  if (current?.state === state) return;
  records = prune({ ...records, [callId]: { state, at } });
  setObject(STORAGE_KEY, records);
};
