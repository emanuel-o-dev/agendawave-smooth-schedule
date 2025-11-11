import { useState, useEffect } from "react";
import { Calendar, Clock, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleBlock {
  id: string;
  block_date: string;
  start_time: string | null;
  end_time: string | null;
  is_full_day: boolean;
  reason: string | null;
}

export const ScheduleBlocks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    block_date: "",
    start_time: "",
    end_time: "",
    is_full_day: true,
    reason: "",
  });

  useEffect(() => {
    if (user) {
      loadBlocks();
    }
  }, [user]);

  const loadBlocks = async () => {
    const { data, error } = await (supabase as any)
      .from("schedule_blocks")
      .select("*")
      .eq("user_id", user?.id)
      .order("block_date", { ascending: true });

    if (error) {
      console.error("Error loading blocks:", error);
      toast({
        title: "Erro ao carregar bloqueios",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setBlocks(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.block_date) {
      toast({
        title: "Erro",
        description: "Selecione uma data para o bloqueio.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.is_full_day && (!formData.start_time || !formData.end_time)) {
      toast({
        title: "Erro",
        description: "Para bloqueios parciais, informe horário de início e fim.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await (supabase as any).from("schedule_blocks").insert({
      user_id: user?.id,
      block_date: formData.block_date,
      start_time: formData.is_full_day ? null : formData.start_time,
      end_time: formData.is_full_day ? null : formData.end_time,
      is_full_day: formData.is_full_day,
      reason: formData.reason || null,
    });

    if (error) {
      console.error("Error creating block:", error);
      toast({
        title: "Erro ao criar bloqueio",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bloqueio criado!",
      description: "O horário foi bloqueado com sucesso.",
    });

    setFormData({
      block_date: "",
      start_time: "",
      end_time: "",
      is_full_day: true,
      reason: "",
    });
    setShowForm(false);
    loadBlocks();
  };

  const handleDelete = async (blockId: string) => {
    const { error } = await (supabase as any)
      .from("schedule_blocks")
      .delete()
      .eq("id", blockId);

    if (error) {
      console.error("Error deleting block:", error);
      toast({
        title: "Erro ao excluir bloqueio",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bloqueio removido",
      description: "O horário está disponível novamente.",
    });

    loadBlocks();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Bloqueios de Horário
          </h3>
          <p className="text-sm text-muted-foreground">
            Marque férias, compromissos pessoais ou horários indisponíveis
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
          size="sm"
          className="gap-2"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Novo Bloqueio
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 border-border bg-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="block_date">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="block_date"
                  type="date"
                  value={formData.block_date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, block_date: e.target.value })
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="is_full_day" className="text-sm font-medium">
                  Bloquear dia inteiro
                </Label>
                <p className="text-xs text-muted-foreground">
                  Marque para bloquear o dia completo
                </p>
              </div>
              <Switch
                id="is_full_day"
                checked={formData.is_full_day}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_full_day: checked })
                }
              />
            </div>

            {!formData.is_full_day && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Horário Início</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Horário Fim</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Input
                id="reason"
                type="text"
                placeholder="Ex: Férias, Compromisso pessoal..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>

            <Button type="submit" className="w-full">
              Criar Bloqueio
            </Button>
          </form>
        </Card>
      )}

      {/* Lista de bloqueios */}
      <div className="space-y-2">
        {blocks.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <p className="text-sm text-muted-foreground">
              Nenhum bloqueio cadastrado
            </p>
          </Card>
        ) : (
          blocks.map((block) => (
            <Card key={block.id} className="p-4 border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">
                      {formatDate(block.block_date)}
                    </span>
                  </div>
                  {block.is_full_day ? (
                    <p className="text-xs text-muted-foreground pl-6">
                      Dia inteiro bloqueado
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 pl-6">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {block.start_time} - {block.end_time}
                      </span>
                    </div>
                  )}
                  {block.reason && (
                    <p className="text-xs text-muted-foreground pl-6">
                      {block.reason}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(block.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
