import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ScoreButtonProps {
  onClick: () => void;
  label: string;
  variant?: 'points' | 'advantage' | 'penalty';
  disabled?: boolean;
}

export function ScoreButton({ onClick, label, variant = 'points', disabled }: ScoreButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'points':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'advantage':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'penalty':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`${getVariantStyles()} font-bold px-4 py-3 text-lg flex items-center space-x-2`}
    >
      <Plus className="w-4 h-4" />
      <span>{label}</span>
    </Button>
  );
}