import { Task } from '@/types/task';

// Mock database for demonstration purposes
const mockDatabase: { archivedTasks: Task[] } = {
  archivedTasks: [],
};

/**
 * Save archived tasks to the database.
 * @param tasks - Array of tasks to archive.
 */
export async function saveArchivedTasksToDatabase(tasks: Task[]): Promise<void> {
  // Simulate saving to a database
  mockDatabase.archivedTasks.push(...tasks);
  console.log('Archived tasks saved to database:', tasks);
}

/**
 * Fetch archived tasks from the database.
 * @returns Array of archived tasks.
 */
export async function fetchArchivedTasksFromDatabase(): Promise<Task[]> {
  // Simulate fetching from a database
  console.log('Fetching archived tasks from database.');
  return mockDatabase.archivedTasks;
}
