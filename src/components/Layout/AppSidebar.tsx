import { Home, Calendar as CalendarIcon, BarChart3, User, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  isAdmin: boolean;
}

const menuItems = [
  { title: "Agendamentos", url: "/dashboard", icon: Home, adminOnly: false },
  { title: "Calendário", url: "/calendar", icon: CalendarIcon, adminOnly: false },
  { title: "Métricas", url: "/metrics", icon: BarChart3, adminOnly: true },
  { title: "Perfil", url: "/profile", icon: User, adminOnly: false },
];

export function AppSidebar({ isAdmin }: AppSidebarProps) {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const collapsed = state === "collapsed";

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast({
      title: "Até logo!",
      description: "Você foi desconectado.",
    });
    navigate("/auth");
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "";

  const visibleItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-sm">AgendeWeb</h2>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Admin" : "Usuário"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
