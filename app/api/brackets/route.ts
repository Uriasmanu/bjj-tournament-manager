import { NextRequest, NextResponse } from 'next/server'
import { readBrackets, writeBrackets, readCompetitors } from '@/lib/storage'
import { Bracket } from '@/types'

export async function POST(request: NextRequest) {
    const body = await request.json()

    const { title, belt, competitorIds } = body

    if (!title || !belt || !competitorIds || competitorIds.length < 2) {
        return NextResponse.json(
            { error: 'Dados inválidos para gerar chave' },
            { status: 400 }
        )
    }

    const bracketsData = await readBrackets()
    const competitorsData = await readCompetitors()

    const selectedCompetitors = competitorsData.competitors.filter(c =>
        competitorIds.includes(c.id) && c.isActive
    )

    if (selectedCompetitors.length < 2) {
        return NextResponse.json(
            { error: 'Competidores inválidos ou inativos' },
            { status: 400 }
        )
    }

    const weights = selectedCompetitors.map(c => c.weight)
    const weightMin = Math.min(...weights)
    const weightMax = Math.max(...weights)

    const label = `${belt} - ${weightMin}kg a ${weightMax}kg`

    const newBracket: Bracket = {
        id: crypto.randomUUID(),
        title,
        belt,

        competitors: competitorIds,
        matches: [],

        status: 'PENDING',
        refereeId: null,
        areaId: null,

        createdAt: new Date().toISOString()
    }

    bracketsData.brackets.push(newBracket)

    await writeBrackets(bracketsData)

    return NextResponse.json(newBracket, { status: 201 })
}