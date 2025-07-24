'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { decomposeTask, TaskDecompositionOutput } from '@/app/dashboard/tasks/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Terminal, Plus, Archive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoiceInputButton } from '@/components/dashboard/voice-input-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Task, Subtask as DecomposedSubtask } from '@/types/task'; // Import Subtask type
import { saveArchivedTasksToDatabase, fetchArchivedTasksFromDatabase } from '@/services/taskService';
import { TaskArchiveModal } from '@/components/dashboard/task-archive-modal';


interface TaskDecompositionToolProps {
    tasks: Task[]; // Add tasks prop
    onTasksDecomposed: (tasks: DecomposedSubtask[]) => void; // Update prop type
    onAddTask?: () => void; // Add callback for add task button
    onVoiceCommand?: (command: string) => void; // Add callback for voice command
}

type DecompositionMode = 'new' | 'existing';


// Utility function to archive completed tasks
function archiveCompletedTasks(tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) {
  const now = Date.now();
  const updatedTasks = tasks.map(task => {
    if (task.completed && !task.archivedAt) {
      return { ...task, archivedAt: now };
    }
    return task;
  });
  setTasks(updatedTasks);
}

export function TaskDecompositionTool({ tasks, onTasksDecomposed, onAddTask, onVoiceCommand }: TaskDecompositionToolProps) {
  const [objective, setObjective] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [mode, setMode] = useState<DecompositionMode>('new');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [localTasks, setLocalTasks] = useState(tasks);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);

  // Fetch archived tasks from the database on component mount
  useEffect(() => {
    async function loadArchivedTasks() {
      const fetchedArchivedTasks = await fetchArchivedTasksFromDatabase();
      setArchivedTasks(fetchedArchivedTasks);
    }
    loadArchivedTasks();
  }, []);

  // Auto-archive completed tasks every 24 hours
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const tasksToArchive = localTasks.filter(task => task.completed && !task.archivedAt);
      if (tasksToArchive.length > 0) {
        saveArchivedTasksToDatabase(tasksToArchive);
        archiveCompletedTasks(localTasks, setLocalTasks);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    return () => clearInterval(interval);
  }, [localTasks]);

  // Manual archive handler
  const handleManualArchive = async () => {
    const tasksToArchive = localTasks.filter(task => task.completed && !task.archivedAt);
    if (tasksToArchive.length > 0) {
      await saveArchivedTasksToDatabase(tasksToArchive);
      archiveCompletedTasks(localTasks, setLocalTasks);
      toast({
        title: "Tasks Archived",
        description: "All completed tasks have been archived.",
        variant: "default",
      });
    } else {
      toast({
        title: "No Tasks to Archive",
        description: "There are no completed tasks to archive.",
        variant: "default",
      });
    }
  };

  // Clear input/selection when mode changes
  useEffect(() => {
    setObjective('');
    setSelectedTaskId(null);
    setError(null);
  }, [mode]);

  const handleDecomposition = () => {
    let objectiveToDecompose = '';

    if (mode === 'new') {
        if (!objective.trim()) {
          setError('Please enter a new objective.');
          return;
        }
        objectiveToDecompose = objective.trim();
    } else { // mode === 'existing'
        if (!selectedTaskId) {
            setError('Please select an existing task.');
            return;
        }
        const selectedTask = tasks.find(task => task.id === selectedTaskId);
        if (!selectedTask) {
             setError('Selected task not found. Please select again.');
             setSelectedTaskId(null); // Reset selection
             return;
        }
        // Use title and description for better context
        // Remove markdown checklist from description if present for cleaner input to AI
        const cleanDescription = selectedTask.description.replace(/^- \[( |x)\] .*\n?/gm, '').trim();
        objectiveToDecompose = `${selectedTask.title}${cleanDescription ? `: ${cleanDescription}` : ''}`;
    }

    setError(null); // Clear previous errors

    startTransition(async () => {
      try {
        const result: TaskDecompositionOutput = await decomposeTask(
          mode === 'existing' && selectedTaskId ? 
            (tasks.find(task => task.id === selectedTaskId)?.title || 'Task Decomposition') :
            'Task Decomposition',
          objectiveToDecompose
        );

        if (result?.subtasks && result.subtasks.length > 0) {
            onTasksDecomposed(result.subtasks); // Pass the array of Subtask objects
            toast({
                title: "Tasks Decomposed!",
                description: `${result.subtasks.length} subtasks generated and added to the board.`,
                variant: "default",
            });
            // Clear inputs after success
            setObjective('');
            setSelectedTaskId(null);
        } else {
             setError('AI could not decompose the task. Try rephrasing or selecting a different task.');
             toast({
                title: "Decomposition Failed",
                description: "The AI couldn't generate subtasks. Please try again.",
                variant: "destructive",
             });
        }

      } catch (err) {
        console.error('Task decomposition error:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to decompose task: ${errorMessage}. Ensure your API key (if required by the model) is correctly configured.`);
        toast({
            title: "Error",
            description: `Task decomposition failed: ${errorMessage}`,
            variant: "destructive",
        });
      }
    });
  };

  const pendingTasks = tasks.filter(task => task.status === 'todo' || task.status === 'in_progress');

  return (
    <Card className="w-full shadow-lg relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://i.imgur.com/MbVfNkn.png)',
          opacity: 0.65,
          mixBlendMode: 'overlay',
          filter: 'blur(0.5px)',
        }}
      />
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">AI Task Decomposition</CardTitle>
            <CardDescription>Break down a large objective or an existing task into smaller, actionable steps with checklists.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onVoiceCommand && (
              <VoiceInputButton 
                onVoiceCommand={onVoiceCommand}
              />
            )}
            {onAddTask && (
              <Button onClick={onAddTask} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            )}
            <Button onClick={handleManualArchive} size="sm" className="ml-2">
              Archive Completed Tasks
            </Button>
            <TaskArchiveModal 
              trigger={
                <Button size="sm" className="ml-2">
                  <Archive className="mr-2 h-4 w-4" />
                  View Archived Tasks
                </Button>
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
          {/* Example task card with colored left border */}
          <div className="bg-white/80 rounded-lg mb-2 border-l-4" style={{ borderLeft: '3pt solid hsl(var(--primary, #14b8a6))', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}>
            {/* ... Task content would go here ... */}
          </div>
           {error && (
              <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
           )}

          <RadioGroup defaultValue="new" onValueChange={(value: DecompositionMode) => setMode(value)} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="r1" />
              <Label htmlFor="r1">New Objective</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="r2" />
              <Label htmlFor="r2">Existing Task</Label>
            </div>
          </RadioGroup>

          <div className="flex space-x-2 items-center">
            {mode === 'new' ? (
               <Input
                  type="text"
                  placeholder="e.g., Build a personal website"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  disabled={isPending}
                  className="flex-grow"
                />
            ) : (
               <Select
                  value={selectedTaskId ?? ""}
                  onValueChange={(value) => setSelectedTaskId(value || null)}
                  disabled={isPending || pendingTasks.length === 0}
               >
                  <SelectTrigger className="flex-grow">
                      <SelectValue placeholder={pendingTasks.length === 0 ? "No pending/in-progress tasks available" : "Select an existing task..."} />
                  </SelectTrigger>
                  <SelectContent>
                      {pendingTasks.map(task => (
                          <SelectItem key={task.id} value={task.id}>
                              {task.title} ({task.status})
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            )}

            <Button
               onClick={handleDecomposition}
               disabled={isPending || (mode === 'new' && !objective.trim()) || (mode === 'existing' && !selectedTaskId)}
               className="shrink-0"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Decomposing...
                </>
              ) : (
                'Decompose'
              )}
            </Button>
          </div>
        </CardContent>
       <CardFooter>
            <p className="text-xs text-muted-foreground">
                Powered by Genkit AI. Generates subtasks with interactive checklists. Results may vary.
            </p>
       </CardFooter>
    </Card>
  );
}
