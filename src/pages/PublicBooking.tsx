import { useState } from "react";
import { Calendar, Clock, User, Phone, Briefcase, CheckCircle2 } from "lucide-react";
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
import { z } from "zod";

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
  service: z.string().min(1, "Selecione um serviço"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
});

const PublicBooking = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    time: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Serviços simulados - viriam do backend/perfil do profissional
  const availableServices = [
    "Corte de Cabelo",
    "Barba",
    "Coloração",
    "Manicure",
    "Pedicure",
  ];

  // Horários disponíveis simulados
  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      bookingSchema.parse(formData);
      
      // Simular envio do agendamento
      console.log("Agendamento:", formData);
      
      setIsSubmitted(true);
      toast({
        title: "Agendamento confirmado! ✨",
        description: "Você receberá uma confirmação em breve.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        toast({
          title: "Erro no formulário",
          description: "Verifique os campos e tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleNewBooking = () => {
    setIsSubmitted(false);
    setFormData({
      name: "",
      phone: "",
      service: "",
      date: "",
      time: "",
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 gradient-secondary">
        <Card className="w-full max-w-md p-8 text-center border-border animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-primary">
            <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Agendamento Confirmado!
          </h2>
          <p className="text-muted-foreground mb-6">
            Seu agendamento foi recebido com sucesso. Você receberá uma confirmação em breve.
          </p>
          <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{formData.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{formData.service}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {new Date(formData.date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{formData.time}</span>
            </div>
          </div>
          <Button
            onClick={handleNewBooking}
            className="w-full h-12 rounded-xl font-semibold shadow-primary hover:scale-[1.02] transition-all"
          >
            Fazer outro agendamento
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-secondary py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-primary mb-4">
            <Calendar className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Agende seu horário
          </h1>
          <p className="text-muted-foreground">
            Escolha o melhor dia e horário para você
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6 md:p-8 border-border animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Seu nome completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`pl-10 h-12 rounded-xl ${errors.name ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                WhatsApp / Telefone
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`pl-10 h-12 rounded-xl ${errors.phone ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Serviço */}
            <div className="space-y-2">
              <Label htmlFor="service" className="text-sm font-medium">
                Selecione o serviço
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Select
                  value={formData.service}
                  onValueChange={(value) =>
                    setFormData({ ...formData, service: value })
                  }
                >
                  <SelectTrigger className={`pl-10 h-12 rounded-xl ${errors.service ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Escolha um serviço" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    {availableServices.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.service && (
                <p className="text-xs text-destructive">{errors.service}</p>
              )}
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Data
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 pointer-events-none" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className={`pl-10 h-12 rounded-xl ${errors.date ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.date && (
                  <p className="text-xs text-destructive">{errors.date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium">
                  Horário
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Select
                    value={formData.time}
                    onValueChange={(value) =>
                      setFormData({ ...formData, time: value })
                    }
                  >
                    <SelectTrigger className={`pl-10 h-12 rounded-xl ${errors.time ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Escolha o horário" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border z-50">
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.time && (
                  <p className="text-xs text-destructive">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 rounded-xl font-semibold text-lg shadow-primary hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Confirmar Agendamento
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Ao confirmar, você receberá uma mensagem com os detalhes do agendamento
            </p>
          </form>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 p-4 border-border bg-card/50">
          <p className="text-sm text-center text-muted-foreground">
            💡 <span className="font-medium">Dica:</span> Chegue com 5 minutos de antecedência para melhor atendimento
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PublicBooking;
