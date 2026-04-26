// src/lib/areaUtils.ts
import { Area, ScheduledMatch } from '@/types';

/**
 * Verifica se uma área pode iniciar uma luta ativa
 */
export function canStartMatch(area: Area): { can: boolean; reason?: string } {
  if (area.currentMatchId) {
    return { can: false, reason: 'Área já possui uma luta ativa' };
  }

  if (!area.refereeId) {
    return { can: false, reason: 'Área precisa de árbitro principal para iniciar luta' };
  }

  return { can: true };
}

/**
 * Verifica se uma área pode ser excluída
 */
export function canDeleteArea(area: Area): { can: boolean; reason?: string } {
  if (area.currentMatchId) {
    return { can: false, reason: 'Área possui luta ativa' };
  }

  if (area.scheduledMatches.length > 0) {
    return { can: false, reason: 'Área possui lutas agendadas' };
  }

  return { can: true };
}

/**
 * Atualiza o bracketCount baseado na fila de lutas agendadas
 */
export function updateBracketCount(area: Area): Area {
  return {
    ...area,
    bracketCount: area.scheduledMatches.length,
  };
}

/**
 * Adiciona uma luta à fila de agendamento
 */
export function addScheduledMatch(
  area: Area,
  matchId: string,
  order?: number,
  estimatedTime?: string,
  isMarried: boolean = false
): Area {
  const newOrder = order ?? area.scheduledMatches.length + 1;

  const scheduledMatch: ScheduledMatch = {
    matchId,
    order: newOrder,
    estimatedTime,
    isMarried,
  };

  const updatedArea = {
    ...area,
    scheduledMatches: [...area.scheduledMatches, scheduledMatch],
  };

  return updateBracketCount(updatedArea);
}

/**
 * Remove uma luta da fila de agendamento
 */
export function removeScheduledMatch(area: Area, matchId: string): Area {
  const updatedArea = {
    ...area,
    scheduledMatches: area.scheduledMatches.filter(
      (match) => match.matchId !== matchId
    ),
  };

  return updateBracketCount(updatedArea);
}

/**
 * Avança para a próxima luta na fila
 */
export function advanceToNextMatch(area: Area): {
  area: Area;
  nextMatchId: string | null;
} {
  if (area.scheduledMatches.length === 0) {
    return { area, nextMatchId: null };
  }

  // Ordena por ordem e pega a primeira
  const sortedMatches = [...area.scheduledMatches].sort((a, b) => a.order - b.order);
  const nextMatch = sortedMatches[0];

  // Remove da fila e atualiza bracketCount
  const updatedArea = removeScheduledMatch(area, nextMatch.matchId);

  return {
    area: {
      ...updatedArea,
      currentMatchId: nextMatch.matchId,
    },
    nextMatchId: nextMatch.matchId,
  };
}

/**
 * Finaliza a luta atual e avança para a próxima
 */
export function finishCurrentMatch(area: Area): {
  area: Area;
  finishedMatchId: string | null;
  nextMatchId: string | null;
} {
  const finishedMatchId = area.currentMatchId;

  if (!finishedMatchId) {
    return { area, finishedMatchId: null, nextMatchId: null };
  }

  const { area: updatedArea, nextMatchId } = advanceToNextMatch({
    ...area,
    currentMatchId: null, // Remove a luta atual
  });

  return {
    area: updatedArea,
    finishedMatchId,
    nextMatchId,
  };
}

/**
 * Atribui uma luta diretamente a uma área (para lutas casadas ou emergenciais)
 */
export function assignMatchToArea(
  area: Area,
  matchId: string
): { area: Area; success: boolean; reason?: string } {
  const canStart = canStartMatch(area);
  if (!canStart.can) {
    return { area, success: false, reason: canStart.reason };
  }

  return {
    area: {
      ...area,
      currentMatchId: matchId,
    },
    success: true,
  };
}

/**
 * Reordena as lutas agendadas
 */
export function reorderScheduledMatches(
  area: Area,
  matchId: string,
  newOrder: number
): Area {
  const updatedMatches = area.scheduledMatches.map((match) => {
    if (match.matchId === matchId) {
      return { ...match, order: newOrder };
    }
    return match;
  });

  return {
    ...area,
    scheduledMatches: updatedMatches,
  };
}