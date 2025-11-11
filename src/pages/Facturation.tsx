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

type InvoiceStatus = "Brouillon" | "Envoyée" | "Payée" | "En retard";

type InvoiceItem = {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
};

type Invoice = {
  id: number;
  number: string;
  client: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  createdAt: string;
  dueAt?: string;
};

const statusVariant: Record<InvoiceStatus, "default" | "secondary" | "outline" | "destructive"> = {
  Brouillon: "outline",
  Envoyée: "secondary",
  Payée: "default",
  "En retard": "destructive",
};

export default function Facturation() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 1,
      number: "F-2025-001",
      client: "SARL Dupont",
      status: "Envoyée",
      createdAt: "2025-01-12",
      items: [
        { id: 1, description: "Main d'œuvre", quantity: 20, unitPrice: 60 },
        { id: 2, description: "Matériaux", quantity: 1, unitPrice: 1200 },
      ],
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    number: "",
    client: "",
    status: "Brouillon" as InvoiceStatus,
  });
  const [items, setItems] = useState<Array<{ description: string; quantity: string; unitPrice: string }>>([
    { description: "", quantity: "1", unitPrice: "0" },
  ]);

  const totals = useMemo(() => {
    const computeTotal = (f: Invoice) => f.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const sum = invoices.reduce((acc, f) => acc + computeTotal(f), 0);
    const paid = invoices.filter((f) => f.status === "Payée").reduce((acc, f) => acc + computeTotal(f), 0);
    const due = invoices
      .filter((f) => f.status === "Envoyée" || f.status === "En retard")
      .reduce((acc, f) => acc + computeTotal(f), 0);
    return { sum, paid, due };
  }, [invoices]);

  const addItemRow = () => setItems((prev) => [...prev, { description: "", quantity: "1", unitPrice: "0" }]);
  const removeItemRow = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewInvoice({ number: "", client: "", status: "Brouillon" });
      setItems([{ description: "", quantity: "1", unitPrice: "0" }]);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newInvoice.number.trim() || !newInvoice.client.trim()) return;

    const preparedItems: InvoiceItem[] = items
      .filter((i) => i.description.trim())
      .map((i, idx) => ({
        id: idx + 1,
        description: i.description.trim(),
        quantity: Math.max(0, Number(i.quantity) || 0),
        unitPrice: Math.max(0, Number(i.unitPrice) || 0),
      }));

    const invoice: Invoice = {
      id: Date.now(),
      number: newInvoice.number.trim(),
      client: newInvoice.client.trim(),
      status: newInvoice.status,
      items: preparedItems.length ? preparedItems : [{ id: 1, description: "Prestation", quantity: 1, unitPrice: 0 }],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setInvoices((prev) => [invoice, ...prev]);
    handleDialogChange(false);
  };

  const totalOf = (invoice: Invoice) => invoice.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facturation</h1>
          <p className="text-muted-foreground mt-1">Suivi des factures et encaissements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>+ Nouvelle facture</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle facture</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Numéro</Label>
                  <Input
                    id="invoice-number"
                    value={newInvoice.number}
                    onChange={(e) => setNewInvoice((p) => ({ ...p, number: e.target.value }))}
                    placeholder="Ex. F-2025-002"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-client">Client</Label>
                  <Input
                    id="invoice-client"
                    value={newInvoice.client}
                    onChange={(e) => setNewInvoice((p) => ({ ...p, client: e.target.value }))}
                    placeholder="Ex. SAS Martin"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="invoice-status">Statut</Label>
                  <Select
                    value={newInvoice.status}
                    onValueChange={(v: InvoiceStatus) => setNewInvoice((p) => ({ ...p, status: v }))}
                  >
                    <SelectTrigger id="invoice-status">
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {(["Brouillon", "Envoyée", "Payée", "En retard"] as InvoiceStatus[]).map((st) => (
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
            <CardTitle>Total factures</CardTitle>
            <CardDescription>Somme de toutes les factures</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totals.sum.toLocaleString("fr-FR")} €</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payées</CardTitle>
            <CardDescription>Encaissements</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">{totals.paid.toLocaleString("fr-FR")} €</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>À encaisser</CardTitle>
            <CardDescription>Envoyées / en retard</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">{totals.due.toLocaleString("fr-FR")} €</CardContent>
        </Card>
      </div>

      {/* Liste des factures */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
          <CardDescription>Dernières factures créées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold">{f.number}</p>
                    <p className="text-xs text-muted-foreground">{f.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={statusVariant[f.status]}>{f.status}</Badge>
                  <div className="text-sm font-semibold">{totalOf(f).toLocaleString("fr-FR")} €</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


