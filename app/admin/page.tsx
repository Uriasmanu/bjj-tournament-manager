import Link from "next/link"
import { Users, Layers, Zap, BarChart3, Plus } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Painel Administrativo</h1>
        <p className="text-gray-400">Gerencie sua competição de Jiu-Jitsu</p>
      </div>

      {/* Quick Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <QuickActionCard
          icon={Users}
          title="Atletas"
          description="Gerenciar atletas"
          href="/admin/athletes"
          count={0}
        />
        <QuickActionCard
          icon={Layers}
          title="Categorias"
          description="Gerenciar categorias"
          href="/admin/categories"
          count={0}
        />
        <QuickActionCard
          icon={Zap}
          title="Lutas"
          description="Gerenciar lutas"
          href="/admin/matches"
          count={0}
        />
        <QuickActionCard
          icon={BarChart3}
          title="Relatórios"
          description="Ver relatórios"
          href="/admin/reports"
          count={0}
        />
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#4338CA] to-[#5a47e8] rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Bem-vindo ao BJJ Tournament Manager</h2>
        <p className="text-gray-100 mb-6">
          Este é o seu painel administrativo onde você pode gerenciar todos os aspectos da sua competição.
        </p>
        <div className="flex gap-4">
          <Link href="/admin/athletes" className="bg-white text-[#4338CA] hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold transition-colors">
            Começar com Atletas
          </Link>
          <Link href="/" className="border border-white hover:bg-white hover:text-[#4338CA] px-6 py-2 rounded-lg font-semibold transition-colors">
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  count,
}: {
  icon: React.ComponentType
  title: string
  description: string
  href: string
  count: number
}) {
  return (
    <Link href={href}>
      <div className="bg-white bg-opacity-5 border border-gray-700 hover:border-[#4338CA] rounded-lg p-6 cursor-pointer transition-all hover:bg-opacity-10">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8 text-[#4338CA]" />
          <span className="text-2xl font-bold text-white">{count}</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </Link>
  )
}
