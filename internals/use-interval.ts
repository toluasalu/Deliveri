import { useEffect, useRef } from 'react';

type Noop = () => void;

export function useInterval(callback: Noop, delay = 0) {
  const savedCallback = useRef<Noop | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
