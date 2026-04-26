import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const AREAS_FILE = join(process.cwd(), 'data', 'areas.json');
const BRACKETS_FILE = join(process.cwd(), 'data', 'brackets.json');

export async function POST(
  request: NextRequest,
  { params }: { params: { areaId: string } }
) {
  try {
    const { winnerId, reason }: {
      winnerId: string;
      reason: 'points' | 'submission';
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

    // Verificar se winnerId é válido
    if (winnerId !== bracket.fighter1?.id && winnerId !== bracket.fighter2?.id) {
      return NextResponse.json({ error: 'ID do vencedor inválido' }, { status: 400 });
    }

    // Finalizar bracket
    bracket.status = 'completed';
    bracket.winner = winnerId;
    bracket.finishedAt = new Date().toISOString();
    bracket.finishReason = reason;

    // Limpar luta atual da área
    area.currentMatchId = null;

    // Salvar dados
    writeFileSync(AREAS_FILE, JSON.stringify(areasData, null, 2));
    writeFileSync(BRACKETS_FILE, JSON.stringify(bracketsData, null, 2));

    return NextResponse.json({
      success: true,
      bracket: {
        id: bracket.id,
        winner: bracket.winner,
        status: bracket.status,
        finishedAt: bracket.finishedAt,
        finishReason: bracket.finishReason,
      },
    });
  } catch (error) {
    console.error('Erro ao finalizar luta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}