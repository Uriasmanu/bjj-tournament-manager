export type Belt =
  | 'WHITE' | 'GRAY' | 'YELLOW' | 'ORANGE' | 'GREEN'
  | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK';

export type BeltReferee =
  | 'PURPLE' | 'BROWN' | 'BLACK';

export interface Competitor {
  id: string;
  name: string;
  team: string;
  weight: number;
  dateBirth: string;
  belt: Belt;
  coach: string | null;
  registrationDate: string;
  isActive: boolean;
}

export interface Referee {
  id: string;
  name: string;
  city: string;
  beltReferee: BeltReferee;
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

export const beltLabelsReferee: Record<BeltReferee, string> = {
  PURPLE: 'Roxa',
  BROWN: 'Marrom',
  BLACK: 'Preta',
};

export type BracketStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'FINISHED';

export interface MatchScore {
  competitorId: string | null;
  points: number;
  advantages: number;
  penalties: number;
  submission: boolean;
}

export interface Match {
  id: string;
  fighter1: string | null;
  fighter2: string | null;
  score1: MatchScore | null;
  score2: MatchScore | null;
  winnerId: string | null;
  round: number;
  finished: boolean;
  dependsOn?:
    | { matchId: string; type: 'WINNER' | 'LOSER' }
    | { matchId: string; type: 'WINNER' | 'LOSER' }[];
}

export interface BracketWinners {
  quarter_left_0?: string;
  quarter_left_1?: string;
  quarter_left_2?: string;
  quarter_left_3?: string;
  quarter_right_0?: string;
  quarter_right_1?: string;
  quarter_right_2?: string;
  quarter_right_3?: string;
  semi_left_0?: string;
  semi_left_1?: string;
  semi_right_0?: string;
  semi_right_1?: string;
  final_left?: string;
  final_right?: string;
  [key: string]: string | undefined;
}

export interface BracketPodium {
  first?: string;
  second?: string;
  third?: string;
}

export interface Bracket {
  id: string;
  title: string;
  belt: string;
  competitors: Competitor[];
  matches: Match[];
  status: BracketStatus;
  refereeId: string | null;
  areaId: string | null;
  createdAt: string;
  winners?: BracketWinners;
  podium?: BracketPodium;
  placements?: BracketPlacement[];
  metadata?: {
    totalCompetitors: number;
    weightRange: {
      min: number;
      max: number;
    };
    hasBye: boolean;
  };
}

export interface BracketPlacement {
  competitorId: string;
  position: number;
}