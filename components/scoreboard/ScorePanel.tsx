import { Card, CardContent } from '@/components/ui/card';
import { FighterCard } from './FighterCard';
import { TimerDisplay } from './TimerDisplay';
import { FighterData, Match } from '@/types';

interface ScorePanelProps {
  match: Match | null;
  fighters: [FighterData | null, FighterData | null];
  areaName: string;
  refereeName: string;
}

export function ScorePanel({ match, fighters, areaName, refereeName }: ScorePanelProps) {
  return (
    <Card className="w-full max-w-6xl mx-auto bg-black text-white border-2 border-bjj-gold">
      <CardContent className="p-6">
        {/* Header com área e árbitro */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-bjj-gold mb-2">{areaName}</h2>
          <p className="text-gray-300">Árbitro: {refereeName || 'Não atribuído'}</p>
        </div>

        {/* Painel de pontuação */}
        <div className="flex items-center justify-between mb-6">
          {/* Lutador 1 */}
          <div className="flex-1">
            <FighterCard
              fighter={fighters[0]}
              score={match?.score1 || null}
              position="left"
            />
          </div>

          {/* Centro - VS e Timer */}
          <div className="flex flex-col items-center mx-8">
            <div className="text-4xl font-bold text-bjj-gold mb-4">VS</div>
            <TimerDisplay />
          </div>

          {/* Lutador 2 */}
          <div className="flex-1">
            <FighterCard
              fighter={fighters[1]}
              score={match?.score2 || null}
              position="right"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}