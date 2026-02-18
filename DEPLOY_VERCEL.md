# Deployment Guide: Vercel

Vercel is the creators of Next.js and the easiest place to deploy Next.js apps for free.

## Prerequisites

-   A GitHub repository with your code pushed.
-   A Vercel account (sign up with GitHub at [vercel.com](https://vercel.com)).

## Steps

1.  **Dashboard**: Go to your Vercel Dashboard and click **"Add New..."** > **"Project"**.
2.  **Import Git Repository**: Find your repo and click **"Import"**.
3.  **Configure Project**:
    -   **Framework Preset**: It should auto-detect "Next.js".
    -   **Root Directory**: Leave as `./`.
    -   **Build Command**: Leave default (`next build`).
    -   **Output Directory**: Leave default.
4.  **Environment Variables**:
    -   Expand the "Environment Variables" section.
    -   Add these (copy from your `.env.local`):
        -   `NEXT_PUBLIC_SUPABASE_URL`
        -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        -   `NEXT_PUBLIC_SITE_URL` (Set this to `https://your-project-name.vercel.app` once deployed, or use `http://localhost:3000` for now/update later).

5.  **Deploy**: Click **"Deploy"**.

Vercel will build your app (it usually takes 1-2 minutes) and give you a live URL.

## Troubleshooting

-   If build fails, check the logs. Vercel logs are very clear.
-   **Supabase**: Ensure your database is accessible (Supabase is accessible from anywhere by default).
