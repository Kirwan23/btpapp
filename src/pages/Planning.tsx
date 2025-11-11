import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { Calendar, Clock, MapPin, Users } from "lucide-react";

// Helpers: génération de la semaine courante (lun-dim) et formats
function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (dimanche) .. 6 (samedi)
  const diff = (day === 0 ? -6 : 1) - day; // ramener au lundi
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const weekdayShort = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const monthShort = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

function formatDayLabel(date: Date) {
  return `${weekdayShort[date.getDay()]} ${date.getDate()}`;
}
function formatDayDescription(date: Date) {
  return `${["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"][date.getDay()]} ${date.getDate()} ${monthShort[date.getMonth()]}`;
}
function idForDay(date: Date) {
  // ex: lun-20-2025
  const map: Record<number, string> = { 0: "dim", 1: "lun", 2: "mar", 3: "mer", 4: "jeu", 5: "ven", 6: "sam" };
  return `${map[date.getDay()]}-${date.getDate()}-${date.getFullYear()}`;
}

function getCurrentWeekDays(baseDate = new Date()) {
  const monday = getMonday(baseDate);
  return new Array(7).fill(null).map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return {
      id: idForDay(d),
      date: d,
      label: formatDayLabel(d),
      description: formatDayDescription(d),
    };
  });
}

const eventTypes = [
  { value: "Chantier", label: "Chantier" },
  { value: "Rendez-vous", label: "Rendez-vous" },
  { value: "Livraison", label: "Livraison" },
  { value: "Autre", label: "Autre" },
] as const;

type EventType = (typeof eventTypes)[number]["value"];

type PlanningEvent = {
  id: number;
  title: string;
  dayId: string;
  time: string;
  team: string;
  location: string;
  type: EventType;
};

const typeColorMap: Record<EventType, string> = {
  Chantier: "bg-primary",
  "Rendez-vous": "bg-accent",
  Livraison: "bg-secondary",
  Autre: "bg-muted-foreground",
};

const initialEvents: PlanningEvent[] = [
  {
    id: 1,
    title: "Rénovation Villa Dupont",
    dayId: "lun-20",
    time: "08:00 - 17:00",
    team: "Pierre, Marie",
    location: "Paris 16ème",
    type: "Chantier",
  },
  {
    id: 2,
    title: "Installation Chauffage",
    dayId: "mar-21",
    time: "09:00 - 16:00",
    team: "Thomas",
    location: "Lyon 3ème",
    type: "Chantier",
  },
  {
    id: 3,
    title: "Rendez-vous client Dubois",
    dayId: "mer-22",
    time: "14:00 - 15:00",
    team: "Pierre",
    location: "Paris 8ème",
    type: "Rendez-vous",
  },
  {
    id: 4,
    title: "Livraison matériaux",
    dayId: "jeu-23",
    time: "10:00 - 11:00",
    team: "-",
    location: "Entrepôt",
    type: "Livraison",
  },
];

