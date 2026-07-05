"use client";

import { Habit } from "@/types";
import { lastNDays } from "@/utils/date";
import { cn } from "@/lib/utils";

export function Heatmap({ habits, onSelect }: { habits: Habit[]; onSelect: (date: string) => void }) {
  const days = lastNDays(140);
  const intensity = (date: string) => habits.filter((habit) => habit.logs.some((log) => log.date === date && log.status === "completed")).length;
  const max = Math.max(1, ...days.map(intensity));

  return (
    <div className="overflow-x-auto pb-1">
      <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
        {days.map((day) => {
          const level = intensity(day);
          const opacity = level === 0 ? 0.12 : 0.25 + (level / max) * 0.75;
          return (
            <button
              key={day}
              onClick={() => onSelect(day)}
              title={`${day}: ${level} completed`}
              className={cn("h-4 w-4 rounded-[5px] ring-1 ring-black/5 transition hover:scale-125 dark:ring-white/10")}
              style={{ backgroundColor: `rgba(14, 165, 233, ${opacity})` }}
            />
          );
        })}
      </div>
    </div>
  );
}
