import { useEffect, useState } from "react";
import { Plus, Clock, User as UserIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
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
  appointment_date: string;
  appointment_time: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  services: {
    name: string;
  };
}

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    const today = new Date().toISOString().split("T")[0];

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
      .gte("appointment_date", today)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error loading appointments:", error);
      setLoading(false);
      return;
    }

    setAppointments(data || []);
    setLoading(false);
  };

  const getStatusColor = (status: Appointment["status"]) => {
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

  const getStatusLabel = (status: Appointment["status"]) => {
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
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
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
                        {appointment.client_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.services.name}
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
                    <span>{appointment.appointment_time.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>{formatDate(appointment.appointment_date)}</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center border-border">
              <p className="text-muted-foreground">
                Nenhum agendamento próximo
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Comece criando um novo agendamento
              </p>
            </Card>
          )}
        </div>
      </div>

      <BottomNav isAdmin={userRole === "admin"} />
    </div>
  );
};

export default Dashboard;
