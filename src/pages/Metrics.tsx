import { TrendingUp, Users, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import AppHeader from "@/components/Layout/AppHeader";
import BottomNav from "@/components/Layout/BottomNav";

const Metrics = () => {
  // Mock data - será substituído por dados reais
  const stats = [
    {
      label: "Atendimentos este mês",
      value: "127",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Taxa de ocupação",
      value: "78%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Agendamentos hoje",
      value: "8",
      change: "2 pendentes",
      icon: CalendarIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Horário mais popular",
      value: "14:00",
      change: "Terça e Quinta",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const weeklyData = [
    { day: "Seg", appointments: 12 },
    { day: "Ter", appointments: 18 },
    { day: "Qua", appointments: 15 },
    { day: "Qui", appointments: 22 },
    { day: "Sex", appointments: 20 },
    { day: "Sáb", appointments: 25 },
    { day: "Dom", appointments: 8 },
  ];

  const maxAppointments = Math.max(...weeklyData.map((d) => d.appointments));

  return (
    <div className="min-h-screen bg-muted pb-20">
      <AppHeader
        title="Métricas"
        subtitle="Acompanhe seu desempenho"
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="p-4 border-border hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-xs font-medium text-green-600">
                  {stat.change}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Weekly Chart */}
        <Card className="p-5 border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Agendamentos por dia da semana
          </h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyData.map((data) => (
              <div
                key={data.day}
                className="flex flex-col items-center gap-2 flex-1"
              >
                <div className="w-full bg-secondary rounded-t-lg relative overflow-hidden">
                  <div
                    className="gradient-primary rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${(data.appointments / maxAppointments) * 140}px`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {data.day}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Popular Times */}
        <Card className="p-5 border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Horários mais procurados
          </h3>
          <div className="space-y-3">
            {[
              { time: "14:00 - 15:00", percentage: 85 },
              { time: "10:00 - 11:00", percentage: 72 },
              { time: "16:00 - 17:00", percentage: 68 },
              { time: "09:00 - 10:00", percentage: 55 },
            ].map((slot) => (
              <div key={slot.time}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {slot.time}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {slot.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary transition-all duration-500"
                    style={{ width: `${slot.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <BottomNav isAdmin={true} />
    </div>
  );
};

export default Metrics;