export default function Planning() {
  const [weekDays, setWeekDays] = useState(getCurrentWeekDays());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [events, setEvents] = useState<PlanningEvent[]>(initialEvents);
  const [activeTypeFilter, setActiveTypeFilter] = useState<EventType | "Tous">("Tous");
  const [activeTeamFilter, setActiveTeamFilter] = useState<string>("Tous");
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: eventTypes[0].value as EventType,
    dayId: weekDays[0].id,
    startTime: "",
    endTime: "",
    team: "",
    location: "",
  });

  // Google Calendar sync states
  const [isGcalDialogOpen, setIsGcalDialogOpen] = useState(false);
  const [gcalApiKey, setGcalApiKey] = useState("");
  const [gcalCalendarId, setGcalCalendarId] = useState("");
  const [gcalStatus, setGcalStatus] = useState<null | "idle" | "loading" | "success" | "error">(null);
  const [gcalError, setGcalError] = useState<string | null>(null);

  useEffect(() => {
    // Init settings from localStorage
    const savedKey = localStorage.getItem("gcal_api_key");
    const savedCal = localStorage.getItem("gcal_calendar_id");
    if (savedKey) setGcalApiKey(savedKey);
    if (savedCal) setGcalCalendarId(savedCal);
    // Refresh the week on mount
    setWeekDays(getCurrentWeekDays());
  }, []);

  const weekRange = useMemo(() => {
    const start = new Date(weekDays[0].date);
    const end = new Date(weekDays[6].date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [weekDays]);

  const uniqueTeams = useMemo(() => {
    const members = new Set<string>();
    events.forEach((event) => {
      event.team
        .split(",")
        .map((member) => member.trim())
        .filter(Boolean)
        .forEach((member) => members.add(member));
    });
    return Array.from(members).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesType = activeTypeFilter === "Tous" || event.type === activeTypeFilter;
        const matchesTeam =
          activeTeamFilter === "Tous" ||
          event.team
            .split(",")
            .map((member) => member.trim())
            .filter(Boolean)
            .includes(activeTeamFilter);
        return matchesType && matchesTeam;
      }),
    [events, activeTeamFilter, activeTypeFilter],
  );

  const eventsByDay = useMemo(
    () =>
      weekDays.map((day) => ({
        dayId: day.id,
        label: day.label,
        events: filteredEvents
          .filter((event) => event.dayId === day.id)
          .sort((a, b) => a.time.localeCompare(b.time)),
      })),
    [filteredEvents],
  );

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewEvent({
        title: "",
        type: eventTypes[0].value as EventType,
        dayId: weekDays[0].id,
        startTime: "",
        endTime: "",
        team: "",
        location: "",
      });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newEvent.title.trim()) {
      return;
    }

    const startTime = newEvent.startTime || "09:00";
    const endTime = newEvent.endTime || "17:00";

    setEvents((previous) => [
      ...previous,
      {
        id: Date.now(),
        title: newEvent.title.trim(),
        dayId: newEvent.dayId,
        time: `${startTime} - ${endTime}`,
        team: newEvent.team.trim() || "-",
        location: newEvent.location.trim() || "À préciser",
        type: newEvent.type,
      },
    ]);

    handleDialogChange(false);
  };

  const handleTypeFilterClick = (type: EventType | "Tous") => {
    setActiveTypeFilter((previous) => (previous === type ? "Tous" : type));
  };

  const handleTeamFilterClick = (team: string) => {
    setActiveTeamFilter((previous) => (previous === team ? "Tous" : team));
  };

  const handleGcalDialogChange = (open: boolean) => {
    setIsGcalDialogOpen(open);
    setGcalStatus("idle");
    setGcalError(null);
  };

  const saveGcalSettings = () => {
    localStorage.setItem("gcal_api_key", gcalApiKey);
    localStorage.setItem("gcal_calendar_id", gcalCalendarId);
  };

  const importFromGoogleCalendar = async () => {
    if (!gcalApiKey || !gcalCalendarId) {
      setGcalError("Renseignez l'API Key et le Calendar ID.");
      setGcalStatus("error");
      return;
    }
    setGcalStatus("loading");
    setGcalError(null);
    try {
      const timeMin = weekRange.start.toISOString();
      const timeMax = weekRange.end.toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        gcalCalendarId,
      )}/events?key=${encodeURIComponent(gcalApiKey)}&singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
        timeMin,
      )}&timeMax=${encodeURIComponent(timeMax)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur API (${response.status})`);
      }
      const data = await response.json();
      const items: any[] = Array.isArray(data.items) ? data.items : [];

      const toTime = (dateTime?: string, dateOnly?: string) => {
        if (dateTime) {
          const d = new Date(dateTime);
          return d;
        }
        if (dateOnly) {
          const d = new Date(dateOnly);
          return d;
        }
        return null;
      };

      const imported: PlanningEvent[] = items
        .map((item) => {
          const start = toTime(item.start?.dateTime, item.start?.date);
          const end = toTime(item.end?.dateTime, item.end?.date);
          if (!start) return null;
          const dayId = idForDay(start);
          const startStr =
            start.getHours().toString().padStart(2, "0") + ":" + start.getMinutes().toString().padStart(2, "0");
          const endStr =
            end
              ? end.getHours().toString().padStart(2, "0") + ":" + end.getMinutes().toString().padStart(2, "0")
              : "";
          const time = endStr ? `${startStr} - ${endStr}` : startStr;
          const title = item.summary || "Événement";
          const location = item.location || "À préciser";
          return {
            id: Date.now() + Math.floor(Math.random() * 1000000),
            title,
            dayId,
            time,
            team: "-",
            location,
            type: "Rendez-vous" as EventType,
          } as PlanningEvent;
        })
        .filter(Boolean) as PlanningEvent[];

      // fusionner en conservant les existants
      setEvents((previous) => [...previous, ...imported]);
      saveGcalSettings();
      setGcalStatus("success");
    } catch (error: any) {
      setGcalError(error?.message || "Échec de la synchronisation");
      setGcalStatus("error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planning des Chantiers</h1>
          <p className="text-muted-foreground mt-1">Vue calendrier et gestion d'équipe</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <div className="flex gap-2">
            <Dialog open={isGcalDialogOpen} onOpenChange={handleGcalDialogChange}>
              <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Sync Google Calendar
          </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Synchroniser Google Calendar (lecture seule)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gcal-api-key">API Key</Label>
                    <Input
                      id="gcal-api-key"
                      placeholder="Votre API Key Google"
                      value={gcalApiKey}
                      onChange={(e) => setGcalApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gcal-calendar-id">Calendar ID</Label>
                    <Input
                      id="gcal-calendar-id"
                      placeholder="exemple@gmail.com ou xxxxxxxxx@group.calendar.google.com"
                      value={gcalCalendarId}
                      onChange={(e) => setGcalCalendarId(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" onClick={saveGcalSettings}>
                      Enregistrer
                    </Button>
                    <Button type="button" onClick={importFromGoogleCalendar} disabled={gcalStatus === "loading"}>
                      {gcalStatus === "loading" ? "Synchronisation..." : "Importer la semaine en cours"}
                    </Button>
                  </div>
                  {gcalStatus === "success" && (
                    <p className="text-sm text-green-600">Synchronisation réussie.</p>
                  )}
                  {gcalStatus === "error" && (
                    <p className="text-sm text-red-600">{gcalError || "Erreur pendant la synchronisation."}</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <DialogTrigger asChild>
          <Button className="gap-2">
            + Planifier
          </Button>
            </DialogTrigger>
          </div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Planifier un nouvel événement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-title">Titre</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(event) => setNewEvent((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Ex. Inspection chantier"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-type">Type</Label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value: EventType) => setNewEvent((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="event-type">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-day">Jour</Label>
                  <Select
                    value={newEvent.dayId}
                    onValueChange={(value) => setNewEvent((prev) => ({ ...prev, dayId: value as (typeof weekDays)[number]["id"] }))}
                  >
                    <SelectTrigger id="event-day">
                      <SelectValue placeholder="Sélectionnez un jour" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem key={day.id} value={day.id}>
                          {day.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horaire</Label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(event) => setNewEvent((prev) => ({ ...prev, startTime: event.target.value }))}
                    />
                    <Input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(event) => setNewEvent((prev) => ({ ...prev, endTime: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-team">Équipe</Label>
                  <Input
                    id="event-team"
                    value={newEvent.team}
                    onChange={(event) => setNewEvent((prev) => ({ ...prev, team: event.target.value }))}
                    placeholder="Ex. Pierre, Marie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-location">Lieu</Label>
                  <Input
                    id="event-location"
                    value={newEvent.location}
                    onChange={(event) => setNewEvent((prev) => ({ ...prev, location: event.target.value }))}
                    placeholder="Ex. Paris 10ème"
                  />
                </div>
        </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => handleDialogChange(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vue calendrier */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Janvier 2025</CardTitle>
              <CardDescription>Semaine du 20 au 26 janvier</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">← Précédent</Button>
              <Button variant="outline" size="sm">Suivant →</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div key={day.id} className="text-center font-semibold text-sm p-2 bg-muted rounded-lg">
                {day.label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 mt-2">
            {eventsByDay.map((day) => (
              <div
                key={day.dayId}
                className="min-h-[200px] border border-border rounded-lg p-2 bg-card hover:bg-muted/20 transition-colors"
              >
                <div className="space-y-2">
                  {day.events.map((event) => (
                    <div key={event.id} className={`${typeColorMap[event.type]} text-white p-2 rounded text-xs`}>
                        <p className="font-semibold truncate">{event.title}</p>
                        <p className="text-[10px] opacity-90 mt-1">{event.time}</p>
                      {event.team !== "-" && (
                        <p className="text-[10px] opacity-90 mt-1">Équipe : {event.team}</p>
                      )}
                      </div>
                    ))}
                  {day.events.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center pt-4">Aucun événement</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des événements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Événements à venir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-muted/30 rounded-lg border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {weekDays.find((day) => day.id === event.dayId)?.label} • {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.team}
                      </span>
                    </div>
                  </div>
                  <Badge className={typeColorMap[event.type]}>Planifié</Badge>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Aucun événement ne correspond à vos filtres.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Filtres et rappels */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Filtres & Rappels</CardTitle>
            <CardDescription>Personnalisez votre vue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Filtrer par type</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={activeTypeFilter === "Tous" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTypeFilterClick("Tous")}
                >
                  Tous
                </Badge>
                {eventTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={activeTypeFilter === type.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTypeFilterClick(type.value)}
                  >
                    {type.label}
                </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Filtrer par équipe</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={activeTeamFilter === "Tous" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTeamFilterClick("Tous")}
                >
                  Toutes
                </Badge>
                {uniqueTeams.map((member) => (
                  <Badge
                    key={member}
                    variant={activeTeamFilter === member ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTeamFilterClick(member)}
                  >
                    {member}
                </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium mb-3">Rappels automatiques</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <span className="text-sm">Chantier demain</span>
                  <Badge variant="secondary">Activé</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">RDV dans 1h</span>
                  <Badge variant="secondary">Activé</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
