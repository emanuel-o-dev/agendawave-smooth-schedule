import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Copy, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DaySchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DAYS = [
  { name: "Domingo", value: 0 },
  { name: "Segunda", value: 1 },
  { name: "Terça", value: 2 },
  { name: "Quarta", value: 3 },
  { name: "Quinta", value: 4 },
  { name: "Sexta", value: 5 },
  { name: "Sábado", value: 6 },
];

const DEFAULT_SCHEDULE = {
  start_time: "09:00",
  end_time: "18:00",
  is_active: false,
};

interface WeekScheduleProps {
  userId: string;
}

export const WeekSchedule = ({ userId }: WeekScheduleProps) => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<DaySchedule[]>(
    DAYS.map((day) => ({
      day_of_week: day.value,
      ...DEFAULT_SCHEDULE,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, [userId]);

  const loadSchedules = async () => {
    const { data, error } = await supabase
      .from("provider_schedules")
      .select("*")
      .eq("user_id", userId)
      .order("day_of_week");

    if (error) {
      console.error("Error loading schedules:", error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const updatedSchedules = DAYS.map((day) => {
        const existingSchedule = data.find(
          (s) => s.day_of_week === day.value
        );
        return existingSchedule
          ? {
              day_of_week: day.value,
              start_time: existingSchedule.start_time,
              end_time: existingSchedule.end_time,
              is_active: existingSchedule.is_active,
            }
          : {
              day_of_week: day.value,
              ...DEFAULT_SCHEDULE,
            };
      });
      setSchedules(updatedSchedules);
    }

    setLoading(false);
  };

  const handleToggleDay = (dayIndex: number) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.day_of_week === dayIndex
          ? { ...schedule, is_active: !schedule.is_active }
          : schedule
      )
    );
  };

  const handleTimeChange = (
    dayIndex: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.day_of_week === dayIndex
          ? { ...schedule, [field]: value }
          : schedule
      )
    );
  };

  const handleCopyToAll = (dayIndex: number) => {
    const sourceDaySchedule = schedules.find((s) => s.day_of_week === dayIndex);
    if (!sourceDaySchedule) return;

    setSchedules((prev) =>
      prev.map((schedule) => ({
        ...schedule,
        start_time: sourceDaySchedule.start_time,
        end_time: sourceDaySchedule.end_time,
      }))
    );

    toast({
      title: "Horários copiados!",
      description: "Horários aplicados a todos os dias.",
    });
  };

  const handleSave = async () => {
    setSaving(true);

    // Delete all existing schedules
    await supabase
      .from("provider_schedules")
      .delete()
      .eq("user_id", userId);

    // Insert only active schedules
    const activeSchedules = schedules
      .filter((s) => s.is_active)
      .map((s) => ({
        user_id: userId,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        is_active: s.is_active,
      }));

    if (activeSchedules.length > 0) {
      const { error } = await supabase
        .from("provider_schedules")
        .insert(activeSchedules);

      if (error) {
        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
    }

    toast({
      title: "Horários salvos!",
      description: "Sua agenda foi atualizada com sucesso.",
    });

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="p-6 border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <Label className="text-base font-semibold">
              Agenda Semanal
            </Label>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Configure os dias e horários em que você atende
        </p>

        <div className="space-y-3">
          {DAYS.map((day) => {
            const schedule = schedules.find((s) => s.day_of_week === day.value);
            if (!schedule) return null;

            return (
              <div
                key={day.value}
                className="p-4 rounded-xl border border-border bg-card/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={() => handleToggleDay(day.value)}
                    />
                    <Label className="text-sm font-medium">{day.name}</Label>
                  </div>
                  {schedule.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToAll(day.value)}
                      className="h-8 text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar para todos
                    </Button>
                  )}
                </div>

                {schedule.is_active && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Início
                      </Label>
                      <Input
                        type="time"
                        value={schedule.start_time}
                        onChange={(e) =>
                          handleTimeChange(
                            day.value,
                            "start_time",
                            e.target.value
                          )
                        }
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Fim
                      </Label>
                      <Input
                        type="time"
                        value={schedule.end_time}
                        onChange={(e) =>
                          handleTimeChange(day.value, "end_time", e.target.value)
                        }
                        className="h-10 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-xl font-semibold shadow-primary hover:scale-[1.02] transition-all"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Salvar agenda
        </Button>
      </div>
    </Card>
  );
};
