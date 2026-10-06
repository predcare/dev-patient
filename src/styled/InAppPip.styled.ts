import { StyleSheet } from 'react-native';

export const PIP_CARD_WIDTH = 140;
export const PIP_CARD_HEIGHT = 190;
export const PIP_CARD_MARGIN = 16;

export const inAppPipStyles = StyleSheet.create({
  dragLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 20,
  },
  floatingCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PIP_CARD_WIDTH,
    height: PIP_CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#0D131E',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  videoContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  avatarPlaceholder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  doctorPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    maxWidth: 90,
  },
  doctorName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expandIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomHud: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  tapToExpandTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    letterSpacing: 0.3,
  },
  endCallBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default inAppPipStyles;
