export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string; // Can contain markdown checklist
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string; // ISO string format for dates
  createdAt: string;
  updatedAt: string;
  completedAt?: string; // ISO string format for when task was completed
  archivedAt?: string; // ISO string format for when task was archived
  parentTaskId?: string; // ID of parent task if this is a subtask
  isDecomposed?: boolean; // Whether this task was created from decomposition
  originalTaskId?: string; // ID of original task if this was decomposed
}

// Added based on task-decomposition flow output schema
export interface Subtask {
  title: string;
  description: string; // Markdown checklist description
}