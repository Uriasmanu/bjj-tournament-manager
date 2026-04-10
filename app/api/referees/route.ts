
import { NextRequest, NextResponse } from 'next/server';
import { readreferees, writereferees } from '@/lib/storage';
import { Referee } from '@/types';


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const belt = searchParams.get('belt');
  const team = searchParams.get('team');
  const name = searchParams.get('name');
  const showInactive = searchParams.get('showInactive') === 'true';

  const data = await readreferees();
  let referees = data.referees;

  if (!showInactive) {
    referees = referees.filter(r => r.isActive);
  }

  if (belt) {
    referees = referees.filter(r => r.belt === belt);
  }

  if (team) {
    referees = referees.filter(r => 
      r.team.toLowerCase().includes(team.toLowerCase())
    );
  }

  if (name) {
    referees = referees.filter(r => 
      r.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  return NextResponse.json(referees);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = await readreferees();

  // Check for duplicate name + team
  const exists = data.referees.some(
   r => r.name === body.name && r.team === body.team && r.isActive
  );

  if (exists) {
    return NextResponse.json(
      { error: 'Já existe um competidor com este nome nesta equipe' },
      { status: 400 }
    );
  }

  const newreferees: Referee = {
    id: crypto.randomUUID(),
    name: body.name,
    team: body.team,
    weight: body.weight,
    age: body.age,
    belt: body.belt,
    coach: body.coach || null,
    registrationDate: new Date().toISOString(),
    isActive: true,
  };

  data.referees.push(newreferees);
  await writereferees(data);

  return NextResponse.json(newreferees, { status: 201 });
}