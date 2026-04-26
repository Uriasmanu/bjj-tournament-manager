import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ScoreAction } from '@/types';

const AREAS_FILE = join(process.cwd(), 'data', 'areas.json');
const BRACKETS_FILE = join(process.cwd(), 'data', 'brackets.json');

export async function POST(
  request: NextRequest,
  { params }: { params: { areaId: string } }
) {
  try {
    const { action, fighterIndex, points }: {
      action: 'addPoints' | 'addAdvantage' | 'addPenalty';
      fighterIndex: 1 | 2;
      points?: number;
    } = await request.json();

    const areaId = params.areaId;

    // Ler dados atuais
    const areasData = JSON.parse(readFileSync(AREAS_FILE, 'utf-8'));
    const bracketsData = JSON.parse(readFileSync(BRACKETS_FILE, 'utf-8'));

    const area = areasData.areas.find((a: any) => a.id === areaId);
    if (!area || !area.currentMatchId) {
      return NextResponse.json({ error: 'Área não encontrada ou sem luta ativa' }, { status: 404 });
    }

    const bracket = bracketsData.brackets.find((b: any) => b.id === area.currentMatchId);
    if (!bracket) {
      return NextResponse.json({ error: 'Luta não encontrada' }, { status: 404 });
    }

    // Aplicar ação
    const scoreAction: ScoreAction = {
      type: action,
      fighterIndex,
      timestamp: Date.now(),
      ...(points && { points }),
    };

    if (!bracket.scoreActions) {
      bracket.scoreActions = [];
    }
    bracket.scoreActions.push(scoreAction);

    // Atualizar scores baseado nas ações
    updateScoresFromActions(bracket);

    // Salvar dados
    writeFileSync(BRACKETS_FILE, JSON.stringify(bracketsData, null, 2));

    return NextResponse.json({
      success: true,
      bracket: {
        id: bracket.id,
        fighter1: bracket.fighter1,
        fighter2: bracket.fighter2,
        scores: bracket.scores,
        scoreActions: bracket.scoreActions,
      },
    });
  } catch (error) {
    console.error('Erro ao processar ação de pontuação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { areaId: string } }
) {
  try {
    const areaId = params.areaId;

    // Ler dados atuais
    const areasData = JSON.parse(readFileSync(AREAS_FILE, 'utf-8'));
    const bracketsData = JSON.parse(readFileSync(BRACKETS_FILE, 'utf-8'));

    const area = areasData.areas.find((a: any) => a.id === areaId);
    if (!area || !area.currentMatchId) {
      return NextResponse.json({ error: 'Área não encontrada ou sem luta ativa' }, { status: 404 });
    }

    const bracket = bracketsData.brackets.find((b: any) => b.id === area.currentMatchId);
    if (!bracket || !bracket.scoreActions || bracket.scoreActions.length === 0) {
      return NextResponse.json({ error: 'Nenhuma ação para desfazer' }, { status: 400 });
    }

    // Remover última ação
    bracket.scoreActions.pop();

    // Recalcular scores
    updateScoresFromActions(bracket);

    // Salvar dados
    writeFileSync(BRACKETS_FILE, JSON.stringify(bracketsData, null, 2));

    return NextResponse.json({
      success: true,
      bracket: {
        id: bracket.id,
        fighter1: bracket.fighter1,
        fighter2: bracket.fighter2,
        scores: bracket.scores,
        scoreActions: bracket.scoreActions,
      },
    });
  } catch (error) {
    console.error('Erro ao desfazer ação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

function updateScoresFromActions(bracket: any) {
  // Reset scores
  bracket.scores = {
    fighter1: { points: 0, advantages: 0, penalties: 0 },
    fighter2: { points: 0, advantages: 0, penalties: 0 },
  };

  // Recalcular baseado nas ações
  if (bracket.scoreActions) {
    bracket.scoreActions.forEach((action: ScoreAction) => {
      const fighterKey = action.fighterIndex === 1 ? 'fighter1' : 'fighter2';

      switch (action.type) {
        case 'addPoints':
          bracket.scores[fighterKey].points += action.points || 0;
          break;
        case 'addAdvantage':
          bracket.scores[fighterKey].advantages += 1;
          break;
        case 'addPenalty':
          bracket.scores[fighterKey].penalties += 1;
          break;
      }
    });
  }
}