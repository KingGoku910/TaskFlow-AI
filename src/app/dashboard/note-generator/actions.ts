'use server';

export async function generateNotesAction(
  topic: string,
  context?: string
): Promise<{
  title: string;
  content: string;
  summary?: string;
  keyPoints?: string[];
}> {
  try {
    // Dynamic import to ensure this only runs on server
    const { generateNotes } = await import('@/ai/flows/note-generation');
    
    const result = await generateNotes({ topic, context });
    
    return {
      title: `Notes: ${topic}`,
      content: result.notes,
      summary: result.summary,
      keyPoints: result.keyPoints
    };
  } catch (error) {
    console.error('Error generating notes:', error);
    
    // Return fallback result if AI processing fails
    return {
      title: `Notes: ${topic}`,
      content: `# ${topic}\n\n## Overview\n\nThis is a fallback note generated when AI services are unavailable.\n\n## Key Points\n\n- Important topic to research\n- Define requirements and scope\n- Plan implementation approach\n\n## Next Steps\n\n- Research the topic further\n- Create detailed outline\n- Begin implementation`,
      summary: 'Fallback note generated',
      keyPoints: ['Research topic', 'Define requirements', 'Plan implementation']
    };
  }
}

export async function refineNotesAction(
  currentNotes: string,
  feedback: string,
  topic: string
): Promise<{
  title: string;
  content: string;
  summary?: string;
  keyPoints?: string[];
}> {
  try {
    // Dynamic import to ensure this only runs on server
    const { refineNotes } = await import('@/ai/flows/note-generation');
    
    const result = await refineNotes({ 
      currentNotes, 
      feedback, 
      topic 
    });
    
    return {
      title: `Notes: ${topic} (Refined)`,
      content: result.notes,
      summary: result.summary,
      keyPoints: result.keyPoints
    };
  } catch (error) {
    console.error('Error refining notes:', error);
    
    // Return original notes if refinement fails
    return {
      title: `Notes: ${topic}`,
      content: currentNotes,
      summary: 'Refinement failed - returned original notes',
      keyPoints: []
    };
  }
}

export async function saveNotesAction(
  notes: string,
  topic: string,
  directory?: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    // Import server-side Supabase client
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        success: false,
        error: 'Authentication required to save notes'
      };
    }

    // Save to database
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: user.id,
        title: `Notes: ${topic}`,
        content: notes,
        topic: topic,
        generated_by_ai: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error saving notes:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      filePath: `Note ID: ${data.id}`
    };
  } catch (error) {
    console.error('Error saving notes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function convertNotesToTasksAction(
  notes: string,
  topic: string
): Promise<{
  success: boolean;
  tasks?: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    estimatedHours?: number;
    dependencies?: string[];
  }>;
  error?: string;
}> {
  try {
    // Dynamic import to ensure this only runs on server
    const { convertNotesToTasks } = await import('@/ai/flows/note-generation');
    
    const tasks = await convertNotesToTasks(notes, topic);
    
    return {
      success: true,
      tasks
    };
  } catch (error) {
    console.error('Error converting notes to tasks:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function createTaskFromNotesAction(
  noteContent: string,
  noteTitle: string,
  shouldDecompose: boolean = false
): Promise<{
  success: boolean;
  taskId?: string;
  subtasks?: any[];
  error?: string;
}> {
  try {
    // Import server-side Supabase client
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        success: false,
        error: 'Authentication required to create tasks'
      };
    }

    // Create the main task
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .insert([{
        user_id: user.id,
        title: noteTitle,
        description: noteContent.substring(0, 500) + (noteContent.length > 500 ? '...' : ''),
        priority: 'medium',
        status: 'todo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (taskError) {
      console.error('Error creating task:', taskError);
      return {
        success: false,
        error: taskError.message
      };
    }

    // If decomposition is requested, decompose the task
    if (shouldDecompose) {
      const { decomposeTask } = await import('@/app/dashboard/tasks/actions');
      const decompositionResult = await decomposeTask(noteTitle, noteContent);
      
      if (decompositionResult.subtasks && decompositionResult.subtasks.length > 0) {
        // Create subtasks in the database
        const subtaskData = decompositionResult.subtasks.map(subtask => ({
          task_id: taskData.id,
          user_id: user.id,
          title: subtask.title,
          description: subtask.description,
          priority: subtask.priority || 'medium',
          status: 'todo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { data: subtasks, error: subtaskError } = await supabase
          .from('subtasks')
          .insert(subtaskData)
          .select();

        if (subtaskError) {
          console.error('Error creating subtasks:', subtaskError);
          // Task was created successfully, just subtasks failed
          return {
            success: true,
            taskId: taskData.id,
            error: `Task created but subtasks failed: ${subtaskError.message}`
          };
        }

        return {
          success: true,
          taskId: taskData.id,
          subtasks: subtasks
        };
      }
    }

    return {
      success: true,
      taskId: taskData.id
    };
  } catch (error) {
    console.error('Error creating task from notes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function exportNotesToPDFAction(
  notes: string,
  topic: string,
  format: 'markdown' | 'richtext' | 'plaintext' = 'markdown'
): Promise<{ success: boolean; error?: string }> {
  try {
    // This is a client-side operation that needs to be handled in the component
    // We'll keep the PDF generation on the client side for now
    return { success: true };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
