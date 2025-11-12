import { FormEvent, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Users, Send, Mail, Phone, GripVertical, Loader2, Settings } from "lucide-react";
import { useSearch } from "@/context/SearchContext";

const pipelineStages = [
  { id: 1, title: "Tous les prospects", color: "bg-muted" },
  { id: 2, title: "Envoi du devis", color: "bg-blue-100" },
  { id: 3, title: "Relance 1", color: "bg-yellow-100" },
  { id: 4, title: "Relance 2", color: "bg-orange-100" },
  { id: 5, title: "Relance 3", color: "bg-red-100" },
] as const;

type ProspectStatus = (typeof pipelineStages)[number]["title"];

type Prospect = {
  id: number;
  name: string;
  email: string;
  phone: string;
  project: string;
  status: ProspectStatus;
};

const initialProspects: Prospect[] = [
  {
    id: 1,
    name: "Jean Dupont",
    email: "jean.dupont@email.com",
    phone: "06 12 34 56 78",
    project: "Rénovation salle de bain",
    status: "Envoi du devis",
  },
  {
    id: 2,
    name: "Marie Lambert",
    email: "marie.l@email.com",
    phone: "06 98 76 54 32",
    project: "Installation chauffage",
    status: "Relance 1",
  },
  {
    id: 3,
    name: "Paul Martin",
    email: "p.martin@email.com",
    phone: "06 45 67 89 12",
    project: "Électricité maison",
    status: "Tous les prospects",
  },
];

// Messages de relance par défaut
const defaultRelanceMessages = {
  "Relance 1": `Bonjour,

Nous espérons que vous allez bien. Nous souhaiterions avoir de vos nouvelles concernant le projet de {project}.

N'hésitez pas à nous contacter si vous avez des questions ou si vous souhaitez planifier un rendez-vous.

Cordialement,
L'équipe`,
  "Relance 2": `Bonjour,

Nous vous recontactons concernant votre projet de {project}. Nous restons à votre disposition pour toute information complémentaire.

Nous serions ravis de pouvoir vous accompagner dans la réalisation de ce projet.

Cordialement,
L'équipe`,
  "Relance 3": `Bonjour,

Dernière relance concernant votre projet de {project}. Si vous êtes toujours intéressé, n'hésitez pas à nous contacter.

Nous restons disponibles pour répondre à vos questions.

Cordialement,
L'équipe`,
};

