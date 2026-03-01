import type { DailyLog } from '../types';

interface HeatMapProps {
  logs: DailyLog[];
  days?: number;
  targetCount: number;
}

export const HeatMap = ({ logs, days = 14, targetCount }: HeatMapProps) => {
  const getLastNDays = () => {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push(date.toISOString().split('T')[0]);
    }
    return result;
  };

  const lastNDays = getLastNDays();

  const getIntensity = (dateStr: string) => {
    const log = logs.find(l => l.date.split('T')[0] === dateStr);
    if (!log) return 0;
    const percentage = (log.completedCount / targetCount) * 100;
    if (percentage >= 100) return 3;
    if (percentage >= 50) return 2;
    if (percentage > 0) return 1;
    return 0;
  };

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 3: return 'bg-accent-cyan shadow-glow-cyan';
      case 2: return 'bg-cyan-600';
      case 1: return 'bg-cyan-800';
      default: return 'bg-slate-200 dark:bg-zinc-800';
    }
  };

  return (
    <div className="flex gap-1">
      {lastNDays.map((date) => {
        const intensity = getIntensity(date);
        return (
          <div
            key={date}
            className={`w-2 h-2 rounded-sm transition-all duration-300 ${getColor(intensity)}`}
            title={date}
          />
        );
      })}
    </div>
  );
};
