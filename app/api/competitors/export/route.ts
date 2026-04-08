// src/app/api/competitors/export/route.ts
import { NextResponse } from 'next/server';
import { readCompetitors } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const data = await readCompetitors();

    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
    const filename = `competidores_export_${timestamp}.json`;

    const jsonData = JSON.stringify(data, null, 2);

    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(jsonData).toString(),
      },
    });
  } catch (error) {
    console.error('Erro na exportação:', error);
    return NextResponse.json(
      { error: 'Erro interno ao exportar competidores' },
      { status: 500 }
    );
  }
}