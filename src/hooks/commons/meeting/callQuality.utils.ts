import {
  CALL_QUALITY_DOWNGRADE_SAMPLES,
  CALL_QUALITY_THRESHOLDS,
  CALL_QUALITY_UPGRADE_SAMPLES,
  VIDEO_TIER_STEP_MS,
} from '../../../config/meeting.constants';
import {
  TNetworkQuality,
  TQualityLimitation,
  TSendTier,
  TVideoTier,
} from '../../../zustand/interfaces/meeting.interfaces';

export type TStatsRow = {
  packetsLost?: number;
  totalPackets?: number;
  rtt?: number | null;
  jitter?: number | null;
};

export type TStatsTotals = { lost: number; total: number };

const RANK: Record<TNetworkQuality, number> = { GOOD: 3, FAIR: 2, WEAK: 1, OFFLINE: 0 };

export const sumStats = (rows: TStatsRow[] = []): TStatsTotals & { rtt: number } =>
  rows.reduce<TStatsTotals & { rtt: number }>(
    (acc, row) => ({
      lost: acc.lost + (row?.packetsLost || 0),
      total: acc.total + (row?.totalPackets || 0),
      rtt: Math.max(acc.rtt, row?.rtt || 0),
    }),
    { lost: 0, total: 0, rtt: 0 },
  );

/** packetsLost/totalPackets are running totals, so loss is the change since the last sample. */
export const lossRatio = (now: TStatsTotals, before: TStatsTotals | null) => {
  if (!before) return 0;
  const lost = now.lost - before.lost;
  const total = now.total - before.total;
  if (total <= 0 || lost < 0) return 0;
  return lost / total;
};

export const classifySample = (loss: number, rtt: number): TNetworkQuality => {
  const { good, fair } = CALL_QUALITY_THRESHOLDS;
  if (loss < good.loss && rtt < good.rtt) return 'GOOD';
  if (loss < fair.loss && rtt < fair.rtt) return 'FAIR';
  return 'WEAK';
};

export type THysteresis = {
  current: TNetworkQuality;
  candidate: TNetworkQuality | null;
  streak: number;
};

/** Drops after 2 bad samples, recovers after 3 good ones, so the UI and video do not flip. */
export const applyHysteresis = (state: THysteresis, sample: TNetworkQuality): THysteresis => {
  if (sample === state.current) return { ...state, candidate: null, streak: 0 };
  const streak = state.candidate === sample ? state.streak + 1 : 1;
  const needed =
    RANK[sample] < RANK[state.current]
      ? CALL_QUALITY_DOWNGRADE_SAMPLES
      : CALL_QUALITY_UPGRADE_SAMPLES;
  if (streak >= needed) return { current: sample, candidate: null, streak: 0 };
  return { ...state, candidate: sample, streak };
};

/**
 * Upper bound from the device link. With no detail available it matches the old bars
 * (wifi 4, cellular 3, unknown 2).
 */
export const getLinkSignalCap = (
  isOffline: boolean,
  connectionType: string,
  wifiStrength: number | null,
  cellularGeneration: string | null,
): number => {
  if (isOffline || connectionType === 'none') return 0;
  if (connectionType === 'ethernet') return 4;
  if (connectionType === 'wifi') {
    if (wifiStrength == null) return 4;
    if (wifiStrength < 30) return 1;
    if (wifiStrength < 60) return 2;
    if (wifiStrength < 80) return 3;
    return 4;
  }
  if (connectionType === 'cellular') {
    if (cellularGeneration === '2g') return 1;
    if (cellularGeneration === '3g') return 2;
    if (cellularGeneration === '5g') return 4;
    return 3;
  }
  if (connectionType === 'unknown') return 2;
  return 3;
};

