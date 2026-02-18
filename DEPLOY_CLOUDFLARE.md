# Deployment Guide: Cloudflare Pages

This guide outlines the steps to deploy your Next.js application to Cloudflare Pages.

## Prerequisites

- A Cloudflare account.
- A GitHub repository containing your project code.

## Configuration Changes (Already Applied)

I have made the following changes to prepare your project:

1.  **Installed Adapter**: `@cloudflare/next-on-pages` (with legacy peer deps due to Next.js 16).
2.  **Configured `wrangler.toml`**: Enabled `nodejs_compat` flag for compatibility.
3.  **Updated `next.config.ts`**: Disabled image optimization (Cloudflare Pages doesn't support the default Next.js image optimization).
4.  **Updated `package.json`**: Added `pages:build` script.

## Deployment Steps

1.  **Push Changes**: Commit and push the changes (including `wrangler.toml` and updated config files) to your GitHub repository.

2.  **Cloudflare Dashboard**:
    - Log in to Cloudflare.
    - Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
    - Select your repository.

3.  **Build Settings**:
    - **Framework Preset**: Select **Next.js**.
    - **Build command**: `npx @cloudflare/next-on-pages` (or `npm run pages:build`).
    - **Build output directory**: `.vercel/output/static` (This is crucial! Do not use `out` or `build`).

4.  **Environment Variables**:
    - Add the following variables in **Settings > Environment variables** (Production & Preview):
        - `NEXT_PUBLIC_SUPABASE_URL`
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        - `NEXT_PUBLIC_SITE_URL` (Your production URL, e.g., `https://your-app.pages.dev`)

5.  **Compatibility Flags**:
    - Since `wrangler.toml` is included, Cloudflare should detect the `nodejs_compat` flag.
    - If needed, verify in **Settings > Functions > Compatibility Flags** that `nodejs_compat` is enabled.

6.  **Deploy**: Click **Save and Deploy**.

## Troubleshooting

-   **"Image Optimization" Errors**: Ensuring `images: { unoptimized: true }` in `next.config.ts` resolves this.
-   **"Node.js Compatibility" Errors**: Ensure `nodejs_compat` is enabled.
-   **Database Connection**: Supabase works fine over HTTP. Ensure your environment variables are correct.

