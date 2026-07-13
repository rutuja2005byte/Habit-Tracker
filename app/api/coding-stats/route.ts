import { NextResponse } from "next/server";

type GitHubRepo = {
  name: string;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  owner: { login: string };
};

type GitHubEvent = {
  type: string;
  created_at: string;
};

type LeetCodeQuestionCount = {
  difficulty: "All" | "Easy" | "Medium" | "Hard";
  count: number;
};

type LeetCodeSubmissionCount = {
  difficulty: "All" | "Easy" | "Medium" | "Hard";
  count: number;
  submissions: number;
};

const leetcodeQuery = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
    allQuestionsCount {
      difficulty
      count
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
      attendedContestsCount
    }
    recentAcSubmissionList(username: $username, limit: 5) {
      title
      titleSlug
      timestamp
    }
  }
`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leetcode = cleanUsername(searchParams.get("leetcode") ?? "");
  const github = cleanUsername(searchParams.get("github") ?? "");

  const [leetcodeResult, githubResult] = await Promise.all([
    leetcode ? fetchLeetCode(leetcode) : null,
    github ? fetchGitHub(github) : null,
  ]);

  return NextResponse.json({
    leetcode: leetcodeResult,
    github: githubResult,
  });
}

function cleanUsername(value: string) {
  return value.trim().replace(/^@/, "");
}

async function fetchGitHub(username: string) {
  try {
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "personal-growth-dashboard",
    };

    const [userResponse, reposResponse, eventsResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
        next: { revalidate: 300 },
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`, {
        headers,
        next: { revalidate: 300 },
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=100`, {
        headers,
        next: { revalidate: 300 },
      }),
    ]);

    if (!userResponse.ok) {
      return { ok: false, error: "GitHub profile was not found." };
    }

    const user = await userResponse.json();
    const repos = reposResponse.ok ? ((await reposResponse.json()) as GitHubRepo[]) : [];
    const events = eventsResponse.ok ? ((await eventsResponse.json()) as GitHubEvent[]) : [];

    const pushEvents = events.filter((event) => event.type === "PushEvent");
    const pullRequests = events.filter((event) => event.type === "PullRequestEvent").length;
    const activeRepos = repos.filter((repo) => {
      const pushedAt = new Date(repo.pushed_at).getTime();
      return Number.isFinite(pushedAt) && Date.now() - pushedAt <= 1000 * 60 * 60 * 24 * 90;
    }).length;
    const totalCommits = await fetchTotalCommits(username, repos, headers);

    return {
      ok: true,
      username: user.login as string,
      profileUrl: user.html_url as string,
      avatarUrl: user.avatar_url as string,
      publicRepos: user.public_repos as number,
      followers: user.followers as number,
      commits: totalCommits,
      recentCommits: pushEvents.length,
      pullRequests,
      activeRepos,
      recentRepos: repos.slice(0, 5).map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language ?? "Not set",
        pushedAt: repo.pushed_at,
      })),
      recentActivity: events.slice(0, 6).map((event) => ({
        type: event.type.replace(/Event$/, ""),
        date: event.created_at,
      })),
    };
  } catch {
    return { ok: false, error: "GitHub stats could not be loaded right now." };
  }
}

async function fetchTotalCommits(username: string, repos: GitHubRepo[], headers: Record<string, string>) {
  const commitCounts = await Promise.all(
    repos.slice(0, 30).map(async (repo) => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/commits?author=${encodeURIComponent(username)}&per_page=1`,
          {
            headers,
            next: { revalidate: 900 },
          },
        );

        if (!response.ok) return 0;

        const link = response.headers.get("link");
        const lastPage = link?.match(/[?&]page=(\d+)>; rel="last"/)?.[1];
        if (lastPage) return Number(lastPage);

        const commits = await response.json();
        return Array.isArray(commits) ? commits.length : 0;
      } catch {
        return 0;
      }
    }),
  );

  return commitCounts.reduce((sum, count) => sum + count, 0);
}

async function fetchLeetCode(username: string) {
  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({ query: leetcodeQuery, variables: { username } }),
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return { ok: false, error: "LeetCode profile was not found." };
    }

    const payload = await response.json();
    const user = payload?.data?.matchedUser;

    if (!user) {
      return { ok: false, error: "LeetCode profile was not found." };
    }

    const solved = user.submitStatsGlobal.acSubmissionNum as LeetCodeSubmissionCount[];
    const totals = payload.data.allQuestionsCount as LeetCodeQuestionCount[];
    const allSolved = solved.find((item) => item.difficulty === "All")?.count ?? 0;
    const allQuestions = totals.find((item) => item.difficulty === "All")?.count ?? 0;
    const contest = payload.data.userContestRanking;
    const recent = payload.data.recentAcSubmissionList ?? [];

    return {
      ok: true,
      username: user.username as string,
      profileUrl: `https://leetcode.com/u/${user.username}/`,
      solved: allSolved,
      totalQuestions: allQuestions,
      completionRate: allQuestions ? Math.round((allSolved / allQuestions) * 100) : 0,
      easy: solved.find((item) => item.difficulty === "Easy")?.count ?? 0,
      medium: solved.find((item) => item.difficulty === "Medium")?.count ?? 0,
      hard: solved.find((item) => item.difficulty === "Hard")?.count ?? 0,
      rating: contest?.rating ? Math.round(contest.rating) : null,
      globalRanking: contest?.globalRanking ?? null,
      contests: contest?.attendedContestsCount ?? 0,
      recentAccepted: recent.map((item: { title: string; titleSlug: string; timestamp: string }) => ({
        title: item.title,
        url: `https://leetcode.com/problems/${item.titleSlug}/`,
        date: new Date(Number(item.timestamp) * 1000).toISOString(),
      })),
    };
  } catch {
    return { ok: false, error: "LeetCode stats could not be loaded right now." };
  }
}
