'use client'

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
  const trendValue = typeof trend === 'string' ? parseFloat(trend) : trend
  const isPositive = trendValue !== undefined && trendValue > 0

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-white border-slate-200 transition-all duration-300 group shadow-sm",
        "hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Container do ícone em Azul/Slate */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
            <Icon size={20} strokeWidth={2.5} />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {trend !== undefined && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] font-bold border-none px-2 py-0.5",
                  isPositive 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "bg-rose-50 text-rose-700"
                )}
              >
                {isPositive ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                {typeof trend === 'number' && trend > 0 ? `+${trend}%` : `${trend}`}
              </Badge>
            )}
            
            {status && (
              <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500 font-semibold uppercase tracking-wider px-2 py-0">
                {status}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {/* Título em cinza para hierarquia */}
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {title}
          </p>
          
          {/* Valor em preto sólido e sem itálico */}
          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            {value}
          </h3>

          {progress !== undefined && (
            <div className="pt-4">
              <div className="flex justify-between text-[10px] mb-1.5 font-bold text-slate-500 uppercase tracking-tighter">
                <span>Concluído</span>
                <span className="text-blue-600">{Math.round(progress * 100)}%</span>
              </div>
              {/* Barra de progresso Azul */}
              <Progress 
                value={progress * 100} 
                className="h-1.5 bg-slate-100 [&>div]:bg-blue-600" 
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}