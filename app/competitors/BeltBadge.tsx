// src/components/competitors/BeltBadge.tsx
'use client';

import { Belt, beltColors, beltLabels } from '@/types';
import { Badge } from '@/components/ui/badge';

interface BeltBadgeProps {
  belt: Belt;
}

export function BeltBadge({ belt }: BeltBadgeProps) {
  const getBeltStyles = () => {
    const colorMap: Record<Belt, { bg: string; text: string; border: string }> = {
      WHITE: { bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-300' },
      GRAY: { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-600' },
      YELLOW: { bg: 'bg-yellow-400', text: 'text-gray-900', border: 'border-yellow-500' },
      ORANGE: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
      GREEN: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' },
      BLUE: { bg: 'bg-blue-700', text: 'text-white', border: 'border-blue-800' },
      PURPLE: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' },
      BROWN: { bg: 'bg-amber-800', text: 'text-white', border: 'border-amber-900' },
      BLACK: { bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-950' },
    };

    return colorMap[belt];
  };

  const styles = getBeltStyles();

  return (
    <Badge 
      className={`
        ${styles.bg} 
        ${styles.text} 
        ${styles.border}
        font-medium 
        px-3 
        py-1 
        rounded-full 
        shadow-sm
        border
        transition-all
        duration-200
        hover:scale-105
        hover:shadow-md
      `}
    >
      <span className="flex items-center gap-1">
        
        {belt === 'WHITE' && '🥋'}
        {belt === 'BLUE' && '💙'}
        {belt === 'PURPLE' && '💜'}
        {belt === 'BROWN' && '🤎'}
        {belt === 'BLACK' && '🖤'}
        {beltLabels[belt]}
      </span>
    </Badge>
  );
}