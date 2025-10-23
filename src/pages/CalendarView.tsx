import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/Layout/AppHeader";
import BottomNav from "@/components/Layout/BottomNav";

interface DayAppointment {
  date: string;
  appointments: Array<{
    id: string;
    clientName: string;
    service: string;
    time: string;
    status: "confirmed" | "pending" | "cancelled";
  }>;
}

const CalendarView = () => {
  const [currentWeek, setCurrentWeek] = useState(0);

  // Mock data para a semana
  const weekData: DayAppointment[] = [
    {
      date: "2025-10-20",
      appointments: [
        {
          id: "1",
          clientName: "Pedro Lima",
          service: "Corte",
          time: "10:00",
          status: "confirmed",
        },
      ],
    },
    {
      date: "2025-10-21",
      appointments: [
        {
          id: "2",
          clientName: "Julia Martins",
          service: "Escova",
          time: "14:00",
          status: "pending",
        },
        {
          id: "3",
          clientName: "Carlos Eduardo",
          service: "Barba",
          time: "16:00",
          status: "confirmed",
        },
      ],
    },
    {
      date: "2025-10-22",
      appointments: [],
    },
    {
      date: "2025-10-23",
      appointments: [
        {
          id: "4",
          clientName: "Maria Silva",
          service: "Corte",
          time: "10:00",
          status: "confirmed",
        },
      ],
    },
  ];

  const getStatusColor = (status: "confirmed" | "pending" | "cancelled") => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      case "cancelled":
        return "bg-red-100 text-red-700 hover:bg-red-100";
    }
  };

  const getStatusLabel = (status: "confirmed" | "pending" | "cancelled") => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelado";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    return {
      dayName: date.toLocaleDateString("pt-BR", { weekday: "short" }),
      dayNumber: date.getDate(),
      isToday,
    };
  };

  return (
    <div className="min-h-screen bg-muted pb-20">
      <AppHeader title="Calendário" subtitle="Visualize seus agendamentos" />

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between bg-card rounded-xl p-3 border border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeek(currentWeek - 1)}
            className="rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <span className="text-sm font-semibold text-foreground">
            20 - 26 Out, 2025
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeek(currentWeek + 1)}
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
                              {appointment.time}
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
                          {appointment.clientName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service}
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

      <BottomNav isAdmin={false} />
    </div>
  );
};

export default CalendarView;
