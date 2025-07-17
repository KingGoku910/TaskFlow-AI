'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { decomposeTask, TaskDecompositionOutput } from '@/app/dashboard/tasks/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Terminal, Plus } from 'lucide-react';
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


interface TaskDecompositionToolProps {
    tasks: Task[]; // Add tasks prop
    onTasksDecomposed: (tasks: DecomposedSubtask[]) => void; // Update prop type
    onAddTask?: () => void; // Add callback for add task button
    onVoiceCommand?: (command: string) => void; // Add callback for voice command
}

type DecompositionMode = 'new' | 'existing';

export function TaskDecompositionTool({ tasks, onTasksDecomposed, onAddTask, onVoiceCommand }: TaskDecompositionToolProps) {
  const [objective, setObjective] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [mode, setMode] = useState<DecompositionMode>('new');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
        className="absolute inset-0 z-0 pointer-events-none opacity-100"
        dangerouslySetInnerHTML={{
          __html: `
            <svg width="100%" height="100%" viewBox="0 0 1755 342" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-0" style="mix-blend-mode: normal; opacity: 0.5">
              <path d="M20.3457 257.968L867.188 112.08L1718.69 250.968" stroke="url(#paint0_radial_4353_100693)" stroke-width="1.1397"></path>
              <path d="M20.3457 115.831L867.188 141.264L1718.69 115.831" stroke="url(#paint1_radial_4353_100693)" stroke-width="1.1397"></path>
              <path d="M345.188 60.1399L868.079 141.264L1393.85 60.1399" stroke="url(#paint2_radial_4353_100693)" stroke-width="1.1397"></path>
              <path d="M232.902 86.2314L867.771 142.755L1506.13 86.2314" stroke="url(#paint3_radial_4353_100693)" stroke-width="1.1397"></path>
              <path d="M295.096 150.689L867.941 136.029L1443.94 150.689" stroke="url(#paint4_radial_4353_100693)" stroke-width="1.1397"></path>
              <g filter="url(#filter0_f_4353_100693)"><ellipse cx="864.594" cy="151.574" rx="271.124" ry="82.5656" fill="hsl(var(--primary))" fill-opacity="0.5"></ellipse></g>
              <path d="M321.689 212.498H1423.53L1024.59 146.214C989.707 140.418 958.375 121.477 937.034 93.2866L934.698 90.2009C917.88 67.9838 891.625 54.9292 863.76 54.9292C836.691 54.9292 811.094 67.2518 794.212 88.4107L790.055 93.6202C767.659 121.689 735.757 140.582 700.377 146.727L321.689 212.498Z" fill="url(#paint5_radial_4353_100693)"></path>
              <path d="M1754 215.262L1019.22 134.195C986.915 130.631 957.348 114.393 937.009 89.0478V89.0478C919.7 67.4787 893.538 54.9292 865.882 54.9292H864.945C838.067 54.9292 812.559 66.7854 795.231 87.3316V87.3316C773.48 113.122 742.819 129.783 709.345 134L0.744141 223.277" stroke="url(#paint6_linear_4353_100693)" stroke-width="1.1397"></path>
              <path d="M1754 215.262L1019.22 134.195C986.915 130.631 957.348 114.393 937.009 89.0478V89.0478C919.7 67.4787 893.538 54.9292 865.882 54.9292H864.945C838.067 54.9292 812.559 66.7854 795.231 87.3316V87.3316C773.48 113.122 742.819 129.783 709.345 134L0.744141 223.277" stroke="url(#paint6_linear_4353_100693_anim)" stroke-width="1.1397"></path>
              <path d="M1727.67 263.927L1014.73 144.526C981.347 138.936 951.627 120.131 932.281 92.3602V92.3602C915.796 68.697 890.879 54.9292 864.541 54.9292H863.648C838.05 54.9292 813.756 67.9365 797.253 90.4774V90.4774C776.583 118.709 745.778 137.834 711.308 143.834L234.791 226.787" stroke="url(#paint7_linear_4353_100693)" stroke-width="1.1397"></path>
              <path d="M1026.15 165.96L1730.54 308.606M702.311 164.135L34.3711 308.606M993.53 165.96L1526.68 308.606M745.614 164.135L238.233 308.606" stroke="url(#paint8_linear_4353_100693)" stroke-width="1.1397"></path>
              <g filter="url(#filter1_f_4353_100693)"><path d="M761.402 127.441L795.229 87.3316C812.557 66.7854 838.066 54.9292 864.944 54.9292H865.881C893.537 54.9292 919.698 67.4787 937.008 89.0478L968.771 128.629" stroke="url(#paint9_linear_4353_100693)" stroke-width="1.1397"></path></g>
              <g filter="url(#filter2_f_4353_100693)"><path d="M930.203 82.036C914.556 60.4668 890.905 48.1616 865.905 48.1616H865.057C840.76 48.1616 817.7 60.0178 802.035 80.564C818.898 64.5075 841.409 55.49 864.944 55.49H865.882C890.122 55.49 913.214 65.1309 930.203 82.036Z" fill="hsl(var(--brand-default))"></path></g>
              <g filter="url(#filter3_f_4353_100693)"><path d="M944.969 69.0081C925.715 47.439 896.616 35.1338 865.854 35.1338H864.811C834.915 35.1338 806.542 46.99 787.268 67.5362C808.016 51.4797 835.714 39.2051 864.673 39.2051H865.826C895.651 39.2051 924.064 52.1031 944.969 69.0081Z" fill="hsl(var(--background-default))"></path></g>
              <path d="M864.407 72.3096V204.318M930.411 138.314L798.402 138.314M921.568 105.312L807.245 171.316M921.567 171.316L807.245 105.312" stroke="url(#paint10_radial_4353_100693)" stroke-width="1.1397"></path>
              <path d="M849.206 126.548C849.11 126.603 849.052 126.705 849.052 126.815C849.052 126.925 849.11 127.027 849.206 127.082L864.249 135.768C864.345 135.823 864.463 135.823 864.558 135.768L879.602 127.082C879.698 127.027 879.757 126.925 879.757 126.815C879.757 126.704 879.698 126.602 879.602 126.547L871.273 121.738C870.277 121.163 869.936 119.889 870.511 118.893C871.086 117.897 872.36 117.556 873.356 118.131L885.172 124.953C885.816 125.325 886.213 126.013 886.213 126.757V140.621C886.213 141.771 885.281 142.704 884.131 142.704C882.98 142.704 882.048 141.771 882.048 140.621V131.015C882.048 130.904 881.989 130.802 881.894 130.747C881.798 130.692 881.68 130.692 881.585 130.747L866.641 139.375C866.545 139.43 866.486 139.532 866.486 139.642V156.782C866.486 156.892 866.545 156.994 866.641 157.049C866.736 157.104 866.854 157.104 866.949 157.049L875.575 152.069C876.571 151.494 877.845 151.835 878.42 152.831C878.995 153.828 878.654 155.101 877.658 155.676L865.446 162.727C864.802 163.099 864.008 163.099 863.363 162.727L850.917 155.541C849.92 154.966 849.579 153.692 850.154 152.696C850.729 151.7 852.003 151.358 852.999 151.933L861.858 157.048C861.953 157.103 862.071 157.103 862.167 157.048C862.262 156.993 862.321 156.891 862.321 156.781V139.642C862.321 139.532 862.262 139.43 862.167 139.375L847.224 130.748C847.129 130.693 847.011 130.693 846.916 130.748C846.82 130.803 846.761 130.905 846.761 131.016V140.502C846.761 141.652 845.829 142.584 844.679 142.584C843.528 142.584 842.596 141.652 842.596 140.502V126.949H842.596L842.596 126.939C842.594 126.894 842.594 126.848 842.596 126.802L842.596 126.802V126.792V126.757C842.596 126.013 842.993 125.325 843.637 124.953L855.453 118.131C856.449 117.556 857.723 117.897 858.298 118.893C858.873 119.889 858.532 121.163 857.536 121.738L849.206 126.548ZM864.405 108.276C865.555 108.276 866.487 109.208 866.487 110.359V124.758C866.487 125.909 865.555 126.841 864.405 126.841C863.255 126.841 862.322 125.909 862.322 124.758V110.359C862.322 109.208 863.255 108.276 864.405 108.276ZM874.406 144.134C874.981 143.138 876.255 142.797 877.251 143.372L890.883 151.242C891.879 151.817 892.22 153.091 891.645 154.087C891.07 155.083 889.796 155.424 888.8 154.849L875.168 146.979C874.172 146.404 873.831 145.13 874.406 144.134ZM853.031 144.52C853.606 145.516 853.264 146.789 852.268 147.365L840.011 154.441C839.015 155.016 837.741 154.675 837.166 153.679C836.591 152.683 836.932 151.409 837.929 150.834L850.186 143.757C851.182 143.182 852.455 143.523 853.031 144.52Z" fill="url(#paint11_linear_4353_100693)" stroke="url(#paint12_linear_4353_100693)" stroke-width="0.617486" stroke-miterlimit="10" stroke-linejoin="round"></path>
              <circle cx="864.593" cy="138.671" r="65.9995" stroke="url(#paint13_linear_4353_100693)" stroke-width="1.1397"></circle>
              <circle cx="864.595" cy="138.672" r="65.9995" transform="rotate(-180 864.595 138.672)" stroke="url(#paint14_linear_4353_100693)" stroke-width="1.1397"></circle>
              <circle cx="864.595" cy="138.671" r="65.9995" transform="rotate(90 864.595 138.671)" stroke="url(#paint15_linear_4353_100693)" stroke-width="1.1397"></circle>
              <circle cx="864.593" cy="138.672" r="65.9995" transform="rotate(-90 864.593 138.672)" stroke="url(#paint16_linear_4353_100693)" stroke-width="1.1397"></circle>
              <g filter="url(#filter4_f_4353_100693)"><circle cx="864.593" cy="138.671" r="65.9995" stroke="url(#paint17_linear_4353_100693)" stroke-width="1.1397"></circle></g>
              <g filter="url(#filter5_f_4353_100693)"><circle cx="864.595" cy="138.672" r="65.9995" transform="rotate(-180 864.595 138.672)" stroke="url(#paint18_linear_4353_100693)" stroke-width="1.1397"></circle></g>
              <g filter="url(#filter6_f_4353_100693)"><circle cx="864.595" cy="138.671" r="65.9995" transform="rotate(90 864.595 138.671)" stroke="url(#paint19_linear_4353_100693)" stroke-width="1.1397"></circle></g>
              <g filter="url(#filter7_f_4353_100693)"><circle cx="864.593" cy="138.672" r="65.9995" transform="rotate(-90 864.593 138.672)" stroke="url(#paint20_linear_4353_100693)" stroke-width="1.1397"></circle></g>
              <g filter="url(#filter8_f_4353_100693)"><circle cx="864.593" cy="138.671" r="65.9995" stroke="url(#paint21_linear_4353_100693)" stroke-width="1.1397"></circle></g>
              <g filter="url(#filter9_f_4353_100693)"><circle cx="864.595" cy="138.672" r="65.9995" transform="rotate(-180 864.595 138.672)" stroke="url(#paint22_linear_4353_100693)" stroke-width="1.1397"></circle></g>
              <g filter="url(#filter10_f_4353_100693)"><circle cx="864.595" cy="138.671" r="65.9995" transform="rotate(90 864.595 138.671)" stroke="url(#paint23_linear_4353_100693)" stroke-width="1.1397"></circle></g>
              <g filter="url(#filter11_f_4353_100693)"><circle cx="864.593" cy="138.672" r="65.9995" transform="rotate(-90 864.593 138.672)" stroke="url(#paint24_linear_4353_100693)" stroke-width="1.1397"></circle></g>
            </svg>
          `
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
