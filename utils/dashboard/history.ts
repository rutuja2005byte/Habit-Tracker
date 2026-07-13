import type { SupabaseClient } from "@supabase/supabase-js";

export type GoalTimeframe = "daily" | "weekly" | "monthly" | "yearly";
export type GoalPriority = "Low" | "Medium" | "High";
export type GoalEventType = "created" | "updated" | "completed" | "reopened" | "deleted";

export type DashboardGoalInput = {
  timeframe: GoalTimeframe;
  name: string;
  category: string;
  description?: string;
  targetDate?: string;
  priority: GoalPriority;
  completed?: boolean;
};

export type CodingSnapshotInput = {
  leetcodeUsername?: string;
  githubUsername?: string;
  leetcodeSolved?: number;
  leetcodeEasy?: number;
  leetcodeMedium?: number;
  leetcodeHard?: number;
  githubTotalCommits?: number;
  githubRecentCommits?: number;
  githubPullRequests?: number;
  githubPublicRepos?: number;
  githubFollowers?: number;
  rawPayload?: unknown;
};

export async function saveGoal(
  supabase: SupabaseClient,
  userId: string,
  goal: DashboardGoalInput,
) {
  const { data, error } = await supabase
    .from("dashboard_goals")
    .insert({
      user_id: userId,
      timeframe: goal.timeframe,
      name: goal.name,
      category: goal.category,
      description: goal.description || null,
      target_date: goal.targetDate || null,
      priority: goal.priority,
      completed: goal.completed ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveGoalHistory(
  supabase: SupabaseClient,
  userId: string,
  event: {
    goalId?: string;
    eventType: GoalEventType;
    timeframe: GoalTimeframe;
    goalName: string;
    metadata?: Record<string, unknown>;
  },
) {
  const { data, error } = await supabase
    .from("dashboard_goal_history")
    .insert({
      user_id: userId,
      goal_id: event.goalId || null,
      event_type: event.eventType,
      timeframe: event.timeframe,
      goal_name: event.goalName,
      metadata: event.metadata ?? {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveCodingProfileConnection(
  supabase: SupabaseClient,
  userId: string,
  profiles: { leetcodeUsername?: string; githubUsername?: string },
) {
  const { data, error } = await supabase
    .from("coding_profile_connections")
    .upsert(
      {
        user_id: userId,
        leetcode_username: profiles.leetcodeUsername || null,
        github_username: profiles.githubUsername || null,
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveCodingSnapshot(
  supabase: SupabaseClient,
  userId: string,
  snapshot: CodingSnapshotInput,
) {
  const { data, error } = await supabase
    .from("coding_progress_snapshots")
    .insert({
      user_id: userId,
      leetcode_username: snapshot.leetcodeUsername || null,
      github_username: snapshot.githubUsername || null,
      leetcode_solved: snapshot.leetcodeSolved ?? 0,
      leetcode_easy: snapshot.leetcodeEasy ?? 0,
      leetcode_medium: snapshot.leetcodeMedium ?? 0,
      leetcode_hard: snapshot.leetcodeHard ?? 0,
      github_total_commits: snapshot.githubTotalCommits ?? 0,
      github_recent_commits: snapshot.githubRecentCommits ?? 0,
      github_pull_requests: snapshot.githubPullRequests ?? 0,
      github_public_repos: snapshot.githubPublicRepos ?? 0,
      github_followers: snapshot.githubFollowers ?? 0,
      raw_payload: snapshot.rawPayload ?? {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