/** Header bars: the link cap, lowered by real call quality. Wifi alone can no longer show "Strong". */
export const getSignalLevel = (
  linkCap: number,
  networkQuality: TNetworkQuality,
  qualityLimitation: TQualityLimitation,
): number => {
  if (linkCap === 0 || networkQuality === 'OFFLINE') return 0;
  const callCap = networkQuality === 'GOOD' ? 4 : networkQuality === 'FAIR' ? 2 : 1;
  const limitCap =
    qualityLimitation === 'bandwidth' || qualityLimitation === 'congestion' ? 2 : 4;
  return Math.max(1, Math.min(linkCap, callCap, limitCap));
};

/** Start times of the current bad / weak / good / not-weak streaks (null = not in that streak). */
export type TTierSince = {
  badSince: number | null;
  weakSince: number | null;
  goodSince: number | null;
  notWeakSince: number | null;
};

export type TTierClocks = { badFor: number; weakFor: number; goodFor: number; notWeakFor: number };

export const freshTierSince = (): TTierSince => ({
  badSince: null,
  weakSince: null,
  goodSince: null,
  notWeakSince: null,
});

export const advanceTierSince = (
  since: TTierSince,
  reading: { bad: boolean; weak: boolean },
  now: number,
): TTierSince => ({
  badSince: reading.bad ? since.badSince ?? now : null,
  goodSince: reading.bad ? null : since.goodSince ?? now,
  weakSince: reading.weak ? since.weakSince ?? now : null,
  notWeakSince: reading.weak ? null : since.notWeakSince ?? now,
});

export const readTierClocks = (since: TTierSince, now: number): TTierClocks => ({
  badFor: since.badSince != null ? now - since.badSince : 0,
  weakFor: since.weakSince != null ? now - since.weakSince : 0,
  goodFor: since.goodSince != null ? now - since.goodSince : 0,
  notWeakFor: since.notWeakSince != null ? now - since.notWeakSince : 0,
});

const RECEIVE_ORDER: TVideoTier[] = ['hd', 'sd', 'low', 'audio'];
const SEND_ORDER: TSendTier[] = ['hd', 'sd', 'low'];

/**
 * What to request from the doctor, from download signals only. Steps down after a weak
 * period; leaves audio-only as soon as the link is no longer weak; climbs one step at a time.
 */
export const decideReceiveTier = (current: TVideoTier, clocks: TTierClocks): TVideoTier => {
  const index = RECEIVE_ORDER.indexOf(current);
  if (current === 'audio') {
    return clocks.notWeakFor >= VIDEO_TIER_STEP_MS.audioExit ? 'low' : 'audio';
  }
  if (clocks.weakFor >= VIDEO_TIER_STEP_MS.toAudio) return 'audio';
  if (clocks.weakFor >= VIDEO_TIER_STEP_MS.toLow) return index < 2 ? 'low' : current;
  if (clocks.badFor >= VIDEO_TIER_STEP_MS.toSd) return index < 1 ? 'sd' : current;
  if (clocks.goodFor >= VIDEO_TIER_STEP_MS.restore && index > 0) return RECEIVE_ORDER[index - 1];
  return current;
};

/**
 * What the patient's camera sends, from upload signals only (local stats and the SDK's
 * bandwidth / congestion limitation). A CPU limitation only keeps it off HD.
 */
export const decideSendTier = (
  current: TSendTier,
  clocks: TTierClocks,
  isCpuLimited: boolean,
): TSendTier => {
  const index = SEND_ORDER.indexOf(current);
  if (clocks.weakFor >= VIDEO_TIER_STEP_MS.toLow) return 'low';
  if (clocks.badFor >= VIDEO_TIER_STEP_MS.toSd) return index < 1 ? 'sd' : current;
  if (isCpuLimited && current === 'hd') return 'sd';
  if (clocks.goodFor >= VIDEO_TIER_STEP_MS.restore && index > 0) {
    const next = SEND_ORDER[index - 1];
    return isCpuLimited && next === 'hd' ? current : next;
  }
  return current;
};
