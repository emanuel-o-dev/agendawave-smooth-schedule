import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/Layout/AppHeader";
import BottomNav from "@/components/Layout/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Appointment {
  id: string;
  client_name: string;
  appointment_time: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  services: {
    name: string;
  };
}

interface DayAppointment {
  date: string;
  appointments: Appointment[];
}

const CalendarView = () => {
  const { user, userRole } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [weekData, setWeekData] = useState<DayAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  function getWeekDates(startDate: Date): string[] {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  }

  useEffect(() => {
    if (user) {
      loadWeekAppointments();
    }
  }, [user, currentWeekStart]);

  const loadWeekAppointments = async () => {
    setLoading(true);
    const weekDates = getWeekDates(currentWeekStart);
    const startDate = weekDates[0];
    const endDate = weekDates[6];

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        client_name,
        appointment_date,
        appointment_time,
        status,
        services (
          name
        )
      `)
      .gte("appointment_date", startDate)
      .lte("appointment_date", endDate)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error("Error loading appointments:", error);
      setLoading(false);
      return;
    }

    // Group appointments by date
    const groupedData: DayAppointment[] = weekDates.map((date) => ({
      date,
      appointments: (data || [])
        .filter((apt: any) => apt.appointment_date === date)
        .map((apt: any) => ({
          id: apt.id,
          client_name: apt.client_name,
          appointment_time: apt.appointment_time,
          status: apt.status,
          services: apt.services,
        })),
    }));

    setWeekData(groupedData);
    setLoading(false);
  };

  const getStatusColor = (status: "confirmed" | "pending" | "cancelled" | "completed") => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      case "cancelled":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      case "completed":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    }
  };

  const getStatusLabel = (status: "confirmed" | "pending" | "cancelled" | "completed") => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelado";
      case "completed":
        return "Concluído";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();

    return {
      dayName: date.toLocaleDateString("pt-BR", { weekday: "short" }),
      dayNumber: date.getDate(),
      isToday,
    };
  };

  const formatWeekRange = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);

    return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString("pt-BR", { month: "short" })}, ${end.getFullYear()}`;
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeekStart(newDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted pb-20">
      <AppHeader title="Calendário" subtitle="Visualize seus agendamentos" />

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between bg-card rounded-xl p-3 border border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateWeek(-1)}
            className="rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <span className="text-sm font-semibold text-foreground">
            {formatWeekRange()}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateWeek(1)}
            className="rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Days List */}
        <div className="space-y-3">
          {weekData.map((day) => {
            const { dayName, dayNumber, isToday } = formatDate(day.date);

            return (
              <div key={day.date} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                      isToday
                        ? "gradient-primary text-primary-foreground font-bold"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xs uppercase">{dayName}</div>
                      <div className="text-base font-bold">{dayNumber}</div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {day.appointments.length}{" "}
                    {day.appointments.length === 1
                      ? "agendamento"
                      : "agendamentos"}
                  </h3>
                </div>

                {day.appointments.length > 0 ? (
                  <div className="space-y-2">
                    {day.appointments.map((appointment) => (
                      <Card
                        key={appointment.id}
                        className="p-4 hover:shadow-md transition-all cursor-pointer border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">
                              {appointment.appointment_time.slice(0, 5)}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(appointment.status)}
                          >
                            {getStatusLabel(appointment.status)}
                          </Badge>
                        </div>
                        <p className="font-medium text-foreground">
                          {appointment.client_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.services.name}
                        </p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-4 border-border border-dashed">
                    <p className="text-sm text-muted-foreground text-center">
                      Nenhum agendamento
                    </p>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav isAdmin={userRole === "admin"} />
    </div>
  );
};

export default CalendarView;
