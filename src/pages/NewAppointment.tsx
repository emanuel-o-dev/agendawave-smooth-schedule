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
  user_id: string;
}

interface ProviderSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const NewAppointment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    clientName: "",
    clientContact: "",
    serviceId: "",
    date: "",
    time: "",
  });
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

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

  const loadProviderHours = async (userId: string, selectedDate: string) => {
    if (!selectedDate) {
      setAvailableHours([]);
      return;
    }

    // Get day of week from selected date (0 = Sunday, 6 = Saturday)
    const date = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = date.getDay();

    const { data, error } = await supabase
      .from("provider_schedules")
      .select("*")
      .eq("user_id", userId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      setAvailableHours([]);
      return;
    }

    const hours = generateTimeSlots(data.start_time, data.end_time);
    setAvailableHours(hours);
  };

  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    if (!startTime || !endTime) return [];

    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeSlot = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
      
      // Filtrar horários já ocupados
      if (!bookedSlots.includes(timeSlot)) {
        slots.push(timeSlot);
      }

      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }

    return slots;
  };

  const loadBookedSlots = async (providerId: string, date: string) => {
    if (!date) {
      setBookedSlots([]);
      return;
    }

    const { data, error } = await supabase
      .from("appointments")
      .select("appointment_time")
      .eq("user_id", providerId)
      .eq("appointment_date", date)
      .in("status", ["confirmed", "pending"]);

    if (error) {
      console.error("Error loading booked slots:", error);
      setBookedSlots([]);
      return;
    }

    const bookedTimes = data?.map((apt) => apt.appointment_time) || [];
    setBookedSlots(bookedTimes);
  };

  useEffect(() => {
    if (formData.serviceId && formData.date) {
      const selectedService = services.find((s) => s.id === formData.serviceId);
      if (selectedService) {
        loadProviderHours(selectedService.user_id, formData.date);
        loadBookedSlots(selectedService.user_id, formData.date);
      }
    } else {
      setAvailableHours([]);
      setBookedSlots([]);
    }
  }, [formData.serviceId, formData.date, services]);


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
                        <div className="flex flex-col gap-1 py-1">
                          <span className="font-medium text-base">{service.name}</span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {service.duration} minutos
                            </span>
                            {service.price && (
                              <span className="font-semibold text-primary">
                                R$ {service.price.toFixed(2)}
                              </span>
                            )}
                          </div>
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
                {formData.serviceId && !formData.date && (
                  <p className="text-xs text-muted-foreground bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mb-2">
                    ℹ️ Selecione uma data primeiro para ver os horários disponíveis
                  </p>
                )}
                {formData.serviceId && formData.date && availableHours.length === 0 && (
                  <p className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-2">
                    ⚠️ Nenhum horário disponível para esta data. Todos os horários estão ocupados ou o prestador ainda não configurou o horário de atendimento.
                  </p>
                )}
                {formData.serviceId && formData.date && availableHours.length > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 mb-2">
                    ✓ {availableHours.length} horário(s) disponível(is) para {new Date(formData.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                )}
                <Select
                  value={formData.time}
                  onValueChange={(value) =>
                    setFormData({ ...formData, time: value })
                  }
                  disabled={!formData.serviceId || !formData.date || availableHours.length === 0}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder={!formData.serviceId ? "Selecione um serviço primeiro" : !formData.date ? "Selecione uma data" : "Escolha o horário"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableHours.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Sem horários disponíveis
                      </SelectItem>
                    ) : (
                      availableHours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
