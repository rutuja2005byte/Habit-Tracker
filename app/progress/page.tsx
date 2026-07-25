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
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  codingDayHistoryStorageKey,
  dailyGoalHistoryStorageKey,
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
    <main className="min-h-screen px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]" href="/tracking">
              <ArrowLeft className="h-4 w-4" />
              Coding tracker
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Year Progress</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Jan 1 to Dec 30, {year}</p>
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={CalendarDays} label="Tracked days" value={String(days.length)} detail="Jan 1 through Dec 30" />
          <Metric icon={Goal} label="Daily goals" value={String(completedGoalDays)} detail="Days with all daily goals done" />
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
    <div className="dashboard-card min-h-32">
      <div className="rounded-2xl bg-[var(--subtle)] p-2 text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{detail}</p>
    </div>
  );
}

function DailyView({ days, today }: { days: DayProgress[]; today?: DayProgress }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="dashboard-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Daily</p>
            <h2 className="section-title">Year map</h2>
          </div>
          <p className="text-sm text-[var(--muted)]">Green means both daily goals and coding target are complete.</p>
        </div>
        <div className="mt-5 grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(22px, 1fr))" }}>
          {days.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-lg border border-[var(--border)] ${day.score === 2 ? "bg-[var(--success)]" : day.score === 1 ? "bg-[var(--warning)]" : "bg-[var(--subtle)]"}`}
              title={`${day.label}: ${day.dailyGoalDone ? "daily goals done" : "daily goals open"}, ${day.codingDone ? "coding done" : "coding open"}`}
            />
          ))}
        </div>
      </div>

      <div className="dashboard-card">
        <p className="section-kicker">Today</p>
        <h2 className="section-title mt-1">{today?.label ?? "No day selected"}</h2>
        <div className="mt-5 grid gap-3">
          <StatusRow label="Daily goals" done={Boolean(today?.dailyGoalDone)} detail={today?.dailyGoalDone ? "Completed" : "Not complete yet"} />
          <StatusRow label="LeetCode" done={(today?.leetcodeAccepted ?? 0) >= 3} detail={`${today?.leetcodeAccepted ?? 0} accepted today`} />
          <StatusRow label="GitHub" done={(today?.githubCommits ?? 0) >= 5} detail={`${today?.githubCommits ?? 0} commits today`} />
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
        <h2 className="section-title">Progress by week</h2>
      </div>
      <div className="mt-5 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="var(--track)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} interval={3} />
            <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
            <Line type="monotone" dataKey="goalDays" name="Daily goal days" stroke="#4f8cff" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="codingDays" name="Coding days" stroke="#34c759" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="fullDays" name="Full progress days" stroke="#ff9f0a" strokeWidth={3} dot={false} />
          </LineChart>
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
        <h2 className="section-title">Progress by month</h2>
      </div>
      <div className="mt-5 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="var(--track)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
            <Bar dataKey="goalDays" name="Daily goal days" radius={[8, 8, 4, 4]}>
              {data.map((item) => <Cell key={`${item.label}-goals`} fill={item.color} />)}
            </Bar>
            <Bar dataKey="codingDays" name="Coding days" radius={[8, 8, 4, 4]} fill="#34c759" />
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
    const dailyGoalDone = Boolean(dailyHistory[date]);
    const codingDone = isCodingDayComplete(codingDay);

    days.push({
      date,
      label: formatter.format(cursor),
      month: monthFormatter.format(cursor),
      dailyGoalDone,
      codingDone,
      leetcodeAccepted: codingDay?.leetcodeAccepted ?? 0,
      githubCommits: codingDay?.githubCommits ?? 0,
      score: Number(dailyGoalDone) + Number(codingDone),
    });
  }

  return days;
}

function groupByWeek(days: DayProgress[]) {
  const weeks: { label: string; goalDays: number; codingDays: number; fullDays: number }[] = [];

  days.forEach((day, index) => {
    const weekIndex = Math.floor(index / 7);
    const current = weeks[weekIndex] ?? {
      label: `W${weekIndex + 1}`,
      goalDays: 0,
      codingDays: 0,
      fullDays: 0,
    };

    current.goalDays += Number(day.dailyGoalDone);
    current.codingDays += Number(day.codingDone);
    current.fullDays += Number(day.score === 2);
    weeks[weekIndex] = current;
  });

  return weeks;
}

function groupByMonth(days: DayProgress[]) {
  const colors = ["#4f8cff", "#34c759", "#ff9f0a", "#ef4444"];
  const months = new Map<string, { label: string; goalDays: number; codingDays: number; fullDays: number; color: string }>();

  days.forEach((day) => {
    const current = months.get(day.month) ?? {
      label: day.month,
      goalDays: 0,
      codingDays: 0,
      fullDays: 0,
      color: colors[months.size % colors.length],
    };

    current.goalDays += Number(day.dailyGoalDone);
    current.codingDays += Number(day.codingDone);
    current.fullDays += Number(day.score === 2);
    months.set(day.month, current);
  });

  return Array.from(months.values());
}
