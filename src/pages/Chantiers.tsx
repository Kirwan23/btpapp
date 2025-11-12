import { FormEvent, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Hammer, MapPin, Calendar, Users, TrendingUp, Clock, DollarSign, Upload, X, Loader2, Sparkles } from "lucide-react";
import { useSearch } from "@/context/SearchContext";

const chantierStatuses = ["En cours", "Terminé", "En attente"] as const;

type ChantierStatus = (typeof chantierStatuses)[number];

type EstimationResult = {
  estimatedDays: number;
  workers: string;
  totalCost: number;
  materials: Array<{ name: string; quantity: string; cost: number }>;
  costBreakdown: {
    materials: number;
    labor: number;
    equipment: number;
    other: number;
  };
  margin: number;
  profit: number;
};

const chantierTypes = [
  "Rénovation",
  "Construction neuve",
  "Plomberie",
  "Électricité",
  "Chauffage",
  "Isolation",
  "Peinture",
  "Carrelage",
  "Menuiserie",
  "Autre",
] as const;

function EstimationIACard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimationResult, setEstimationResult] = useState<EstimationResult | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    type: "",
    surface: "",
    location: "",
    desiredDelay: "",
    description: "",
    apiKey: localStorage.getItem("openai_api_key") || "",
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);
    setPhotoPreviews(newPhotos.map((file) => URL.createObjectURL(file)));
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Nettoyer les previews
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      setPhotos([]);
      setPhotoPreviews([]);
      setFormData((prev) => ({ ...prev, type: "", surface: "", location: "", desiredDelay: "", description: "" }));
    }
  };

  const estimateWithAI = async () => {
    if (!formData.type || !formData.surface || !formData.location) {
      alert("Veuillez remplir au moins le type, la surface et la localisation");
      return;
    }

    setIsEstimating(true);
    setEstimationResult(null);

    try {
      // Préparer les images en base64 si disponibles
      const imagePromises = photos.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(",")[1]);
          };
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(imagePromises);

      // Construire le prompt pour ChatGPT
      const prompt = `Tu es un expert en estimation de chantiers BTP. Analyse les informations suivantes et fournis une estimation détaillée au format JSON strict :

Type de chantier: ${formData.type}
Surface: ${formData.surface} m²
Localisation: ${formData.location}
Délai souhaité: ${formData.desiredDelay || "Non spécifié"}
Description: ${formData.description || "Non fournie"}
${photos.length > 0 ? `Nombre de photos fournies: ${photos.length}` : ""}

Réponds UNIQUEMENT avec un JSON valide dans ce format exact (sans texte avant ou après) :
{
  "estimatedDays": nombre de jours estimés,
  "workers": "description des ouvriers nécessaires (ex: '2 plombiers, 1 aide')",
  "totalCost": coût total en euros (nombre),
  "materials": [
    {"name": "nom matériau", "quantity": "quantité", "cost": prix en euros}
  ],
  "costBreakdown": {
    "materials": coût matériaux en euros,
    "labor": coût main d'œuvre en euros,
    "equipment": coût équipement en euros,
    "other": autres coûts en euros
  },
  "margin": marge en pourcentage (nombre),
  "profit": bénéfice estimé en euros (nombre)
}

Sois réaliste et précis dans tes estimations.`;

      const messages: Array<{ role: string; content: Array<any> }> = [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...base64Images.map((base64, index) => ({
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            })),
          ],
        },
      ];

      // Appel à l'API OpenAI
      const apiKey = formData.apiKey || localStorage.getItem("openai_api_key") || "";
      if (!apiKey) {
        alert("Veuillez configurer votre clé API OpenAI dans les paramètres");
        setIsEstimating(false);
        return;
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: photos.length > 0 ? "gpt-4o" : "gpt-4o-mini",
          messages,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erreur lors de l'estimation");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const result = JSON.parse(content) as EstimationResult;

      setEstimationResult(result);
      handleDialogChange(false);
    } catch (error: any) {
      console.error("Erreur estimation:", error);
      alert(`Erreur lors de l'estimation: ${error.message || "Erreur inconnue"}`);
    } finally {
      setIsEstimating(false);
    }
  };

  const chartData = estimationResult
    ? [
        { name: "Matériaux", value: estimationResult.costBreakdown.materials, color: "hsl(var(--primary))" },
        { name: "Main d'œuvre", value: estimationResult.costBreakdown.labor, color: "hsl(var(--accent))" },
        { name: "Équipement", value: estimationResult.costBreakdown.equipment, color: "#f59e0b" },
        { name: "Autres", value: estimationResult.costBreakdown.other, color: "hsl(var(--muted-foreground))" },
      ]
    : [];

  const chartConfig = {
    materials: { label: "Matériaux", color: "hsl(var(--primary))" },
    labor: { label: "Main d'œuvre", color: "hsl(var(--accent))" },
    equipment: { label: "Équipement", color: "#f59e0b" },
    other: { label: "Autres", color: "hsl(var(--muted-foreground))" },
  };

  return (
    <>
      <Card className="shadow-elevated bg-gradient-card border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Estimation IA de Chantier
          </CardTitle>
          <CardDescription>Analysez un nouveau projet avec l'intelligence artificielle ChatGPT</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {estimationResult ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-card rounded-xl border border-border">
                  <Clock className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Temps estimé</p>
                  <p className="text-lg font-bold">{estimationResult.estimatedDays} jours</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <Users className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Ouvriers nécessaires</p>
                  <p className="text-lg font-bold">{estimationResult.workers}</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <DollarSign className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Coût prévisionnel</p>
                  <p className="text-lg font-bold">{estimationResult.totalCost.toLocaleString()}€</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <Hammer className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Matériaux</p>
                  <p className="text-lg font-bold">{estimationResult.materials.length} articles</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition des Coûts</CardTitle>
                    <CardDescription>Analyse détaillée des dépenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Détails Financiers</CardTitle>
                    <CardDescription>Marge et bénéfice estimés</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Coût total</span>
                        <span className="text-lg font-bold">{estimationResult.totalCost.toLocaleString()}€</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Marge</span>
                        <span className="text-lg font-bold text-primary">{estimationResult.margin}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <span className="text-sm font-medium">Bénéfice estimé</span>
                        <span className="text-lg font-bold text-primary">{estimationResult.profit.toLocaleString()}€</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Liste des Matériaux</CardTitle>
                  <CardDescription>Matériaux nécessaires pour le chantier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {estimationResult.materials.map((material, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{material.name}</p>
                          <p className="text-sm text-muted-foreground">Quantité: {material.quantity}</p>
                        </div>
                        <p className="font-bold">{material.cost.toLocaleString()}€</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" onClick={() => setEstimationResult(null)} className="w-full">
                Nouvelle estimation
              </Button>
            </div>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button variant="accent" size="lg" className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Estimer via IA
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Estimation IA de Chantier</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="est-type">Type de chantier *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
                        <SelectTrigger id="est-type">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {chantierTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="est-surface">Surface (m²) *</Label>
                      <Input
                        id="est-surface"
                        type="number"
                        value={formData.surface}
                        onChange={(e) => setFormData((prev) => ({ ...prev, surface: e.target.value }))}
                        placeholder="Ex. 50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="est-location">Localisation *</Label>
                      <Input
                        id="est-location"
                        value={formData.location}
                        onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                        placeholder="Ex. Paris 16ème"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="est-delay">Délai souhaité</Label>
                      <Input
                        id="est-delay"
                        value={formData.desiredDelay}
                        onChange={(e) => setFormData((prev) => ({ ...prev, desiredDelay: e.target.value }))}
                        placeholder="Ex. 2 semaines"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="est-description">Description du projet</Label>
                    <Textarea
                      id="est-description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez les travaux à réaliser..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="est-photos">Photos du chantier (optionnel)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <input
                        type="file"
                        id="est-photos"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <label htmlFor="est-photos" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Cliquez pour ajouter des photos</p>
                        </div>
                      </label>
                      {photoPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {photoPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img src={preview} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => removePhoto(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="est-apikey">Clé API OpenAI (optionnel, sera sauvegardée)</Label>
                    <Input
                      id="est-apikey"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, apiKey: e.target.value }));
                        if (e.target.value) {
                          localStorage.setItem("openai_api_key", e.target.value);
                        }
                      }}
                      placeholder="sk-..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Si vous avez déjà configuré votre clé API, vous pouvez la laisser vide
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => handleDialogChange(false)} disabled={isEstimating}>
                    Annuler
                  </Button>
                  <Button onClick={estimateWithAI} disabled={isEstimating}>
                    {isEstimating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Estimation en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Estimer
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </>
  );
}

type Chantier = {
  id: number;
  name: string;
  status: ChantierStatus;
  location: string;
  progress: number;
  startDate: string;
  estimatedDays: number;
  workers: number;
  cost: string;
};

const initialChantiers: Chantier[] = [
  {
    id: 1,
    name: "Rénovation Villa Dupont",
    status: "En cours",
    location: "Paris 16ème",
    progress: 65,
    startDate: "15 Jan 2025",
    estimatedDays: 4,
    workers: 3,
    cost: "15,000€",
  },
  {
    id: 2,
    name: "Installation Chauffage",
    status: "Terminé",
    location: "Lyon 3ème",
    progress: 100,
    startDate: "01 Jan 2025",
    estimatedDays: 2,
    workers: 2,
    cost: "8,500€",
  },
  {
    id: 3,
    name: "Mise aux normes électriques",
    status: "En attente",
    location: "Marseille 8ème",
    progress: 0,
    startDate: "À planifier",
    estimatedDays: 3,
    workers: 2,
    cost: "12,000€",
  },
];

export default function Chantiers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chantiers, setChantiers] = useState<Chantier[]>(initialChantiers);
  const [newChantier, setNewChantier] = useState({
    name: "",
    status: chantierStatuses[0],
    location: "",
    startDate: "",
    estimatedDays: "",
    workers: "",
    cost: "",
    progress: "0",
  });

  const progressPreview = useMemo(
    () => Math.min(100, Math.max(0, Number.isNaN(Number(newChantier.progress)) ? 0 : Number(newChantier.progress))),
    [newChantier.progress],
  );

  const { query, registerChantiers } = useSearch();
  const searchTerm = query.trim().toLowerCase();

  const filteredChantiers = useMemo(() => {
    if (!searchTerm) {
      return chantiers;
    }

    return chantiers.filter((chantier) =>
      [chantier.name, chantier.location, chantier.status, chantier.cost]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm)),
    );
  }, [chantiers, searchTerm]);

  useEffect(() => {
    registerChantiers(
      chantiers.map((chantier) => ({
        id: chantier.id,
        name: chantier.name,
        location: chantier.location,
        status: chantier.status,
        cost: chantier.cost,
        url: `/chantiers#chantier-${chantier.id}`,
      })),
    );
  }, [chantiers, registerChantiers]);

  const resetForm = () =>
    setNewChantier({
      name: "",
      status: chantierStatuses[0],
      location: "",
      startDate: "",
      estimatedDays: "",
      workers: "",
      cost: "",
      progress: "0",
    });

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newChantier.name.trim() || !newChantier.location.trim()) {
      return;
    }

    setChantiers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newChantier.name.trim(),
        status: newChantier.status,
        location: newChantier.location.trim(),
        startDate: newChantier.startDate.trim() || "À planifier",
        estimatedDays: Number(newChantier.estimatedDays) || 0,
        workers: Number(newChantier.workers) || 0,
        cost: newChantier.cost.trim() || "À définir",
        progress: Number(newChantier.progress) || 0,
      },
    ]);

    resetForm();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Chantiers</h1>
          <p className="text-muted-foreground mt-1">Estimation IA et suivi en temps réel</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Hammer className="h-4 w-4" />
              Nouveau Chantier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un chantier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chantier-name">Nom du chantier</Label>
                  <Input
                    id="chantier-name"
                    value={newChantier.name}
                    onChange={(event) => setNewChantier((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Ex. Rénovation appartement"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chantier-status">Statut</Label>
                  <Select
                    value={newChantier.status}
                    onValueChange={(value: ChantierStatus) => setNewChantier((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger id="chantier-status">
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {chantierStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chantier-location">Localisation</Label>
                  <Input
                    id="chantier-location"
                    value={newChantier.location}
                    onChange={(event) => setNewChantier((prev) => ({ ...prev, location: event.target.value }))}
                    placeholder="Ville ou adresse"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chantier-start-date">Date de démarrage</Label>
                  <Input
                    id="chantier-start-date"
                    value={newChantier.startDate}
                    onChange={(event) => setNewChantier((prev) => ({ ...prev, startDate: event.target.value }))}
                    placeholder="Ex. 15 Fév 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chantier-days">Durée estimée (jours)</Label>
                  <Input
                    id="chantier-days"
                    type="number"
                    min={0}
                    value={newChantier.estimatedDays}
                    onChange={(event) => setNewChantier((prev) => ({ ...prev, estimatedDays: event.target.value }))}
                    placeholder="Ex. 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chantier-workers">Nombre d'ouvriers</Label>
                  <Input
                    id="chantier-workers"
                    type="number"
                    min={0}
                    value={newChantier.workers}
                    onChange={(event) => setNewChantier((prev) => ({ ...prev, workers: event.target.value }))}
                    placeholder="Ex. 4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chantier-cost">Budget estimé</Label>
                  <Input
                    id="chantier-cost"
                    value={newChantier.cost}
                    onChange={(event) => setNewChantier((prev) => ({ ...prev, cost: event.target.value }))}
                    placeholder="Ex. 12,000€"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chantier-progress">Progression (%)</Label>
                  <Input
                    id="chantier-progress"
                    type="number"
                    min={0}
                    max={100}
                    value={newChantier.progress}
                    onChange={(event) => setNewChantier((prev) => ({ ...prev, progress: event.target.value }))}
                    placeholder="Ex. 25"
                  />
                  <p className="text-xs text-muted-foreground">Aperçu : {progressPreview}%</p>
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

      {/* Estimation IA Section */}
      <EstimationIACard />

      {/* Liste des chantiers */}
      <div className="grid grid-cols-1 gap-4">
        {filteredChantiers.map((chantier) => (
          <Card
            key={chantier.id}
            id={`chantier-${chantier.id}`}
            className="shadow-card hover:shadow-elevated transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{chantier.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {chantier.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {chantier.startDate}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        chantier.status === "En cours"
                          ? "default"
                          : chantier.status === "Terminé"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {chantier.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-semibold">{chantier.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${chantier.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Durée</p>
                      <p className="font-semibold">{chantier.estimatedDays} jours</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Équipe</p>
                      <p className="font-semibold">{chantier.workers} ouvriers</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-semibold text-primary">{chantier.cost}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:w-32">
                  <Button variant="default" size="sm" className="w-full">
                    Voir détails
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Modifier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
