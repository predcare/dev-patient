import { useEffect, useRef, useState } from 'react';

export function useDebounce<T>(value: T, delay: number, onDebounce?: () => void): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const prevValueRef = useRef<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      if (prevValueRef.current !== value) {
        onDebounce?.();
        prevValueRef.current = value;
      }
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay, onDebounce]);

  return debouncedValue;
}
export function useDebouncedArray(values: string[], delay: number): string[] {
  const [debounced, setDebounced] = useState(values);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounced(values);
    }, delay);
    return () => clearTimeout(handler);
  }, [values.join('|'), delay]);

  return debounced;
}
