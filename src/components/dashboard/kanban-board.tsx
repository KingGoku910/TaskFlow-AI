
'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus } from '@/types/task';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { Button } from '@/components/ui/button'; // Import Button
import { Trash2, Edit } from 'lucide-react'; // Import Trash icon
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TaskDetailDialog } from './task-detail-dialog';
import { Markdown } from '@/components/ui/markdown';
import { TaskEditor } from '@/components/dashboard/task-editor';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void; // Prop for deleting a single task
  selectedTaskIds: string[]; // New prop for selected task IDs
  onTaskSelectionChange: (taskId: string, isSelected: boolean) => void; // New prop for selection change
}

const columns: TaskStatus[] = ['todo', 'in_progress', 'completed'];

export function KanbanBoard({
  tasks,
  onTaskStatusChange,
  onUpdateTask,
  onDeleteTask,
  selectedTaskIds,
  onTaskSelectionChange,
}: KanbanBoardProps) {
  const [isBrowser, setIsBrowser] = useState(false);
  const [taskToOpen, setTaskToOpen] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, []);

  const currentSelectedTaskForDialog = tasks.find(t => t.id === taskToOpen?.id) || null;

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    const newStatus = destination.droppableId as TaskStatus;
    onTaskStatusChange(draggableId, newStatus);
  };

  const handleCardClick = (task: Task, e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent dialog opening if the click target is the checkbox or delete button
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-dialog-open="true"]')) {
      return;
    }
    setTaskToOpen(task);
  };

  const handleDialogClose = () => {
    setTaskToOpen(null);
  };

  const handleDialogUpdateTask = (updatedTask: Task) => {
    onUpdateTask(updatedTask);
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleSaveEdit = (updatedTask: Task) => {
    onUpdateTask(updatedTask);
    setEditingTaskId(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  // Helper function to map status to CSS data attribute
  const getStatusDataAttribute = (status: TaskStatus): string => {
    return status; // Now they match exactly
  };

  // Helper function to get display name for status
  const getStatusDisplayName = (status: TaskStatus): string => {
    switch (status) {
      case 'todo': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
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

  if (!isBrowser) {
    return null;
  }

  return (
    <section id="kanban-board-container" className="kanban-board-container">
      <DragDropContext onDragEnd={onDragEnd}>
        <div id="kanban-columns" className="kanban-columns grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  id={`kanban-column-${status.toLowerCase().replace(/\s+/g, '-')}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  data-status={getStatusDataAttribute(status)}
                  className={cn(
                    "kanban-column bg-muted/50 p-4 rounded-lg border border-dashed transition-colors duration-200",
                    `column-${status.toLowerCase().replace(/\s+/g, '-')}`,
                    snapshot.isDraggingOver ? 'bg-accent border-primary dragging-over' : 'border-gray-200 dark:!border-[var(--sidebar-accent)]'
                  )}
                >
                  <h2 id={`column-title-${status.toLowerCase().replace(/\s+/g, '-')}`} className="kanban-header column-title text-lg font-semibold mb-4 text-foreground capitalize">{getStatusDisplayName(status)}</h2>
                  <div className={`task-list space-y-3 min-h-[200px] tasks-${status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {tasks
                      .filter((task) => task.status === status)
                      .reverse()
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(providedDraggable, snapshotDraggable) => (
                            <div
                              id={`task-item-${task.id}`}
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                              style={{ ...providedDraggable.draggableProps.style }}
                              className={cn(
                                "task-item rounded-lg transition-shadow duration-200",
                                `task-${task.id}`,
                                `priority-${task.priority.toLowerCase()}`,
                                snapshotDraggable.isDragging ? 'shadow-xl dragging' : 'shadow-md'
                              )}
                              onClick={(e) => handleCardClick(task, e)}
                            >
                              {editingTaskId === task.id ? (
                                <TaskEditor
                                  task={task}
                                  onSave={handleSaveEdit}
                                  onCancel={handleCancelEdit}
                                  isEditing={true}
                                />
                              ) : (
                                <Card className={cn(
                                  "task-card bg-card hover:bg-card/90 cursor-pointer relative",
                                  { 'ring-2 ring-primary ring-offset-2 ring-offset-background': snapshotDraggable.isDragging }
                                )}
                                data-status={getStatusDataAttribute(status)}
                                >
                                <CardHeader className="task-card-header p-4 pb-2 pr-12">
                                  <div
                                    data-no-dialog-open="true"
                                    className="task-checkbox-container absolute top-3 right-3 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Checkbox
                                      id={`select-task-${task.id}`}
                                      className="task-selection-checkbox"
                                      checked={selectedTaskIds.includes(task.id)}
                                      onCheckedChange={(checked) => onTaskSelectionChange(task.id, !!checked)}
                                      aria-labelledby={`task-title-${task.id}`}
                                    />
                                  </div>
                                  <div className="task-header-content flex justify-between items-start gap-2">
                                    <CardTitle id={`task-title-${task.id}`} className="task-title text-base font-medium text-card-foreground">{task.title}</CardTitle>
                                    <Badge variant={getPriorityBadgeVariant(task.priority)} className={`priority-badge priority-${task.priority.toLowerCase()} text-xs shrink-0`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</Badge>
                                  </div>
                                  <CardDescription className="task-deadline text-xs text-muted-foreground pt-1">
                                    Deadline: {task.deadline ? format(new Date(task.deadline), 'PP') : 'N/A'}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="task-card-content p-4 pt-0">
                                  <div className="task-description line-clamp-3 overflow-hidden">
                                    {task.description && task.description.trim() ? (
                                      <Markdown compact className="text-sm">
                                        {task.description}
                                      </Markdown>
                                    ) : (
                                      <p className="text-sm text-muted-foreground italic">No description.</p>
                                    )}
                                  </div>
                                   <div className="task-actions mt-2 flex justify-end gap-1" data-no-dialog-open="true">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditTask(task.id);
                                      }}
                                      aria-label={`Edit task ${task.title}`}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      id={`delete-task-${task.id}`}
                                      variant="ghost"
                                      size="icon"
                                      className="delete-task-button h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTask(task.id);
                                      }}
                                      aria-label={`Delete task ${task.title}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <TaskDetailDialog
        task={currentSelectedTaskForDialog}
        isOpen={!!currentSelectedTaskForDialog}
        onOpenChange={handleDialogClose}
        onUpdateTask={handleDialogUpdateTask}
      />
    </section>
  );
}
