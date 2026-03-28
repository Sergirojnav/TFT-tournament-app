"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Trophy, ArrowLeft, ArrowRight, Shuffle, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Step = "basic" | "teams" | "groups" | "complete"

interface Team {
  id: string
  name: string
  logo_url?: string
}

export function TournamentCreationFlow({ teams }: { teams: Team[] }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("basic")
  const [loading, setLoading] = useState(false)

  // Paso 1: Información básica
  const [tournamentName, setTournamentName] = useState("")
  const [tournamentType, setTournamentType] = useState<"league" | "groups">("groups")

  // Paso 2: Selección de equipos
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [searchTeam, setSearchTeam] = useState("")

  // Paso 3: Configuración de grupos
  const [numGroups, setNumGroups] = useState(2)
  const [groups, setGroups] = useState<{ [key: string]: string[] }>({})

  const handleCreateTournament = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Crear torneo
      const { data: tournament, error: tournamentError } = await supabase
        .from("tournaments")
        .insert({
          name: tournamentName,
          type: tournamentType,
          status: "active",
        })
        .select()
        .single()

      if (tournamentError) throw tournamentError

      // Añadir equipos al torneo
      const tournamentTeamsData = selectedTeams.map((teamId) => ({
        tournament_id: tournament.id,
        team_id: teamId,
      }))

      const { error: teamsError } = await supabase.from("tournament_teams").insert(tournamentTeamsData)

      if (teamsError) throw teamsError

      // Si es torneo por grupos, crear grupos
      if (tournamentType === "groups") {
        const groupEntries = Object.entries(groups)
        for (let i = 0; i < groupEntries.length; i++) {
          const [groupName, teamIds] = groupEntries[i]
          const { data: group, error: groupError } = await supabase
            .from("groups")
            .insert({
              tournament_id: tournament.id,
              name: groupName,
              order_number: i + 1, // Usar el índice + 1 como order_number (1, 2, 3, etc.)
            })
            .select()
            .single()

          if (groupError) throw groupError

          const groupMembersData = teamIds.map((teamId) => ({
            group_id: group.id,
            team_id: teamId,
          }))

          const { error: membersError } = await supabase.from("group_members").insert(groupMembersData)

          if (membersError) throw membersError
        }
      }

      setStep("complete")
      setTimeout(() => {
        router.push(`/tournaments/${tournament.id}`)
      }, 2000)
    } catch (error: any) {
  console.error("Error creating tournament:")
  console.error(JSON.stringify(error, null, 2))
  console.error(error)

  alert(error?.message || "Error al crear el torneo")
    } finally {
      setLoading(false)
    }
  }

  const distributeTeamsRandomly = () => {
    const shuffled = [...selectedTeams].sort(() => Math.random() - 0.5)
    const newGroups: { [key: string]: string[] } = {}

    for (let i = 0; i < numGroups; i++) {
      newGroups[`Grupo ${String.fromCharCode(65 + i)}`] = []
    }

    shuffled.forEach((teamId, index) => {
      const groupIndex = index % numGroups
      const groupName = `Grupo ${String.fromCharCode(65 + groupIndex)}`
      newGroups[groupName].push(teamId)
    })

    setGroups(newGroups)
  }

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchTeam.toLowerCase()))

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Crear Nuevo Torneo</h1>
            <p className="text-slate-600 dark:text-slate-400">
              {step === "basic" && "Paso 1: Información básica"}
              {step === "teams" && "Paso 2: Seleccionar equipos"}
              {step === "groups" && "Paso 3: Organizar grupos"}
              {step === "complete" && "Completado"}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="flex gap-2">
          {["basic", "teams", "groups"].map((s, i) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                s === step
                  ? "bg-blue-600"
                  : ["basic", "teams", "groups"].indexOf(step) > i
                    ? "bg-blue-400"
                    : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Paso 1: Información básica */}
      {step === "basic" && (
        <Card className="bg-card/80 backdrop-blur-lg border border-primary/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Información del Torneo</CardTitle>
            <CardDescription>Define el nombre y tipo de torneo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Torneo</Label>
              <Input
                id="name"
                placeholder="Ej: Liga Nacional 2025"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Tipo de Torneo</Label>
              <RadioGroup value={tournamentType} onValueChange={(v) => setTournamentType(v as any)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <RadioGroupItem value="league" id="league" />
                  <Label htmlFor="league" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Liga (Todos contra todos)</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Cada equipo juega contra todos los demás
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <RadioGroupItem value="groups" id="groups" />
                  <Label htmlFor="groups" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Torneo por Grupos</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Fase de grupos seguida de eliminatorias
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              className="w-full gradient-sport"
              size="lg"
              onClick={() => setStep("teams")}
              disabled={!tournamentName}
            >
              Siguiente: Seleccionar Equipos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paso 2: Selección de equipos */}
      {step === "teams" && (
        <Card className="bg-card/80 backdrop-blur-lg border border-primary/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Seleccionar Equipos Participantes</CardTitle>
            <CardDescription>
              {selectedTeams.length} de {teams.length} equipos seleccionados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar equipos..."
                value={searchTeam}
                onChange={(e) => setSearchTeam(e.target.value)}
                className="pl-10 h-12 bg-muted/50 border-primary/20 focus:border-primary/50"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 max-h-96 overflow-y-auto pr-2">
              {filteredTeams.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-muted-foreground">No se encontraron equipos</div>
              ) : (
                filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center space-x-3 p-4 border border-primary/20 rounded-lg hover:bg-primary/5 cursor-pointer transition-all"
                    onClick={() => {
                      setSelectedTeams((prev) =>
                        prev.includes(team.id) ? prev.filter((id) => id !== team.id) : [...prev, team.id],
                      )
                    }}
                  >
                    <Checkbox
                      checked={selectedTeams.includes(team.id)}
                      onCheckedChange={(checked) => {
                        setSelectedTeams((prev) => (checked ? [...prev, team.id] : prev.filter((id) => id !== team.id)))
                      }}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      {team.logo_url ? (
                        <img
                          src={team.logo_url || "/placeholder.svg"}
                          alt={team.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-sport text-white text-sm font-bold">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold">{team.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("basic")} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (tournamentType === "groups") {
                    setStep("groups")
                  } else {
                    handleCreateTournament()
                  }
                }}
                disabled={selectedTeams.length < 2}
              >
                {tournamentType === "groups" ? "Siguiente: Organizar Grupos" : "Crear Torneo"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 3: Configuración de grupos */}
      {step === "groups" && tournamentType === "groups" && (
        <Card className="bg-card/80 backdrop-blur-lg border border-primary/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Organizar Grupos</CardTitle>
            <CardDescription>
              Distribuye los {selectedTeams.length} equipos en {numGroups} grupo(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="num-groups">Número de Grupos</Label>
                <Input
                  id="num-groups"
                  type="number"
                  min={2}
                  max={8}
                  value={numGroups.toString()}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value) || 2
                    setNumGroups(value)
                    setGroups({})
                  }}
                  className="mt-2 h-12"
                />
              </div>
              <Button variant="outline" onClick={() => setGroups({})} className="bg-transparent">
                Organizar Manualmente
              </Button>
              <Button
                onClick={distributeTeamsRandomly}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Distribuir Aleatoriamente
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: numGroups }, (_, i) => {
                const groupName = `Grupo ${String.fromCharCode(65 + i)}`
                const groupTeams = groups[groupName] || []

                return (
                  <div key={groupName} className="space-y-3 p-4 rounded-lg border border-primary/20 bg-muted/30">
                    <div className="pb-3 border-b border-primary/20">
                      <h3 className="text-lg font-semibold">{groupName}</h3>
                      <p className="text-sm text-muted-foreground">{groupTeams.length} equipos</p>
                    </div>
                    <div className="space-y-2 min-h-40">
                      {teams
                        .filter((t) => groupTeams.includes(t.id))
                        .map((team) => (
                          <div
                            key={team.id}
                            className="flex items-center justify-between gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary/20 transition-all"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("teamId", team.id)
                              e.dataTransfer.setData("sourceGroup", groupName)
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault()
                              const teamId = e.dataTransfer.getData("teamId")
                              const sourceGroup = e.dataTransfer.getData("sourceGroup")

                              if (sourceGroup !== groupName) {
                                setGroups((prev) => ({
                                  ...prev,
                                  [sourceGroup]: prev[sourceGroup].filter((id) => id !== teamId),
                                  [groupName]: [...(prev[groupName] || []), teamId],
                                }))
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {team.logo_url ? (
                                <img
                                  src={team.logo_url || "/placeholder.svg"}
                                  alt={team.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-xs font-bold">
                                  {team.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className="text-sm font-medium">{team.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setGroups((prev) => ({
                                  ...prev,
                                  [groupName]: prev[groupName].filter((id) => id !== team.id),
                                }))
                              }}
                              className="h-6 w-6 p-0"
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      <div
                        className="flex items-center justify-center min-h-12 border-2 border-dashed border-primary/30 rounded-lg text-muted-foreground text-sm transition-all hover:border-primary/50 hover:bg-primary/5"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const teamId = e.dataTransfer.getData("teamId")
                          const sourceGroup = e.dataTransfer.getData("sourceGroup")

                          if (sourceGroup !== groupName) {
                            setGroups((prev) => ({
                              ...prev,
                              [sourceGroup]: prev[sourceGroup].filter((id) => id !== teamId),
                              [groupName]: [...(prev[groupName] || []), teamId],
                            }))
                          }
                        }}
                      >
                        Arrastra aquí
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("teams")} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button
                className="flex-1 gradient-sport"
                onClick={handleCreateTournament}
                disabled={loading || Object.values(groups).every((g) => g.length === 0)}
              >
                {loading ? "Creando..." : "Crear Torneo"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 4: Completado */}
      {step === "complete" && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Torneo Creado Exitosamente</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Redirigiendo al panel del torneo...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
