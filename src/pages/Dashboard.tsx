import { StatsCard } from "@/components/dashboard/StatsCard";
import { Hammer, CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-gradient-primary rounded-2xl p-8 text-white shadow-elevated">
        <h1 className="text-3xl font-bold mb-2">Bienvenue sur BTP SmartManager</h1>
        <p className="text-white/90 text-lg">Gérez vos chantiers avec intelligence artificielle</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Chantiers"
          value="24"
          change="↑ +3 ce mois"
          icon={Hammer}
          trend="up"
        />
        <StatsCard
          title="Chantiers Terminés"
          value="10"
          change="↑ +2"
          icon={CheckCircle2}
          trend="up"
        />
        <StatsCard
          title="En Cours"
          value="12"
          icon={Clock}
        />
        <StatsCard
          title="En Attente"
          value="2"
          icon={AlertCircle}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analyse des projets */}
        <Card className="lg:col-span-2 shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Analyse des Projets
            </CardTitle>
            <CardDescription>Progression moyenne : 74% terminés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-xl">
              <div className="text-center space-y-3">
                <div className="w-32 h-32 rounded-full bg-gradient-primary mx-auto flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">74%</span>
                </div>
                <p className="text-muted-foreground">Taux de réussite global</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="accent" className="w-full">
                Analyser via IA
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rappels & Actions */}
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Rappels & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-medium">Rendez-vous client Dupont</p>
              <p className="text-xs text-muted-foreground mt-1">Aujourd'hui à 14h00</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-medium">Devis à valider</p>
              <p className="text-xs text-muted-foreground mt-1">Chantier #348</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-medium">Livraison matériaux</p>
              <p className="text-xs text-muted-foreground mt-1">Demain matin</p>
            </div>
            <Button variant="outline" className="w-full mt-2">
              Démarrer la réunion
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Collaboration équipe & Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collaboration équipe */}
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Collaboration Équipe
            </CardTitle>
            <CardDescription>Membres actifs sur les chantiers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Pierre Martin", role: "Chef de chantier", status: "En cours", project: "Rénovation Dupont" },
              { name: "Marie Durand", role: "Plombier", status: "Terminé", project: "Installation chauffage" },
              { name: "Thomas Bernard", role: "Électricien", status: "En attente", project: "Mise aux normes" },
            ].map((member, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-semibold text-primary">{member.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <Badge variant={member.status === "En cours" ? "default" : member.status === "Terminé" ? "secondary" : "outline"}>
                  {member.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-3">
              + Ajouter membre
            </Button>
          </CardContent>
        </Card>

        {/* Progression globale */}
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Progression Globale
            </CardTitle>
            <CardDescription>Performance mensuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Chantiers terminés</span>
                  <span className="font-semibold">42%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "42%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>En cours</span>
                  <span className="font-semibold">50%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: "50%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>En attente</span>
                  <span className="font-semibold">8%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-muted-foreground h-2 rounded-full" style={{ width: "8%" }}></div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">1,024h</p>
                  <p className="text-xs text-muted-foreground mt-1">Temps total travaillé ce mois</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
