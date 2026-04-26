import { NextRequest, NextResponse } from 'next/server';
import { readAreas, writeAreas } from '@/lib/storage';
import { advanceToNextMatch } from '@/lib/areaUtils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const data = await readAreas();
  const area = data.areas.find((entry) => entry.id === id);

  if (!area) {
    return NextResponse.json({ error: 'Área não encontrada' }, { status: 404 });
  }

  const result = advanceToNextMatch(area);

  // Atualiza no array
  const index = data.areas.findIndex((entry) => entry.id === id);
  data.areas[index] = result.area;

  await writeAreas(data);

  return NextResponse.json({
    ...result.area,
    nextMatchId: result.nextMatchId,
  });
}