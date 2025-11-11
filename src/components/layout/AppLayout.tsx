import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Search, Plus, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="text-foreground" />
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un chantier ou client..."
                  className="pl-10 bg-muted/50 border-border rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un chantier
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Importer
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
