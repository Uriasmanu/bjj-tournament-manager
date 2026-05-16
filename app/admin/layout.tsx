import Link from "next/link"
import { Home, Users, Layers, Zap, BarChart3, LogOut } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-[#f0c844] transition-colors">
            <span className="text-2xl">🏆</span>
            <span className="font-bold">BJJ Manager</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={Home} label="Dashboard" href="/admin" />
          <NavItem icon={Users} label="Atletas" href="/admin/athletes" />
          <NavItem icon={Layers} label="Categorias" href="/admin/categories" />
          <NavItem icon={Zap} label="Lutas" href="/admin/matches" />
          <NavItem icon={BarChart3} label="Relatórios" href="/admin/reports" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#4338CA] rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavItem({ icon: Icon, label, href }: { icon: React.ComponentType; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#4338CA] rounded-lg transition-colors">
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  )
}
