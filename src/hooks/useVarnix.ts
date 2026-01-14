import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VarnixProject {
  id: string;
  user_id: string;
  project_id: string | null;
  project_name: string;
  cost: number;
  status: string;
  created_at: string;
}

export interface VarnixPayment {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  created_at: string;
}

export const useVarnixProjects = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["varnix_projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("varnix_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VarnixProject[];
    },
    enabled: !!user,
  });
};

export const useCreateVarnixProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (project: { project_id?: string; project_name: string; cost: number; status: string }) => {
      const { data, error } = await supabase
        .from("varnix_projects")
        .insert({
          ...project,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["varnix_projects"] });
    },
  });
};

export const useVarnixPayments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["varnix_payments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("varnix_payments")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as VarnixPayment[];
    },
    enabled: !!user,
  });
};

export const useCreateVarnixPayment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payment: { date: string; amount: number }) => {
      const { data, error } = await supabase
        .from("varnix_payments")
        .insert({
          ...payment,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["varnix_payments"] });
    },
  });
};
