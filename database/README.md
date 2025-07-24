# Database Setup

This directory contains the database schema and setup files for TaskFlow AI.

## ✅ Quick Setup

1. **Go to your Supabase Dashboard**
   - Navigate to [supabase.com](https://supabase.com)
   - Open your project dashboard

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Schema**
   - Copy the contents of `schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

## 🗄️ What This Creates

- **Tables**: `users`, `tasks`, `notes`, `meeting_summaries`, `analytics_events`
- **Row Level Security (RLS)**: Ensures users can only access their own data
- **Indexes**: For better query performance
- **Triggers**: Automatically update `updated_at` timestamps
- **AI Features**: Full support for meeting summaries and analytics

## 📊 Tables Overview

### `users`
- User profiles and settings
- Links to Supabase Auth users
- Tracks tutorial completion

### `tasks`
- User tasks with Kanban status tracking (todo, in_progress, completed)
- Supports priorities (low, medium, high) and deadlines
- Full CRUD operations with optimistic updates

### `notes`
- User notes and AI-generated content
- Supports tagging system and AI source tracking
- Full CRUD operations

### `meeting_summaries` ⭐ NEW
- AI-powered meeting analysis and summaries
- Stores key points, action items, and participants
- Audio URL storage for meeting recordings

### `analytics_events` ⭐ NEW
- User interaction tracking for productivity analytics
- Event metadata in JSONB format
- Time-series data for dashboard insights

## 🚀 Next Steps (Database is Ready!)

Now that your database is set up, follow these steps to get your app fully functional:

### 1. Environment Configuration
Ensure your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

### 2. Test Database Connection
- Start your dev server: `npm run dev`
- Navigate to the auth page: `http://localhost:9004/auth`
- Register a new account or sign in
- Check if authentication works properly

### 3. Verify Core Features
- ✅ **Tasks**: Create, edit, delete tasks on the Kanban board
- ✅ **Analytics**: View productivity dashboard with real data
- ✅ **Meeting Summaries**: Test AI-powered meeting analysis
- ✅ **Navigation**: Ensure all sidebar buttons work

### 4. Test AI Features (Optional)
If you have a Google AI API key configured:
- Try the Meeting Summary AI processing
- Test Task Decomposition feature
- Generate AI notes from topics

### 6. Tutorial System ⭐ ACTIVE
Your app includes a **comprehensive tutorial system**:
- ✅ **Auto-Tutorial**: 6 guided tasks created for new users
- ✅ **Tutorial Restart**: Available in Settings page for users who want to replay the tutorial
- ✅ **Interactive Checklists**: Tutorial tasks include clickable checkboxes
- ✅ **Feature Coverage**: Covers Kanban boards, AI tools, task management, and navigation

**Tutorial Features:**
- Dashboard introduction and drag-and-drop
- Task creation and management
- AI Task Decomposition
- AI Note Generator
- Meeting Summaries exploration
- Complete feature walkthrough

### 7. Settings & Customization ⭐ NEW
- ✅ **Settings Page**: Now accessible from sidebar navigation
- ✅ **Tutorial Restart**: Users can restart the onboarding tutorial anytime
- ✅ **Theme Toggle**: Light/Dark mode switching with persistence
- ✅ **Account Info**: Display current user details and session info
- ✅ **Future-Ready**: Framework for additional settings and preferences

### 8. Production Deployment
When ready for production:
- Deploy to Vercel/Netlify
- Configure production environment variables
- Test all features in production environment

## Troubleshooting

If you get permission errors, make sure:
- You're logged into the correct Supabase project
- Your project has the latest version of Supabase
- You have admin access to the project
