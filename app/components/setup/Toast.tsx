"use client"

import { CheckCircle, XCircle } from "lucide-react"

interface ToastProps {
  tipo: "sucesso" | "erro"
  mensagem: string
}

export function Toast({ tipo, mensagem }: ToastProps) {
  const isSucesso = tipo === "sucesso"
  const bgClass = isSucesso ? "bg-green-500/20 border-green-500" : "bg-red-500/20 border-red-500"
  const textClass = isSucesso ? "text-green-400" : "text-red-400"

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${bgClass} ${textClass} text-sm`}>
      {isSucesso ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <XCircle className="w-4 h-4" />
      )}
      {mensagem}
    </div>
  )
}

interface ToastProviderProps {
  toast: { tipo: "sucesso" | "erro"; mensagem: string } | null
}

export function ToastProvider({ toast }: ToastProviderProps) {
  if (!toast) return null
  return <Toast tipo={toast.tipo} mensagem={toast.mensagem} />
}