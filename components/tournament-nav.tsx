"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trophy, Home, FileText, List, BarChart3, ArrowLeft, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Tournament {
  id: string
  name: string
  type: string
  status: string
}

export function TournamentNav({ tournament, isAdmin }: { tournament: Tournament; isAdmin?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { name: "Home", href: `/tournaments/${tournament.id}`, icon: Home },
    { name: "Match Report", href: `/tournaments/${tournament.id}/match-report`, icon: FileText },
    { name: "Partidos", href: `/tournaments/${tournament.id}/matches`, icon: List },
    { name: "Clasificación", href: `/tournaments/${tournament.id}/standings`, icon: Trophy },
    { name: "Estadísticas", href: `/tournaments/${tournament.id}/stats`, icon: BarChart3 },
  ]

  if (isAdmin) {
    navItems.push({
      name: "Admin",
      href: `/tournaments/${tournament.id}/admin`,
      icon: Settings,
    })
  }

  return (
    <nav className="border-b border-white/10 bg-card/80 backdrop-blur-lg shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 pl-2 border-r border-white/10 pr-4">
              <img src="/images/bwmf-logo.png" alt="Waterpolo Pro" className="h-8 w-8" />
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torneos
            </Button>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-cyan-400" />
              <span className="font-semibold text-foreground">{tournament.name}</span>
              <Badge variant={tournament.status === "active" ? "default" : "secondary"} className="sport-badge">
                {tournament.status === "active" ? "Activo" : "Borrador"}
              </Badge>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 ${isActive ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
