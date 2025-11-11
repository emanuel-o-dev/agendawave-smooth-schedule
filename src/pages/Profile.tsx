import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Mail, LogOut, Save, Plus, X, Briefcase, Link as LinkIcon, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/Layout/AppHeader";
import BottomNav from "@/components/Layout/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { WeekSchedule } from "@/components/WeekSchedule";
import { ScheduleBlocks } from "@/components/ScheduleBlocks";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
  active: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    duration: "30",
    price: "",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      if (userRole === "prestador") {
        loadServices();
      }
    }
  }, [user, userRole]);

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      setLoading(false);
      return;
    }

    if (data) {
      setFormData({
        name: data.name || "",
        email: data.email || "",
      });
    }

    setLoading(false);
  };

  const loadServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading services:", error);
      return;
    }

    setServices(data || []);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        name: formData.name,
      })
      .eq("id", user?.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleAddService = async () => {
    if (!newService.name.trim()) return;

    const { error } = await supabase
      .from("services")
      .insert({
        user_id: user?.id,
        name: newService.name.trim(),
        description: newService.description.trim() || null,
        duration: parseInt(newService.duration) || 30,
        price: newService.price ? parseFloat(newService.price) : null,
        active: true,
      });

    if (error) {
      toast({
        title: "Erro ao adicionar serviço",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Serviço adicionado!",
      description: `"${newService.name}" foi adicionado aos seus serviços.`,
    });

    setNewService({ name: "", description: "", duration: "30", price: "" });
    loadServices();
  };

  const handleRemoveService = async (serviceId: string, serviceName: string) => {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (error) {
      toast({
        title: "Erro ao remover serviço",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Serviço removido",
      description: `"${serviceName}" foi removido.`,
    });

    loadServices();
  };

  const handleCopyLink = () => {
    const bookingLink = `${window.location.origin}/agendar`;
    navigator.clipboard.writeText(bookingLink);
    toast({
      title: "Link copiado! 📋",
      description: "Compartilhe com seus clientes.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  disabled
                  className="pl-10 h-12 rounded-xl bg-muted"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-12 rounded-xl font-semibold shadow-primary hover:scale-[1.02] transition-all"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Salvar alterações
            </Button>
          </form>
        </Card>

        {/* Week Schedule - Only for prestador */}
        {userRole === "prestador" && user && (
          <WeekSchedule userId={user.id} />
        )}

        {/* Schedule Blocks - Only for prestador */}
        {userRole === "prestador" && user && (
          <Card className="p-6 border-border">
            <ScheduleBlocks />
          </Card>
        )}

        {/* Services Section - Only for prestador */}
        {userRole === "prestador" && (
          <Card className="p-6 border-border">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                <Label className="text-base font-semibold">Serviços Oferecidos</Label>
              </div>

              {/* Services List */}
              <div className="space-y-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-start justify-between p-3 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{service.name}</p>
                      {service.description && (
                        <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                      )}
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{service.duration} min</span>
                        {service.price && <span>R$ {service.price.toFixed(2)}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveService(service.id, service.name)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Service */}
              <div className="space-y-3 pt-2 border-t">
                <Input
                  placeholder="Nome do serviço"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="h-11 rounded-xl"
                />
                <Textarea
                  placeholder="Descrição (opcional)"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="rounded-xl resize-none"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Duração (min)"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Preço (R$)"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleAddService}
                  className="w-full h-11 rounded-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Serviço
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Public Booking Link - Only for prestador */}
        {userRole === "prestador" && (
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
        )}

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

      <BottomNav isAdmin={userRole === "admin"} />
    </div>
  );
};

export default Profile;
