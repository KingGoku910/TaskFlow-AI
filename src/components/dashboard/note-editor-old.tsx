'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image, 
  Upload, 
  X, 
  Save, 
  Eye, 
  Loader2, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  onSave: (note: SavedNote) => void;
  onCancel: () => void;
  initialNote?: Partial<SavedNote>;
}

interface SavedNote {
  id: string;
  title: string;
  content: string;
  images: ImageAttachment[];
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  isArchived?: boolean;
}

interface ImageAttachment {
  id: string;
  url: string;
  name: string;
  size: number;
  analysis?: string;
  thumbnail?: string;
}

export function NoteEditor({ onSave, onCancel, initialNote }: NoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [images, setImages] = useState<ImageAttachment[]>(initialNote?.images || []);
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [category, setCategory] = useState(initialNote?.category || 'general');
  const [newTag, setNewTag] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages: ImageAttachment[] = [];
    
    for (const file of acceptedFiles) {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        const newImage: ImageAttachment = {
          id: Date.now().toString() + Math.random().toString(36),
          url: imageUrl,
          name: file.name,
          size: file.size,
          thumbnail: imageUrl
        };
        
        newImages.push(newImage);
        
        // Analyze image with Vision AI
        await analyzeImage(newImage);
      }
    }
    
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: true
  });

  const analyzeImage = async (image: ImageAttachment) => {
    setIsAnalyzing(true);
    try {
      // Simulate Vision AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis = [
        "This image contains text that could be extracted for note-taking",
        "Image shows a diagram with several connected elements",
        "Photo contains handwritten notes with key points highlighted",
        "Screenshot of a document with important information",
        "Image appears to be a whiteboard with brainstorming content"
      ];
      
      const analysis = mockAnalysis[Math.floor(Math.random() * mockAnalysis.length)];
      
      setImages(prev => prev.map(img => 
        img.id === image.id 
          ? { ...img, analysis }
          : img
      ));
      
      toast({
        title: "Image Analyzed",
        description: "AI analysis complete. Check the image details.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak your notes. Click stop when finished.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Processing audio...",
        variant: "default"
      });
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your note.",
        variant: "destructive"
      });
      return;
    }

    const note: SavedNote = {
      id: initialNote?.id || Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      images,
      tags,
      category,
      createdAt: initialNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      summary: content.trim().substring(0, 150) + (content.length > 150 ? '...' : ''),
      isArchived: false
    };

    onSave(note);
    
    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully.",
      variant: "default"
    });
  };

  const categories = [
    'general',
    'work',
    'personal',
    'research',
    'ideas',
    'meetings',
    'projects'
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{initialNote?.id ? 'Edit Note' : 'Create New Note'}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isAnalyzing}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? 'Stop Recording' : 'Record Audio'}
            </Button>
            
            {audioRef.current?.src && (
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayback}
              >
                {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="images">Images ({images.length})</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                rows={12}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button onClick={addTag} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="images" className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? "Drop the images here..."
                  : "Drag & drop images here, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: PNG, JPG, GIF, WebP
              </p>
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map(image => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-48 object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold truncate">{image.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {(image.size / 1024).toFixed(1)} KB
                      </p>
                      {image.analysis && (
                        <div className="mt-2 p-2 bg-muted rounded">
                          <p className="text-sm font-medium">AI Analysis:</p>
                          <p className="text-xs text-muted-foreground">{image.analysis}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {isAnalyzing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm">Analyzing images with AI...</span>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {title || 'Untitled Note'}
                  <Badge variant="outline">{category}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">
                    {content || 'No content yet...'}
                  </div>
                </div>
                
                {images.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Attachments ({images.length})</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {images.map(image => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.thumbnail || image.url}
                            alt={image.name}
                            className="w-full h-20 object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isAnalyzing}>
            <Save className="mr-2 h-4 w-4" />
            Save Note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
