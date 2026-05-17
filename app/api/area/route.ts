import { NextRequest, NextResponse } from "next/server"
import { writeFile, readFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"

const DATA_DIR = join(process.cwd(), "data")

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
}

function getAreaFilePath(areaName: string): string {
  const safeName = areaName.toLowerCase().replace(/[^a-z0-9]/g, "-")
  return join(DATA_DIR, `${safeName}.json`)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const area = searchParams.get("area")

  if (!area) {
    return NextResponse.json({ error: "Area name is required" }, { status: 400 })
  }

  try {
    await ensureDataDir()
    const filePath = getAreaFilePath(area)
    
    try {
      const data = await readFile(filePath, "utf-8")
      return NextResponse.json(JSON.parse(data))
    } catch {
      return NextResponse.json({ area, chaves: [], criadoEm: new Date().toISOString() })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to read area data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { area, chaves } = body

    if (!area) {
      return NextResponse.json({ error: "Area name is required" }, { status: 400 })
    }

    await ensureDataDir()
    const filePath = getAreaFilePath(area)
    
    const dados = {
      area,
      chaves: chaves || [],
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }

    await writeFile(filePath, JSON.stringify(dados, null, 2), "utf-8")
    
    return NextResponse.json({ success: true, message: "Area saved successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save area data" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { area, chaves } = body

    if (!area) {
      return NextResponse.json({ error: "Area name is required" }, { status: 400 })
    }

    await ensureDataDir()
    const filePath = getAreaFilePath(area)
    
    let existingData = { area, chaves: [], criadoEm: new Date().toISOString() }
    
    try {
      const existing = await readFile(filePath, "utf-8")
      existingData = JSON.parse(existing)
    } catch {
      // File doesn't exist, use defaults
    }

    const dados = {
      ...existingData,
      chaves: chaves || existingData.chaves,
      atualizadoEm: new Date().toISOString()
    }

    await writeFile(filePath, JSON.stringify(dados, null, 2), "utf-8")
    
    return NextResponse.json({ success: true, message: "Area updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update area data" }, { status: 500 })
  }
}