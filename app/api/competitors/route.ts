// src/app/api/competitors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readCompetitors, writeCompetitors } from '@/lib/storage';
import { Competitor } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const belt = searchParams.get('belt');
  const team = searchParams.get('team');
  const name = searchParams.get('name');
  const showInactive = searchParams.get('showInactive') === 'true';

  const data = await readCompetitors();
  let competitors = data.competitors;

  if (!showInactive) {
    competitors = competitors.filter(c => c.isActive);
  }

  if (belt) {
    competitors = competitors.filter(c => c.belt === belt);
  }

  if (team) {
    competitors = competitors.filter(c => 
      c.team.toLowerCase().includes(team.toLowerCase())
    );
  }

  if (name) {
    competitors = competitors.filter(c => 
      c.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  return NextResponse.json(competitors);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = await readCompetitors();

  // Check for duplicate name + team
  const exists = data.competitors.some(
    c => c.name === body.name && c.team === body.team && c.isActive
  );

  if (exists) {
    return NextResponse.json(
      { error: 'Já existe um competidor com este nome nesta equipe' },
      { status: 400 }
    );
  }

  const newCompetitor: Competitor = {
    id: crypto.randomUUID(),
    name: body.name,
    team: body.team,
    weight: body.weight,
    dateBirth: body.dateBirth,
    belt: body.belt,
    coach: body.coach || null,
    alreadyInBracket: false,
    registrationDate: new Date().toISOString(),
    isActive: true,
  };

  data.competitors.push(newCompetitor);
  await writeCompetitors(data);

  return NextResponse.json(newCompetitor, { status: 201 });
}