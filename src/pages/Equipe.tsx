import { FormEvent, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, UserPlus, Clock, CheckCircle2 } from "lucide-react";

export default function Equipe() {
  const statusOptions = ["Disponible", "En chantier", "En congé"] as const;
  type MemberStatus = (typeof statusOptions)[number];

  type Member = {
    id: number;
    name: string;
    role: string;
    avatar: string;
    chantiers: number;
    heures: number;
    ponctualite: number;
    status: MemberStatus;
    currentProject: string;
  };

  const initialMembers: Member[] = [
    {
      id: 1,
      name: "Pierre Martin",
      role: "Chef de chantier",
      avatar: "PM",
      chantiers: 12,
      heures: 256,
      ponctualite: 98,
      status: "En chantier",
      currentProject: "Rénovation Villa Dupont",
    },
    {
      id: 2,
      name: "Marie Durand",
      role: "Plombier",
      avatar: "MD",
      chantiers: 8,
      heures: 184,
      ponctualite: 100,
      status: "Disponible",
      currentProject: "-",
    },
    {
      id: 3,
      name: "Thomas Bernard",
      role: "Électricien",
      avatar: "TB",
      chantiers: 10,
      heures: 220,
      ponctualite: 95,
      status: "En chantier",
      currentProject: "Installation électrique",
    },
    {
      id: 4,
      name: "Sophie Lefebvre",
      role: "Aide de chantier",
      avatar: "SL",
      chantiers: 6,
      heures: 148,
      ponctualite: 92,
      status: "En congé",
      currentProject: "-",
    },
  ];

  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    status: statusOptions[0] as MemberStatus,
    currentProject: "",
  });

  const totalHeures = useMemo(() => members.reduce((acc, m) => acc + m.heures, 0), [members]);
  const punctualityAverage = useMemo(
    () => (members.length ? Math.round(members.reduce((acc, m) => acc + m.ponctualite, 0) / members.length) : 0),
    [members],
  );

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewMember({
        name: "",
        role: "",
        status: statusOptions[0],
        currentProject: "",
      });
    }
  };

  const initialsFromName = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newMember.name.trim() || !newMember.role.trim()) {
      return;
    }
    const member: Member = {
      id: Date.now(),
      name: newMember.name.trim(),
      role: newMember.role.trim(),
      avatar: initialsFromName(newMember.name),
      chantiers: 0,
      heures: 0,
      ponctualite: 100,
      status: newMember.status,
      currentProject: newMember.currentProject.trim() || "-",
    };
    setMembers((prev) => [...prev, member]);
    handleDialogChange(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion de l'Équipe</h1>
          <p className="text-muted-foreground mt-1">Membres et performances</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Ajouter un membre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un membre</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="member-name">Nom complet</Label>
                  <Input
                    id="member-name"
                    value={newMember.name}
                    onChange={(e) => setNewMember((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex. Alice Dupont"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-role">Rôle</Label>
                  <Input
                    id="member-role"
                    value={newMember.role}
                    onChange={(e) => setNewMember((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="Ex. Plombier, Électricien..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-status">Statut</Label>
                  <Select
                    value={newMember.status}
                    onValueChange={(value: MemberStatus) => setNewMember((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger id="member-status">
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-project">Projet actuel (optionnel)</Label>
                  <Input
                    id="member-project"
                    value={newMember.currentProject}
                    onChange={(e) => setNewMember((prev) => ({ ...prev, currentProject: e.target.value }))}
                    placeholder="Ex. Rénovation cuisine"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => handleDialogChange(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats équipe */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Membres</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Actifs dans l'équipe</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Chantier</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{members.filter(m => m.status === "En chantier").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Membres actifs aujourd'hui</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Heures</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalHeures}h</div>
            <p className="text-xs text-muted-foreground mt-1">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ponctualité Moy.</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{punctualityAverage}%</div>
            <p className="text-xs text-green-600 mt-1">Excellent</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des membres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="shadow-card hover:shadow-elevated transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{member.avatar}</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant={
                    member.status === "En chantier"
                      ? "default"
                      : member.status === "Disponible"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {member.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Projet actuel */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Projet en cours</p>
                <p className="font-medium mt-1">{member.currentProject}</p>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{member.chantiers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Chantiers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{member.heures}h</div>
                  <p className="text-xs text-muted-foreground mt-1">Heures</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{member.ponctualite}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Ponctualité</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Voir détails
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Attribuer chantier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Historique d'activité */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Historique d'Activité</CardTitle>
          <CardDescription>Actions récentes de l'équipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { member: "Pierre Martin", action: "a terminé le chantier", project: "Rénovation Villa Dupont", time: "Il y a 2h" },
              { member: "Marie Durand", action: "a commencé", project: "Installation chauffage", time: "Il y a 4h" },
              { member: "Thomas Bernard", action: "a mis à jour", project: "Mise aux normes électriques", time: "Il y a 5h" },
              { member: "Sophie Lefebvre", action: "a validé le devis pour", project: "Plomberie appartement", time: "Hier" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-semibold text-primary text-sm">{activity.member[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{activity.member}</span> {activity.action}{" "}
                      <span className="text-primary">{activity.project}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
