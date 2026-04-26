import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Area } from '@/types';

interface AreaSelectorProps {
  areas: Area[];
  selectedAreaId: string | null;
  onAreaChange: (areaId: string) => void;
  loading?: boolean;
}

export function AreaSelector({ areas, selectedAreaId, onAreaChange, loading }: AreaSelectorProps) {
  // Ensure selectedAreaId is never an empty string
  const safeSelectedValue = selectedAreaId && selectedAreaId !== '' ? selectedAreaId : undefined;

  const handleValueChange = (value: string) => {
    // Prevent calling onAreaChange with empty string
    if (value && value !== '') {
      onAreaChange(value);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Select
        value={safeSelectedValue}
        onValueChange={handleValueChange}
        disabled={loading}
      >
        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder="Selecione uma área" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {areas.length === 0 ? (
            // FIX: Use a non-empty string value or don't render a select item
            <div className="px-2 py-1.5 text-sm text-gray-400 text-center">
              Nenhuma área cadastrada
            </div>
          ) : (
            areas.map(area => (
              <SelectItem key={area.id} value={area.id}>
                {area.name} {area.currentMatchId ? `(${area.bracketCount} lutas)` : '(sem luta ativa)'}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}