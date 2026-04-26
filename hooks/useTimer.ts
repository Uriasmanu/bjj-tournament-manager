import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerReturn {
  elapsed: number;
  isRunning: boolean;
  duration: number;
  start: () => Promise<void>;
  pause: () => Promise<void>;
  reset: () => Promise<void>;
  setDuration: (seconds: number) => Promise<void>;
  loadTimer: (areaId: string) => Promise<void>;
}

export function useTimer(initialDuration: number = 300): UseTimerReturn {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDurationState] = useState(initialDuration);
  const [areaId, setAreaId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadTimer = useCallback(async (areaId: string) => {
    try {
      const response = await fetch(`/api/scoreboard/${areaId}/timer`);
      if (response.ok) {
        const data = await response.json();
        setElapsed(data.timer.elapsed);
        setIsRunning(data.timer.isRunning);
        setDurationState(data.timer.duration);
        setAreaId(areaId);
      }
    } catch (error) {
      console.error('Erro ao carregar timer:', error);
    }
  }, []);

  const start = useCallback(async () => {
    if (!areaId || isRunning) return;

    try {
      const response = await fetch(`/api/scoreboard/${areaId}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      if (response.ok) {
        const data = await response.json();
        setElapsed(data.timer.elapsed);
        setIsRunning(data.timer.isRunning);
      }
    } catch (error) {
      console.error('Erro ao iniciar timer:', error);
    }
  }, [areaId, isRunning]);

  const pause = useCallback(async () => {
    if (!areaId || !isRunning) return;

    try {
      const response = await fetch(`/api/scoreboard/${areaId}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' }),
      });

      if (response.ok) {
        const data = await response.json();
        setElapsed(data.timer.elapsed);
        setIsRunning(data.timer.isRunning);
      }
    } catch (error) {
      console.error('Erro ao pausar timer:', error);
    }
  }, [areaId, isRunning]);

  const reset = useCallback(async () => {
    if (!areaId) return;

    try {
      const response = await fetch(`/api/scoreboard/${areaId}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      if (response.ok) {
        const data = await response.json();
        setElapsed(data.timer.elapsed);
        setIsRunning(data.timer.isRunning);
      }
    } catch (error) {
      console.error('Erro ao resetar timer:', error);
    }
  }, [areaId]);

  const setDuration = useCallback(async (seconds: number) => {
    if (!areaId) return;

    try {
      const response = await fetch(`/api/scoreboard/${areaId}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setDuration', duration: seconds }),
      });

      if (response.ok) {
        const data = await response.json();
        setDurationState(data.timer.duration);
        if (elapsed >= data.timer.duration) {
          setElapsed(data.timer.duration);
          setIsRunning(false);
        }
      }
    } catch (error) {
      console.error('Erro ao definir duração:', error);
    }
  }, [areaId, elapsed]);

  useEffect(() => {
    if (isRunning && elapsed < duration) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          if (next >= duration) {
            setIsRunning(false);
            return duration;
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, elapsed, duration]);

  return {
    elapsed,
    isRunning,
    duration,
    start,
    pause,
    reset,
    setDuration,
    loadTimer,
  };
}