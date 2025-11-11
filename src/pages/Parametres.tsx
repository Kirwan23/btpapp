import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Key, Mail, Bell, Database } from "lucide-react";

export default function Parametres() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Configuration et intégrations</p>
      </div>

      {/* Compte */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Compte Utilisateur
          </CardTitle>
          <CardDescription>Gérez vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" placeholder="Votre nom" defaultValue="Jean Dupont" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" placeholder="Votre prénom" defaultValue="Jean" className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="votre@email.com" defaultValue="jean.dupont@btp.fr" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="entreprise">Entreprise</Label>
            <Input id="entreprise" placeholder="Nom de l'entreprise" defaultValue="BTP Dupont & Fils" className="mt-1" />
          </div>
          <Button>Enregistrer les modifications</Button>
        </CardContent>
      </Card>

      {/* Intégrations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Intégrations
          </CardTitle>
          <CardDescription>Connectez vos services externes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">OpenAI (API)</p>
                <p className="text-xs text-muted-foreground">Pour les estimations IA</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configurer</Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">n8n Webhooks</p>
                <p className="text-xs text-muted-foreground">Automatisations CRM</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configurer</Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Google Calendar</p>
                <p className="text-xs text-muted-foreground">Synchronisation planning</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Connecter</Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Email Professionnel</p>
                <p className="text-xs text-muted-foreground">Envoi automatique de devis</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Connecter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Préférences de notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications email</p>
              <p className="text-sm text-muted-foreground">Recevoir des emails pour les événements importants</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Rappels de chantier</p>
              <p className="text-sm text-muted-foreground">Rappels automatiques la veille d'un chantier</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertes devis</p>
              <p className="text-sm text-muted-foreground">Notifications pour les devis en attente</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Rapports hebdomadaires</p>
              <p className="text-sm text-muted-foreground">Résumé de la semaine tous les lundis</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Thème */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
          <CardDescription>Personnalisez l'interface</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mode sombre</p>
              <p className="text-sm text-muted-foreground">Activer le thème sombre</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
