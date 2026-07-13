"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  ExternalLink,
  GitPullRequest,
  Link2,
  ListChecks,
  RefreshCw,
  SquareCode,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";

type Profile = {
  leetcode: string;
  github: string;
};

type TrackerStats = {
  label: string;
  value: string;
  detail: string;
};

const emptyStats: TrackerStats[] = [
  { label: "LeetCode solved", value: "0", detail: "Connect a username to start tracking" },
  { label: "GitHub commits", value: "0", detail: "Connect a username to start tracking" },
  { label: "Active repos", value: "0", detail: "No repository data yet" },
  { label: "Coding streak", value: "0 days", detail: "No activity synced yet" },
];

export default function TrackingPage() {
  const [profile, setProfile] = useState<Profile>({ leetcode: "", github: "" });
  const [connected, setConnected] = useState<Profile>({ leetcode: "", github: "" });

  const hasLeetcode = connected.leetcode.trim().length > 0;
  const hasGithub = connected.github.trim().length > 0;
  const hasAnyConnection = hasLeetcode || hasGithub;

  const stats = useMemo(() => emptyStats, []);

  function connect() {
    setConnected({
      leetcode: profile.leetcode.trim(),
      github: profile.github.trim(),
    });
  }

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
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Connect your LeetCode and GitHub usernames to keep coding practice and project work in one place.
            </p>
          </div>
          <button className="icon-button" type="button" aria-label="Refresh tracking data">
            <RefreshCw className="h-5 w-5" />
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div className="dashboard-card min-h-32" key={item.label}>
              <p className="text-sm text-[var(--muted)]">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{item.value}</p>
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
                LeetCode username
                <div className="relative">
                  <Code2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    className="input pl-11"
                    value={profile.leetcode}
                    onChange={(event) => setProfile((current) => ({ ...current, leetcode: event.target.value }))}
                    placeholder="your-leetcode-id"
                  />
                </div>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                GitHub username
                <div className="relative">
                  <SquareCode className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    className="input pl-11"
                    value={profile.github}
                    onChange={(event) => setProfile((current) => ({ ...current, github: event.target.value }))}
                    placeholder="your-github-id"
                  />
                </div>
              </label>
              <button className="primary-button w-full" type="button" onClick={connect}>
                <Link2 className="h-4 w-4" />
                Connect
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ConnectionCard
              connected={hasLeetcode}
              icon={Code2}
              label="LeetCode"
              username={connected.leetcode}
              href={hasLeetcode ? `https://leetcode.com/u/${connected.leetcode}/` : "https://leetcode.com"}
              items={["Problems solved", "Acceptance rate", "Contest rating", "Daily challenge streak"]}
            />
            <ConnectionCard
              connected={hasGithub}
              icon={SquareCode}
              label="GitHub"
              username={connected.github}
              href={hasGithub ? `https://github.com/${connected.github}` : "https://github.com"}
              items={["Commits", "Pull requests", "Repositories", "Contribution streak"]}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ActivityPanel
            title="LeetCode progress"
            icon={Trophy}
            emptyText={hasLeetcode ? "Live LeetCode sync is ready to wire to the API." : "Connect LeetCode to see solved problems and streaks."}
          />
          <ActivityPanel
            title="GitHub activity"
            icon={GitPullRequest}
            emptyText={hasGithub ? "Live GitHub sync is ready to wire to the API." : "Connect GitHub to see commits, repositories, and pull requests."}
          />
        </section>

        {!hasAnyConnection ? (
          <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <ListChecks className="mx-auto h-9 w-9 text-[var(--accent)]" />
            <p className="mt-3 font-medium">No coding accounts connected yet.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Add usernames above to prepare tracking for LeetCode and GitHub.</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function ConnectionCard({
  connected,
  icon: Icon,
  label,
  username,
  href,
  items,
}: {
  connected: boolean;
  icon: typeof Code2;
  label: string;
  username: string;
  href: string;
  items: string[];
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
            <p className="mt-1 text-sm text-[var(--muted)]">{connected ? `Connected as ${username}` : "Not connected"}</p>
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
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div className="flex items-center justify-between rounded-2xl bg-[var(--subtle)] px-4 py-3 text-sm" key={item}>
            <span className="text-[var(--muted)]">{item}</span>
            <span className="font-semibold">0</span>
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

function ActivityPanel({
  title,
  icon: Icon,
  emptyText,
}: {
  title: string;
  icon: typeof Trophy;
  emptyText: string;
}) {
  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Tracking</p>
          <h2 className="section-title">{title}</h2>
        </div>
        <Icon className="h-5 w-5 text-[var(--accent)]" />
      </div>
      <div className="mt-5 rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
        <p className="font-medium">{emptyText}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">OAuth/API integration can fill this area with real synced progress.</p>
      </div>
    </div>
  );
}
