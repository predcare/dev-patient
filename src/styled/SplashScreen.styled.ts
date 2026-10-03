import { StyleSheet } from 'react-native';

export const Splashstyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },

  // Background Circles
  circleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.08,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: '#007AFF',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 250,
    height: 250,
    backgroundColor: '#007AFF',
    bottom: -50,
    left: -80,
  },
  circle3: {
    width: 200,
    height: 200,
    backgroundColor: '#007AFF',
    top: '40%',
    left: '50%',
    marginLeft: -100,
    marginTop: -100,
    opacity: 0.05,
  },

  // Content
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 110,
    height: 110,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#8E8E93',
    letterSpacing: 0.5,
  },

  // Loader
  loaderContainer: {
    position: 'absolute',
    bottom: 120,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#C7C7CC',
    letterSpacing: 0.5,
  },
  versionText: {
    fontSize: 11,
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
