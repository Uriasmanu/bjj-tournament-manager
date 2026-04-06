'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MenuCardProps {
  href: string
  title: string
  description: string
  icon: LucideIcon
  highlight?: boolean
  badge?: string
  status?: string
  actionLabel?: string
  className?: string
}

export function MenuCard({
  href,
  title,
  description,
  icon: Icon,
  highlight = false,
  badge,
  status,
  actionLabel = "Acessar",
  className
}: MenuCardProps) {
  return (
    <Link 
      href={href} 
      className={cn(
        "block h-full group outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl transition-all active:scale-[0.98]",
        className
      )}
    >
      <Card className={cn(
        "relative overflow-hidden h-full border-slate-200 bg-white transition-all duration-300",
        "hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1",
        highlight && "border-blue-200 bg-blue-50/30 ring-1 ring-blue-100"
      )}>
        
        {/* Indicador lateral para itens destacados */}
        {highlight && (
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
        )}

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-4">
            {/* Container do Ícone: Azul quando em foco ou hover */}
            <div className={cn(
              "p-2.5 rounded-lg transition-all duration-300",
              highlight 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                : "bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white"
            )}>
              <Icon size={22} strokeWidth={2.5} />
            </div>
            
            {/* Badges e Status com cores suaves */}
            <div className="flex flex-col items-end gap-2">
              {badge && (
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px] uppercase tracking-wider font-bold"
                >
                  {badge}
                </Badge>
              )}
              {status && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-200">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    {status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Título: Forte e em Preto */}
          <CardTitle className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
            {title}
          </CardTitle>

          {/* Descrição: Cinza para hierarquia visual */}
          <CardDescription className="text-slate-500 text-sm leading-relaxed mt-2 line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>

        {/* Rodapé do Card com Action Label */}
        <CardContent>
          <div className="flex items-center text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-all duration-300">
            <span>{actionLabel}</span>
            <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}