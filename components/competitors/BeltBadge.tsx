// src/components/competitors/BeltBadge.tsx
'use client';

import { Belt, beltColors, beltLabels } from '@/types';
import { Badge } from '@/components/ui/badge';

interface BeltBadgeProps {
  belt: Belt;
}

export function BeltBadge({ belt }: BeltBadgeProps) {
  const getBeltColor = () => {
    const color = beltColors[belt];
    if (belt === 'WHITE') return 'bg-white text-black border-gray-300';
    if (belt === 'BLACK') return 'bg-black text-white';
    return `bg-[${color}] text-white`;
  };

  return (
    <Badge className={`${getBeltColor()} font-medium`}>
      {beltLabels[belt]}
    </Badge>
  );
}