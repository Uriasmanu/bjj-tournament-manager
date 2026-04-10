import { NextRequest, NextResponse } from 'next/server';
import { readReferees, writeReferees } from '@/lib/storage';
import { Referee, BeltReferee } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name');
  const city = searchParams.get('city');
  const belt = searchParams.get('beltReferee') as BeltReferee | null;
  const showInactive = searchParams.get('showInactive') === 'true';

  const data = await readReferees();
  let referees = data.referees;

  if (!showInactive) {
    referees = referees.filter(r => r.isActive);
  }

  if (name) {
    referees = referees.filter(r =>
      r.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (city) {
    referees = referees.filter(r =>
      r.city?.toLowerCase().includes(city.toLowerCase())
    );
  }

  if (belt) {
    referees = referees.filter(r => r.beltReferee === belt);
  }

  return NextResponse.json(referees);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const data = await readReferees();
  const referees = data.referees;

  if (!body.name || !body.beltReferee) {
    return NextResponse.json(
      { error: 'Nome e faixa são obrigatórios' },
      { status: 400 }
    );
  }

  const exists = referees.some(
    r => r.name.toLowerCase() === body.name.toLowerCase() && r.isActive
  );

  if (exists) {
    return NextResponse.json(
      { error: 'Já existe um árbitro com este nome' },
      { status: 400 }
    );
  }

  const newReferee: Referee = {
    id: crypto.randomUUID(),
    name: body.name,
    beltReferee: body.beltReferee,
    city: body.city || '',
    registrationDate: new Date().toISOString(),
    isActive: true,
  };

  data.referees.push(newReferee);
  await writeReferees(data);

  return NextResponse.json(newReferee, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const body = await request.json();

  if (!id) {
    return NextResponse.json(
      { error: 'ID é obrigatório' },
      { status: 400 }
    );
  }

  const data = await readReferees();
  const referees = data.referees;

  const index = referees.findIndex(r => r.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Árbitro não encontrado' },
      { status: 404 }
    );
  }

  referees[index] = {
    ...referees[index],
    name: body.name ?? referees[index].name,
    beltReferee: body.beltReferee ?? referees[index].beltReferee,
    city: body.city ?? referees[index].city,
  };

  await writeReferees(data);

  return NextResponse.json(referees[index]);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'ID é obrigatório' },
      { status: 400 }
    );
  }

  const data = await readReferees();
  const referees = data.referees;

  const index = referees.findIndex(r => r.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Árbitro não encontrado' },
      { status: 404 }
    );
  }

  // Soft delete - apenas desativa
  referees[index].isActive = false;

  await writeReferees(data);

  return NextResponse.json({ message: 'Árbitro desativado com sucesso' });
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const reactivate = searchParams.get('reactivate') === 'true';

  if (!id) {
    return NextResponse.json(
      { error: 'ID é obrigatório' },
      { status: 400 }
    );
  }

  const data = await readReferees();
  const referees = data.referees;

  const index = referees.findIndex(r => r.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Árbitro não encontrado' },
      { status: 404 }
    );
  }

  if (reactivate) {
    referees[index].isActive = true;
  }

  await writeReferees(data);

  return NextResponse.json({ message: 'Árbitro reativado com sucesso' });
}