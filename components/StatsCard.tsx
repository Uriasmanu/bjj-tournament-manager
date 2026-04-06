import React from 'react'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string | number
  status?: string
  progress?: number
  onClick?: () => void
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  status,
  progress,
  onClick,
  className
}: StatsCardProps) {
  // Converte trend para número para lógica de cores, se possível
  const trendValue = typeof trend === 'string' ? parseFloat(trend) : trend
  const isPositive = trendValue !== undefined && trendValue > 0

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-zinc-900/40 border-zinc-800 transition-all duration-300 group",
        "hover:border-bjj-gold/40 hover:bg-zinc-900/60 hover:shadow-lg hover:shadow-bjj-gold/5",
        onClick && "cursor-pointer active:scale-[0.97]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-5">
          <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-400 group-hover:text-bjj-gold transition-colors">
            <Icon size={20} />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {trend !== undefined && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] font-bold border-none",
                  isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                )}
              >
                {isPositive ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                {typeof trend === 'number' && trend > 0 ? `+${trend}%` : `${trend}`}
              </Badge>
            )}
            
            {status && (
              <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400 uppercase tracking-widest px-1.5 py-0">
                {status}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.1em]">
            {title}
          </p>
          <h3 className="text-3xl font-black text-white tracking-tight leading-none italic">
            {value}
          </h3>

          {progress !== undefined && (
            <div className="pt-3">
              <div className="flex justify-between text-[10px] mb-1 font-medium text-zinc-500">
                <span>Progresso</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <Progress value={progress * 100} className="h-1.5 bg-zinc-800" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}