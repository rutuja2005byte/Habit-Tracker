"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  Check,
  ChevronRight,
  Code2,
  Download,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  Home,
  Moon,
  PenLine,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Target,
  Trophy,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Heatmap } from "@/components/habit-tracker/heatmap";
import { ProgressRing } from "@/components/habit-tracker/progress-ring";
import { habitColors, quotes } from "@/constants/defaults";
import { cn } from "@/lib/utils";
import {
  getCompletionRate,
  getCurrentStreak,
  getHabitStatusForDate,
  getLongestStreak,
  goalTypeLabel,
  HabitState,
  useHabitStore,
} from "@/store/useHabitStore";
import { GoalType, Habit, HabitStatus } from "@/types";
import { formatShortDate, lastNDays, todayKey } from "@/utils/date";
import { useNotifications } from "@/hooks/useNotifications";

const iconMap = { Activity, BookOpen, Briefcase, Code2, Droplets, Dumbbell, HeartPulse, Moon, PenLine, Sparkles, Target, Wallet };
const nav = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "habits", label: "Habits", icon: Check },
  { id: "goals", label: "Goals", icon: Target },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type View = (typeof nav)[number]["id"];

const blankHabit = { name: "", icon: "Sparkles", color: "#0ea5e9", category: "Personal", frequency: "Daily", notes: "" };
const blankGoal = { title: "", type: "weekly" as GoalType, target: 5, completed: 0, unit: "times", deadline: "", notes: "", milestones: "", color: "#6366f1" };

function IconBadge({ icon, color, className }: { icon: string; color: string; className?: string }) {
  const Icon = iconMap[icon as keyof typeof iconMap] ?? Sparkles;
  return (
    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm", className)} style={{ backgroundColor: color }}>
      <Icon className="h-5 w-5" />
    </span>
  );
}

function statusClasses(status?: HabitStatus) {
  if (status === "completed") return "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  if (status === "skipped") return "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  if (status === "missed") return "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
  return "border-zinc-200 bg-white/70 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400";
}

