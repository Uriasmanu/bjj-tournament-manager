import { useState, useEffect, useCallback } from 'react';
import { Match, MatchScore, ScoreAction, Competitor, Referee, Area } from '@/types';

interface FighterData {
  id: string;
  name: string;
  weight: number;
  coach: string;
}

interface UseScoreboardReturn {
  match: Match | null;
  area: Area | null;
  fighters: [FighterData | null, FighterData | null];
  referee: Referee | null;
  loading: boolean;
  error: string | null;
  addPoints: (fighter: 1 | 2, points: 2 | 3 | 4) => void;
  addAdvantage: (fighter: 1 | 2) => void;
  addPenalty: (fighter: 1 | 2) => void;
  undo: () => void;
  finishMatch: (winnerId: string, reason: 'points' | 'submission') => Promise<void>;
  loadMatch: (areaId: string) => Promise<void>;
}

export function useScoreboard(): UseScoreboardReturn {
  const [match, setMatch] = useState<Match | null>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [fighters, setFighters] = useState<[FighterData | null, FighterData | null]>([null, null]);
  const [referee, setReferee] = useState<Referee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionHistory, setActionHistory] = useState<ScoreAction[]>([]);

  const loadMatch = useCallback(async (areaId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Buscar área
      const areaResponse = await fetch(`/api/areas/${areaId}`);
      if (!areaResponse.ok) {
        throw new Error('Área não encontrada');
      }
      const areaData = await areaResponse.json();
      setArea(areaData);

      if (!areaData.currentMatchId) {
        setMatch(null);
        setFighters([null, null]);
        setReferee(null);
        return;
      }

      // Buscar árbitro se existir
      if (areaData.refereeId) {
        const refereeResponse = await fetch('/api/referees');
        if (refereeResponse.ok) {
          const refereesData = await refereeResponse.json();
          const refereeData = refereesData.find((r: Referee) => r.id === areaData.refereeId);
          setReferee(refereeData || null);
        }
      }

      // Buscar brackets para encontrar a luta
      const bracketsResponse = await fetch('/api/brackets');
      if (!bracketsResponse.ok) {
        throw new Error('Erro ao buscar chaves');
      }
      const bracketsData = await bracketsResponse.json();

      let foundMatch: Match | null = null;
      let bracketCompetitors: Competitor[] = [];

      for (const bracket of bracketsData.brackets) {
        const matchInBracket = bracket.matches.find((m: Match) => m.id === areaData.currentMatchId);
        if (matchInBracket) {
          foundMatch = matchInBracket;
          bracketCompetitors = bracket.competitors;
          break;
        }
      }

      if (!foundMatch) {
        throw new Error('Luta não encontrada');
      }

      setMatch(foundMatch);

      // Buscar dados dos lutadores
      const fighter1 = bracketCompetitors.find(c => c.id === foundMatch.fighter1);
      const fighter2 = bracketCompetitors.find(c => c.id === foundMatch.fighter2);

      setFighters([
        fighter1 ? {
          id: fighter1.id,
          name: fighter1.name,
          weight: fighter1.weight,
          coach: fighter1.coach || '',
        } : null,
        fighter2 ? {
          id: fighter2.id,
          name: fighter2.name,
          weight: fighter2.weight,
          coach: fighter2.coach || '',
        } : null,
      ]);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPoints = useCallback(async (fighter: 1 | 2, points: 2 | 3 | 4) => {
    if (!match || !area) return;

    try {
      const response = await fetch(`/api/scoreboard/${area.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addPoints',
          fighterIndex: fighter,
          points,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Atualizar match com dados retornados
        setMatch(prev => prev ? { ...prev, scores: data.bracket.scores } : null);
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao adicionar pontos');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  }, [match, area]);

  const addAdvantage = useCallback(async (fighter: 1 | 2) => {
    if (!match || !area) return;

    try {
      const response = await fetch(`/api/scoreboard/${area.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addAdvantage',
          fighterIndex: fighter,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMatch(prev => prev ? { ...prev, scores: data.bracket.scores } : null);
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao adicionar vantagem');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  }, [match, area]);

  const addPenalty = useCallback(async (fighter: 1 | 2) => {
    if (!match || !area) return;

    try {
      const response = await fetch(`/api/scoreboard/${area.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addPenalty',
          fighterIndex: fighter,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMatch(prev => prev ? { ...prev, scores: data.bracket.scores } : null);
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao adicionar punição');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  }, [match, area]);

  const undo = useCallback(async () => {
    if (!area) return;

    try {
      const response = await fetch(`/api/scoreboard/${area.id}/score`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setMatch(prev => prev ? { ...prev, scores: data.bracket.scores } : null);
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao desfazer ação');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  }, [area]);

  const finishMatch = useCallback(async (winnerId: string, reason: 'points' | 'submission') => {
    if (!area) return;

    try {
      const response = await fetch(`/api/scoreboard/${area.id}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerId,
          reason,
        }),
      });

      if (response.ok) {
        // Recarregar dados após finalizar
        await loadMatch(area.id);
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao finalizar luta');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  }, [area, loadMatch]);

  return {
    match,
    area,
    fighters,
    referee,
    loading,
    error,
    addPoints,
    addAdvantage,
    addPenalty,
    undo,
    finishMatch,
    loadMatch,
  };
}