export type DailyGoalHistory = Record<string, boolean>;
export type CodingDayHistory = Record<string, { leetcodeAccepted: number; githubCommits: number }>;

export const dailyGoalHistoryStorageKey = "personal-growth-dashboard-daily-history";
export const codingDayHistoryStorageKey = "coding-progress-tracker-day-history";

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatStreak(days: number) {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function calculateStreak(
  history: Record<string, boolean>,
  isCompleteToday = false,
  today = new Date(),
) {
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  if (!isCompleteToday) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (history[localDateKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function isCodingDayComplete(day?: { leetcodeAccepted: number; githubCommits: number }) {
  return Boolean(day && day.leetcodeAccepted >= 3 && day.githubCommits >= 5);
}

export function codingCompletionHistory(history: CodingDayHistory) {
  return Object.fromEntries(
    Object.entries(history).map(([date, day]) => [date, isCodingDayComplete(day)]),
  ) as Record<string, boolean>;
}
