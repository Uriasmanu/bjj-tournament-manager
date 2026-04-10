
import { NextRequest, NextResponse } from 'next/server';
import { readreferees, writereferees } from '@/lib/storage';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const body = await request.json();
  const data = await readReferees();

  const index = data.referees.findIndex(r => r.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Competidor não encontrado' },
      { status: 404 }
    );
  }

  const exists = data.referees.some(
    r =>
      r.name === body.name &&
      r.team === body.team &&
      r.id !== id &&
      r.isActive
  );

  if (exists) {
    return NextResponse.json(
      { error: 'Já existe um competidor com este nome nesta equipe' },
      { status: 400 }
    );
  }

  data.referees[index] = {
    ...data.referees[index],
    name: body.name,
    team: body.team,
    weight: body.weight,
    age: body.age,
    belt: body.belt,
    coach: body.coach || null,
  };

  await writereferees(data);

  return NextResponse.json(data.referees[index]);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const data = await readreferees();
  const index = data.referees.findIndex(c => c.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Competidor não encontrado' },
      { status: 404 }
    );
  }

  data.referees[index].isActive = false;

  await writereferees(data);

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const data = await readreferees();
  const index = data.referees.findIndex(c => c.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Competidor não encontrado' },
      { status: 404 }
    );
  }

  const competitor = data.referees[index];

  const exists = data.referees.some(
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

  data.referees[index].isActive = true;

  await writereferees(data);

  return NextResponse.json({ success: true });
}