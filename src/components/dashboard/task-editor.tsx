'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Save, X, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task, TaskPriority } from '@/types/task';

interface TaskEditorProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onCancel: () => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

export function TaskEditor({ task, onSave, onCancel, isEditing = false, onEditToggle }: TaskEditorProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [deadline, setDeadline] = useState<Date | undefined>(
    task.deadline ? new Date(task.deadline) : undefined
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    console.log('Task changed:', task); // Debug log
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    const newDeadline = task.deadline ? new Date(task.deadline) : undefined;
    console.log('Setting deadline to:', newDeadline); // Debug log
    setDeadline(newDeadline);
  }, [task]);

  const handleSave = () => {
    console.log('Saving task with deadline:', deadline); // Debug log
    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      description: description.trim(),
      priority,
      deadline: deadline ? deadline.toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
    console.log('Updated task:', updatedTask); // Debug log
    onSave(updatedTask);
  };

  const handleCancel = () => {
    // Reset to original values
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDeadline(task.deadline ? new Date(task.deadline) : undefined);
    onCancel();
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!isEditing) {
    // Display mode
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            {onEditToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditToggle}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {task.description && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <p className={cn("text-sm capitalize", getPriorityColor(task.priority))}>
                {task.priority}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Deadline</Label>
              <p className="text-sm text-muted-foreground">
                {task.deadline ? format(new Date(task.deadline), 'PPP') : 'No deadline set'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Edit mode
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Edit Task</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description (optional)"
            rows={3}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Deadline</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsCalendarOpen(!isCalendarOpen);
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(date) => {
                    console.log('Date selected:', date); // Debug log
                    if (date) {
                      setDeadline(date);
                    }
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeadline(undefined);
                      setIsCalendarOpen(false);
                    }}
                  >
                    Clear Date
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-4">
          <Button onClick={handleSave} size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
