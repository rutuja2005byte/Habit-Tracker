# Habit Tracker

A clean full-stack Next.js project integrated with Supabase as the primary database and authentication provider.

## Prerequisites

- Node.js `>=22.0.0`

## Getting Started

First, configure your environment variables by copying `.env.local.example` to `.env.local` and filling in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

Then, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Useful Commands

- `npm run dev`: Start local development server
- `npm run build`: Build the production bundle
- `npm run start`: Start the production server
- `npm run lint`: Lint the codebase using ESLint
