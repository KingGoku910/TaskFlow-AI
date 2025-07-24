'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Task } from '@/types/task';
import { Markdown } from '@/components/ui/markdown';
import { getArchivedTasks, unarchiveTask, deleteTask } from '@/app/dashboard/tasks/actions';

interface TaskArchiveModalProps {
  trigger?: React.ReactNode;
}

export function TaskArchiveModal({ trigger }: TaskArchiveModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load archived tasks when modal opens
  useEffect(() => {
    if (isOpen) {
      loadArchivedTasks();
    }
  }, [isOpen]);

  const loadArchivedTasks = async () => {
    setLoading(true);
    try {
      const tasks = await getArchivedTasks();
      setArchivedTasks(tasks);
    } catch (error) {
      console.error('Error loading archived tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (taskId: string) => {
    setActionLoading(taskId);
    try {
      await unarchiveTask(taskId);
      // Remove from local state
      setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error unarchiving task:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(taskId);
    try {
      await deleteTask(taskId);
      // Remove from local state
      setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityBadgeVariant = (priority: Task['priority']): 'destructive' | 'secondary' | 'default' => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: Task['status']): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      default: return 'outline';
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Archive className="h-4 w-4" />
      Task Archive
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Task Archive ({archivedTasks.length} items)
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : archivedTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No archived tasks found.</p>
              <p className="text-sm">Completed tasks are automatically archived after 24 hours.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedTasks.map((task) => (
                <Card key={task.id} className="bg-muted/50">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex gap-2 flex-wrap">
                        <Badge
                          variant={getPriorityBadgeVariant(task.priority)}
                          className="text-xs"
                        >
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                        <Badge
                          variant={getStatusBadgeVariant(task.status)}
                          className="text-xs"
                        >
                          {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => handleUnarchive(task.id)}
                          disabled={actionLoading === task.id}
                          aria-label={`Restore task ${task.title}`}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handlePermanentDelete(task.id)}
                          disabled={actionLoading === task.id}
                          aria-label={`Permanently delete task ${task.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-base font-medium">{task.title}</CardTitle>
                    <CardDescription className="text-xs">
                      <div className="space-y-1">
                        <div>Deadline: {task.deadline ? format(new Date(task.deadline), 'PP') : 'N/A'}</div>
                        <div>Archived: {task.archivedAt ? format(new Date(task.archivedAt), 'PPp') : 'Unknown'}</div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-sm text-muted-foreground">
                      {task.description && task.description.trim() ? (
                        <Markdown compact>
                          {task.description}
                        </Markdown>
                      ) : (
                        <p className="italic">No description.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Tasks are automatically archived 24 hours after completion
          </p>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