// Composant de carte draggable
function ProspectCard({ prospect }: { prospect: Prospect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: prospect.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{prospect.name}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prospect.project}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{prospect.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant de colonne
function Column({
  column,
  prospects,
}: {
  column: (typeof pipelineStages)[number] & { count: number };
  prospects: Prospect[];
}) {
  const columnProspects = prospects.filter((p) => p.status === column.title);
  const ids = columnProspects.map((p) => p.id);
  const { setNodeRef } = useDroppable({
    id: column.title,
  });

  return (
    <Card className="shadow-card flex flex-col" ref={setNodeRef}>
      <CardHeader className={`${column.color} rounded-t-xl`}>
        <CardTitle className="text-sm font-semibold">{column.title}</CardTitle>
        <Badge variant="secondary" className="w-fit mt-2">
          {column.count}
        </Badge>
      </CardHeader>
      <CardContent className="p-3 flex-1 min-h-[400px]">
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {columnProspects.map((prospect) => (
              <ProspectCard key={prospect.id} prospect={prospect} />
            ))}
          </div>
        </SortableContext>
        {columnProspects.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Aucun prospect
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CRM() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState<{
    prospect: Prospect;
    newStatus: ProspectStatus;
    type: "devis" | "relance";
    content: string;
  } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    email: localStorage.getItem("crm_email") || "",
    n8nWebhook: localStorage.getItem("n8n_webhook") || "",
  });

  const [newProspect, setNewProspect] = useState({
    name: "",
    email: "",
    phone: "",
    project: "",
    status: pipelineStages[0].title as ProspectStatus,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { query, setQuery, registerProspects } = useSearch();
  const searchTerm = query.trim().toLowerCase();

  const filteredProspects = useMemo(() => {
    if (!searchTerm) {
      return prospects;
    }

    return prospects.filter((prospect) =>
      [prospect.name, prospect.project, prospect.email, prospect.phone, prospect.status]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm)),
    );
  }, [prospects, searchTerm]);

  const displayedProspects = searchTerm ? filteredProspects : prospects;

  const columns = useMemo(
    () =>
      pipelineStages.map((stage) => ({
        ...stage,
        count: displayedProspects.filter((prospect) => prospect.status === stage.title).length,
      })),
    [displayedProspects]
  );

  useEffect(() => {
    registerProspects(
      prospects.map((prospect) => ({
        id: prospect.id,
        name: prospect.name,
        project: prospect.project,
        status: prospect.status,
        email: prospect.email,
        phone: prospect.phone,
      })),
    );
  }, [prospects, registerProspects]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const prospectId = active.id as number;
    const containerId = (over.data?.current as any)?.sortable?.containerId ?? over.id;
    const targetColumn = columns.find((col) => col.title === containerId);
    if (!targetColumn) return;

    const newStatus = targetColumn.title as ProspectStatus;

    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect || prospect.status === newStatus) return;

    // Déterminer le type d'action
    const isDevis = newStatus === "Envoi du devis";
    const isRelance = newStatus.startsWith("Relance");

    if (isDevis || isRelance) {
      // Ouvrir la popup de vérification
      let content = "";
      if (isDevis) {
        content = `Devis pour ${prospect.project}\n\nClient: ${prospect.name}\nEmail: ${prospect.email}\n\nMontant estimé: À définir\n\nVeuillez vérifier les détails avant envoi.`;
      } else {
        content = defaultRelanceMessages[newStatus as keyof typeof defaultRelanceMessages]
          .replace("{project}", prospect.project);
      }

      setReviewData({
        prospect,
        newStatus,
        type: isDevis ? "devis" : "relance",
        content,
      });
      setIsReviewDialogOpen(true);
    } else {
      // Déplacement simple sans popup
      handleStatusChange(prospectId, newStatus);
    }
  };

  const handleStatusChange = async (prospectId: number, newStatus: ProspectStatus) => {
    setProspects((prev) =>
      prev.map((p) => (p.id === prospectId ? { ...p, status: newStatus } : p))
    );

    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) return;

    // Déclencher le webhook
    await triggerWebhook(prospect, newStatus);
  };

  const triggerWebhook = async (prospect: Prospect, newStatus: ProspectStatus) => {
    const webhookUrl = emailConfig.n8nWebhook || localStorage.getItem("n8n_webhook");
    
    if (!webhookUrl) {
      console.log("Webhook non configuré, simulation locale");
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prospect: {
            id: prospect.id,
            name: prospect.name,
            email: prospect.email,
            phone: prospect.phone,
            project: prospect.project,
          },
          newStatus,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Erreur webhook:", error);
    }
  };

  const handleSendReview = async () => {
    if (!reviewData) return;

    setIsSending(true);

    try {
      // Simuler l'envoi via webhook
      await triggerWebhook(reviewData.prospect, reviewData.newStatus);

      // Mettre à jour le statut
      await handleStatusChange(reviewData.prospect.id, reviewData.newStatus);

      setIsReviewDialogOpen(false);
      setReviewData(null);
    } catch (error) {
      console.error("Erreur envoi:", error);
      alert("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewProspect({
        name: "",
        email: "",
        phone: "",
        project: "",
        status: pipelineStages[0].title as ProspectStatus,
      });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newProspect.name.trim() || !newProspect.project.trim()) {
      return;
    }

    setProspects((previous) => [
      ...previous,
      {
        id: Date.now(),
        name: newProspect.name.trim(),
        email: newProspect.email.trim(),
        phone: newProspect.phone.trim(),
        project: newProspect.project.trim(),
        status: newProspect.status,
      },
    ]);

    if (query) {
      setQuery("");
    }

    handleDialogChange(false);
  };

  const activeProspect = activeId ? prospects.find((p) => p.id === activeId) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM Prospects</h1>
          <p className="text-muted-foreground mt-1">Pipeline visuel et relances automatiques</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEmailDialogOpen(true)} className="gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Nouveau Prospect
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un prospect</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prospect-name">Nom complet</Label>
                    <Input
                      id="prospect-name"
                      value={newProspect.name}
                      onChange={(event) => setNewProspect((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Ex. Jeanne Martin"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prospect-project">Projet</Label>
                    <Input
                      id="prospect-project"
                      value={newProspect.project}
                      onChange={(event) => setNewProspect((prev) => ({ ...prev, project: event.target.value }))}
                      placeholder="Ex. Rénovation cuisine"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prospect-email">Email</Label>
                    <Input
                      id="prospect-email"
                      type="email"
                      value={newProspect.email}
                      onChange={(event) => setNewProspect((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="Ex. jean.dupont@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prospect-phone">Téléphone</Label>
                    <Input
                      id="prospect-phone"
                      value={newProspect.phone}
                      onChange={(event) => setNewProspect((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="Ex. 06 12 34 56 78"
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
      </div>

      {/* Configuration Email/Webhook */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuration Email & Webhooks</DialogTitle>
            <DialogDescription>
              Configurez votre email professionnel et le webhook n8n pour automatiser les envois
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-config">Email professionnel</Label>
              <Input
                id="email-config"
                type="email"
                value={emailConfig.email}
                onChange={(e) => {
                  const newEmail = e.target.value;
                  setEmailConfig((prev) => ({ ...prev, email: newEmail }));
                  localStorage.setItem("crm_email", newEmail);
                }}
                placeholder="contact@votre-entreprise.com"
              />
              <p className="text-xs text-muted-foreground">
                Email utilisé pour envoyer les devis et relances
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-config">Webhook n8n</Label>
              <Input
                id="webhook-config"
                value={emailConfig.n8nWebhook}
                onChange={(e) => {
                  const newWebhook = e.target.value;
                  setEmailConfig((prev) => ({ ...prev, n8nWebhook: newWebhook }));
                  localStorage.setItem("n8n_webhook", newWebhook);
                }}
                placeholder="https://votre-n8n.com/webhook/..."
              />
              <p className="text-xs text-muted-foreground">
                URL du webhook n8n qui déclenchera les workflows d'envoi d'emails
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-2">Comment ça fonctionne ?</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Lorsqu'un prospect est déplacé dans une colonne, un webhook est déclenché</li>
                <li>Le webhook envoie les données du prospect à n8n</li>
                <li>n8n génère et envoie automatiquement l'email correspondant</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsEmailDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup de vérification avant envoi */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {reviewData?.type === "devis" ? "Vérification du devis" : "Vérification de la relance"}
            </DialogTitle>
            <DialogDescription>
              Vérifiez le contenu avant l'envoi à {reviewData?.prospect.email}
            </DialogDescription>
          </DialogHeader>
          {reviewData && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-2">Destinataire</p>
                <p className="text-sm">{reviewData.prospect.name}</p>
                <p className="text-sm text-muted-foreground">{reviewData.prospect.email}</p>
                <p className="text-sm text-muted-foreground">{reviewData.prospect.phone}</p>
              </div>
              <div className="space-y-2">
                <Label>
                  {reviewData.type === "devis" ? "Contenu du devis" : "Message de relance"}
                </Label>
                <Textarea
                  value={reviewData.content}
                  onChange={(e) =>
                    setReviewData((prev) => (prev ? { ...prev, content: e.target.value } : null))
                  }
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)} disabled={isSending}>
              Annuler
            </Button>
            <Button onClick={handleSendReview} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emails intelligents */}
      <Card className="shadow-elevated bg-gradient-card border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-6 w-6 text-primary" />
            Emails Intelligents
          </CardTitle>
          <CardDescription>Automatisation via webhooks n8n</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <div className="text-3xl font-bold text-primary">42</div>
              <p className="text-sm text-muted-foreground mt-1">Emails envoyés ce mois</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <div className="text-3xl font-bold text-primary">78%</div>
              <p className="text-sm text-muted-foreground mt-1">Taux d'ouverture</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <div className="text-3xl font-bold text-primary">15</div>
              <p className="text-sm text-muted-foreground mt-1">Devis signés</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Kanban avec Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {columns.map((column) => (
            <Column key={column.id} column={column} prospects={displayedProspects} />
          ))}
        </div>
        <DragOverlay>
          {activeProspect ? (
            <div className="p-3 bg-card border border-border rounded-lg shadow-lg opacity-90">
              <h4 className="font-semibold text-sm">{activeProspect.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{activeProspect.project}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
