
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Task } from '@/types/task';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogDescription, // No longer directly used for this part
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Markdown } from '@/components/ui/markdown';

interface TaskDetailDialogProps {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (updatedTask: Task) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  originalLine: string;
}

// Regex to find markdown checklist items: - [ ] or - [x]
const checklistRegex = /^- \[( |x)\] (.*)/;

export function TaskDetailDialog({ task, isOpen, onOpenChange, onUpdateTask }: TaskDetailDialogProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [currentDescription, setCurrentDescription] = useState<string>('');

  useEffect(() => {
    if (task) {
      setCurrentDescription(task.description);
      const lines = task.description.split('\n');
      const items: ChecklistItem[] = lines
        .map((line, index) => {
          const match = line.match(checklistRegex);
          if (match) {
            return {
              id: `item-${task.id}-${index}`,
              text: match[2],
              checked: match[1] === 'x',
              originalLine: line,
            };
          }
          return null;
        })
        .filter((item): item is ChecklistItem => item !== null);
      setChecklistItems(items);
    } else {
      setChecklistItems([]);
      setCurrentDescription('');
    }
  }, [task]);

  const handleCheckboxChange = (itemId: string) => {
    const updatedItems = checklistItems.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setChecklistItems(updatedItems);

    // Reconstruct the description string based on updated checklist items
    let newDescription = currentDescription;
    updatedItems.forEach(item => {
      const newMarker = item.checked ? '- [x]' : '- [ ]';
      const updatedLine = `${newMarker} ${item.text}`;
      // Use originalLine to find and replace reliably, handling potential duplicates if text is identical
      newDescription = newDescription.replace(item.originalLine, updatedLine);
      // Update originalLine for the next potential update within the same dialog session
      item.originalLine = updatedLine;
    });

    setCurrentDescription(newDescription);

    // Immediately update the task in the parent state
    if (task) {
        onUpdateTask({ ...task, description: newDescription });
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

  // Memoize checklist rendering to avoid unnecessary re-renders
  const renderedChecklist = useMemo(() => {
    if (checklistItems.length === 0) {
       // If no checklist items detected, render as markdown
       return (
         <div className="task-detail-description">
           {currentDescription && currentDescription.trim() ? (
             <Markdown className="text-sm">
               {currentDescription}
             </Markdown>
           ) : (
             <p className="text-sm text-muted-foreground italic">No description provided.</p>
           )}
         </div>
       );
    }

    // If there are checklist items, we need to render them separately and show any non-checklist content as markdown
    const nonChecklistLines = currentDescription.split('\n').filter(line => !checklistRegex.test(line));
    const hasNonChecklistContent = nonChecklistLines.some(line => line.trim());

    return (
      <div className="space-y-4">
        {hasNonChecklistContent && (
          <div className="task-detail-description">
            <Markdown className="text-sm">
              {nonChecklistLines.join('\n')}
            </Markdown>
          </div>
        )}
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={item.checked}
                onCheckedChange={() => handleCheckboxChange(item.id)}
                aria-labelledby={`${item.id}-label`}
              />
              <Label
                htmlFor={item.id}
                id={`${item.id}-label`}
                className={`flex-1 text-sm ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}
              >
                {item.text}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistItems, currentDescription]); // Removed handleCheckboxChange from deps as it was causing infinite loop potential

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          {/* Replaced DialogDescription with a div to avoid nesting div (from Badge) inside p (from DialogDescription) */}
          <div className="text-sm text-muted-foreground flex items-center gap-4 pt-1">
             <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority} Priority</Badge>
             <span>Deadline: {format(new Date(task.deadline), 'PPP')}</span>
             <Badge variant="outline">{task.status}</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] my-4 pr-6">
            <h3 className="text-md font-semibold mb-2 text-foreground">Description / Checklist</h3>
            {renderedChecklist}
        </ScrollArea>

        <DialogFooter>
           {/* Add Edit/Save buttons here later if direct editing is needed */}
           <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
