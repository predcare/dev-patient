import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';

export interface UseFocusRefetchOptions {
  /** Whether to skip executing on the initial component mount */
  skipFirst?: boolean;
  /** Execute only once when screen first comes into focus */
  once?: boolean;
  /** Whether focus callback execution is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Custom hook that triggers a refetch callback when a screen comes into active focus in React Navigation.
 * - Initial visit: Screen renders and triggers initial API call/callback once.
 * - Subsequent visits: Easily configured to run conditionally, once, or on every focus without unmounting UI.
 */
export function useFocusRefetch(
  refetchCallback: () => void | Promise<void>,
  deps: React.DependencyList = [],
  options: UseFocusRefetchOptions = {}
) {
  const { skipFirst = false, once = false, enabled = true } = options;
  const isFirstMount = useRef(true);
  const hasExecutedRef = useRef(false);
  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;

      if (skipFirst && isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }

      if (once && hasExecutedRef.current) {
        return;
      }

      isFirstMount.current = false;
      hasExecutedRef.current = true;

      try {
        refetchCallback();
      } catch (error) {
        console.error('[useFocusRefetch] Error executing refetch callback:', error);
      }
    }, [skipFirst, once, enabled, ...deps])
  );

  return {
    isFocused,
    hasExecuted: hasExecutedRef.current,
  };
}

export default useFocusRefetch;
