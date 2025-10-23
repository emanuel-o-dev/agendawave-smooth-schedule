import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Mail, Clock, LogOut, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/Layout/AppHeader";
import BottomNav from "@/components/Layout/BottomNav";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "João Silva",
    email: "joao@email.com",
    workStart: "09:00",
    workEnd: "18:00",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Até logo!",
      description: "Você foi desconectado.",
    });
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-muted pb-20">
      <AppHeader title="Perfil" subtitle="Gerencie suas informações" />

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Profile Picture */}
        <Card className="p-6 border-border flex flex-col items-center">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-primary">
            <UserIcon className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{formData.name}</h2>
          <p className="text-sm text-muted-foreground">{formData.email}</p>
        </Card>

        {/* Form */}
        <Card className="p-6 border-border">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome completo
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Horário de atendimento
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="workStart" className="text-xs text-muted-foreground">
                    Início
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="workStart"
                      type="time"
                      value={formData.workStart}
                      onChange={(e) =>
                        setFormData({ ...formData, workStart: e.target.value })
                      }
                      className="pl-9 h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workEnd" className="text-xs text-muted-foreground">
                    Fim
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="workEnd"
                      type="time"
                      value={formData.workEnd}
                      onChange={(e) =>
                        setFormData({ ...formData, workEnd: e.target.value })
                      }
                      className="pl-9 h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-semibold shadow-primary hover:scale-[1.02] transition-all"
            >
              <Save className="w-5 h-5 mr-2" />
              Salvar alterações
            </Button>
          </form>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 rounded-xl font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da conta
        </Button>
      </div>

      <BottomNav isAdmin={false} />
    </div>
  );
};

export default Profile;
