# Deployment Guide

## Quick Start

The application is **ready to deploy** with zero configuration!

## Local Development

```bash
npm install
npm run dev
```

Visit: `http://localhost:3000`

## Push to GitHub

Before deploying to Vercel, you'll need to push your code to GitHub. Here's how:

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., `roster-app`)
5. Choose public or private
6. **Don't** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### Step 2: Initialize Git (if not already done)

If you haven't initialized git in your project:

```bash
git init
```

### Step 3: Add All Files and Commit

```bash
git add .
git commit -m "init commit"
```

### Step 4: Add GitHub Remote

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Or if you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Step 5: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

If prompted for credentials:
- **HTTPS**: Use a GitHub Personal Access Token (not your password)
- **SSH**: Ensure your SSH key is added to GitHub

### Troubleshooting

**If you get an authentication error:**
- For HTTPS: Generate a Personal Access Token at [github.com/settings/tokens](https://github.com/settings/tokens)
- For SSH: Add your SSH key at [github.com/settings/keys](https://github.com/settings/keys)

**If you already have a git repository:**
```bash
git remote -v  # Check existing remotes
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Deploy to Vercel

### Option 1: Vercel CLI (Recommended)
```bash
npm install -g vercel
vercel
```

### Option 2: Vercel Dashboard
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click "Deploy" - it will auto-detect Next.js

### Option 3: Vercel Button
Add this to your README for one-click deployment:
```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)
```

## Environment Variables (Optional)

Currently **none required**. If you want to add analytics or other services later, create a `.env.local` file:

```bash
# Example (not required for basic functionality)
# NEXT_PUBLIC_ANALYTICS_ID=your_id_here
```

## Build & Test Production Locally

```bash
npm run build
npm start
```

## CSV Format

Your CSV must have these exact columns:
- `employee_id`
- `name`
- `role`
- `hourly_rate`
- `hours_worked`
- `output_score`
- `team`

## Sample Data

A sample CSV is included in `public/sample.csv` for testing.
