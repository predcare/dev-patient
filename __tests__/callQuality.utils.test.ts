import {
  advanceTierSince,
  applyHysteresis,
  classifySample,
  decideReceiveTier,
  decideSendTier,
  freshTierSince,
  getLinkSignalCap,
  getSignalLevel,
  lossRatio,
  readTierClocks,
  sumStats,
  THysteresis,
  TTierClocks,
} from '../src/hooks/commons/meeting/callQuality.utils';

describe('callQuality.utils', () => {
  it('computes loss from the change between samples, not running totals', () => {
    const before = sumStats([{ packetsLost: 100, totalPackets: 10000 }]);
    const now = sumStats([{ packetsLost: 110, totalPackets: 10500, rtt: 120 }]);
    expect(lossRatio(now, before)).toBeCloseTo(10 / 500);
    expect(lossRatio(now, null)).toBe(0);
    expect(now.rtt).toBe(120);
  });

  it('classifies samples by loss and rtt', () => {
    expect(classifySample(0.01, 100)).toBe('GOOD');
    expect(classifySample(0.05, 100)).toBe('FAIR');
    expect(classifySample(0.01, 400)).toBe('FAIR');
    expect(classifySample(0.2, 100)).toBe('WEAK');
  });

  it('drops after 2 bad samples and recovers after 3 good ones', () => {
    let state: THysteresis = { current: 'GOOD', candidate: null, streak: 0 };
    state = applyHysteresis(state, 'WEAK');
    expect(state.current).toBe('GOOD');
    state = applyHysteresis(state, 'WEAK');
    expect(state.current).toBe('WEAK');

    state = applyHysteresis(state, 'GOOD');
    state = applyHysteresis(state, 'GOOD');
    expect(state.current).toBe('WEAK');
    state = applyHysteresis(state, 'GOOD');
    expect(state.current).toBe('GOOD');
  });

  it('keeps the old bars when no link details exist', () => {
    expect(getLinkSignalCap(false, 'wifi', null, null)).toBe(4);
    expect(getLinkSignalCap(false, 'cellular', null, null)).toBe(3);
    expect(getLinkSignalCap(false, 'unknown', null, null)).toBe(2);
    expect(getLinkSignalCap(true, 'wifi', 90, null)).toBe(0);
  });

  it('caps the bars by wifi strength and cellular generation', () => {
    expect(getLinkSignalCap(false, 'wifi', 20, null)).toBe(1);
    expect(getLinkSignalCap(false, 'wifi', 70, null)).toBe(3);
    expect(getLinkSignalCap(false, 'cellular', null, '3g')).toBe(2);
    expect(getLinkSignalCap(false, 'cellular', null, '5g')).toBe(4);
  });

  it('does not show full signal on wifi when the call is weak', () => {
    expect(getSignalLevel(4, 'GOOD', null)).toBe(4);
    expect(getSignalLevel(4, 'FAIR', null)).toBe(2);
    expect(getSignalLevel(4, 'WEAK', null)).toBe(1);
    expect(getSignalLevel(4, 'GOOD', 'bandwidth')).toBe(2);
    expect(getSignalLevel(4, 'OFFLINE', null)).toBe(0);
  });
});

describe('tier ladders', () => {
  const clocks = (c: Partial<TTierClocks>): TTierClocks => ({
    badFor: 0,
    weakFor: 0,
    goodFor: 0,
    notWeakFor: 0,
    ...c,
  });

  it('steps the receive tier down on a weak download', () => {
    expect(decideReceiveTier('hd', clocks({ badFor: 6000 }))).toBe('sd');
    expect(decideReceiveTier('sd', clocks({ badFor: 10000, weakFor: 10000 }))).toBe('low');
    expect(decideReceiveTier('low', clocks({ badFor: 20000, weakFor: 20000 }))).toBe('audio');
  });

  it('leaves audio-only straight to low once the download is not weak for 3 s', () => {
    expect(decideReceiveTier('audio', clocks({ notWeakFor: 2000 }))).toBe('audio');
    expect(decideReceiveTier('audio', clocks({ notWeakFor: 3000, goodFor: 3000 }))).toBe('low');
    // FAIR is enough to leave audio-only
    expect(decideReceiveTier('audio', clocks({ notWeakFor: 3000, badFor: 3000 }))).toBe('low');
  });

  it('climbs one step at a time after a good period', () => {
    expect(decideReceiveTier('low', clocks({ goodFor: 9000, notWeakFor: 9000 }))).toBe('low');
    expect(decideReceiveTier('low', clocks({ goodFor: 10000, notWeakFor: 10000 }))).toBe('sd');
    expect(decideReceiveTier('sd', clocks({ goodFor: 10000, notWeakFor: 10000 }))).toBe('hd');
  });

  it('never goes below low on the send side, and a CPU limit only keeps it off HD', () => {
    expect(decideSendTier('hd', clocks({ weakFor: 60000, badFor: 60000 }), false)).toBe('low');
    expect(decideSendTier('hd', clocks({}), true)).toBe('sd');
    expect(decideSendTier('sd', clocks({ goodFor: 10000 }), true)).toBe('sd');
    expect(decideSendTier('sd', clocks({ goodFor: 10000 }), false)).toBe('hd');
  });

  it('tracks bad / weak / good streaks', () => {
    let since = freshTierSince();
    since = advanceTierSince(since, { bad: true, weak: true }, 1000);
    since = advanceTierSince(since, { bad: true, weak: true }, 5000);
    expect(readTierClocks(since, 5000)).toEqual({ badFor: 4000, weakFor: 4000, goodFor: 0, notWeakFor: 0 });
    since = advanceTierSince(since, { bad: true, weak: false }, 6000);
    expect(readTierClocks(since, 9000)).toEqual({ badFor: 8000, weakFor: 0, goodFor: 0, notWeakFor: 3000 });
    since = advanceTierSince(since, { bad: false, weak: false }, 10000);
    expect(readTierClocks(since, 12000)).toEqual({ badFor: 0, weakFor: 0, goodFor: 2000, notWeakFor: 6000 });
  });
});

describe('meeting store call quality', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const useMeetingStore = require('../src/zustand/stores/useMeetingStore').default;

  beforeEach(() => useMeetingStore.getState().resetMeetingStore());

  it('resolving one limitation type keeps the others', () => {
    const store = useMeetingStore.getState();
    store.setQualityLimitationEvent('bandwidth', true);
    store.setQualityLimitationEvent('cpu', true);
    useMeetingStore.getState().setQualityLimitationEvent('bandwidth', false);
    expect(useMeetingStore.getState().qualityLimitation).toBe('cpu');
    useMeetingStore.getState().setQualityLimitationEvent('cpu', false);
    expect(useMeetingStore.getState().qualityLimitation).toBeNull();
  });

  it('drops old limitations and quality on rejoin', () => {
    const store = useMeetingStore.getState();
    store.setQualityLimitationEvent('bandwidth', true);
    store.setCallQualities('WEAK', 'WEAK');
    useMeetingStore.getState().rejoinCallInfo({ token: 't', meetingId: 'm' });
    const next = useMeetingStore.getState();
    expect(next.qualityLimitation).toBeNull();
    expect(next.networkQuality).toBe('GOOD');
    expect(next.downlinkQuality).toBe('GOOD');
  });

  it('networkQuality is the worse direction', () => {
    useMeetingStore.getState().setCallQualities('GOOD', 'WEAK');
    expect(useMeetingStore.getState().networkQuality).toBe('WEAK');
  });
});
