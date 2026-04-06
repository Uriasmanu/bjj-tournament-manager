// src/app/api/competitors/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readCompetitors, writeCompetitors } from '@/lib/storage';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const data = await readCompetitors();
  
  const index = data.competitors.findIndex(c => c.id === params.id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Competidor não encontrado' }, { status: 404 });
  }

  // Check for duplicate name + team (excluding current)
  const exists = data.competitors.some(
    c => c.name === body.name && c.team === body.team && c.id !== params.id && c.isActive
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
    age: body.age,
    belt: body.belt,
    coach: body.coach || null,
  };

  await writeCompetitors(data);
  return NextResponse.json(data.competitors[index]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await readCompetitors();
  const index = data.competitors.findIndex(c => c.id === params.id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Competidor não encontrado' }, { status: 404 });
  }

  // Soft delete
  data.competitors[index].isActive = false;
  await writeCompetitors(data);
  
  return NextResponse.json({ success: true });
}