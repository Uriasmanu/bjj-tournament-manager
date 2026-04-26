import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Area } from '@/types';

interface AreaSelectorProps {
  areas: Area[];
  selectedAreaId: string | null;
  onAreaChange: (areaId: string) => void;
  loading?: boolean;
}

export function AreaSelector({ areas, selectedAreaId, onAreaChange, loading }: AreaSelectorProps) {
  const activeAreas = areas.filter(area => area.currentMatchId);

  return (
    <div className="w-full max-w-md mx-auto">
      <Select
        value={selectedAreaId || ''}
        onValueChange={onAreaChange}
        disabled={loading}
      >
        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder="Selecione uma área ativa" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {activeAreas.length === 0 ? (
            <SelectItem value="" disabled>
              Nenhuma área com luta ativa
            </SelectItem>
          ) : (
            activeAreas.map(area => (
              <SelectItem key={area.id} value={area.id}>
                {area.name} ({area.bracketCount} lutas)
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}