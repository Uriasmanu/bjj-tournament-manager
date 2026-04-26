import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';
import { Area } from '@/types';

interface AreaScheduleSummaryProps {
  area: Area;
}

export function AreaScheduleSummary({ area }: AreaScheduleSummaryProps) {
  const sortedMatches = [...area.scheduledMatches].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Agenda - {area.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Luta atual */}
        {area.currentMatchId && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="bg-green-500">
                Luta Ativa
              </Badge>
            </div>
            <div className="text-sm">
              <strong>Match ID:</strong> {area.currentMatchId}
            </div>
          </div>
        )}

        {/* Próximas lutas */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Próximas Lutas ({sortedMatches.length})
          </h4>

          {sortedMatches.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Nenhuma luta agendada
            </p>
          ) : (
            <div className="space-y-2">
              {sortedMatches.slice(0, 5).map((match, index) => (
                <div
                  key={match.matchId}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                      {match.order}
                    </Badge>
                    <span className="text-sm font-medium">
                      Match {match.matchId}
                    </span>
                    {match.isMarried && (
                      <Badge variant="secondary" className="text-xs">
                        Casada
                      </Badge>
                    )}
                  </div>
                  {match.estimatedTime && (
                    <span className="text-sm text-gray-600">
                      ~{match.estimatedTime}
                    </span>
                  )}
                </div>
              ))}

              {sortedMatches.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{sortedMatches.length - 5} lutas agendadas
                </p>
              )}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {area.bracketCount}
            </div>
            <div className="text-sm text-gray-600">Total de Chaves</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {sortedMatches.length}
            </div>
            <div className="text-sm text-gray-600">Lutas na Fila</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}