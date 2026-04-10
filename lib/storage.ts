// src/lib/storage.ts
import { Competitor, Referee } from '@/types';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface CompetitorsData {
  competitors: Competitor[];
}

export interface RefereesData {
  referees: Referee[];
}

export async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readCompetitors(): Promise<CompetitorsData> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'competitors.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { competitors: [] };
  }
}

export async function writeCompetitors(data: CompetitorsData): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'competitors.json');
  const tempPath = path.join(DATA_DIR, 'competitors.json.tmp');
  
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, filePath);
}

export async function readReferees(): Promise<RefereesData> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'referees.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { referees: [] };
  }
}

export async function writereferees(data: RefereesData): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'referees.json');
  const tempPath = path.join(DATA_DIR, 'referees.json.tmp');
  
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, filePath);
}