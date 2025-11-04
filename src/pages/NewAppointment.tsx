import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, Clock, User as UserIcon, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number | null;
}

const NewAppointment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientContact: "",
    serviceId: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", user?.id)
      .eq("active", true)
      .order("name");

    if (error) {
      console.error("Error loading services:", error);
      toast({
        title: "Erro ao carregar serviços",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setServices(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.clientContact || !formData.serviceId || !formData.date || !formData.time) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("appointments")
      .insert({
        user_id: user?.id,
        service_id: formData.serviceId,
        client_name: formData.clientName,
        client_contact: formData.clientContact,
        appointment_date: formData.date,
        appointment_time: formData.time,
        status: "confirmed",
      });

    setSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Horário já reservado",
          description: "Este horário já possui um agendamento. Escolha outro horário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao criar agendamento",
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }

    toast({
      title: "Agendamento criado!",
      description: "O cliente receberá uma confirmação em breve.",
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 safe-top">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Novo Agendamento
            </h1>
            <p className="text-sm text-muted-foreground">
              Preencha os dados do cliente
            </p>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-md mx-auto p-4">
        <Card className="p-6 border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-medium">
                Nome do cliente
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="clientName"
                  type="text"
                  placeholder="Nome completo"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientContact" className="text-sm font-medium">
                Contato (WhatsApp)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="clientContact"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.clientContact}
                  onChange={(e) =>
                    setFormData({ ...formData, clientContact: e.target.value })
                  }
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service" className="text-sm font-medium">
                Serviço
              </Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceId: value })
                }
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>
                      Carregando...
                    </SelectItem>
                  ) : services.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Cadastre serviços no seu perfil
                    </SelectItem>
                  ) : (
                    services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex flex-col">
                          <span>{service.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {service.duration} min
                            {service.price && ` • R$ ${service.price.toFixed(2)}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Data
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium">
                  Horário
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                disabled={submitting || services.length === 0}
                className="w-full h-12 rounded-xl font-semibold shadow-primary hover:scale-[1.02] transition-all"
              >
                {submitting ? "Criando..." : "Confirmar Agendamento"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full h-12 rounded-xl font-semibold"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NewAppointment;
