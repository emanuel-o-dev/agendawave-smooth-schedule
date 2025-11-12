import { TrendingUp, Users, Calendar as CalendarIcon, Clock, DollarSign, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import AppHeader from "@/components/Layout/AppHeader";
import BottomNav from "@/components/Layout/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const Metrics = () => {
  const { user, userRole } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const isAdmin = userRole === "admin";

  // Fetch appointments data
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["metrics-appointments", user?.id, selectedMonth],
    queryFn: async () => {
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);

      let query = supabase
        .from("appointments")
        .select(`
          *,
          services (
            name,
            price,
            duration
          )
        `)
        .gte("appointment_date", format(startDate, "yyyy-MM-dd"))
        .lte("appointment_date", format(endDate, "yyyy-MM-dd"));

      if (!isAdmin && user?.id) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!appointments) return null;

    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    
    const totalAppointments = appointments.length;
    const confirmedAppointments = appointments.filter(a => a.status === "confirmed").length;
    const cancelledAppointments = appointments.filter(a => a.status === "cancelled").length;
    const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);
    const pendingToday = todayAppointments.filter(a => a.status === "pending").length;

    // Calculate revenue
    const totalRevenue = appointments
      .filter(a => a.status === "confirmed")
      .reduce((sum, apt) => {
        const price = apt.services?.price || 0;
        return sum + Number(price);
      }, 0);

    // Cancellation rate
    const cancellationRate = totalAppointments > 0 
      ? ((cancelledAppointments / totalAppointments) * 100).toFixed(1)
      : "0";

    // Weekly distribution
    const weeklyData = [
      { day: "Dom", appointments: 0 },
      { day: "Seg", appointments: 0 },
      { day: "Ter", appointments: 0 },
      { day: "Qua", appointments: 0 },
      { day: "Qui", appointments: 0 },
      { day: "Sex", appointments: 0 },
      { day: "Sáb", appointments: 0 },
    ];

    appointments.forEach(apt => {
      const dayOfWeek = getDay(new Date(apt.appointment_date + "T00:00:00"));
      weeklyData[dayOfWeek].appointments++;
    });

    // Popular times
    const timeSlots: Record<string, number> = {};
    appointments.forEach(apt => {
      const hour = apt.appointment_time.substring(0, 5);
      timeSlots[hour] = (timeSlots[hour] || 0) + 1;
    });

    const sortedTimes = Object.entries(timeSlots)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);

    const maxTime = sortedTimes[0]?.[1] || 1;
    const popularTimes = sortedTimes.map(([time, count]) => ({
      time: `${time} - ${(parseInt(time.split(":")[0]) + 1).toString().padStart(2, "0")}:00`,
      percentage: Math.round((count / maxTime) * 100),
    }));

    // Occupation rate (based on total possible hours)
    const daysInMonth = endOfMonth(selectedMonth).getDate();
    const workingDaysInMonth = daysInMonth * 0.7; // Assuming 70% are working days
    const avgWorkingHours = 8;
    const avgAppointmentDuration = 1; // 1 hour average
    const totalPossibleAppointments = workingDaysInMonth * avgWorkingHours / avgAppointmentDuration;
    const occupationRate = ((confirmedAppointments / totalPossibleAppointments) * 100).toFixed(0);

    return {
      totalAppointments,
      confirmedAppointments,
      todayAppointments: todayAppointments.length,
      pendingToday,
      totalRevenue,
      cancellationRate,
      weeklyData,
      popularTimes,
      occupationRate,
      mostPopularTime: sortedTimes[0]?.[0] || "N/A",
    };
  }, [appointments, selectedMonth]);

  if (isLoading || !metrics) {
    return (
      <div className="min-h-screen bg-muted pb-20">
        <AppHeader title="Métricas" subtitle="Acompanhe seu desempenho" />
        <div className="max-w-md mx-auto p-4 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
        <BottomNav isAdmin={isAdmin} />
      </div>
    );
  }

  const stats = [
    {
      label: "Atendimentos este mês",
      value: metrics.confirmedAppointments.toString(),
      change: `Total: ${metrics.totalAppointments}`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Taxa de ocupação",
      value: `${metrics.occupationRate}%`,
      change: `${metrics.confirmedAppointments} confirmados`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Agendamentos hoje",
      value: metrics.todayAppointments.toString(),
      change: `${metrics.pendingToday} pendentes`,
      icon: CalendarIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Horário mais popular",
      value: metrics.mostPopularTime,
      change: `${metrics.popularTimes[0]?.percentage || 0}% dos agendamentos`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Receita do mês",
      value: `R$ ${metrics.totalRevenue.toFixed(2)}`,
      change: `${metrics.confirmedAppointments} atendimentos`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Taxa de cancelamento",
      value: `${metrics.cancellationRate}%`,
      change: `${appointments?.filter(a => a.status === "cancelled").length || 0} cancelados`,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const maxAppointments = Math.max(...metrics.weeklyData.map((d) => d.appointments), 1);

  return (
    <div className="min-h-screen bg-muted pb-20">
      <AppHeader
        title="Métricas"
        subtitle="Acompanhe seu desempenho"
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Month Selector */}
        <Card className="p-4 border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Período de análise
          </h3>
          <select
            value={format(selectedMonth, "yyyy-MM")}
            onChange={(e) => setSelectedMonth(new Date(e.target.value + "-01"))}
            className="w-full p-2 rounded-lg border border-border bg-background text-foreground"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              return (
                <option key={i} value={format(date, "yyyy-MM")}>
                  {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
                </option>
              );
            })}
          </select>
        </Card>

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
            {metrics.weeklyData.map((data) => (
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
            {metrics.popularTimes.length > 0 ? (
              metrics.popularTimes.map((slot) => (
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
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem dados suficientes para análise
              </p>
            )}
          </div>
        </Card>
      </div>

      <BottomNav isAdmin={true} />
    </div>
  );
};

export default Metrics;
