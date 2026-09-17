import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';

/**
 * Reusable hook to execute a callback whenever a React Navigation screen comes into focus.
 * Prevents React 18/19 Dev Mode double-mount executions so it runs EXACTLY ONCE per screen focus event.
 *
 * @param callback Function to execute on screen focus (can return a cleanup function for blur).
 * @param deps Optional dependency array.
 */
export function useScreenFocus(
  callback: () => void | (() => void),
  deps: React.DependencyList = []
): void {
  const isFocusedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (isFocusedRef.current) {
        return;
      }
      isFocusedRef.current = true;

      const cleanup = callback();

      return () => {
        isFocusedRef.current = false;
        if (typeof cleanup === 'function') {
          cleanup();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
  );
}

export default useScreenFocus;
