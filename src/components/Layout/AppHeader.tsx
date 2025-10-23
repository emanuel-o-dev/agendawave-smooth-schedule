import { Calendar } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

const AppHeader = ({ title, subtitle }: AppHeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-4 py-4 safe-top">
      <div className="max-w-md mx-auto flex items-center gap-3">
        <SidebarTrigger />
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-primary">
          <Calendar className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
