import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';

interface TimerControlsProps {
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  isRunning?: boolean;
}

export function TimerControls({ onStart, onPause, onReset, isRunning: propIsRunning }: TimerControlsProps) {
  // Se não receber props, usa o hook padrão
  const timer = useTimer();
  const isRunning = propIsRunning ?? timer.isRunning;
  const start = onStart ?? timer.start;
  const pause = onPause ?? timer.pause;
  const reset = onReset ?? timer.reset;

  return (
    <div className="flex justify-center space-x-4">
      <Button
        onClick={isRunning ? pause : start}
        size="lg"
        className="bg-bjj-gold hover:bg-bjj-gold-dark text-black font-bold px-8 py-4 text-xl"
      >
        {isRunning ? (
          <>
            <Pause className="w-6 h-6 mr-2" />
            Pausar
          </>
        ) : (
          <>
            <Play className="w-6 h-6 mr-2" />
            Iniciar
          </>
        )}
      </Button>

      <Button
        onClick={reset}
        variant="outline"
        size="lg"
        className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-4"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Reset
      </Button>
    </div>
  );
}