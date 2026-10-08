import { StyleSheet } from 'react-native';

// The Android PiP window is roughly 150-240dp wide; below this the name pill crowds the video.
export const PIP_NAME_PILL_MIN_WIDTH = 140;

export const androidPipStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 99999,
    elevation: 99999,
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholderTxt: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
    color: '#CBD5E1',
    textAlign: 'center',
  },
  namePill: {
    position: 'absolute',
    top: 6,
    left: 6,
    maxWidth: '62%',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  nameTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selfTile: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: '30%',
    aspectRatio: 3 / 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  muteBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    padding: 2,
    zIndex: 10,
  },
});

export default androidPipStyles;
