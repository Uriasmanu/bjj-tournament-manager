import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const AREAS_FILE = join(process.cwd(), 'data', 'areas.json');

export async function POST(
  request: NextRequest,
  { params }: { params: { areaId: string } }
) {
  try {
    const { action, duration }: {
      action: 'start' | 'pause' | 'reset' | 'setDuration';
      duration?: number;
    } = await request.json();

    const areaId = params.areaId;

    // Ler dados atuais
    const areasData = JSON.parse(readFileSync(AREAS_FILE, 'utf-8'));

    const area = areasData.areas.find((a: any) => a.id === areaId);
    if (!area) {
      return NextResponse.json({ error: 'Área não encontrada' }, { status: 404 });
    }

    // Inicializar timer se não existir
    if (!area.timer) {
      area.timer = {
        elapsed: 0,
        isRunning: false,
        duration: 300, // 5 minutos padrão
        lastUpdate: Date.now(),
      };
    }

    const now = Date.now();

    switch (action) {
      case 'start':
        if (!area.timer.isRunning) {
          area.timer.isRunning = true;
          area.timer.lastUpdate = now;
        }
        break;

      case 'pause':
        if (area.timer.isRunning) {
          // Calcular tempo decorrido desde última atualização
          const timeDiff = Math.floor((now - area.timer.lastUpdate) / 1000);
          area.timer.elapsed += timeDiff;
          area.timer.isRunning = false;
        }
        break;

      case 'reset':
        area.timer.elapsed = 0;
        area.timer.isRunning = false;
        area.timer.lastUpdate = now;
        break;

      case 'setDuration':
        if (duration !== undefined && duration > 0) {
          area.timer.duration = duration;
        }
        break;
    }

    // Salvar dados
    writeFileSync(AREAS_FILE, JSON.stringify(areasData, null, 2));

    return NextResponse.json({
      success: true,
      timer: area.timer,
    });
  } catch (error) {
    console.error('Erro ao processar ação do timer:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { areaId: string } }
) {
  try {
    const areaId = params.areaId;

    // Ler dados atuais
    const areasData = JSON.parse(readFileSync(AREAS_FILE, 'utf-8'));

    const area = areasData.areas.find((a: any) => a.id === areaId);
    if (!area) {
      return NextResponse.json({ error: 'Área não encontrada' }, { status: 404 });
    }

    // Calcular tempo atual se timer estiver rodando
    let currentElapsed = area.timer?.elapsed || 0;
    if (area.timer?.isRunning) {
      const timeDiff = Math.floor((Date.now() - area.timer.lastUpdate) / 1000);
      currentElapsed += timeDiff;
    }

    return NextResponse.json({
      timer: {
        ...area.timer,
        elapsed: currentElapsed,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar timer:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}