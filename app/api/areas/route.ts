import { NextRequest, NextResponse } from 'next/server';
import { readAreas, writeAreas, readReferees } from '@/lib/storage';
import { Area, BeltReferee } from '@/types';
import { updateBracketCount } from '@/lib/areaUtils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  const data = await readAreas();
  let areas = data.areas;

  if (name) {
    areas = areas.filter((area) =>
      area.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  return NextResponse.json(areas);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name) {
    return NextResponse.json(
      { error: 'Nome da área é obrigatório' },
      { status: 400 }
    );
  }

  const data = await readAreas();

  const exists = data.areas.some(
    (area) => area.name.toLowerCase() === body.name.toLowerCase()
  );

  if (exists) {
    return NextResponse.json(
      { error: 'Já existe uma área com este nome' },
      { status: 400 }
    );
  }

  let refereeId = body.refereeId ?? null;
  let assistantRefereeId = body.assistantRefereeId ?? null;

  if (refereeId || assistantRefereeId) {
    const refereesData = await readReferees();

    if (refereeId) {
      const referee = refereesData.referees.find(
        (r) => r.id === refereeId && r.isActive
      );
      if (!referee) {
        return NextResponse.json(
          { error: 'Árbitro principal não encontrado ou inativo' },
          { status: 400 }
        );
      }
    }

    if (assistantRefereeId) {
      const assistant = refereesData.referees.find(
        (r) => r.id === assistantRefereeId && r.isActive
      );
      if (!assistant) {
        return NextResponse.json(
          { error: 'Árbitro assistente não encontrado ou inativo' },
          { status: 400 }
        );
      }
    }
  }

  const newArea: Area = {
    id: crypto.randomUUID(),
    name: body.name,
    currentMatchId: null,
    scheduledMatches: [],
    refereeId,
    assistantRefereeId,
    bracketCount: 0,
  };

  data.areas.push(newArea);
  await writeAreas(data);

  return NextResponse.json(newArea, { status: 201 });
}
