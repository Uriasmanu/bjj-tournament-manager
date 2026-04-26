import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';

interface UndoButtonProps {
  onUndo: () => void;
  disabled?: boolean;
}

export function UndoButton({ onUndo, disabled }: UndoButtonProps) {
  return (
    <Button
      onClick={onUndo}
      disabled={disabled}
      variant="outline"
      className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
    >
      <Undo2 className="w-4 h-4 mr-2" />
      Desfazer Última Ação
    </Button>
  );
}