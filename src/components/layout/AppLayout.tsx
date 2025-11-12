import { ReactNode, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchProvider, useSearch } from "@/context/SearchContext";
import { useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { query, setQuery, chantiers, prospects, clear } = useSearch();

  const trimmedQuery = query.trim();
  const chantierMatches = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    const lower = trimmedQuery.toLowerCase();
    return chantiers
      .filter((chantier) =>
        [chantier.name, chantier.location, chantier.status, chantier.cost]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(lower)),
      )
      .slice(0, 5);
  }, [trimmedQuery, chantiers]);

  const prospectMatches = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    const lower = trimmedQuery.toLowerCase();
    return prospects
      .filter((prospect) =>
        [prospect.name, prospect.project, prospect.status, prospect.email, prospect.phone]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(lower)),
      )
      .slice(0, 5);
  }, [trimmedQuery, prospects]);

  const hasResults = chantierMatches.length > 0 || prospectMatches.length > 0;

  const handleNavigate = (url: string) => {
    clear();
    navigate(url);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <SidebarTrigger className="text-foreground" />
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un chantier ou un prospect..."
                className="pl-10 bg-muted/50 border-border rounded-xl"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {trimmedQuery && (
                <div className="absolute left-0 right-0 mt-2 rounded-lg border border-border bg-card shadow-lg max-h-80 overflow-y-auto">
                  {!hasResults && (
                    <div className="px-4 py-3 text-sm text-muted-foreground">Aucun résultat pour “{trimmedQuery}”.</div>
                  )}
                  {chantierMatches.length > 0 && (
                    <div className="py-2">
                      <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Chantiers
                      </p>
                      <div className="mt-1 space-y-1">
                        {chantierMatches.map((chantier) => (
                          <button
                            key={chantier.id}
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleNavigate(chantier.url || "/chantiers")}
                          >
                            <span className="block font-medium text-foreground">{chantier.name}</span>
                            <span className="block text-xs text-muted-foreground">
                              {chantier.location} • {chantier.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {prospectMatches.length > 0 && (
                    <div className="py-2 border-t border-border/60">
                      <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Prospects
                      </p>
                      <div className="mt-1 space-y-1">
                        {prospectMatches.map((prospect) => (
                          <button
                            key={prospect.id}
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleNavigate("/crm")}
                          >
                            <span className="block font-medium text-foreground">{prospect.name}</span>
                            <span className="block text-xs text-muted-foreground">
                              {prospect.project} • {prospect.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <SearchProvider>
        <LayoutContent>{children}</LayoutContent>
      </SearchProvider>
    </SidebarProvider>
  );
}
