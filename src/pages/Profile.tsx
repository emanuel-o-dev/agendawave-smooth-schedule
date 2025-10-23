import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Mail, Clock, LogOut, Save, Plus, X, Briefcase, Link as LinkIcon, Copy } from "lucide-react";
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
  
  const [services, setServices] = useState<string[]>([
    "Corte de Cabelo",
    "Barba",
  ]);
  const [newService, setNewService] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast({
      title: "Até logo!",
      description: "Você foi desconectado.",
    });
    navigate("/auth");
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService("");
      toast({
        title: "Serviço adicionado!",
        description: `"${newService}" foi adicionado aos seus serviços.`,
      });
    }
  };

  const handleRemoveService = (index: number) => {
    const removedService = services[index];
    setServices(services.filter((_, i) => i !== index));
    toast({
      title: "Serviço removido",
      description: `"${removedService}" foi removido.`,
    });
  };

  const handleCopyLink = () => {
    const bookingLink = `${window.location.origin}/agendar`;
    navigator.clipboard.writeText(bookingLink);
    toast({
      title: "Link copiado! 📋",
      description: "Compartilhe com seus clientes.",
    });
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

        {/* Services Section */}
        <Card className="p-6 border-border">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold">Serviços Oferecidos</Label>
            </div>

            {/* Services List */}
            <div className="space-y-2">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border"
                >
                  <span className="text-sm font-medium">{service}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveService(index)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Service */}
            <div className="flex gap-2">
              <Input
                placeholder="Nome do serviço"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddService()}
                className="h-11 rounded-xl"
              />
              <Button
                onClick={handleAddService}
                className="h-11 px-4 rounded-xl"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Public Booking Link */}
        <Card className="p-6 border-border bg-primary/5">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold">Link de Agendamento</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Compartilhe este link com seus clientes para que eles possam agendar diretamente
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/agendar`}
                className="h-11 rounded-xl bg-background"
              />
              <Button
                onClick={handleCopyLink}
                className="h-11 px-4 rounded-xl"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
            <Button
              onClick={() => window.open("/agendar", "_blank")}
              variant="outline"
              className="w-full h-11 rounded-xl"
            >
              Visualizar página de agendamento
            </Button>
          </div>
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
