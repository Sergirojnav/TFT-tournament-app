import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CalendarDays, MapPin, Eye, Trophy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function MatchesPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const resolvedParams = await params
  const { tournamentId } = resolvedParams

  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      team_a:teams!matches_team_a_id_fkey(name, logo_url),
      team_b:teams!matches_team_b_id_fkey(name, logo_url)
    `)
    .eq("tournament_id", tournamentId)
    .order("match_date", { ascending: false })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Partidos del Torneo</h1>
        <p className="text-muted-foreground">Historial completo de todos los partidos</p>
      </div>

      <div className="grid gap-6">
        {matches && matches.length > 0 ? (
          matches.map((match) => (
            <Link key={match.id} href={`/tournaments/${tournamentId}/matches/${match.id}`}>
              <Card className="bg-card/80 backdrop-blur-lg border border-primary/30 shadow-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 hover:border-primary/40 group overflow-hidden relative">
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-card/60 backdrop-blur-xl border border-primary/20">
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          {new Date(match.match_date).toLocaleDateString("es-ES", {
                            weekday: "short",
                          })}
                        </span>
                        <p className="text-sm font-semibold">
                          {new Date(match.match_date).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {match.location && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 backdrop-blur-xl border border-primary/20">
                          <MapPin className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium">{match.location}</span>
                        </div>
                      )}
                      <div className="p-2 rounded-full bg-card/60 backdrop-blur-xl border border-primary/20 group-hover:bg-primary/20 transition-colors">
                        <Eye className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <div className="flex items-center justify-between gap-4">
                    {/* Equipo A */}
                    <div className="flex-1 flex items-center justify-end gap-4">
                      <div className="text-right">
                        <p className="font-bold text-xl tracking-tight">{match.team_a?.name}</p>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Local</span>
                      </div>
                      {match.team_a?.logo_url ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                          <Image
                            src={match.team_a.logo_url || "/placeholder.svg"}
                            alt={match.team_a?.name || ""}
                            width={56}
                            height={56}
                            className="relative h-14 w-14 rounded-full object-cover border-2 border-primary/30 shadow-lg"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/30 shadow-lg">
                          <Trophy className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Marcador - Reemplazando glass-card con clases nativas */}
                    <div className="px-8 py-6 bg-card/80 backdrop-blur-lg border border-primary/30 shadow-xl rounded-xl min-w-[160px]">
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-4xl font-black sport-gradient-text tracking-tight">
                          {match.team_a_score || 0}
                        </span>
                        <span className="text-2xl font-bold text-muted-foreground/50">-</span>
                        <span className="text-4xl font-black sport-gradient-text-orange tracking-tight">
                          {match.team_b_score || 0}
                        </span>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                          Final
                        </span>
                      </div>
                    </div>

                    {/* Equipo B */}
                    <div className="flex-1 flex items-center gap-4">
                      {match.team_b?.logo_url ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full" />
                          <Image
                            src={match.team_b.logo_url || "/placeholder.svg"}
                            alt={match.team_b?.name || ""}
                            width={56}
                            height={56}
                            className="relative h-14 w-14 rounded-full object-cover border-2 border-secondary/30 shadow-lg"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center border-2 border-secondary/30 shadow-lg">
                          <Trophy className="h-6 w-6 text-secondary" />
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-bold text-xl tracking-tight">{match.team_b?.name}</p>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Visitante</span>
                      </div>
                    </div>
                  </div>

                  {match.comments && (
                    <div className="mt-6 p-4 bg-card/80 backdrop-blur-lg border border-primary/10 rounded-lg shadow-xl">
                      <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        Comentarios
                      </p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{match.comments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="bg-card/80 backdrop-blur-lg border border-primary/30 shadow-xl">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-card/60 backdrop-blur-xl border border-primary/20">
                  <Trophy className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">No hay partidos registrados aún</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
