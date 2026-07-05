import { Category, Goal, Habit, Settings } from "@/types";

const today = new Date();
const iso = (offset: number) => {
  const date = new Date(today);
  date.setDate(today.getDate() - offset);
  return date.toISOString().slice(0, 10);
};

const logs = (pattern: number[]) =>
  pattern.map((offset) => ({ date: iso(offset), status: "completed" as const }));

export const defaultCategories: Category[] = [
  { id: "fitness", name: "Fitness", color: "#f97316", icon: "Dumbbell" },
  { id: "health", name: "Health", color: "#14b8a6", icon: "HeartPulse" },
  { id: "study", name: "Study", color: "#6366f1", icon: "BookOpen" },
  { id: "career", name: "Career", color: "#0ea5e9", icon: "Briefcase" },
  { id: "finance", name: "Finance", color: "#22c55e", icon: "Wallet" },
  { id: "personal", name: "Personal", color: "#ec4899", icon: "Sparkles" },
  { id: "spiritual", name: "Spiritual", color: "#a855f7", icon: "Moon" },
];

export const habitColors = ["#0ea5e9", "#14b8a6", "#f97316", "#a855f7", "#ec4899", "#22c55e", "#f43f5e"];

export const defaultHabits: Habit[] = [
  { id: "water", name: "Drink Water", icon: "Droplets", color: "#0ea5e9", category: "Health", frequency: "Daily", notes: "8 glasses before dinner.", createdAt: iso(34), logs: logs([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14]) },
  { id: "workout", name: "Workout", icon: "Dumbbell", color: "#f97316", category: "Fitness", frequency: "5x / week", notes: "Strength or Zone 2.", createdAt: iso(60), logs: logs([0, 1, 3, 4, 6, 7, 9, 11, 13, 15, 17, 19]) },
  { id: "read", name: "Read", icon: "BookOpen", color: "#6366f1", category: "Study", frequency: "Daily", notes: "Minimum 15 pages.", createdAt: iso(90), logs: logs([0, 2, 3, 4, 5, 6, 8, 10, 11, 12]) },
  { id: "coding", name: "Coding", icon: "Code2", color: "#14b8a6", category: "Career", frequency: "Daily", notes: "Build or practice for 60 minutes.", createdAt: iso(120), logs: logs([0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13]) },
  { id: "journal", name: "Journal", icon: "PenLine", color: "#ec4899", category: "Personal", frequency: "Daily", notes: "One honest page.", createdAt: iso(20), logs: logs([1, 2, 4, 7, 8, 9, 12]) },
];

export const defaultGoals: Goal[] = [
  { id: "leetcode-week", title: "Finish 5 Leetcode Questions", type: "weekly", target: 5, completed: 3, unit: "questions", deadline: iso(-3), notes: "Focus on arrays and DP.", milestones: ["Arrays", "Sliding window", "DP basics"], status: "active", color: "#6366f1" },
  { id: "pages-month", title: "Read 100 Pages", type: "monthly", target: 100, completed: 64, unit: "pages", deadline: iso(-18), notes: "Finish the current book.", milestones: ["25 pages", "50 pages", "100 pages"], status: "active", color: "#ec4899" },
  { id: "full-stack", title: "Learn Full Stack", type: "yearly", target: 12, completed: 5, unit: "projects", deadline: "2026-12-31", notes: "Ship one meaningful project each month.", milestones: ["Next.js", "Databases", "Auth", "Deployments"], status: "active", color: "#0ea5e9" },
  { id: "software-engineer", title: "Become Software Engineer", type: "fiveYear", target: 100, completed: 24, unit: "percent", deadline: "2031-07-05", notes: "Build proof, network, intern, ship.", milestones: ["Portfolio", "Internship", "First role", "Senior craft"], status: "active", color: "#22c55e" },
];

export const defaultSettings: Settings = {
  theme: "light",
  accentColor: "#0ea5e9",
  notifications: { enabled: false, morning: true, afternoon: false, evening: true },
};

export const quotes = [
  "Small daily wins are how big futures become ordinary.",
  "Consistency is quiet until it becomes undeniable.",
  "Design the day, then let the day compound.",
  "A streak is just trust with yourself, repeated.",
];
