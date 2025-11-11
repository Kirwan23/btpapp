import { LayoutDashboard, Hammer, Users, Calendar, DollarSign, UserCircle, Settings, FileText, Receipt } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Chantiers", url: "/chantiers", icon: Hammer },
  { title: "CRM Prospects", url: "/crm", icon: Users },
  { title: "Planning", url: "/planning", icon: Calendar },
  { title: "Bilan Financier", url: "/finances", icon: DollarSign },
  { title: "Devis", url: "/devis", icon: FileText },
  { title: "Facturation", url: "/facturation", icon: Receipt },
  { title: "Équipe", url: "/equipe", icon: UserCircle },
  { title: "Paramètres", url: "/parametres", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-6 flex items-center gap-3">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">BTP SmartManager</h1>
              <p className="text-xs text-sidebar-foreground/70">Gestion intelligente</p>
            </div>
          )}
          {isCollapsed && (
            <div className="text-xl font-bold text-sidebar-foreground">BTP</div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent rounded-lg transition-colors"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
