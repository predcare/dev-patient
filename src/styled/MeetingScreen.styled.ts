import { Dimensions, StyleSheet } from 'react-native';
import { theme } from './theme.styled';

const { width: SW, height: SH } = Dimensions.get('window');

export const meetingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#1E293B',
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  doctorAvatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  doctorAvatarTxt: {
    color: theme.colors.surface,
    fontSize: 40,
    fontWeight: '800',
  },

  // Top Header Bar
  headerBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  doctorInfoCol: {
    flex: 1,
    paddingRight: 10,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.surface,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.8,
  },

  // Top Right Timer Column
  timersCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveTxt: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  timerValue: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 4,
  },
  leftBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  leftLbl: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  leftValue: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },

  // Floating PiP Camera Preview
  pipContainer: {
    position: 'absolute',
    top: 150,
    right: 16,
    width: 120,
    height: 165,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  pipVideoMock: {
    flex: 1,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom HUD Control Container
  bottomHud: {
    position: 'absolute',
    bottom: 24,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },

  // Row 1 (3 Buttons)
  controlsRow1: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  btnCol3: {
    flex: 1,
  },
  ctrlBtnLg: {
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  ctrlBtnLgActiveTeal: {
    backgroundColor: '#0D9488',
  },

  // Row 2 (4 Buttons)
  controlsRow2: {
    flexDirection: 'row',
    gap: 8,
  },
  btnCol4: {
    flex: 1,
  },
  ctrlBtnSm: {
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  ctrlBtnSmActiveRed: {
    backgroundColor: '#EF4444',
  },

  // Button Icon & Labels
  ctrlIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  ctrlLabel: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});

export default meetingStyles;
