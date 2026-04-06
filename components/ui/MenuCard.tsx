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
  /** Ícone do Lucide (componente, não elemento) */
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
  icon: Icon, // Renomeando para Icon (maiúsculo)
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
        "block h-full group outline-none focus-visible:ring-2 focus-visible:ring-bjj-gold rounded-xl transition-transform active:scale-[0.98]",
        className
      )}
    >
      <Card className={cn(
        "relative overflow-hidden h-full border-zinc-800 bg-zinc-900/40 backdrop-blur-sm transition-all duration-300",
        "hover:border-bjj-gold/40 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-bjj-gold/5",
        highlight && "ring-1 ring-bjj-gold/30 bg-zinc-900/90"
      )}>
        
        {/* Linha de destaque */}
        {highlight && (
          <div className="absolute top-0 left-0 w-1 h-full bg-bjj-gold shadow-[2px_0_15px_rgba(212,175,55,0.3)]" />
        )}

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-4">
            {/* Container do ícone - Agora Icon é usado diretamente como componente */}
            <div className={cn(
              "p-2.5 rounded-lg transition-all duration-500",
              highlight 
                ? "bg-bjj-gold text-black scale-110 rotate-3 shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
                : "bg-zinc-800 text-zinc-400 group-hover:text-bjj-gold group-hover:bg-bjj-gold/10 group-hover:scale-110"
            )}>
              <Icon size={24} />
            </div>
            
            {/* Badge e Status */}
            <div className="flex flex-col items-end gap-2">
              {badge && (
                <Badge 
                  variant="outline" 
                  className="bg-bjj-gold/10 border-bjj-gold/30 text-bjj-gold text-[10px] uppercase tracking-widest font-bold"
                >
                  {badge}
                </Badge>
              )}
              {status && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950/50 rounded-full border border-zinc-800/50">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tighter">
                    {status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Título */}
          <CardTitle className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">
            {title}
          </CardTitle>

          {/* Descrição */}
          <CardDescription className="text-zinc-400 text-sm leading-relaxed mt-2 line-clamp-2 group-hover:text-zinc-300 transition-colors">
            {description}
          </CardDescription>
        </CardHeader>

        {/* Ação */}
        <CardContent>
          <div className="flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-bjj-gold transition-all duration-300">
            <span className="relative">
              {actionLabel}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-bjj-gold transition-all duration-300 group-hover:w-full" />
            </span>
            <ChevronRight className="w-3.5 h-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}