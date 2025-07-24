## Supabase Database Schema (Alternative Backend)

### Tables
1. **users**
   - id: uuid (primary key, references auth.users)
   - email: text
   - created_at: timestamp
   - tutorial_completed: boolean

2. **tasks**
   - id: uuid (primary key)
   - user_id: uuid (foreign key → users.id)
   - title: text
   - description: text
   - status: text (enum: 'Pending', 'In Progress', 'Completed')
   - priority: text (enum: 'Low', 'Medium', 'High')
   - deadline: timestamp
   - created_at: timestamp
   - updated_at: timestamp

3. **subtasks**
   - id: uuid (primary key)
   - task_id: uuid (foreign key → tasks.id)
   - title: text
   - description: text

4. **notes**
   - id: uuid (primary key)
   - user_id: uuid (foreign key → users.id)
   - topic: text
   - content: text
   - created_at: timestamp

5. **meeting_summaries** (for future features)
   - id: uuid (primary key)
   - user_id: uuid (foreign key → users.id)
   - summary: text
   - created_at: timestamp

6. **analytics** (for future features)
   - id: uuid (primary key)
   - user_id: uuid (foreign key → users.id)
   - data: jsonb
   - created_at: timestamp

### Enums (recommended)
- task_status: 'Pending', 'In Progress', 'Completed'
- task_priority: 'Low', 'Medium', 'High'

### Relationships
- users → tasks (one-to-many)
- tasks → subtasks (one-to-many)
- users → notes, meeting_summaries, analytics (one-to-many)

This schema supports all current and planned features, is scalable, and leverages Supabase’s relational and auth capabilities.
