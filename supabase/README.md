# Dashboard History Database

Run `supabase/migrations/001_dashboard_history.sql` in the Supabase SQL editor for the project connected in `.env.local`.

The migration creates:

- `dashboard_goals`: current daily, weekly, monthly, and yearly goals.
- `dashboard_goal_history`: append-only goal events such as created, updated, completed, reopened, and deleted.
- `coding_profile_connections`: the connected LeetCode and GitHub usernames per user.
- `coding_progress_snapshots`: historical coding tracker snapshots for charts/history.

All tables have row-level security enabled and are scoped to `auth.uid()`, so users can only access their own dashboard history after Supabase Auth is added to the UI.
