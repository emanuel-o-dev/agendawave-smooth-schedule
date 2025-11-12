import { Calendar, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Agendamento Fácil",
      description: "Escolha o serviço, data e horário que melhor se adequam à sua rotina",
    },
    {
      icon: Clock,
      title: "Horários Flexíveis",
      description: "Veja em tempo real os horários disponíveis e reserve instantaneamente",
    },
    {
      icon: CheckCircle,
      title: "Confirmação Imediata",
      description: "Receba confirmação na hora e fique tranquilo com seu agendamento",
    },
  ];

  return (
    <div className="min-h-screen gradient-secondary">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-primary shadow-primary mb-6">
            <Calendar className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            Agende seu horário
            <br />
            <span className="gradient-text">de forma simples</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Reserve seu atendimento em poucos cliques. Rápido, fácil e sem complicações.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/agendar")}
              size="lg"
              className="h-14 px-8 rounded-xl font-semibold text-lg shadow-primary hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Agendar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              size="lg"
              className="h-14 px-8 rounded-xl font-semibold text-lg hover:scale-[1.02] transition-all"
            >
              Entrar como Prestador
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="p-6 border-border hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-primary">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <Card className="p-8 text-center border-border gradient-primary/5 animate-in fade-in zoom-in duration-500 delay-500">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Pronto para agendar?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Selecione o serviço desejado, escolha a data e horário e pronto! É muito simples.
          </p>
          <Button
            onClick={() => navigate("/agendar")}
            size="lg"
            className="h-12 px-8 rounded-xl font-semibold shadow-primary hover:scale-[1.02] transition-all"
          >
            Ir para Agendamento
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Index;
