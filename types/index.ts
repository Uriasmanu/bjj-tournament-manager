// src/types/index.ts
export type Belt = 
  | 'WHITE' | 'GRAY' | 'YELLOW' | 'ORANGE' | 'GREEN'
  | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK';

export interface Competitor {
  id: string;
  name: string;
  team: string;
  weight: number;
  age: number;
  belt: Belt;
  coach: string | null;
  registrationDate: string;
  isActive: boolean;
}

export interface Referee {
  id: string;
  name: string;
  belt: Belt;
  city: string;
  registrationDate: string;
  isActive: boolean;
}

export const beltColors: Record<Belt, string> = {
  WHITE: '#FFFFFF',
  GRAY: '#808080',
  YELLOW: '#FFD700',
  ORANGE: '#FFA500',
  GREEN: '#008000',
  BLUE: '#1E3A8A',
  PURPLE: '#800080',
  BROWN: '#8B4513',
  BLACK: '#000000',
};

export const beltLabels: Record<Belt, string> = {
  WHITE: 'Branca',
  GRAY: 'Cinza',
  YELLOW: 'Amarela',
  ORANGE: 'Laranja',
  GREEN: 'Verde',
  BLUE: 'Azul',
  PURPLE: 'Roxa',
  BROWN: 'Marrom',
  BLACK: 'Preta',
};