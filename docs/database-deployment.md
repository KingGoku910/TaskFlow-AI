# Database Deployment Guide

This document provides complete instructions for deploying the TaskFlow AI database schema to Supabase.

## 📋 Prerequisites

1. **Supabase Project**: Active Supabase project with admin access
2. **Authentication**: Supabase Auth must be enabled (default)
3. **Environment Variables**: Configured in your `.env.local` file

## 🚀 Quick Deployment

### Step 1: Run Schema Script

1. Open your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire content from `database/schema.sql`
4. Click **Run** to execute the script

### Step 2: Verify Tables

After running the script, you should see these tables in your **Table Editor**:

- ✅ `users` - User profiles and settings
- ✅ `tasks` - Core task management
- ✅ `notes` - AI-generated and manual notes  
- ✅ `meeting_summaries` - AI meeting analysis
- ✅ `analytics_events` - User interaction tracking

### Step 3: Test Row Level Security

The schema includes RLS policies that ensure users can only access their own data:

```sql
-- Test with authenticated user
SELECT * FROM tasks; -- Only returns current user's tasks
SELECT * FROM meeting_summaries; -- Only returns current user's summaries
```

## 📊 Database Schema Overview

### Core Tables

#### `tasks`
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users(id)
title           VARCHAR(255) NOT NULL
description     TEXT
status          VARCHAR(50) CHECK (todo, in_progress, completed)
priority        VARCHAR(50) CHECK (low, medium, high)
deadline        TIMESTAMP WITH TIME ZONE
tags            TEXT[]
created_at      TIMESTAMP WITH TIME ZONE
updated_at      TIMESTAMP WITH TIME ZONE
```

#### `meeting_summaries`
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users(id)
title           VARCHAR(255) NOT NULL
summary         TEXT NOT NULL
key_points      TEXT[]
action_items    TEXT[]
participants    TEXT[]
audio_url       VARCHAR(500)
duration        INTEGER
created_at      TIMESTAMP WITH TIME ZONE
updated_at      TIMESTAMP WITH TIME ZONE
```

#### `analytics_events`
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users(id)
event_type      VARCHAR(100) NOT NULL
event_value     NUMERIC
metadata        JSONB
created_at      TIMESTAMP WITH TIME ZONE
```

#### `notes`
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users(id)
title           VARCHAR(255) NOT NULL
content         TEXT
tags            TEXT[]
created_at      TIMESTAMP WITH TIME ZONE
updated_at      TIMESTAMP WITH TIME ZONE
```

## 🔒 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only view their own data
- Users can only modify their own data
- No cross-user data access

### Authentication Integration
- All tables reference `auth.users(id)` from Supabase Auth
- Automatic user cleanup on account deletion (CASCADE)
- JWT-based access control

## 📈 Performance Optimizations

### Indexes
The schema includes optimized indexes for:
- User-based queries (`user_id` indexes)
- Time-based queries (`created_at` indexes)
- Status filtering (`status` indexes)

### Triggers
- Automatic `updated_at` timestamp updates
- Consistent timestamp handling across all tables

## 🧪 Testing the Schema

### Sample Data Insertion

You can test the schema with sample data:

```sql
-- Insert a test task (replace UUID with your user ID)
INSERT INTO tasks (user_id, title, description, status, priority) 
VALUES (
  auth.uid(), 
  'Test Task', 
  'This is a test task description', 
  'todo', 
  'medium'
);

-- Insert a test meeting summary
INSERT INTO meeting_summaries (user_id, title, summary, key_points, action_items)
VALUES (
  auth.uid(),
  'Test Meeting',
  'This was a productive team meeting discussing project progress.',
  ARRAY['Project on track', 'Team collaboration excellent'],
  ARRAY['Complete feature X by Friday', 'Schedule follow-up meeting']
);
```

### Verification Queries

```sql
-- Check tasks
SELECT COUNT(*) as task_count FROM tasks WHERE user_id = auth.uid();

-- Check meeting summaries  
SELECT COUNT(*) as meeting_count FROM meeting_summaries WHERE user_id = auth.uid();

-- Check analytics events
SELECT COUNT(*) as event_count FROM analytics_events WHERE user_id = auth.uid();
```

## 🔧 Environment Configuration

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

## 🚨 Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure RLS policies are correctly applied
2. **Foreign Key Errors**: Verify auth.users table exists and user is authenticated
3. **Index Errors**: Some indexes may already exist - ignore duplicate warnings

### Manual RLS Reset (if needed)

```sql
-- Disable RLS temporarily
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Re-enable with fresh policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Recreate policies...
```

## ✅ Deployment Checklist

- [ ] Schema script executed successfully
- [ ] All 5 tables created (`users`, `tasks`, `notes`, `meeting_summaries`, `analytics_events`)
- [ ] RLS policies applied and tested
- [ ] Indexes created for performance
- [ ] Triggers set up for `updated_at` fields
- [ ] Sample data inserted and verified
- [ ] Environment variables configured
- [ ] Application connecting successfully

The database is now ready for production use with the TaskFlow AI application!
