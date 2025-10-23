import { Home, Calendar, BarChart3, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  adminOnly?: boolean;
}

interface BottomNavProps {
  isAdmin?: boolean;
}

const BottomNav = ({ isAdmin = false }: BottomNavProps) => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: Home, label: "Agendamentos", path: "/dashboard" },
    { icon: Calendar, label: "Calendário", path: "/calendar" },
    { icon: BarChart3, label: "Métricas", path: "/metrics", adminOnly: true },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[4rem]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
