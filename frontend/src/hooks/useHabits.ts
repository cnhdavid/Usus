import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { CreateHabitRequest, UpdateHabitRequest } from '../types';

export const useHabits = () => {
  const queryClient = useQueryClient();

  const habitsQuery = useQuery({
    queryKey: ['habits'],
    queryFn: () => apiClient.habits.getAll(),
  });

  const createHabitMutation = useMutation({
    mutationFn: (data: CreateHabitRequest) => apiClient.habits.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHabitRequest }) =>
      apiClient.habits.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (id: number) => apiClient.habits.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  return {
    habits: habitsQuery.data ?? [],
    isLoading: habitsQuery.isLoading,
    error: habitsQuery.error,
    createHabit: createHabitMutation.mutate,
    updateHabit: updateHabitMutation.mutate,
    deleteHabit: deleteHabitMutation.mutate,
  };
};
