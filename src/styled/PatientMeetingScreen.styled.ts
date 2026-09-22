import { Platform, StyleSheet } from 'react-native';

export const PatientMeetingScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },

  // Header Bar (Positioned over full screen video)
  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  doctorStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E99A8',
    marginTop: 2,
    letterSpacing: 0.5,
    lineHeight: 14,
  },

  headerRight: {
    alignItems: 'flex-end',
  },
  headerTopRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 6,
  },
  connectingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  connectingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.3,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
  },

  headerBottomRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  leftPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E99A8',
    letterSpacing: 0.3,
  },
  leftTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Floating PIP Box (Top Right, layered above stage video)
  selfPipCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 95 : 100,
    right: 16,
    width: 112,
    height: 152,
    borderRadius: 16,
    backgroundColor: '#0D131E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 100,
    elevation: 10,
  },
  pipMuteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pipAvatarTxt: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3A475C',
  },
  pipYouBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 10,
  },
  pipYouTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E99A8',
    letterSpacing: 0.3,
  },

  // Main Stage Area (Full Screen Background)
  stageContainerFull: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 1,
  },
  stageContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#000000',
    zIndex: 1,
  },
  waitingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 24,
    textAlign: 'center',
  },
  waitingSubtitle: {
    fontSize: 13,
    color: '#8E99A8',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Bottom Control Bar (Positioned over full screen video)
  controlBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 12,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlRowSpacing: {
    marginBottom: 10,
  },
  controlBtn: {
    flex: 1,
    height: 76,
    backgroundColor: '#22252D',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnEnd: {
    backgroundColor: '#3D1518',
    borderWidth: 1,
    borderColor: '#591C21',
  },
  controlBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  controlBtnTxtMuted: {
    color: '#94A3B8',
  },
  controlBtnTxtEnd: {
    color: '#EF4444',
  },
});

export default PatientMeetingScreenStyles;
