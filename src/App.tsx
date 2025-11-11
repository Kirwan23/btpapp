import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/chantiers" element={<AppLayout><Chantiers /></AppLayout>} />
          <Route path="/crm" element={<AppLayout><CRM /></AppLayout>} />
          <Route path="/planning" element={<AppLayout><Planning /></AppLayout>} />
          <Route path="/finances" element={<AppLayout><Finances /></AppLayout>} />
          <Route path="/devis" element={<AppLayout><Devis /></AppLayout>} />
          <Route path="/facturation" element={<AppLayout><Facturation /></AppLayout>} />
          <Route path="/equipe" element={<AppLayout><Equipe /></AppLayout>} />
          <Route path="/parametres" element={<AppLayout><Parametres /></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
