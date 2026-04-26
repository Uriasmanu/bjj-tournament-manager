import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Edit,
  Trash2,
  Calendar,
  Users,
  Clock,
  Trophy,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { Area } from '@/types';

interface AreaCardProps {
  area: Area;
  onEdit: () => void;
  onDelete: () => void;
}

export function AreaCard({ area, onEdit, onDelete }: AreaCardProps) {
  const hasActiveMatch = !!area.currentMatchId;
  const hasReferee = !!area.refereeId;
  const scheduledCount = area.scheduledMatches.length;
  const hasScheduledMatches = scheduledCount > 0;

  const totalCapacity = Math.max(area.bracketCount, 1);
  const progressValue = hasActiveMatch ? 100 : (scheduledCount / totalCapacity) * 100;

  return (
    <Card className={`bg-white border border-gray-200 shadow-xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${hasActiveMatch ? 'ring-2 ring-green-500' : ''}`}>
      <CardHeader className="bg-gradient-to-r from-bjj-black to-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="p-1.5 bg-bjj-gold rounded">
              <Trophy className="w-4 h-4 text-bjj-black" />
            </div>
            {area.name}
          </CardTitle>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-gray-300 hover:text-white hover:bg-bjj-blue border-bjj-blue hover:border-bjj-blue"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={hasActiveMatch || hasScheduledMatches}
              className="text-gray-300 hover:text-white border-red-200 hover:bg-red-600 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasActiveMatch ? (
              <>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <Play className="w-3 h-3 mr-1" />
                  Luta Ativa
                </Badge>
                <span className="text-sm text-gray-600">
                  Match: {area.currentMatchId?.slice(0, 8)}...
                </span>
              </>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                <Pause className="w-3 h-3 mr-1" />
                Disponível
              </Badge>
            )}
          </div>

          <Badge variant="outline" className="text-gray-600 border-gray-300">
            {area.bracketCount} chaves
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Capacidade</span>
            <span className="text-gray-900 font-medium">
              {hasActiveMatch ? 'Em uso' : `${scheduledCount}/${area.bracketCount}`}
            </span>
          </div>
          <Progress
            value={progressValue}
            className="h-2"
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-bjj-blue" />
            <span className="text-sm font-semibold text-gray-900">Arbitragem</span>
          </div>

          {hasReferee ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <strong className="text-gray-900">Principal:</strong> {area.refereeId?.slice(0, 8)}...
              </div>
              {area.assistantRefereeId && (
                <div className="text-sm text-gray-600">
                  <strong className="text-gray-900">Assistente:</strong> {area.assistantRefereeId?.slice(0, 8)}...
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700 font-medium">
                Árbitro principal não atribuído
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-bjj-gold" />
            <span className="text-sm font-semibold text-gray-900">Programação</span>
          </div>

          {hasScheduledMatches ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <strong className="text-gray-900">{scheduledCount}</strong> lutas na fila
              </div>

              <div className="space-y-1">
                {area.scheduledMatches.slice(0, 3).map((match, index) => (
                  <div
                    key={match.matchId}
                    className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center text-xs">
                        {match.order}
                      </Badge>
                      <span className="text-gray-900 font-medium">
                        {match.matchId.slice(0, 8)}...
                      </span>
                      {match.isMarried && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          Casada
                        </Badge>
                      )}
                    </div>
                    {match.estimatedTime && (
                      <span className="text-gray-500">
                        ~{match.estimatedTime}
                      </span>
                    )}
                  </div>
                ))}

                {scheduledCount > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{scheduledCount - 3} lutas agendadas
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Nenhuma luta agendada
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-bjj-blue text-bjj-blue hover:bg-bjj-blue hover:text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Ver Agenda
          </Button>

          {hasActiveMatch && (
            <Button
              size="sm"
              className="flex-1 bg-bjj-gold text-bjj-black hover:bg-bjj-gold-dark hover:text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Ver Placar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}