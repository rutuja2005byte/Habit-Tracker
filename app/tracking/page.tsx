"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  ExternalLink,
  GitPullRequest,
  Link2,
  Loader2,
  RefreshCw,
  SquareCode,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";

type Profile = {
  leetcode: string;
  github: string;
};

type LeetCodeStats =
  | {
      ok: true;
      username: string;
      profileUrl: string;
      solved: number;
      totalQuestions: number;
      completionRate: number;
      easy: number;
      medium: number;
      hard: number;
      rating: number | null;
      globalRanking: number | null;
      contests: number;
      recentAccepted: { title: string; url: string; date: string }[];
    }
  | { ok: false; error: string };

type GitHubStats =
  | {
      ok: true;
      username: string;
      profileUrl: string;
      avatarUrl: string;
      publicRepos: number;
      followers: number;
      commits: number;
      pullRequests: number;
      activeRepos: number;
      recentRepos: { name: string; url: string; stars: number; language: string; pushedAt: string }[];
      recentActivity: { type: string; date: string }[];
    }
  | { ok: false; error: string };

type CodingStats = {
  leetcode: LeetCodeStats | null;
  github: GitHubStats | null;
};

export default function TrackingPage() {
  const [profile, setProfile] = useState<Profile>({ leetcode: "", github: "" });
  const [connected, setConnected] = useState<Profile>({ leetcode: "", github: "" });
  const [stats, setStats] = useState<CodingStats>({ leetcode: null, github: null });
  const [loading, setLoading] = useState(false);

  const leetcodeUsername = connected.leetcode;
  const githubUsername = connected.github;
  const leetcode = stats.leetcode;
  const github = stats.github;
  const hasConnection = Boolean(leetcodeUsername || githubUsername);

  async function connect() {
    const nextProfile = {
      leetcode: extractProfileId(profile.leetcode, "leetcode"),
      github: extractProfileId(profile.github, "github"),
    };

    setConnected(nextProfile);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (nextProfile.leetcode) params.set("leetcode", nextProfile.leetcode);
      if (nextProfile.github) params.set("github", nextProfile.github);

      const response = await fetch(`/api/coding-stats?${params.toString()}`);
      const data = (await response.json()) as CodingStats;
      setStats(data);
    } finally {
      setLoading(false);
    }
  }

  const topStats = [
    {
      label: "LeetCode solved",
      value: leetcode?.ok ? String(leetcode.solved) : "-",
      detail: leetcode?.ok ? `${leetcode.completionRate}% of public problem set` : "Connect LeetCode to load analysis",
    },
    {
      label: "GitHub commits",
      value: github?.ok ? String(github.commits) : "-",
      detail: github?.ok ? "Recent public push activity" : "Connect GitHub to load analysis",
    },
    {
      label: "Repositories",
      value: github?.ok ? String(github.publicRepos) : "-",
      detail: github?.ok ? `${github.activeRepos} active in the last 90 days` : "Connect GitHub to load analysis",
    },
    {
      label: "Coding score",
      value: String((leetcode?.ok ? leetcode.solved : 0) + (github?.ok ? github.commits + github.activeRepos : 0)),
      detail: "Solved problems + recent public activity",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]" href="/">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </a>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Coding Progress Tracker</h1>
          </div>
          <button className="icon-button" type="button" aria-label="Refresh tracking data" onClick={connect} disabled={loading || !hasConnection}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {topStats.map((item) => (
            <div className="dashboard-card min-h-32" key={item.label}>
              <p className="text-sm text-[var(--muted)]">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{loading ? "..." : item.value}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="dashboard-card">
            <p className="section-kicker">Accounts</p>
            <h2 className="section-title mt-1">Connect profiles</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                LeetCode profile
                <div className="relative">
                  <Code2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    className="input pl-11"
                    value={profile.leetcode}
                    onChange={(event) => setProfile((current) => ({ ...current, leetcode: event.target.value }))}
                    placeholder="username or profile URL"
                  />
                </div>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                GitHub profile
                <div className="relative">
                  <SquareCode className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    className="input pl-11"
                    value={profile.github}
                    onChange={(event) => setProfile((current) => ({ ...current, github: event.target.value }))}
                    placeholder="username or profile URL"
                  />
                </div>
              </label>
              <button className="primary-button w-full" type="button" onClick={connect} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                {loading ? "Analyzing" : "Connect and analyze"}
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ConnectionCard
              connected={Boolean(leetcodeUsername)}
              icon={Code2}
              label="LeetCode"
              username={leetcodeUsername}
              href={leetcode?.ok ? leetcode.profileUrl : "https://leetcode.com"}
              rows={[
                ["Problems solved", leetcode?.ok ? leetcode.solved : "-"],
                ["Easy / Medium / Hard", leetcode?.ok ? `${leetcode.easy} / ${leetcode.medium} / ${leetcode.hard}` : "-"],
                ["Contest rating", leetcode?.ok ? leetcode.rating ?? "Unrated" : "-"],
                ["Contests", leetcode?.ok ? leetcode.contests : "-"],
              ]}
              error={leetcode && !leetcode.ok ? leetcode.error : undefined}
            />
            <ConnectionCard
              connected={Boolean(githubUsername)}
              icon={SquareCode}
              label="GitHub"
              username={githubUsername}
              href={github?.ok ? github.profileUrl : "https://github.com"}
              rows={[
                ["Recent commits", github?.ok ? github.commits : "-"],
                ["Pull requests", github?.ok ? github.pullRequests : "-"],
                ["Public repos", github?.ok ? github.publicRepos : "-"],
                ["Followers", github?.ok ? github.followers : "-"],
              ]}
              error={github && !github.ok ? github.error : undefined}
            />
          </div>
        </section>

        <section className="grid items-stretch gap-6 lg:grid-cols-2">
          <LeetCodeAnalysis stats={leetcode} loading={loading} />
          <GitHubAnalysis stats={github} loading={loading} />
        </section>
      </div>
    </main>
  );
}

function extractProfileId(value: string, provider: "leetcode" | "github") {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (provider === "leetcode") {
      const userIndex = parts.findIndex((part) => part === "u" || part === "profile");
      return (userIndex >= 0 ? parts[userIndex + 1] : parts[0]) ?? trimmed;
    }
    return parts[0] ?? trimmed;
  } catch {
    return trimmed.replace(/^@/, "");
  }
}

function ConnectionCard({
  connected,
  icon: Icon,
  label,
  username,
  href,
  rows,
  error,
}: {
  connected: boolean;
  icon: typeof Code2;
  label: string;
  username: string;
  href: string;
  rows: [string, string | number][];
  error?: string;
}) {
  return (
    <motion.div className="dashboard-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[var(--subtle)] p-3 text-[var(--accent)]">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="section-title">{label}</h2>
            <p className="mt-1 break-all text-sm text-[var(--muted)]">{connected ? `Connected as ${username}` : "Not connected"}</p>
          </div>
        </div>
        <span className={`badge ${connected ? "connected-badge" : ""}`}>
          {connected ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connected
            </>
          ) : (
            "Waiting"
          )}
        </span>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-[var(--subtle)] p-3 text-sm text-[var(--error)]">{error}</p> : null}
      <div className="mt-5 grid gap-3">
        {rows.map(([labelText, value]) => (
          <div className="flex items-center justify-between rounded-2xl bg-[var(--subtle)] px-4 py-3 text-sm" key={labelText}>
            <span className="text-[var(--muted)]">{labelText}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
      <a className="secondary-button mt-5 w-full" href={href} target="_blank" rel="noreferrer">
        <ExternalLink className="h-4 w-4" />
        Open {label}
      </a>
    </motion.div>
  );
}

function LeetCodeAnalysis({ stats, loading }: { stats: LeetCodeStats | null; loading: boolean }) {
  const solvedGoal = 100;
  const progress = stats?.ok ? Math.min(Math.round((stats.solved / solvedGoal) * 100), 100) : 0;

  return (
    <div className="dashboard-card flex h-full flex-col">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Analysis</p>
          <h2 className="section-title">LeetCode progress</h2>
        </div>
        <Trophy className="h-5 w-5 text-[var(--accent)]" />
      </div>
      {loading ? <LoadingPanel /> : null}
      {!loading && stats?.ok ? (
        <div className="mt-5 grid flex-1 content-start gap-4">
          <ProgressRow label="LeetCode progress" value={progress} detail={`${stats.solved}/${solvedGoal} solved goal`} />
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Easy" value={stats.easy} />
            <MiniStat label="Medium" value={stats.medium} />
            <MiniStat label="Hard" value={stats.hard} />
          </div>
          <ListBlock
            title="Recent accepted"
            items={stats.recentAccepted.slice(0, 4).map((item) => ({
              label: item.title,
              detail: formatDate(item.date),
              href: item.url,
            }))}
          />
        </div>
      ) : null}
      {!loading && (!stats || !stats.ok) ? <EmptyAnalysis text={stats?.ok === false ? stats.error : "Connect LeetCode to see solved-problem analysis."} /> : null}
    </div>
  );
}

function GitHubAnalysis({ stats, loading }: { stats: GitHubStats | null; loading: boolean }) {
  const repoGoal = 15;
  const progress = stats?.ok ? Math.min(Math.round((stats.publicRepos / repoGoal) * 100), 100) : 0;

  return (
    <div className="dashboard-card flex h-full flex-col">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Analysis</p>
          <h2 className="section-title">GitHub activity</h2>
        </div>
        <GitPullRequest className="h-5 w-5 text-[var(--accent)]" />
      </div>
      {loading ? <LoadingPanel /> : null}
      {!loading && stats?.ok ? (
        <div className="mt-5 grid flex-1 content-start gap-4">
          <ProgressRow label="GitHub progress" value={progress} detail={`${stats.publicRepos}/${repoGoal} repository goal`} />
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Repos" value={stats.publicRepos} />
            <MiniStat label="Active" value={stats.activeRepos} />
            <MiniStat label="Commits" value={stats.commits} />
          </div>
          <ListBlock
            title="Recent repositories"
            items={stats.recentRepos.slice(0, 4).map((repo) => ({
              label: repo.name,
              detail: `${repo.language} · ${repo.stars} stars · ${formatDate(repo.pushedAt)}`,
              href: repo.url,
            }))}
          />
        </div>
      ) : null}
      {!loading && (!stats || !stats.ok) ? <EmptyAnalysis text={stats?.ok === false ? stats.error : "Connect GitHub to see repository and activity analysis."} /> : null}
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="mt-5 flex items-center justify-center gap-3 rounded-3xl border border-dashed border-[var(--border)] p-8 text-sm text-[var(--muted)]">
      <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
      Loading analysis
    </div>
  );
}

function EmptyAnalysis({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
      <p className="font-medium">{text}</p>
    </div>
  );
}

function ProgressRow({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>
          <span className="block font-medium">{label}</span>
          <span className="mt-1 block text-xs text-[var(--muted)]">{detail}</span>
        </span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--track)]">
        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[var(--subtle)] p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: { label: string; detail: string; href?: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.length ? (
          items.map((item) =>
            item.href ? (
              <a className="rounded-2xl bg-[var(--subtle)] px-4 py-3 text-sm transition hover:bg-[var(--track)]" href={item.href} target="_blank" rel="noreferrer" key={`${item.label}-${item.detail}`}>
                <span className="block font-medium">{item.label}</span>
                <span className="mt-1 block text-xs text-[var(--muted)]">{item.detail}</span>
              </a>
            ) : (
              <div className="rounded-2xl bg-[var(--subtle)] px-4 py-3 text-sm" key={`${item.label}-${item.detail}`}>
                <span className="block font-medium">{item.label}</span>
                <span className="mt-1 block text-xs text-[var(--muted)]">{item.detail}</span>
              </div>
            ),
          )
        ) : (
          <p className="rounded-2xl bg-[var(--subtle)] px-4 py-3 text-sm text-[var(--muted)]">No public items found.</p>
        )}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
