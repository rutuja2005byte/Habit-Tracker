"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Flame,
  Moon,
  Pencil,
  Plus,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Trash2,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Timeframe = "daily" | "weekly" | "monthly" | "yearly";
type Priority = "Low" | "Medium" | "High";

type Goal = {
  id: string;
  name: string;
  category: string;
  description?: string;
  createdAt: string;
  targetDate?: string;
  priority: Priority;
  completed: boolean;
};

const goalSchema = z.object({
  name: z.string().min(2, "Add a clear goal name."),
  category: z.string().min(2, "Choose a category."),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
});

type GoalFormValues = z.infer<typeof goalSchema>;

const initialGoals: Record<Timeframe, Goal[]> = {
  daily: [],
  weekly: [],
  monthly: [],
  yearly: [],
};

const tabs: { id: Timeframe; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

const timeframeCopy: Record<Timeframe, { title: string; subtitle: string; empty: string }> = {
  daily: {
    title: "Daily Goals",
    subtitle: "Small wins that make today count.",
    empty: "No daily goals yet. Start with one tiny promise.",
  },
  weekly: {
    title: "Weekly Goals",
    subtitle: "The work that compounds across seven days.",
    empty: "Your week is a blank canvas. Add the first goal.",
  },
  monthly: {
    title: "Monthly Goals",
    subtitle: "Milestones, reflection, and momentum.",
    empty: "Set a monthly milestone to make progress visible.",
  },
  yearly: {
    title: "Yearly Goals",
    subtitle: "The big arcs worth returning to.",
    empty: "Add a yearly goal that future you will thank you for.",
  },
};

function stats(goals: Goal[]) {
  const completed = goals.filter((item) => item.completed).length;
  const total = goals.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return { completed, total, pending: total - completed, percent };
}

export default function Home() {
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState<Timeframe>("daily");
  const [goalsByTimeframe, setGoalsByTimeframe] = useState(initialGoals);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; timeframe: Timeframe; goal?: Goal } | null>(null);

  const allGoals = Object.values(goalsByTimeframe).flat();
  const overall = stats(allGoals);
  const activeGoals = goalsByTimeframe[active];
  const activeStats = stats(activeGoals);
  const xp = overall.completed * 120 + activeStats.percent * 4;

  const completionData = [
    { name: "Completed", value: activeStats.completed, color: "#22c55e" },
    { name: "Pending", value: activeStats.pending, color: dark ? "#334155" : "#e2e8f0" },
  ];

  function upsertGoal(values: GoalFormValues) {
    if (!modal) return;
    setGoalsByTimeframe((current) => {
      const existing = current[modal.timeframe];
      if (modal.mode === "edit" && modal.goal) {
        return {
          ...current,
          [modal.timeframe]: existing.map((item) =>
            item.id === modal.goal?.id ? { ...item, ...values } : item,
          ),
        };
      }

      return {
        ...current,
        [modal.timeframe]: [
          ...existing,
          {
            id: crypto.randomUUID(),
            completed: false,
            createdAt: new Date().toISOString().slice(0, 10),
            ...values,
          },
        ],
      };
    });
    setModal(null);
  }

  function toggleGoal(timeframe: Timeframe, id: string) {
    setGoalsByTimeframe((current) => ({
      ...current,
      [timeframe]: current[timeframe].map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    }));
  }

  function deleteGoal(timeframe: Timeframe, id: string) {
    setGoalsByTimeframe((current) => ({
      ...current,
      [timeframe]: current[timeframe].filter((item) => item.id !== id),
    }));
  }

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  return (
    <main className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                Personal Growth Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Good Morning, Rutuja</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">{today} · Keep today calm, clear, and complete.</p>
            </div>
            <div className="flex items-center gap-2">
              <a className="primary-button" href="/tracking" aria-label="Open coding tracker">
                <TrendingUp className="h-4 w-4" />
                Track Coding
              </a>
              <button className="icon-button" type="button" aria-label="Toggle theme" onClick={() => setDark((value) => !value)}>
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard icon={Target} label="Overall Progress" value={`${overall.percent}%`} detail={`${overall.completed}/${overall.total} complete`} />
            <MetricCard icon={Flame} label="Current Streak" value="0 days" detail="No streak yet" />
            <MetricCard icon={CheckCircle2} label="Completion" value={`${activeStats.percent}%`} detail={`${timeframeCopy[active].title}`} />
            <MetricCard icon={Zap} label="XP" value={xp.toLocaleString()} detail="Growth points earned" />
            <MetricCard icon={CalendarDays} label="Today's Date" value={new Date().getDate().toString()} detail={today} />
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-sm">
            <div className="grid grid-cols-4 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`rounded-2xl px-3 py-3 text-sm font-medium transition ${active === tab.id ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted)] hover:bg-[var(--subtle)] hover:text-[var(--foreground)]"}`}
                  type="button"
                  onClick={() => setActive(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <GoalPanel
              timeframe={active}
              goals={activeGoals}
              onAdd={() => setModal({ mode: "add", timeframe: active })}
              onEdit={(goalItem) => setModal({ mode: "edit", timeframe: active, goal: goalItem })}
              onDelete={(id) => deleteGoal(active, id)}
              onToggle={(id) => toggleGoal(active, id)}
            />

            <aside className="grid gap-6">
              <div className="dashboard-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="section-kicker">Completion</p>
                    <h2 className="section-title">{timeframeCopy[active].title}</h2>
                  </div>
                  <BarChart3 className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div className="mt-4 grid grid-cols-[140px_1fr] items-center gap-4">
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={completionData} innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                          {completionData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    <StatLine label="Completed" value={activeStats.completed} />
                    <StatLine label="Pending" value={activeStats.pending} />
                    <StatLine label="Total goals" value={activeStats.total} />
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {modal ? (
          <GoalModal
            modal={modal}
            onClose={() => setModal(null)}
            onSubmit={upsertGoal}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Target; label: string; value: string; detail: string }) {
  return (
    <div className="dashboard-card min-h-32">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-[var(--subtle)] p-2 text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 truncate text-xs text-[var(--muted)]">{detail}</p>
    </div>
  );
}

function GoalPanel({
  timeframe,
  goals,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: {
  timeframe: Timeframe;
  goals: Goal[];
  onAdd: () => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const current = stats(goals);

  return (
    <div className="dashboard-card">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-kicker">{current.completed} / {current.total} Completed</p>
          <h2 className="section-title text-2xl">{timeframeCopy[timeframe].title}</h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">{timeframeCopy[timeframe].subtitle}</p>
        </div>
        <button className="primary-button" type="button" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add Goal
        </button>
      </div>

      <div className="mt-6">
        <div className="mb-4 rounded-3xl bg-[var(--subtle)] p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium">{current.percent}% complete</span>
            <span className="text-[var(--muted)]">{current.completed} of {current.total}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--track)]">
            <motion.div className="h-full rounded-full bg-[var(--accent)]" initial={{ width: 0 }} animate={{ width: `${current.percent}%` }} />
          </div>
        </div>
        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
              <Trophy className="mx-auto h-8 w-8 text-[var(--accent)]" />
              <p className="mt-3 font-medium">{timeframeCopy[timeframe].empty}</p>
            </div>
          ) : (
            goals.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`goal-card ${item.completed ? "goal-card-complete" : ""}`}
              >
                <button className="mt-1 text-[var(--accent)]" type="button" aria-label={`Toggle ${item.name}`} onClick={() => onToggle(item.id)}>
                  {item.completed ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <span className="badge">{item.category}</span>
                    <span className={`priority priority-${item.priority.toLowerCase()}`}>{item.priority}</span>
                  </div>
                  {item.description ? <p className="mt-1 text-sm text-[var(--muted)]">{item.description}</p> : null}
                  <p className="mt-2 text-xs text-[var(--muted)]">Created {item.createdAt}{item.targetDate ? ` · Target ${item.targetDate}` : ""}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="icon-button small" type="button" aria-label={`Edit ${item.name}`} onClick={() => onEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="icon-button small danger" type="button" aria-label={`Delete ${item.name}`} onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[var(--subtle)] px-4 py-3 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function GoalModal({
  modal,
  onClose,
  onSubmit,
}: {
  modal: { mode: "add" | "edit"; timeframe: Timeframe; goal?: Goal };
  onClose: () => void;
  onSubmit: (values: GoalFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: modal.goal ?? {
      name: "",
      category: "",
      description: "",
      targetDate: "",
      priority: "Medium",
    },
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.form
        className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xl"
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 16 }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="section-kicker">{timeframeCopy[modal.timeframe].title}</p>
            <h2 className="section-title">{modal.mode === "add" ? "Add Goal" : "Edit Goal"}</h2>
          </div>
          <button className="icon-button small" type="button" aria-label="Close modal" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <Field label="Goal Name" error={errors.name?.message}>
            <input className="input" {...register("name")} placeholder="Build project" />
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <input className="input" {...register("category")} placeholder="Career" />
          </Field>
          <Field label="Description">
            <textarea className="input min-h-24 resize-none" {...register("description")} placeholder="Optional notes" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Target Date">
              <input className="input" type="date" {...register("targetDate")} />
            </Field>
            <Field label="Priority">
              <select className="input" {...register("priority")}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit">
            <Check className="h-4 w-4" />
            Save
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-xs text-[var(--error)]">{error}</span> : null}
    </label>
  );
}
