import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MatchScore } from '@/types';

interface FighterData {
  id: string;
  name: string;
  weight: number;
  coach: string;
}

interface FighterCardProps {
  fighter: FighterData | null;
  score: MatchScore | null;
  position: 'left' | 'right';
}

export function FighterCard({ fighter, score, position }: FighterCardProps) {
  if (!fighter) {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardContent className="p-4 text-center">
          <p className="text-gray-400">Lutador não definido</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-900 border-2 ${position === 'left' ? 'border-blue-500' : 'border-red-500'}`}>
      <CardContent className="p-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">{fighter.name}</h3>
          <p className="text-gray-300 text-sm mb-1">{fighter.weight}kg</p>
          <p className="text-gray-400 text-xs">{fighter.coach}</p>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Pontos:</span>
            <Badge variant="secondary" className="text-2xl font-bold bg-bjj-gold text-black">
              {score?.points || 0}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Vantagens:</span>
            <Badge variant="outline" className="text-lg">
              {score?.advantages || 0}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Punições:</span>
            <Badge variant="destructive" className="text-lg">
              {score?.penalties || 0}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}