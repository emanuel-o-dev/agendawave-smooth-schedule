import { Plus, Clock, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/Layout/AppHeader";
import BottomNav from "@/components/Layout/BottomNav";

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
}

const Dashboard = () => {
  // Mock data - será substituído por dados reais do backend
  const appointments: Appointment[] = [
    {
      id: "1",
      clientName: "Maria Silva",
      service: "Corte de Cabelo",
      date: "2025-10-23",
      time: "10:00",
      status: "confirmed",
    },
    {
      id: "2",
      clientName: "João Santos",
      service: "Barba",
      date: "2025-10-23",
      time: "14:30",
      status: "pending",
    },
    {
      id: "3",
      clientName: "Ana Costa",
      service: "Manicure",
      date: "2025-10-24",
      time: "09:00",
      status: "confirmed",
    },
  ];

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      case "cancelled":
        return "bg-red-100 text-red-700 hover:bg-red-100";
    }
  };

  const getStatusLabel = (status: Appointment["status"]) => {
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
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="min-h-screen bg-muted pb-20">
      <AppHeader
        title="Agendamentos"
        subtitle="Gerencie seus atendimentos"
      />

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Quick Action Button */}
        <Link to="/new-appointment">
          <Button
            size="lg"
            className="w-full h-14 rounded-xl shadow-primary font-semibold text-base hover:scale-[1.02] transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Agendamento
          </Button>
        </Link>

        {/* Today's Appointments */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground px-1">
            Próximos atendimentos
          </h2>

          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="p-4 hover:shadow-md transition-all cursor-pointer border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {appointment.clientName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.service}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(appointment.status)}
                  >
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center border-border">
              <p className="text-muted-foreground">
                Nenhum agendamento para hoje
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Comece criando um novo agendamento
              </p>
            </Card>
          )}
        </div>
      </div>

      <BottomNav isAdmin={false} />
    </div>
  );
};

export default Dashboard;
