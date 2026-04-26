import { useTimer } from '@/hooks/useTimer';

interface TimerDisplayProps {
  elapsed?: number;
  duration?: number;
}

export function TimerDisplay({ elapsed: propElapsed, duration: propDuration }: TimerDisplayProps) {
  // Se não receber props, usa o hook padrão
  const timer = useTimer();
  const elapsed = propElapsed ?? timer.elapsed;
  const duration = propDuration ?? timer.duration;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remaining = Math.max(0, duration - elapsed);
  const isFinished = elapsed >= duration;

  return (
    <div className="text-center">
      <div
        className={`font-mono text-6xl font-bold ${
          isFinished ? 'text-red-500 animate-pulse' : 'text-white'
        }`}
      >
        {formatTime(remaining)}
      </div>
      {isFinished && (
        <div className="text-red-400 text-lg font-semibold mt-2">
          TEMPO ESGOTADO
        </div>
      )}
    </div>
  );
}