import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Upload, FileText } from "lucide-react";

export default function Finances() {
  const expenses = [
    { id: 1, category: "Matériaux", amount: "2,450€", date: "18 Jan 2025", vendor: "Brico Dépôt" },
    { id: 2, category: "Carburant", amount: "180€", date: "17 Jan 2025", vendor: "Total Energies" },
    { id: 3, category: "Outillage", amount: "540€", date: "15 Jan 2025", vendor: "Leroy Merlin" },
    { id: 4, category: "Repas", amount: "95€", date: "14 Jan 2025", vendor: "Restaurant" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bilan Financier</h1>
          <p className="text-muted-foreground mt-1">Suivi automatisé des dépenses et marges</p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Scanner un ticket
        </Button>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dépenses</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8,450€</div>
            <p className="text-xs text-muted-foreground mt-1">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42,000€</div>
            <p className="text-xs text-muted-foreground mt-1">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marge Moyenne</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">32%</div>
            <p className="text-xs text-green-600 mt-1">+2% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">33,550€</div>
            <p className="text-xs text-green-600 mt-1">↑ +12% vs mois dernier</p>
          </CardContent>
        </Card>
      </div>

      {/* OCR et classification */}
      <Card className="shadow-elevated bg-gradient-card border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-primary" />
            Classification Automatique par IA
          </CardTitle>
          <CardDescription>
            Scannez vos tickets de caisse, l'IA les analyse et les classe automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <div className="text-2xl font-bold text-primary">145</div>
              <p className="text-xs text-muted-foreground mt-1">Tickets scannés</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <div className="text-2xl font-bold text-primary">98%</div>
              <p className="text-xs text-muted-foreground mt-1">Précision IA</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <div className="text-2xl font-bold text-primary">12h</div>
              <p className="text-xs text-muted-foreground mt-1">Temps économisé</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <div className="text-2xl font-bold text-primary">8</div>
              <p className="text-xs text-muted-foreground mt-1">Catégories auto</p>
            </div>
          </div>
          <Button variant="accent" size="lg" className="w-full mt-4 gap-2">
            <Upload className="h-4 w-4" />
            Scanner un nouveau ticket
          </Button>
        </CardContent>
      </Card>

      {/* Graphique de dépenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Répartition des Dépenses</CardTitle>
            <CardDescription>Par catégorie ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Matériaux", value: 45, amount: "3,800€", color: "bg-primary" },
                { name: "Main-d'œuvre", value: 30, amount: "2,500€", color: "bg-accent" },
                { name: "Carburant", value: 12, amount: "1,000€", color: "bg-yellow-500" },
                { name: "Outillage", value: 8, amount: "700€", color: "bg-orange-500" },
                { name: "Autres", value: 5, amount: "450€", color: "bg-muted-foreground" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.amount} ({item.value}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className={`${item.color} h-3 rounded-full transition-all duration-500`} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggestion IA */}
        <Card className="shadow-card bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Suggestions IA
            </CardTitle>
            <CardDescription>Optimisez vos dépenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-card rounded-xl border border-primary/20">
              <p className="text-sm font-medium">💡 Carburant en hausse</p>
              <p className="text-xs text-muted-foreground mt-1">
                Vos dépenses carburant ont augmenté de 12% ce mois. Envisagez d'optimiser vos trajets.
              </p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-primary/20">
              <p className="text-sm font-medium">📊 Marge excellente</p>
              <p className="text-xs text-muted-foreground mt-1">
                Votre marge de 32% est supérieure à la moyenne du secteur (28%).
              </p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-primary/20">
              <p className="text-sm font-medium">🎯 Opportunité</p>
              <p className="text-xs text-muted-foreground mt-1">
                Négociez des tarifs groupés avec vos fournisseurs pour économiser jusqu'à 8%.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historique des dépenses */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Historique des Dépenses</CardTitle>
          <CardDescription>Dernières transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{expense.category}</p>
                    <p className="text-sm text-muted-foreground">{expense.vendor} • {expense.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{expense.amount}</p>
                  <Button variant="ghost" size="sm" className="mt-1">
                    Détails
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
