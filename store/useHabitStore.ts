"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultCategories, defaultGoals, defaultHabits, defaultSettings } from "@/constants/defaults";
import { Category, Goal, GoalType, Habit, HabitStatus, Settings } from "@/types";
import { daysAgo, isWithinDays, todayKey } from "@/utils/date";

type HabitInput = Omit<Habit, "id" | "createdAt" | "logs">;
type GoalInput = Omit<Goal, "id">;

export type HabitState = {
  habits: Habit[];
  goals: Goal[];
  categories: Category[];
  settings: Settings;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  addHabit: (habit: HabitInput) => void;
  updateHabitStatus: (habitId: string, status: HabitStatus) => void;
  addGoal: (goal: GoalInput) => void;
  updateGoalProgress: (goalId: string, completed: number) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  setTheme: (theme: Settings["theme"]) => void;
  setAccentColor: (color: string) => void;
  toggleNotifications: (key: keyof Settings["notifications"]) => void;
  importData: (payload: Pick<HabitState, "habits" | "goals" | "categories" | "settings">) => void;
  resetData: () => void;
};

const id = () => crypto.randomUUID();

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: defaultHabits,
      goals: defaultGoals,
      categories: defaultCategories,
      settings: defaultSettings,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      addHabit: (habit) =>
        set((state) => ({
          habits: [{ ...habit, id: id(), createdAt: todayKey(), logs: [] }, ...state.habits],
        })),
      updateHabitStatus: (habitId, status) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;
            const logs = habit.logs.filter((log) => log.date !== todayKey());
            return { ...habit, logs: [{ date: todayKey(), status }, ...logs] };
          }),
        })),
      addGoal: (goal) => set((state) => ({ goals: [{ ...goal, id: id() }, ...state.goals] })),
      updateGoalProgress: (goalId, completed) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? { ...goal, completed: Math.min(goal.target, Math.max(0, completed)), status: completed >= goal.target ? "completed" : "active" }
              : goal,
          ),
        })),
      addCategory: (category) => set((state) => ({ categories: [{ ...category, id: id() }, ...state.categories] })),
      setTheme: (theme) => set((state) => ({ settings: { ...state.settings, theme } })),
      setAccentColor: (accentColor) => set((state) => ({ settings: { ...state.settings, accentColor } })),
      toggleNotifications: (key) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, [key]: !state.settings.notifications[key] },
          },
        })),
      importData: (payload) => set(payload),
      resetData: () => set({ habits: defaultHabits, goals: defaultGoals, categories: defaultCategories, settings: defaultSettings }),
    }),
    {
      name: "habit-tracker-v1",
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: (state) => ({
        habits: state.habits,
        goals: state.goals,
        categories: state.categories,
        settings: state.settings,
      }),
    },
  ),
);

export const getHabitStatusForDate = (habit: Habit, date: string) =>
  habit.logs.find((log) => log.date === date)?.status;

export const getCompletionRate = (habit: Habit, days = 30) => {
  const completed = habit.logs.filter((log) => log.status === "completed" && isWithinDays(log.date, days)).length;
  return Math.round((completed / days) * 100);
};

export const getCurrentStreak = (habit: Habit) => {
  let streak = 0;
  for (let index = 0; index < 365; index++) {
    if (getHabitStatusForDate(habit, daysAgo(index)) === "completed") streak += 1;
    else break;
  }
  return streak;
};

export const getLongestStreak = (habit: Habit) => {
  const dates = new Set(habit.logs.filter((log) => log.status === "completed").map((log) => log.date));
  let longest = 0;
  let current = 0;
  for (let index = 364; index >= 0; index--) {
    if (dates.has(daysAgo(index))) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
};

export const goalTypeLabel: Record<GoalType, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  fiveYear: "5-Year",
};
