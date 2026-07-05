export type HabitStatus = "completed" | "skipped" | "missed";
export type GoalType = "daily" | "weekly" | "monthly" | "yearly" | "fiveYear";
export type GoalStatus = "not-started" | "active" | "completed" | "paused";

export type HabitLog = {
  date: string;
  status: HabitStatus;
  notes?: string;
};

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  frequency: string;
  notes: string;
  createdAt: string;
  logs: HabitLog[];
};

export type Goal = {
  id: string;
  title: string;
  type: GoalType;
  target: number;
  completed: number;
  unit: string;
  deadline?: string;
  notes: string;
  milestones: string[];
  status: GoalStatus;
  color: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type Settings = {
  theme: "light" | "dark";
  accentColor: string;
  notifications: {
    enabled: boolean;
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
};
