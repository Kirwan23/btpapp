import { FormEvent, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

type QuoteStatus = "Brouillon" | "Envoyé" | "Accepté" | "Refusé";

type QuoteItem = {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
};

type Quote = {
  id: number;
  number: string;
  client: string;
  status: QuoteStatus;
  items: QuoteItem[];
  createdAt: string;
  dueAt?: string;
};

const statusVariant: Record<QuoteStatus, "default" | "secondary" | "outline" | "destructive"> = {
  Brouillon: "outline",
  Envoyé: "secondary",
  Accepté: "default",
  Refusé: "destructive",
};

export default function Devis() {
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: 1,
      number: "D-2025-001",
      client: "SARL Dupont",
      status: "Envoyé",
      createdAt: "2025-01-10",
      items: [
        { id: 1, description: "Rénovation salle de bain", quantity: 1, unitPrice: 8500 },
        { id: 2, description: "Fournitures plomberie", quantity: 1, unitPrice: 1200 },
      ],
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQuote, setNewQuote] = useState({
    number: "",
    client: "",
    status: "Brouillon" as QuoteStatus,
  });
  const [items, setItems] = useState<Array<{ description: string; quantity: string; unitPrice: string }>>([
    { description: "", quantity: "1", unitPrice: "0" },
  ]);

  const totals = useMemo(() => {
    const computeTotal = (q: Quote) => q.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const sum = quotes.reduce((acc, q) => acc + computeTotal(q), 0);
    const accepted = quotes.filter((q) => q.status === "Accepté").reduce((acc, q) => acc + computeTotal(q), 0);
    const sent = quotes.filter((q) => q.status === "Envoyé").reduce((acc, q) => acc + computeTotal(q), 0);
    return { sum, accepted, sent };
  }, [quotes]);

  const addItemRow = () => setItems((prev) => [...prev, { description: "", quantity: "1", unitPrice: "0" }]);
  const removeItemRow = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewQuote({ number: "", client: "", status: "Brouillon" });
      setItems([{ description: "", quantity: "1", unitPrice: "0" }]);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newQuote.number.trim() || !newQuote.client.trim()) return;

    const preparedItems: QuoteItem[] = items
      .filter((i) => i.description.trim())
      .map((i, idx) => ({
        id: idx + 1,
        description: i.description.trim(),
        quantity: Math.max(0, Number(i.quantity) || 0),
        unitPrice: Math.max(0, Number(i.unitPrice) || 0),
      }));

    const quote: Quote = {
      id: Date.now(),
      number: newQuote.number.trim(),
      client: newQuote.client.trim(),
      status: newQuote.status,
      items: preparedItems.length ? preparedItems : [{ id: 1, description: "Prestation", quantity: 1, unitPrice: 0 }],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setQuotes((prev) => [quote, ...prev]);
    handleDialogChange(false);
  };

  const totalOf = (quote: Quote) => quote.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Devis</h1>
          <p className="text-muted-foreground mt-1">Création, suivi et relance des devis</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>+ Nouveau devis</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau devis</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quote-number">Numéro</Label>
                  <Input
                    id="quote-number"
                    value={newQuote.number}
                    onChange={(e) => setNewQuote((p) => ({ ...p, number: e.target.value }))}
                    placeholder="Ex. D-2025-002"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-client">Client</Label>
                  <Input
                    id="quote-client"
                    value={newQuote.client}
                    onChange={(e) => setNewQuote((p) => ({ ...p, client: e.target.value }))}
                    placeholder="Ex. SAS Martin"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="quote-status">Statut</Label>
                  <Select
                    value={newQuote.status}
                    onValueChange={(v: QuoteStatus) => setNewQuote((p) => ({ ...p, status: v }))}
                  >
                    <SelectTrigger id="quote-status">
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {(["Brouillon", "Envoyé", "Accepté", "Refusé"] as QuoteStatus[]).map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Lignes</Label>
                <div className="space-y-2">
                  {items.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      <Input
                        className="md:col-span-6"
                        placeholder="Description"
                        value={row.description}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, description: e.target.value } : it)),
                          )
                        }
                      />
                      <Input
                        className="md:col-span-2"
                        type="number"
                        min={0}
                        placeholder="Qté"
                        value={row.quantity}
                        onChange={(e) =>
                          setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, quantity: e.target.value } : it)))
                        }
                      />
                      <Input
                        className="md:col-span-3"
                        type="number"
                        min={0}
                        placeholder="PU (€)"
                        value={row.unitPrice}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, unitPrice: e.target.value } : it)),
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="md:col-span-1"
                        onClick={() => removeItemRow(idx)}
                        disabled={items.length === 1}
                      >
                        Suppr
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" onClick={addItemRow}>
                  + Ajouter une ligne
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => handleDialogChange(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total devis</CardTitle>
            <CardDescription>Somme de tous les devis</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totals.sum.toLocaleString("fr-FR")} €</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Acceptés</CardTitle>
            <CardDescription>Devis signés</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {totals.accepted.toLocaleString("fr-FR")} €
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Envoyés</CardTitle>
            <CardDescription>En attente de réponse</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">{totals.sent.toLocaleString("fr-FR")} €</CardContent>
        </Card>
      </div>

      {/* Liste des devis */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des devis</CardTitle>
          <CardDescription>Derniers devis créés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quotes.map((q) => (
              <div key={q.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold">{q.number}</p>
                    <p className="text-xs text-muted-foreground">{q.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={statusVariant[q.status]}>{q.status}</Badge>
                  <div className="text-sm font-semibold">{totalOf(q).toLocaleString("fr-FR")} €</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


