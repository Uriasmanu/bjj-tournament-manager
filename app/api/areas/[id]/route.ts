import { NextRequest, NextResponse } from 'next/server';
import { readAreas, writeAreas, readReferees } from '@/lib/storage';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await request.json();

  const data = await readAreas();
  const index = data.areas.findIndex((area) => area.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Área não encontrada' }, { status: 404 });
  }

  const updatedArea = { ...data.areas[index] };

  if (body.name) {
    const duplicate = data.areas.some(
      (area) =>
        area.id !== id && area.name.toLowerCase() === body.name.toLowerCase()
    );
    if (duplicate) {
      return NextResponse.json(
        { error: 'Já existe outra área com este nome' },
        { status: 400 }
      );
    }
    updatedArea.name = body.name;
  }

  if (body.refereeId !== undefined) {
    if (body.refereeId !== null) {
      const refereesData = await readReferees();
      const referee = refereesData.referees.find(
        (r) => r.id === body.refereeId && r.isActive
      );
      if (!referee) {
        return NextResponse.json(
          { error: 'Árbitro principal não encontrado ou inativo' },
          { status: 400 }
        );
      }
    }
    updatedArea.refereeId = body.refereeId;
  }

  if (body.assistantRefereeId !== undefined) {
    if (body.assistantRefereeId !== null) {
      const refereesData = await readReferees();
      const assistant = refereesData.referees.find(
        (r) => r.id === body.assistantRefereeId && r.isActive
      );
      if (!assistant) {
        return NextResponse.json(
          { error: 'Árbitro assistente não encontrado ou inativo' },
          { status: 400 }
        );
      }
    }
    updatedArea.assistantRefereeId = body.assistantRefereeId;
  }

  if (body.currentMatchId !== undefined) {
    updatedArea.currentMatchId = body.currentMatchId;
  }

  if (body.scheduledMatches !== undefined) {
    updatedArea.scheduledMatches = body.scheduledMatches;
    updatedArea.bracketCount = body.scheduledMatches.length;
  }

  data.areas[index] = updatedArea;

  await writeAreas(data);

  return NextResponse.json(updatedArea);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const data = await readAreas();
  const index = data.areas.findIndex((area) => area.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Área não encontrada' }, { status: 404 });
  }

  const area = data.areas[index];
  if (area.currentMatchId || area.scheduledMatches.length > 0) {
    return NextResponse.json(
      {
        error:
          'Não é possível excluir área com luta ativa ou lutas agendadas. Remova ou realoque antes de excluir.',
      },
      { status: 400 }
    );
  }

  data.areas.splice(index, 1);
  await writeAreas(data);

  return NextResponse.json({ message: 'Área excluída com sucesso' });
}
