// src/app/api/competitors/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readCompetitors, writeCompetitors } from '@/lib/storage';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const body = await request.json();
  const data = await readCompetitors();

  const index = data.competitors.findIndex(c => c.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Competidor não encontrado' },
      { status: 404 }
    );
  }

  const exists = data.competitors.some(
    c =>
      c.name === body.name &&
      c.team === body.team &&
      c.id !== id &&
      c.isActive
  );

  if (exists) {
    return NextResponse.json(
      { error: 'Já existe um competidor com este nome nesta equipe' },
      { status: 400 }
    );
  }

  data.competitors[index] = {
    ...data.competitors[index],
    name: body.name,
    team: body.team,
    weight: body.weight,
    dateBirth: body.dateBirth,
    belt: body.belt,
    coach: body.coach || null,
  };

  await writeCompetitors(data);

  return NextResponse.json(data.competitors[index]);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const data = await readCompetitors();
  const index = data.competitors.findIndex(c => c.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Competidor não encontrado' },
      { status: 404 }
    );
  }

  data.competitors[index].isActive = false;

  await writeCompetitors(data);

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const data = await readCompetitors();
  const index = data.competitors.findIndex(c => c.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Competidor não encontrado' },
      { status: 404 }
    );
  }

  const competitor = data.competitors[index];

  const exists = data.competitors.some(
    c =>
      c.name === competitor.name &&
      c.team === competitor.team &&
      c.id !== id &&
      c.isActive
  );

  if (exists) {
    return NextResponse.json(
      { error: 'Já existe um competidor ativo com este nome nesta equipe' },
      { status: 400 }
    );
  }

  data.competitors[index].isActive = true;

  await writeCompetitors(data);

  return NextResponse.json({ success: true });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await readCompetitors();

  const competitor = data.competitors.find(c => c.id === id);

  if (!competitor) {
    return NextResponse.json(
      { error: 'Competidor não encontrado' },
      { status: 404 }
    );
  }

  // Retorna o objeto completo ou apenas { name, team } conforme sua necessidade
  return NextResponse.json(competitor);
}