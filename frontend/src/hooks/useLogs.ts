import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { CreateDailyLogRequest, UpdateDailyLogRequest, Habit } from '../types';

export const useLogs = (habitId?: number) => {
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ['logs', habitId],
    queryFn: () => habitId ? apiClient.logs.getByHabit(habitId) : Promise.resolve([]),
    enabled: !!habitId,
  });

  const createLogMutation = useMutation({
    mutationFn: (data: CreateDailyLogRequest) => apiClient.logs.create(data),
    onMutate: async (newLog) => {
      await queryClient.cancelQueries({ queryKey: ['logs', newLog.habitId] });
      
      const previousLogs = queryClient.getQueryData(['logs', newLog.habitId]);
      
      queryClient.setQueryData(['logs', newLog.habitId], (old: any) => {
        return [...(old || []), { ...newLog, id: Date.now() }];
      });
      
      return { previousLogs };
    },
    onError: (err, newLog, context) => {
      queryClient.setQueryData(['logs', newLog.habitId], context?.previousLogs);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['logs', variables.habitId] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const updateLogMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDailyLogRequest }) =>
      apiClient.logs.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: (id: number) => apiClient.logs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const toggleHabitCompletion = async (habit: Habit, date: Date = new Date()) => {
    const dateStr = date.toISOString().split('T')[0];
    const logs = logsQuery.data || [];
    const existingLog = logs.find(log => 
      log.habitId === habit.id && log.date.split('T')[0] === dateStr
    );

    if (existingLog) {
      // Already logged for this day — unmark it
      await deleteLogMutation.mutateAsync(existingLog.id);
    } else {
      // Mark as fully complete for this day
      await createLogMutation.mutateAsync({
        habitId: habit.id,
        date: dateStr,
        completedCount: habit.targetCount,
      });
    }
  };

  return {
    logs: logsQuery.data ?? [],
    isLoading: logsQuery.isLoading,
    error: logsQuery.error,
    createLog: createLogMutation.mutate,
    updateLog: updateLogMutation.mutate,
    deleteLog: deleteLogMutation.mutate,
    toggleHabitCompletion,
  };
};
