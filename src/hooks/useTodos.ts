import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Todo {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  completed: boolean;
  due_date: string | null;
  priority: string;
  created_at: string;
  updated_at: string;
}

export const useTodos = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["todos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Todo[];
    },
    enabled: !!user,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (todo: { title: string; priority?: string; due_date?: string; project_id?: string }) => {
      const { data, error } = await supabase
        .from("todos")
        .insert({
          ...todo,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Todo> & { id: string }) => {
      const { data, error } = await supabase
        .from("todos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};
