
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useToast } from '@/hooks/use-toast';
import { KanbanBoard } from '@/components/dashboard/kanban-board';
import { TaskDecompositionTool } from '@/components/dashboard/task-decomposition-tool';
import { AddTaskForm } from '@/components/dashboard/add-task-form';
import type { Task, Subtask as DecomposedSubtask } from '@/types/task';
import { Plus, Loader2, AlertTriangle, Trash2 as TrashIcon, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { VoiceInputButton } from '@/components/dashboard/voice-input-button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// Import server actions
import {
    addTask,
    updateTask,
    deleteTask,
    deleteMultipleTasks,
    archiveTask,
    archiveMultipleTasks,
} from '@/app/dashboard/tasks/actions';

interface DashboardClientProps {
  initialTasks: Task[];
  userId: string;
  pageError: string | null;
}

export default function DashboardClientContent({ initialTasks, userId, pageError }: DashboardClientProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const [isDeleting, startDeleteTransition] = useTransition();
    const [isArchiving, startArchiveTransition] = useTransition();

    const { toast } = useToast();
    const router = useRouter(); // Get router instance

    const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
        if (!userId) {
            toast({ title: "Error", description: "User ID not available.", variant: "destructive" });
            return;
        }
        
        try {
            // Create FormData as expected by server action
            const formData = new FormData();
            formData.append('title', newTaskData.title);
            formData.append('description', newTaskData.description || '');
            formData.append('priority', newTaskData.priority);
            formData.append('status', 'todo'); // Default status
            
            // Format deadline properly
            if (newTaskData.deadline) {
                formData.append('deadline', newTaskData.deadline);
            } else {
                // Default to one week from now
                const defaultDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                formData.append('deadline', defaultDeadline);
            }
            
            const newTask = await addTask(formData);
            if (newTask) {
                // Optimistic update (optional but good UX)
                setTasks((prevTasks) => [newTask, ...prevTasks]);
                router.refresh(); // Trigger revalidation

                toast({ title: "Task Added", description: `"${newTask.title}" has been added.` });
                setIsAddTaskDialogOpen(false);
            }
        } catch (error) {
            console.error('Add task error:', error);
            toast({ title: "Error", description: "Failed to add task. Please try again.", variant: "destructive" });
        }
    };

    const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
        if (!userId) return;
        
        try {
            const updateData = { 
                status: newStatus,
                updated_at: new Date().toISOString()
            };
            
            await updateTask(taskId, updateData);
            
            // Optimistic update
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, ...updateData } : task
                )
            );
            
            router.refresh(); // Trigger revalidation
        } catch (error) {
            console.error('Update task status error:', error);
            toast({ 
                title: "Error", 
                description: `Failed to update task status: ${error instanceof Error ? error.message : 'Unknown error'}`, 
                variant: "destructive" 
            });
        }
    };

    const handleUpdateTask = async (updatedTaskData: Task) => {
        if (!userId) return;
        
        try {
            const { id, createdAt, updatedAt, ...dataToUpdate } = updatedTaskData;
            
            // Add updated_at timestamp
            const updateData = {
                ...dataToUpdate,
                updated_at: new Date().toISOString()
            };
            
            await updateTask(id, updateData);
            
            // Optimistic update
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === id ? { ...task, ...updateData } : task
                )
            );
            
            toast({ 
                title: "Task Updated", 
                description: `"${updatedTaskData.title}" has been updated.` 
            });
            
            router.refresh(); // Trigger revalidation
        } catch (error) {
            console.error('Update task error:', error);
            toast({ 
                title: "Error", 
                description: `Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`, 
                variant: "destructive" 
            });
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!userId) return;
        const taskToDelete = tasks.find(t => t.id === taskId);
        if (!taskToDelete) return;

        try {
            await deleteTask(taskId);
            // Optimistic update
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
            setSelectedTaskIds((prev) => prev.filter(id => id !== taskId));
            router.refresh(); // Trigger revalidation

            toast({ title: "Task Deleted", description: `"${taskToDelete.title}" has been deleted.` });
        } catch (error) {
            console.error('Delete task error:', error);
            toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
        }
    };

    const handleArchiveTask = async (taskId: string) => {
        if (!userId) return;
        const taskToArchive = tasks.find(t => t.id === taskId);
        if (!taskToArchive) return;

        try {
            await archiveTask(taskId);
            // Optimistic update (remove from view since we only show non-archived tasks)
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
            setSelectedTaskIds((prev) => prev.filter(id => id !== taskId));
            router.refresh(); // Trigger revalidation

            toast({ title: "Task Archived", description: `"${taskToArchive.title}" has been archived.` });
        } catch (error) {
            console.error('Archive task error:', error);
            toast({ title: "Error", description: "Failed to archive task.", variant: "destructive" });
        }
    };

    const handleDecomposedTasks = async (decomposedSubtasks: DecomposedSubtask[]) => {
        if (!userId) return;
        
        try {
            const newTasksPromises = decomposedSubtasks.map(async (subtask) => {
                const formData = new FormData();
                formData.append('title', subtask.title);
                formData.append('description', subtask.description);
                formData.append('priority', 'medium');
                formData.append('status', 'todo');
                formData.append('deadline', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
                
                return addTask(formData);
            });

            const addedTasks = await Promise.all(newTasksPromises);
            const successfulTasks = addedTasks.filter(task => task !== null) as Task[];
            
            if (successfulTasks.length > 0) {
                // Optimistic update (add new tasks immediately)
                setTasks(prev => [...successfulTasks, ...prev]);
                router.refresh(); // Trigger revalidation

                toast({
                    title: "Tasks Added",
                    description: `${successfulTasks.length} new tasks added from decomposition.`
                });
            }
            
            if (successfulTasks.length !== decomposedSubtasks.length) {
                toast({
                    title: "Partial Success",
                    description: `Some tasks could not be added from decomposition.`,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Decomposed tasks error:', error);
            toast({
                title: "Error",
                description: `Failed to add decomposed tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: "destructive"
            });
        }
    };

    const handleTaskSelectionChange = (taskId: string, isSelected: boolean) => {
        setSelectedTaskIds((prevSelectedIds: string[]) => {
            if (isSelected) {
                return [...prevSelectedIds, taskId];
            } else {
                return prevSelectedIds.filter((id) => id !== taskId);
            }
        });
    };

    const handleDeleteSelectedTasks = () => {
        if (!userId || selectedTaskIds.length === 0) return;
        startDeleteTransition(async () => {
            try {
                await deleteMultipleTasks(selectedTaskIds);
                
                // Optimistic update
                setTasks((prevTasks) => prevTasks.filter((task) => !selectedTaskIds.includes(task.id)));
                router.refresh(); // Trigger revalidation

                toast({ 
                    title: "Tasks Deleted", 
                    description: `${selectedTaskIds.length} tasks have been deleted.` 
                });
                setSelectedTaskIds([]);
            } catch (error) {
                console.error('Delete multiple tasks error:', error);
                toast({ 
                    title: "Error Deleting Tasks", 
                    description: "Failed to delete selected tasks.", 
                    variant: "destructive" 
                });
            }
        });
    };

    const handleArchiveSelectedTasks = () => {
        if (!userId || selectedTaskIds.length === 0) return;
        startArchiveTransition(async () => {
            try {
                await archiveMultipleTasks(selectedTaskIds);
                
                // Optimistic update (remove from view since we only show non-archived tasks)
                setTasks((prevTasks) => prevTasks.filter((task) => !selectedTaskIds.includes(task.id)));
                router.refresh(); // Trigger revalidation

                toast({ 
                    title: "Tasks Archived", 
                    description: `${selectedTaskIds.length} tasks have been archived.` 
                });
                setSelectedTaskIds([]);
            } catch (error) {
                console.error('Archive multiple tasks error:', error);
                toast({ 
                    title: "Error Archiving Tasks", 
                    description: "Failed to archive selected tasks.", 
                    variant: "destructive" 
                });
            }
        });
    };

     if (pageError) {
        const isDatabaseError = pageError.includes('Database tables not set up');
        
        return (
            <div id="dashboard-error-container" className="dashboard-error-container flex flex-col items-center justify-center h-full text-center p-4">
                <Alert variant="destructive" className="dashboard-error-alert max-w-lg">
                    <AlertTriangle className="h-6 w-6" />
                    <AlertTitle className="error-title text-xl font-semibold">
                        {isDatabaseError ? 'Database Setup Required' : 'Dashboard Loading Error'}
                    </AlertTitle>
                    <AlertDescription className="error-description mt-2 text-base">
                        <p className="mb-2">{pageError}</p>
                        {isDatabaseError ? (
                            <div className="database-setup-instructions text-left">
                                <p className="mb-2 font-medium">To fix this:</p>
                                <ol className="setup-steps list-decimal list-inside space-y-1 text-sm">
                                    <li>Go to your Supabase Dashboard</li>
                                    <li>Open the SQL Editor</li>
                                    <li>Run the schema from <code>database/schema.sql</code></li>
                                    <li>Refresh this page</li>
                                </ol>
                            </div>
                        ) : (
                            <p className="general-error-message">Please check your Supabase connection and server logs for more details.</p>
                        )}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }


    return (
        <div id="dashboard-content" className="dashboard-content space-y-8 w-full h-full flex flex-col">
            <div id="dashboard-header-section" className="dashboard-header-section flex justify-between items-center gap-4 flex-wrap">
                <div id="dashboard-actions" className="dashboard-actions flex items-center gap-2">
                    {selectedTaskIds.length > 0 && (
                        <>
                            <Button
                                id="archive-selected-tasks-button"
                                className="archive-selected-tasks-button"
                                variant="outline"
                                onClick={handleArchiveSelectedTasks}
                                disabled={isArchiving}
                            >
                                {isArchiving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Archive className="mr-2 h-4 w-4" />
                                )}
                                Archive ({selectedTaskIds.length})
                            </Button>
                            <Button
                                id="delete-selected-tasks-button"
                                className="delete-selected-tasks-button"
                                variant="destructive"
                                onClick={handleDeleteSelectedTasks}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <TrashIcon className="mr-2 h-4 w-4" />
                                )}
                                Delete ({selectedTaskIds.length})
                            </Button>
                        </>
                    )}
                </div>
                <div className="dashboard-tools flex items-center gap-2">
                    {/* Archive functionality moved to task decomposition tool */}
                </div>
            </div>

            <div id="task-decomposition-section" className="task-decomposition-section">
                <TaskDecompositionTool 
                    tasks={tasks} 
                    onTasksDecomposed={handleDecomposedTasks}
                    onAddTask={() => setIsAddTaskDialogOpen(true)}
                    onVoiceCommand={(command) => console.log("Voice command received:", command)}
                />
            </div>

            <div id="kanban-board-section" className="kanban-board-section flex-1 min-h-0">
                <KanbanBoard
                    tasks={tasks}
                    onTaskStatusChange={handleUpdateTaskStatus}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onArchiveTask={handleArchiveTask}
                    selectedTaskIds={selectedTaskIds}
                    onTaskSelectionChange={handleTaskSelectionChange}
                />
            </div>

            {/* Add Task Dialog */}
            <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
                <DialogContent id="add-task-dialog" className="add-task-dialog sm:max-w-[425px]">
                    <DialogHeader className="add-task-dialog-header">
                        <DialogTitle className="add-task-dialog-title">Add New Task</DialogTitle>
                    </DialogHeader>
                    <AddTaskForm onSubmit={handleAddTask} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
