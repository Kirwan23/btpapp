import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Component, type ReactNode } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Chantiers from "./pages/Chantiers";
import CRM from "./pages/CRM";
import Planning from "./pages/Planning";
import Finances from "./pages/Finances";
import Equipe from "./pages/Equipe";
import Parametres from "./pages/Parametres";
import NotFound from "./pages/NotFound";
import Devis from "./pages/Devis";
import Facturation from "./pages/Facturation";
import Login from "./pages/Login";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isOk = typeof window !== "undefined" && localStorage.getItem("ACCESS_CODE_OK") === "1";
  if (!isOk) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
          <h1>Une erreur s'est produite</h1>
          <p>{this.state.error?.message || "Erreur inconnue"}</p>
          <button onClick={() => window.location.reload()}>Recharger la page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<RequireAuth><AppLayout><Dashboard /></AppLayout></RequireAuth>} />
            <Route path="/chantiers" element={<RequireAuth><AppLayout><Chantiers /></AppLayout></RequireAuth>} />
            <Route path="/crm" element={<RequireAuth><AppLayout><CRM /></AppLayout></RequireAuth>} />
            <Route path="/planning" element={<RequireAuth><AppLayout><Planning /></AppLayout></RequireAuth>} />
            <Route path="/finances" element={<RequireAuth><AppLayout><Finances /></AppLayout></RequireAuth>} />
            <Route path="/devis" element={<RequireAuth><AppLayout><Devis /></AppLayout></RequireAuth>} />
            <Route path="/facturation" element={<RequireAuth><AppLayout><Facturation /></AppLayout></RequireAuth>} />
            <Route path="/equipe" element={<RequireAuth><AppLayout><Equipe /></AppLayout></RequireAuth>} />
            <Route path="/parametres" element={<RequireAuth><AppLayout><Parametres /></AppLayout></RequireAuth>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
