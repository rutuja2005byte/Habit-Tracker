"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Code2,
  Flame,
  Goal,
  type LucideIcon,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  codingDayHistoryStorageKey,
  dailyGoalHistoryStorageKey,
  dailyGoalProgress,
  isCodingDayComplete,
  localDateKey,
  type CodingDayHistory,
  type DailyGoalHistory,
} from "@/utils/streaks";

type ViewMode = "daily" | "weekly" | "monthly";

type DayProgress = {
  date: string;
  label: string;
  month: string;
  dailyGoalDone: boolean;
  dailyGoalPercent: number;
  codingDone: boolean;
  leetcodeAccepted: number;
  githubCommits: number;
  score: number;
};

const viewTabs: { id: ViewMode; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export default function ProgressPage() {
  const [view, setView] = useState<ViewMode>("daily");
  const [dailyHistory, setDailyHistory] = useState<DailyGoalHistory>({});
  const [codingHistory, setCodingHistory] = useState<CodingDayHistory>({});

  const year = new Date().getFullYear();
  const days = useMemo(
    () => buildYearProgress(year, dailyHistory, codingHistory),
    [year, dailyHistory, codingHistory],
  );
  const weekly = useMemo(() => groupByWeek(days), [days]);
  const monthly = useMemo(() => groupByMonth(days), [days]);
  const completedGoalDays = days.filter((day) => day.dailyGoalDone).length;
  const completedCodingDays = days.filter((day) => day.codingDone).length;
  const fullDays = days.filter((day) => day.score === 2).length;
  const today = days.find((day) => day.date === localDateKey());

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedDaily = window.localStorage.getItem(dailyGoalHistoryStorageKey);
        const savedCoding = window.localStorage.getItem(codingDayHistoryStorageKey);
        setDailyHistory(savedDaily ? (JSON.parse(savedDaily) as DailyGoalHistory) : {});
        setCodingHistory(savedCoding ? (JSON.parse(savedCoding) as CodingDayHistory) : {});
      } catch {
        setDailyHistory({});
        setCodingHistory({});
      }
    });
  }, []);

  return (
    <main className="min-h-screen px-4 py-4 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]" href="/">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Year Progress</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Jan 1 to Dec 30, {year}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-3xl border border-[var(--border)] bg-[var(--subtle)] p-2">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${view === tab.id ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"}`}
                type="button"
                onClick={() => setView(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={CalendarDays} label="Tracked days" value={String(days.length)} detail="Jan 1 through Dec 30" />
          <Metric icon={Goal} label="Daily goals" value={String(completedGoalDays)} detail="100% daily-goal days" />
          <Metric icon={Code2} label="Coding days" value={String(completedCodingDays)} detail="3+ LeetCode and 5+ GitHub commits" />
          <Metric icon={Flame} label="Full progress days" value={String(fullDays)} detail="Both goal and coding complete" />
        </section>

        {view === "daily" ? <DailyView days={days} today={today} /> : null}
        {view === "weekly" ? <WeeklyView data={weekly} /> : null}
        {view === "monthly" ? <MonthlyView data={monthly} /> : null}
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return (
    <div className="dashboard-card min-h-24">
      <div className="rounded-2xl bg-[var(--subtle)] p-2 text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{detail}</p>
    </div>
  );
}

function DailyView({ days, today }: { days: DayProgress[]; today?: DayProgress }) {
  return (
    <section className="grid gap-4">
      <div className="dashboard-card py-4">
        <p className="section-kicker">Today</p>
        <h2 className="section-title mt-1">{today?.label ?? "No day selected"}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <StatusRow label="Daily goals" done={Boolean(today?.dailyGoalDone)} detail={`${today?.dailyGoalPercent ?? 0}% complete`} />
          <StatusRow label="LeetCode" done={(today?.leetcodeAccepted ?? 0) >= 3} detail={`${today?.leetcodeAccepted ?? 0} accepted today`} />
          <StatusRow label="GitHub" done={(today?.githubCommits ?? 0) >= 5} detail={`${today?.githubCommits ?? 0} commits today`} />
        </div>
      </div>

      <div className="dashboard-card min-h-64 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Daily</p>
          </div>
        </div>
        <div
          className="mt-5 grid w-full overflow-hidden"
          style={{
            gridAutoColumns: "minmax(0, 1fr)",
            gridAutoFlow: "column",
            gridTemplateRows: "repeat(7, 14px)",
            gap: "6px",
          }}
        >
          {days.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-lg border ${goalCellClass(day.dailyGoalPercent)}`}
              title={`${day.label}: ${day.dailyGoalPercent}% daily goals complete`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WeeklyView({ data }: { data: ReturnType<typeof groupByWeek> }) {
  return (
    <section className="dashboard-card">
      <div>
        <p className="section-kicker">Weekly</p>
      </div>
      <div className="mt-5 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="var(--track)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} interval={3} />
            <YAxis domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
            <Bar dataKey="weeklyPercent" name="Weekly target %" radius={[8, 8, 4, 4]} fill="#34c759" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function MonthlyView({ data }: { data: ReturnType<typeof groupByMonth> }) {
  return (
    <section className="dashboard-card">
      <div>
        <p className="section-kicker">Monthly</p>
      </div>
      <div className="mt-5 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="var(--track)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
            <Bar dataKey="monthlyPercent" name="Monthly target %" radius={[8, 8, 4, 4]}>
              {data.map((item) => <Cell key={`${item.label}-goals`} fill={item.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function StatusRow({ label, done, detail }: { label: string; done: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--subtle)] px-4 py-3 text-sm">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{detail}</p>
      </div>
      {done ? <CheckCircle2 className="h-5 w-5 text-[var(--success)]" /> : <TrendingUp className="h-5 w-5 text-[var(--muted)]" />}
    </div>
  );
}

function buildYearProgress(year: number, dailyHistory: DailyGoalHistory, codingHistory: CodingDayHistory) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 30);
  const days: DayProgress[] = [];
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = localDateKey(cursor);
    const codingDay = codingHistory[date];
    const dailyGoalPercent = dailyGoalProgress(dailyHistory[date]);
    const dailyGoalDone = dailyGoalPercent >= 100;
    const codingDone = isCodingDayComplete(codingDay);

    days.push({
      date,
      label: formatter.format(cursor),
      month: monthFormatter.format(cursor),
      dailyGoalDone,
      dailyGoalPercent,
      codingDone,
      leetcodeAccepted: codingDay?.leetcodeAccepted ?? 0,
      githubCommits: codingDay?.githubCommits ?? 0,
      score: Number(dailyGoalDone) + Number(codingDone),
    });
  }

  return days;
}

function groupByWeek(days: DayProgress[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weeks = new Map<string, { label: string; days: number; goalTotal: number; codingDays: number; weeklyPercent: number; weekEnd: Date }>();

  days.forEach((day) => {
    const dayDate = new Date(`${day.date}T00:00:00`);
    const weekEnd = new Date(dayDate);
    weekEnd.setDate(weekEnd.getDate() + ((7 - weekEnd.getDay()) % 7));
    const weekKey = localDateKey(weekEnd);
    const current = weeks.get(weekKey) ?? {
      label: `W${weeks.size + 1}`,
      days: 0,
      goalTotal: 0,
      codingDays: 0,
      weeklyPercent: 0,
      weekEnd,
    };

    current.days += 1;
    current.goalTotal += day.dailyGoalPercent;
    current.codingDays += Number(day.codingDone);
    current.weeklyPercent = current.weekEnd <= today
      ? Math.round(current.goalTotal / current.days)
      : 0;
    weeks.set(weekKey, current);
  });

  return Array.from(weeks.values());
}

function groupByMonth(days: DayProgress[]) {
  const colors = ["#4f8cff", "#34c759", "#ff9f0a", "#ef4444"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const months = new Map<string, { label: string; days: number; goalTotal: number; monthlyPercent: number; color: string; lastDate: Date }>();

  days.forEach((day) => {
    const dayDate = new Date(`${day.date}T00:00:00`);
    const realLastDate = new Date(dayDate.getFullYear(), dayDate.getMonth() + 1, 0);
    const yearLastDate = new Date(dayDate.getFullYear(), 11, 30);
    const lastDate = realLastDate > yearLastDate ? yearLastDate : realLastDate;
    const current = months.get(day.month) ?? {
      label: day.month,
      days: 0,
      goalTotal: 0,
      monthlyPercent: 0,
      color: colors[months.size % colors.length],
      lastDate,
    };

    current.days += 1;
    current.goalTotal += day.dailyGoalPercent;
    current.monthlyPercent = current.lastDate <= today
      ? Math.round(current.goalTotal / current.days)
      : 0;
    months.set(day.month, current);
  });

  return Array.from(months.values());
}

function goalCellClass(percent: number) {
  if (percent >= 100) return "border-green-500 bg-[var(--success)] shadow-sm shadow-green-200";
  if (percent >= 75) return "border-emerald-400 bg-emerald-300";
  if (percent >= 50) return "border-emerald-300 bg-emerald-200";
  if (percent > 0) return "border-emerald-200 bg-emerald-100";
  return "border-slate-200 bg-slate-100/80";
}
