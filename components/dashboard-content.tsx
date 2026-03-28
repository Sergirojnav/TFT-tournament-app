"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Plus, Users, Calendar, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Tournament {
  id: string
  name: string
  type: string
  status: string
  created_at: string
  tournament_teams: Array<{ count: number }>
}

interface Profile {
  id: string
  email: string
  role: string
}

export function DashboardContent({
  tournaments,
  profile,
  isAdmin,
}: { tournaments: Tournament[]; profile: Profile | null; isAdmin: boolean }) {
  const handleDeleteTournament = async (tournamentId: string, tournamentName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el torneo "${tournamentName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        alert(`Error: ${data.error}`)
        return
      }

      window.location.reload()
    } catch (error) {
      console.error("Error deleting tournament:", error)
      alert("Error al eliminar el torneo")
    }
  }

  return (
    <div
      className="min-h-screen bg-background relative"
      style={{
        backgroundImage: "url('/images/2.png')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-border bg-card/60 backdrop-blur-xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/20">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Waterpolo Pro</h1>
                  <p className="text-sm text-muted-foreground">Sistema de Gestión de Torneos</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  {isAdmin && (
                    <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary border-primary/20">
                      Administrador
                    </Badge>
                  )}
                </div>
                <form action="/auth/sign-out" method="post">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-transparent"
                  >
                    Cerrar Sesión
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Mis Torneos
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Selecciona un torneo para gestionar partidos y estadísticas
              </p>
            </div>
            {isAdmin && (
              <Link href="/tournaments/create">
                <Button
                  size="lg"
                  className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Crear Torneo
                </Button>
              </Link>
            )}
          </div>

          {tournaments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <Trophy className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No hay torneos creados</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">
                  {isAdmin
                    ? "Crea tu primer torneo para comenzar a gestionar partidos y estadísticas"
                    : "No hay torneos disponibles. Contacta con un administrador."}
                </p>
                {isAdmin && (
                  <Link href="/tournaments/create">
                    <Button size="lg" className="gap-2">
                      <Plus className="h-5 w-5" />
                      Crear Primer Torneo
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="relative group">
                  <Link href={`/tournaments/${tournament.id}`}>
                    <Card className="h-full card-hover cursor-pointer overflow-hidden border-border bg-card">
                      <div
                        className={`h-2 ${
                          tournament.status === "active"
                            ? "gradient-primary"
                            : tournament.status === "finished"
                              ? "bg-muted"
                              : "gradient-secondary"
                        }`}
                      />
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{tournament.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {tournament.type === "league" ? "Liga" : "Torneo por Grupos"}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              tournament.status === "active"
                                ? "default"
                                : tournament.status === "finished"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {tournament.status === "active"
                              ? "Activo"
                              : tournament.status === "finished"
                                ? "Finalizado"
                                : "Borrador"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">
                              {tournament.tournament_teams[0]?.count || 0} equipos
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">
                              {new Date(tournament.created_at).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        handleDeleteTournament(tournament.id, tournament.name)
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-background/80 backdrop-blur-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
