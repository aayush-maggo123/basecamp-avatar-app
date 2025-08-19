# Basecamp Avatar - Personal Productivity Dashboard

A modern, gamified productivity dashboard that syncs with your Basecamp account to provide focused task management and analytics.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com/)

## ✨ Features

### 📅 Today View
- **Smart task filtering**: Shows tasks assigned to you with a 7-day window (overdue to upcoming)
- **Due date awareness**: Highlights overdue, due today, and upcoming tasks
- **Undated tasks**: Optional display of your top 3 undated tasks
- **Real-time sync**: Manual sync button with "last synced" timestamp

### 🎯 Focus Mode
- **Single-task focus**: Dedicated page for individual task completion
- **Built-in timer**: Start/pause timer for time tracking (coming soon)
- **Quick completion**: Mark tasks as complete directly from focus view

### 📊 Analytics Dashboard
- **Completion metrics**: Track your completion percentage over time
- **Monthly trends**: Visualise assigned vs completed tasks by month
- **Streak tracking**: Monitor your 30-day completion streaks
- **Performance insights**: Data-driven productivity analytics

### 🔄 Basecamp Integration
- **Automatic sync**: Scheduled background sync with Basecamp
- **Project hierarchy**: Maintains your Basecamp project and todo list structure
- **Assignee tracking**: Filters tasks based on assignment
- **Bi-directional updates**: Complete tasks in the app, sync back to Basecamp

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **UI Components**: Radix UI primitives with custom styling
- **Charts**: Recharts for analytics visualisation
- **Authentication**: Basecamp OAuth integration
- **Deployment**: Vercel (frontend) + Supabase (backend)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/aayush-maggo123/basecamp-avatar-app.git
   cd basecamp-avatar-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase and Basecamp credentials.

4. **Set up database**
   - Run the SQL migration in `scripts/01-create-tables.sql` in your Supabase dashboard
   - Insert your Basecamp tokens into the `bc_tokens` table

5. **Deploy Edge Functions**
   ```bash
   supabase functions deploy sync_basecamp
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [SETUP.md](SETUP.md).

## 📱 Pages & Routes

- **`/`** - Today view (default landing page)
- **`/today`** - Focused task list for today
- **`/focus/[id]`** - Individual task focus mode
- **`/dashboard`** - Analytics and productivity metrics
- **`/auth`** - Basecamp OAuth authentication
- **`/api/sync/*`** - Sync endpoints for Basecamp integration

## 🔧 API Endpoints

- **`POST /api/sync/now`** - Trigger immediate Basecamp sync
- **`POST /api/sync/todos`** - Sync todos only
- **`POST /api/sync/projects`** - Sync projects and todo lists
- **`POST /api/auth/basecamp`** - Handle Basecamp OAuth token exchange

## 📊 Database Schema

Key tables:
- **`projects`** - Basecamp projects
- **`todo_lists`** - Todo lists within projects  
- **`todos`** - Individual tasks with assignee and due date info
- **`bc_tokens`** - Stored Basecamp API tokens
- **`sync_state`** - Sync status and cursor tracking

## 🎮 Gamification Features (Coming Soon)

- Achievement badges for completion streaks
- Productivity scoring system
- Avatar progression based on task completion
- Weekly/monthly challenges
