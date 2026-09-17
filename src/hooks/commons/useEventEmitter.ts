import { useEffect } from 'react';
import eventEmitter from '../../lib/services/event.emitter';

export default function useEventEmitter<T = unknown>(
  event: string,
  callback: (data: T) => void,
) {
  useEffect(() => {
    eventEmitter.on(event, callback);
    return () => {
      eventEmitter.off(event, callback);
    };
  }, [event, callback]);
}
