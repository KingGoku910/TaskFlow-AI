## Supabase Edge Functions (Recommended)

To extend Effecto TaskFlow with custom logic and integrations, implement the following Supabase Edge Functions:

1. **decompose_task**
   - Accepts a task objective, calls an AI service (e.g., OpenAI), returns subtasks.
   - Triggered from dashboard when user requests decomposition.

2. **generate_notes**
   - Accepts a topic, calls an AI service, returns structured markdown notes.
   - Triggered from dashboard note generator.

3. **get_user_analytics**
   - Aggregates and returns user productivity stats (tasks completed, time to completion, etc.).
   - Triggered from analytics dashboard.

4. **summarize_meeting**
   - Accepts meeting transcript, calls AI service, returns summary and action items.
   - Triggered from meeting summary page.

5. **task_event_webhook**
   - Listens for task creation/update/deletion, triggers notifications or integrations (e.g., email, Slack).
   - Triggered via Supabase Row Level Security (RLS) or direct API call.

6. **create_tutorial_tasks**
   - Automatically creates tutorial tasks for new users.
   - Triggered after user registration.

These Edge Functions enable secure, scalable, and flexible backend logic for advanced features and integrations in Supabase.
