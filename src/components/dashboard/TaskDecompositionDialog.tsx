'use client';

import React, { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  CheckSquare, 
  Plus, 
  Clock, 
  Target, 
  Zap,
  ArrowRight,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { decomposeTask } from '@/app/dashboard/tasks/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskDecompositionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: {
    id: string;
    title: string;
    description?: string;
  };
  onTasksCreated: (subtasks: any[]) => void;
}

export function TaskDecompositionDialog({ 
  isOpen, 
  onClose, 
  task, 
  onTasksCreated 
}: TaskDecompositionDialogProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [isDecomposing, startDecomposition] = useTransition();
  const [decomposedTasks, setDecomposedTasks] = useState<any[]>([]);
  const [showDecomposition, setShowDecomposition] = useState(false);
  const { toast } = useToast();

  const handleDecompose = async () => {
    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a task title to decompose.',
        variant: 'destructive',
      });
      return;
    }

    startDecomposition(async () => {
      try {
        const result = await decomposeTask(title, description);
        
        if (result.subtasks && result.subtasks.length > 0) {
          setDecomposedTasks(result.subtasks);
          setShowDecomposition(true);
          toast({
            title: 'Task Decomposed',
            description: `Generated ${result.subtasks.length} subtasks from your main task.`,
          });
        } else {
          toast({
            title: 'No Subtasks Generated',
            description: 'The task might already be specific enough or AI processing failed.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Decomposition error:', error);
        toast({
          title: 'Decomposition Failed',
          description: 'Could not decompose the task. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleCreateSubtasks = async () => {
    if (decomposedTasks.length === 0) return;

    try {
      // Import the necessary actions
      const { createClient } = await import('@/utils/supabase/server');
      
      // For now, we'll pass the subtasks back to the parent component
      // The parent will handle the actual creation
      onTasksCreated(decomposedTasks);
      
      toast({
        title: 'Subtasks Created',
        description: `${decomposedTasks.length} subtasks will be created in your task board.`,
      });
      
      // Reset and close
      setTitle('');
      setDescription('');
      setDecomposedTasks([]);
      setShowDecomposition(false);
      onClose();
    } catch (error) {
      console.error('Error creating subtasks:', error);
      toast({
        title: 'Creation Failed',
        description: 'Could not create subtasks. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateSubtask = (index: number, field: string, value: any) => {
    setDecomposedTasks(prev => 
      prev.map((task, i) => 
        i === index ? { ...task, [field]: value } : task
      )
    );
  };

  const removeSubtask = (index: number) => {
    setDecomposedTasks(prev => prev.filter((_, i) => i !== index));
  };

  const resetDialog = () => {
    setTitle(task?.title || '');
    setDescription(task?.description || '');
    setDecomposedTasks([]);
    setShowDecomposition(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Task Decomposition Tool
          </DialogTitle>
          <DialogDescription>
            Break down a complex task into smaller, manageable subtasks using AI assistance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!showDecomposition ? (
            <>
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Define Your Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === 'Enter') {
                          e.preventDefault();
                          if (!isDecomposing && title.trim()) {
                            handleDecompose();
                          }
                        }
                      }}
                      placeholder="e.g., Build a mobile app for task management (Ctrl+Enter to decompose)"
                      disabled={isDecomposing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-description">Task Description (Optional)</Label>
                    <Textarea
                      id="task-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === 'Enter') {
                          e.preventDefault();
                          if (!isDecomposing && title.trim()) {
                            handleDecompose();
                          }
                        }
                      }}
                      placeholder="Provide additional context, requirements, or constraints... (Ctrl+Enter to decompose)"
                      rows={4}
                      disabled={isDecomposing}
                    />
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium">Tips for better decomposition:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Be specific about the end goal</li>
                        <li>Include any constraints or requirements</li>
                        <li>Mention the target audience or use case</li>
                      </ul>
                    </div>
                  </div>

                  <Button 
                    onClick={handleDecompose}
                    disabled={isDecomposing || !title.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isDecomposing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Decomposing Task...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Decompose into Subtasks
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Decomposition Results */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Generated Subtasks</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Review and customize the subtasks before creating them
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowDecomposition(false)}
                      >
                        Back to Edit
                      </Button>
                      <Button 
                        onClick={handleCreateSubtasks}
                        disabled={decomposedTasks.length === 0}
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create All Subtasks
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {decomposedTasks.map((subtask, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <Input
                                  value={subtask.title}
                                  onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                                  className="font-medium"
                                  placeholder="Subtask title"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSubtask(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-3">
                            <Textarea
                              value={subtask.description}
                              onChange={(e) => updateSubtask(index, 'description', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.ctrlKey && e.key === 'Enter') {
                                  e.preventDefault();
                                  // Focus next subtask or create new one if this is the last
                                  const nextIndex = index + 1;
                                  if (nextIndex < subtasks.length) {
                                    const nextTextarea = document.querySelector(`#subtask-${nextIndex}`) as HTMLTextAreaElement;
                                    if (nextTextarea) {
                                      nextTextarea.focus();
                                    }
                                  }
                                }
                              }}
                              placeholder="Task description... (Ctrl+Enter to go to next)"
                              rows={3}
                              className="text-sm"
                              id={`subtask-${index}`}
                            />
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">Priority:</Label>
                                <Select
                                  value={subtask.priority || 'medium'}
                                  onValueChange={(value) => updateSubtask(index, 'priority', value)}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {subtask.estimated_hours && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    ~{subtask.estimated_hours}h
                                  </span>
                                </div>
                              )}
                            </div>

                            {subtask.checklist && subtask.checklist.length > 0 && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Checklist:</Label>
                                <div className="space-y-1">
                                  {subtask.checklist.map((item: any, checkIndex: number) => (
                                    <div key={checkIndex} className="flex items-center gap-2 text-sm">
                                      <CheckSquare className="h-3 w-3 text-muted-foreground" />
                                      <span>{item.item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