export function HabitTrackerApp() {
  const store = useHabitStore();
  const { sendTestReminder } = useNotifications(store.settings.notifications);
  const [view, setView] = useState<View>("dashboard");
  const [query, setQuery] = useState("");
  const [habitOpen, setHabitOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [habitForm, setHabitForm] = useState(blankHabit);
  const [goalForm, setGoalForm] = useState(blankGoal);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const todayCompleted = store.habits.filter((habit) => getHabitStatusForDate(habit, todayKey()) === "completed").length;
  const todayRate = store.habits.length ? Math.round((todayCompleted / store.habits.length) * 100) : 0;
  const allDone = store.habits.length > 0 && todayCompleted === store.habits.length;
  const currentStreak = Math.max(0, ...store.habits.map(getCurrentStreak));
  const longestStreak = Math.max(0, ...store.habits.map(getLongestStreak));
  const xp = store.habits.reduce((sum, habit) => sum + habit.logs.filter((log) => log.status === "completed").length * 12, 0);
  const level = Math.max(1, Math.floor(xp / 250) + 1);
  const quote = quotes[new Date().getDate() % quotes.length];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", store.settings.theme === "dark");
    document.documentElement.style.setProperty("--accent", store.settings.accentColor);
  }, [store.settings.theme, store.settings.accentColor]);

  useEffect(() => {
    if (allDone) confetti({ particleCount: 120, spread: 80, origin: { y: 0.75 } });
  }, [allDone]);

  const filteredHabits = store.habits.filter((habit) => `${habit.name} ${habit.category} ${habit.notes}`.toLowerCase().includes(query.toLowerCase()));
  const filteredGoals = store.goals.filter((goal) => `${goal.title} ${goal.notes} ${goal.type}`.toLowerCase().includes(query.toLowerCase()));

  const completionTrend = useMemo(
    () =>
      lastNDays(14).map((date) => ({
        date: formatShortDate(date),
        completion: store.habits.length
          ? Math.round((store.habits.filter((habit) => getHabitStatusForDate(habit, date) === "completed").length / store.habits.length) * 100)
          : 0,
      })),
    [store.habits],
  );

  const habitSuccess = store.habits.map((habit) => ({ name: habit.name, value: getCompletionRate(habit), color: habit.color }));
  const selectedDateHabits = store.habits.filter((habit) => getHabitStatusForDate(habit, selectedDate) === "completed");
  const activeGoals = store.goals.filter((goal) => goal.status !== "completed").length;
  const finishedGoals = store.goals.length - activeGoals;
  const mostConsistent = [...store.habits].sort((a, b) => getCompletionRate(b) - getCompletionRate(a))[0];

  const addHabit = () => {
    if (!habitForm.name.trim()) return;
    store.addHabit(habitForm);
    setHabitForm(blankHabit);
    setHabitOpen(false);
  };

  const addGoal = () => {
    if (!goalForm.title.trim()) return;
    store.addGoal({
      title: goalForm.title,
      type: goalForm.type,
      target: Number(goalForm.target),
      completed: Number(goalForm.completed),
      unit: goalForm.unit,
      deadline: goalForm.deadline,
      notes: goalForm.notes,
      milestones: goalForm.milestones.split(",").map((item) => item.trim()).filter(Boolean),
      status: "active",
      color: goalForm.color,
    });
    setGoalForm(blankGoal);
    setGoalOpen(false);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ habits: store.habits, goals: store.goals, categories: store.categories, settings: store.settings }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `habit-tracker-${todayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => store.importData(JSON.parse(text)));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_34%),linear-gradient(135deg,#f8fafc,#eef2ff_45%,#fdf2f8)] text-zinc-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.2),transparent_32%),linear-gradient(135deg,#09090b,#111827_55%,#18181b)] dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl gap-4 px-4 py-4 lg:px-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-3xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:flex">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"><Flame className="h-5 w-5" /></div>
            <div>
              <p className="font-semibold">Life OS</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Habit & Goal Tracker</p>
            </div>
          </div>
          <nav className="mt-6 grid gap-1">
            {nav.map((item) => (
              <button key={item.id} onClick={() => setView(item.id)} className={cn("flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition", view === item.id ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-600 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-white/10")}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <Card className="mt-auto bg-zinc-950 p-4 text-white dark:bg-white dark:text-zinc-950">
            <div className="flex items-center justify-between"><span className="text-sm font-medium">Level {level}</span><Trophy className="h-4 w-4" /></div>
            <Progress value={xp % 250 / 2.5} className="mt-3 bg-white/20" indicatorClassName="bg-white dark:bg-zinc-950" />
            <p className="mt-2 text-xs opacity-70">{xp} XP earned</p>
          </Card>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-4">
          <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-white/50 bg-white/65 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/55 lg:top-4 lg:mx-0 lg:rounded-3xl lg:border">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Today, {new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Build a life you can measure.</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1 md:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search habits and goals" className="pl-9" />
                </div>
                <AddHabitDialog open={habitOpen} setOpen={setHabitOpen} form={habitForm} setForm={setHabitForm} onAdd={addHabit} categories={store.categories.map((category) => category.name)} />
                <AddGoalDialog open={goalOpen} setOpen={setGoalOpen} form={goalForm} setForm={setGoalForm} onAdd={addGoal} />
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              {view === "dashboard" && (
                <div className="grid gap-4">
                  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Metric title="Completed Today" value={`${todayCompleted}/${store.habits.length}`} icon={Check} tone="emerald" />
                    <Metric title="Current Streak" value={`${currentStreak} days`} icon={Flame} tone="orange" />
                    <Metric title="Longest Streak" value={`${longestStreak} days`} icon={Trophy} tone="violet" />
                    <Metric title="Completion" value={`${todayRate}%`} icon={Activity} tone="sky" />
                  </section>
                  <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                    <Card>
                      <div className="mb-5 flex items-center justify-between"><div><CardTitle>Today&apos;s Habits</CardTitle><CardDescription>{quote}</CardDescription></div><Flame className="h-5 w-5 text-orange-500" /></div>
                      <div className="grid gap-3">
                        {filteredHabits.map((habit) => <HabitRow key={habit.id} habit={habit} onStatus={store.updateHabitStatus} onOpen={() => setSelectedHabit(habit)} />)}
                      </div>
                    </Card>
                    <Card>
                      <CardTitle>Progress Rings</CardTitle>
                      <div className="mt-6 grid grid-cols-2 gap-5">
                        <ProgressRing value={todayRate} label="Today" color="#0ea5e9" />
                        <ProgressRing value={Math.round(completionTrend.reduce((sum, item) => sum + item.completion, 0) / Math.max(1, completionTrend.length))} label="Weekly" color="#22c55e" />
                        <ProgressRing value={Math.round(store.goals.filter((goal) => goal.type === "monthly").reduce((sum, goal) => sum + (goal.completed / goal.target) * 100, 0) / Math.max(1, store.goals.filter((goal) => goal.type === "monthly").length))} label="Monthly" color="#ec4899" />
                        <ProgressRing value={Math.round(store.goals.filter((goal) => goal.type === "fiveYear").reduce((sum, goal) => sum + (goal.completed / goal.target) * 100, 0) / Math.max(1, store.goals.filter((goal) => goal.type === "fiveYear").length))} label="5-Year" color="#a855f7" />
                      </div>
                    </Card>
                  </section>
                  <section className="grid gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                      <CardTitle>Calendar Heatmap</CardTitle>
                      <CardDescription>Click a day to inspect completed habits.</CardDescription>
                      <div className="mt-5"><Heatmap habits={store.habits} onSelect={setSelectedDate} /></div>
                      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{selectedDate}: {selectedDateHabits.length ? selectedDateHabits.map((habit) => habit.name).join(", ") : "No completed habits"}</p>
                    </Card>
                    <Card>
                      <CardTitle>Widgets</CardTitle>
                      <div className="mt-4 grid gap-3 text-sm">
                        <Widget label="Today's Focus" value={store.habits.find((habit) => getHabitStatusForDate(habit, todayKey()) !== "completed")?.name ?? "All clear"} />
                        <Widget label="Upcoming Deadlines" value={`${store.goals.filter((goal) => goal.deadline && goal.status !== "completed").length} active`} />
                        <Widget label="Most Consistent" value={mostConsistent?.name ?? "Start tracking"} />
                        <Widget label="Quote" value={quote} />
                      </div>
                    </Card>
                  </section>
                </div>
              )}

              {view === "habits" && <HabitsView habits={filteredHabits} onStatus={store.updateHabitStatus} onOpen={setSelectedHabit} />}
              {view === "goals" && <GoalsView goals={filteredGoals} updateGoalProgress={store.updateGoalProgress} />}
              {view === "calendar" && <CalendarView habits={store.habits} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
              {view === "analytics" && <AnalyticsView trend={completionTrend} success={habitSuccess} habits={store.habits} currentStreak={currentStreak} longestStreak={longestStreak} />}
              {view === "settings" && <SettingsView store={store} exportData={exportData} importData={importData} sendTestReminder={sendTestReminder} stats={{ total: store.habits.length, todayCompleted, todayRate, activeGoals, finishedGoals, currentStreak, longestStreak }} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 rounded-3xl border border-white/70 bg-white/80 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/85 lg:hidden">
        {nav.map((item) => <button key={item.id} onClick={() => setView(item.id)} className={cn("grid place-items-center rounded-2xl py-2", view === item.id ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-500")}><item.icon className="h-5 w-5" /></button>)}
      </nav>
      <button onClick={() => setHabitOpen(true)} className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-zinc-950 text-white shadow-2xl dark:bg-white dark:text-zinc-950 lg:hidden"><Plus className="h-6 w-6" /></button>
      <HabitDetail habit={selectedHabit} onClose={() => setSelectedHabit(null)} />
    </div>
  );
}

function Metric({ title, value, icon: Icon, tone }: { title: string; value: string; icon: typeof Activity; tone: "emerald" | "orange" | "violet" | "sky" }) {
  const colors = { emerald: "bg-emerald-500", orange: "bg-orange-500", violet: "bg-violet-500", sky: "bg-sky-500" };
  return <Card><div className="flex items-center justify-between"><div><p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div><span className={cn("grid h-11 w-11 place-items-center rounded-2xl text-white", colors[tone])}><Icon className="h-5 w-5" /></span></div></Card>;
}

function HabitRow({ habit, onStatus, onOpen }: { habit: Habit; onStatus: (id: string, status: HabitStatus) => void; onOpen: () => void }) {
  const status = getHabitStatusForDate(habit, todayKey());
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white/65 p-3 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
      <IconBadge icon={habit.icon} color={habit.color} />
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p className="truncate font-medium">{habit.name}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{habit.category} · {getCurrentStreak(habit)} day streak · {getCompletionRate(habit)}%</p>
      </button>
      {(["completed", "skipped", "missed"] as HabitStatus[]).map((item) => (
        <button key={item} onClick={() => onStatus(habit.id, item)} className={cn("hidden rounded-xl border px-2.5 py-1.5 text-xs font-medium capitalize sm:block", status === item ? statusClasses(item) : statusClasses())}>{item}</button>
      ))}
      <button onClick={() => onStatus(habit.id, "completed")} className={cn("grid h-9 w-9 place-items-center rounded-xl border sm:hidden", statusClasses(status))}>{status === "completed" ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>
    </div>
  );
}

function AddHabitDialog({ open, setOpen, form, setForm, onAdd, categories }: { open: boolean; setOpen: (open: boolean) => void; form: typeof blankHabit; setForm: (form: typeof blankHabit) => void; onAdd: () => void; categories: string[] }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="icon"><Plus className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold">Add Habit</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-zinc-500">Create a daily system you can actually keep.</DialogDescription>
        <div className="mt-5 grid gap-3">
          <Input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <select className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-900" value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })}>{Object.keys(iconMap).map((icon) => <option key={icon}>{icon}</option>)}</select>
            <select className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-900" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          </div>
          <div className="flex gap-2">{habitColors.map((color) => <button key={color} onClick={() => setForm({ ...form, color })} className={cn("h-8 w-8 rounded-full ring-offset-2", form.color === color && "ring-2 ring-zinc-950 dark:ring-white")} style={{ backgroundColor: color }} />)}</div>
          <Input placeholder="Frequency" value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value })} />
          <Textarea placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          <Button onClick={onAdd}>Create habit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddGoalDialog({ open, setOpen, form, setForm, onAdd }: { open: boolean; setOpen: (open: boolean) => void; form: typeof blankGoal; setForm: (form: typeof blankGoal) => void; onAdd: () => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="secondary"><Target className="h-4 w-4" />Goal</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold">Create Goal</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-zinc-500">Daily, weekly, monthly, yearly, or five-year vision.</DialogDescription>
        <div className="mt-5 grid gap-3">
          <Input placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <select className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-900" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as GoalType })}>{Object.keys(goalTypeLabel).map((type) => <option key={type} value={type}>{goalTypeLabel[type as GoalType]}</option>)}</select>
            <Input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3"><Input type="number" value={form.target} onChange={(event) => setForm({ ...form, target: Number(event.target.value) })} /><Input type="number" value={form.completed} onChange={(event) => setForm({ ...form, completed: Number(event.target.value) })} /><Input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} /></div>
          <Input placeholder="Milestones, comma separated" value={form.milestones} onChange={(event) => setForm({ ...form, milestones: event.target.value })} />
          <Textarea placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          <Button onClick={onAdd}>Create goal</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HabitsView({ habits, onStatus, onOpen }: { habits: Habit[]; onStatus: (id: string, status: HabitStatus) => void; onOpen: (habit: Habit) => void }) {
  return <div className="grid gap-4 md:grid-cols-2">{habits.map((habit) => <Card key={habit.id}><HabitRow habit={habit} onStatus={onStatus} onOpen={() => onOpen(habit)} /></Card>)}</div>;
}

function GoalsView({ goals, updateGoalProgress }: { goals: ReturnType<typeof useHabitStore.getState>["goals"]; updateGoalProgress: (id: string, value: number) => void }) {
  return <div className="grid gap-4 lg:grid-cols-2">{goals.map((goal) => { const value = Math.round((goal.completed / goal.target) * 100); return <Card key={goal.id}><div className="flex items-start justify-between gap-4"><div><CardTitle>{goal.title}</CardTitle><CardDescription>{goalTypeLabel[goal.type]} · {goal.deadline ? `Due ${goal.deadline}` : "No deadline"}</CardDescription></div><span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: goal.color }}>{goal.status}</span></div><Progress value={value} className="mt-5" indicatorClassName="bg-[var(--accent)]" /><div className="mt-4 flex items-center justify-between text-sm"><span>{goal.completed}/{goal.target} {goal.unit}</span><span>{value}%</span></div><div className="mt-4 flex gap-2"><Button size="sm" variant="secondary" onClick={() => updateGoalProgress(goal.id, goal.completed - 1)}>-</Button><Button size="sm" onClick={() => updateGoalProgress(goal.id, goal.completed + 1)}>+</Button></div>{goal.milestones.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{goal.milestones.map((milestone) => <span key={milestone} className="rounded-full bg-zinc-100 px-3 py-1 text-xs dark:bg-white/10">{milestone}</span>)}</div>}</Card>; })}</div>;
}

function CalendarView({ habits, selectedDate, setSelectedDate }: { habits: Habit[]; selectedDate: string; setSelectedDate: (date: string) => void }) {
  const completed = habits.filter((habit) => getHabitStatusForDate(habit, selectedDate) === "completed");
  return <div className="grid gap-4"><Card><CardTitle>Contribution Calendar</CardTitle><CardDescription>GitHub-style habit intensity across the last 140 days.</CardDescription><div className="mt-5"><Heatmap habits={habits} onSelect={setSelectedDate} /></div></Card><Card><CardTitle>{selectedDate}</CardTitle><div className="mt-4 grid gap-3">{completed.length ? completed.map((habit) => <HabitRow key={habit.id} habit={habit} onStatus={() => undefined} onOpen={() => undefined} />) : <EmptyState title="No completed habits" body="This day is still a blank square in the story." />}</div></Card></div>;
}

function AnalyticsView({ trend, success, habits, currentStreak, longestStreak }: { trend: { date: string; completion: number }[]; success: { name: string; value: number; color: string }[]; habits: Habit[]; currentStreak: number; longestStreak: number }) {
  const missed = habits.map((habit) => ({ name: habit.name, missed: habit.logs.filter((log) => log.status === "missed").length }));
  return <div className="grid gap-4 xl:grid-cols-2"><Card><CardTitle>Daily Completion</CardTitle><div className="mt-4 h-72"><ResponsiveContainer><AreaChart data={trend}><defs><linearGradient id="completion" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} /><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} /><XAxis dataKey="date" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Area type="monotone" dataKey="completion" stroke="#0ea5e9" fill="url(#completion)" /></AreaChart></ResponsiveContainer></div></Card><Card><CardTitle>Habit Success Rate</CardTitle><div className="mt-4 h-72"><ResponsiveContainer><PieChart><Pie data={success} dataKey="value" nameKey="name" innerRadius={68} outerRadius={100}>{success.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></Card><Card><CardTitle>Missed Habits</CardTitle><div className="mt-4 h-72"><ResponsiveContainer><BarChart data={missed}><CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="missed" fill="#f43f5e" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card><Card><CardTitle>Streak Intelligence</CardTitle><div className="mt-6 grid grid-cols-2 gap-4"><Metric title="Current" value={`${currentStreak} days`} icon={Flame} tone="orange" /><Metric title="Longest" value={`${longestStreak} days`} icon={Trophy} tone="violet" /></div></Card></div>;
}

function SettingsView({ store, exportData, importData, sendTestReminder, stats }: { store: HabitState; exportData: () => void; importData: (event: ChangeEvent<HTMLInputElement>) => void; sendTestReminder: () => void; stats: Record<string, number> }) {
  return <div className="grid gap-4 lg:grid-cols-2"><Card><CardTitle>Appearance</CardTitle><div className="mt-4 flex gap-2"><Button variant={store.settings.theme === "light" ? "default" : "secondary"} onClick={() => store.setTheme("light")}>Light</Button><Button variant={store.settings.theme === "dark" ? "default" : "secondary"} onClick={() => store.setTheme("dark")}>Dark</Button></div><div className="mt-5 flex gap-2">{habitColors.map((color) => <button key={color} onClick={() => store.setAccentColor(color)} className="h-9 w-9 rounded-full ring-offset-2" style={{ backgroundColor: color }} />)}</div></Card><Card><CardTitle>Notifications</CardTitle><div className="mt-4 grid gap-3">{(["enabled", "morning", "afternoon", "evening"] as const).map((key) => <label key={key} className="flex items-center justify-between rounded-xl bg-zinc-100 p-3 text-sm capitalize dark:bg-white/10"><span>{key} reminder</span><input type="checkbox" checked={store.settings.notifications[key]} onChange={() => store.toggleNotifications(key)} /></label>)}<Button variant="secondary" onClick={sendTestReminder}><Bell className="h-4 w-4" />Test notification</Button></div></Card><Card><CardTitle>Data</CardTitle><div className="mt-4 flex flex-wrap gap-2"><Button onClick={exportData}><Download className="h-4 w-4" />Export JSON</Button><label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-white/70 px-4 text-sm font-medium ring-1 ring-zinc-200 dark:bg-white/10 dark:ring-white/10"><Upload className="h-4 w-4" />Import JSON<input className="hidden" type="file" accept="application/json" onChange={importData} /></label><Button variant="danger" onClick={store.resetData}><RotateCcw className="h-4 w-4" />Reset Data</Button></div></Card><Card><CardTitle>Statistics</CardTitle><div className="mt-4 grid grid-cols-2 gap-3">{Object.entries(stats).map(([key, value]) => <Widget key={key} label={key.replace(/([A-Z])/g, " $1")} value={String(value)} />)}</div></Card></div>;
}

function HabitDetail({ habit, onClose }: { habit: Habit | null; onClose: () => void }) {
  if (!habit) return null;
  const trend = lastNDays(30).map((date) => ({ date: formatShortDate(date), completion: getHabitStatusForDate(habit, date) === "completed" ? 100 : 0 }));
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-sm"><Card className="max-h-[90vh] w-full max-w-3xl overflow-auto bg-white dark:bg-zinc-950"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><IconBadge icon={habit.icon} color={habit.color} /><div><CardTitle>{habit.name}</CardTitle><CardDescription>{habit.category} · {habit.frequency}</CardDescription></div></div><Button size="icon" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button></div><div className="mt-6 grid gap-4 md:grid-cols-3"><Metric title="Completion" value={`${getCompletionRate(habit)}%`} icon={Activity} tone="sky" /><Metric title="Current Streak" value={`${getCurrentStreak(habit)} days`} icon={Flame} tone="orange" /><Metric title="Longest Streak" value={`${getLongestStreak(habit)} days`} icon={Trophy} tone="violet" /></div><div className="mt-6 h-64"><ResponsiveContainer><AreaChart data={trend}><XAxis dataKey="date" fontSize={12} /><YAxis hide /><Tooltip /><Area dataKey="completion" stroke={habit.color} fill={habit.color} fillOpacity={0.18} /></AreaChart></ResponsiveContainer></div><div className="mt-4"><Heatmap habits={[habit]} onSelect={() => undefined} /></div><p className="mt-5 rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-600 dark:bg-white/10 dark:text-zinc-300">{habit.notes || "No notes yet."}</p></Card></div>;
}

function Widget({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-zinc-100/80 p-3 dark:bg-white/10"><p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="grid place-items-center rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-white/15"><Sparkles className="mb-3 h-8 w-8 text-zinc-400" /><p className="font-medium">{title}</p><p className="mt-1 text-sm text-zinc-500">{body}</p></div>;
}
