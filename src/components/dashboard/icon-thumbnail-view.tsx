'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  FileText, 
  Image, 
  Archive, 
  Star, 
  Clock, 
  Tag, 
  Folder,
  Play,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Hash
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SavedItem {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'task' | 'document' | 'image' | 'audio';
  category: string;
  tags: string[];
  thumbnail?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  size: number;
  author: string;
  status: 'active' | 'archived' | 'draft';
}

interface IconThumbnailViewProps {
  items: SavedItem[];
  onItemClick: (item: SavedItem) => void;
  onItemEdit: (item: SavedItem) => void;
  onItemDelete: (itemId: string) => void;
  onItemFavorite: (itemId: string, isFavorite: boolean) => void;
  onItemArchive: (itemId: string) => void;
}

type ViewMode = 'grid' | 'list' | 'compact';
type SortBy = 'title' | 'date' | 'size' | 'type' | 'category';
type SortOrder = 'asc' | 'desc';

export function IconThumbnailView({ 
  items, 
  onItemClick, 
  onItemEdit, 
  onItemDelete, 
  onItemFavorite, 
  onItemArchive 
}: IconThumbnailViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const { toast } = useToast();

  // Filter and sort items
  const filteredAndSortedItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesFavorites = !showFavoritesOnly || item.isFavorite;
      
      return matchesSearch && matchesCategory && matchesType && matchesStatus && matchesFavorites;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const categories = Array.from(new Set(items.map(item => item.category)));
  const types = Array.from(new Set(items.map(item => item.type)));
  const statuses = Array.from(new Set(items.map(item => item.status)));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'task':
        return <Hash className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'audio':
        return <Play className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'archived':
        return 'bg-gray-500';
      case 'draft':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAction = (action: 'delete' | 'archive' | 'favorite') => {
    selectedItems.forEach(itemId => {
      switch (action) {
        case 'delete':
          onItemDelete(itemId);
          break;
        case 'archive':
          onItemArchive(itemId);
          break;
        case 'favorite':
          onItemFavorite(itemId, true);
          break;
      }
    });
    setSelectedItems([]);
  };

  // Grid view item component
  const GridItem = ({ item }: { item: SavedItem }) => (
    <Card className={cn(
      "cursor-pointer transition-all hover:shadow-md group",
      selectedItems.includes(item.id) ? "ring-2 ring-primary" : ""
    )}>
      <div className="relative">
        <div className="aspect-square p-4 flex items-center justify-center bg-muted/50 relative">
          {item.thumbnail ? (
            <img 
              src={item.thumbnail} 
              alt={item.title}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="text-muted-foreground">
              {getTypeIcon(item.type)}
            </div>
          )}
          
          {/* Status indicator */}
          <div className={cn(
            "absolute top-2 right-2 w-3 h-3 rounded-full",
            getStatusColor(item.status)
          )} />
          
          {/* Selection checkbox */}
          <input
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={() => toggleItemSelection(item.id)}
            className="absolute top-2 left-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          />
          
          {/* Favorite star */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onItemFavorite(item.id, !item.isFavorite);
            }}
          >
            <Star className={cn("h-4 w-4", item.isFavorite ? "fill-yellow-500 text-yellow-500" : "")} />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm line-clamp-1" title={item.title}>
              {item.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onItemClick(item)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onItemEdit(item)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onItemArchive(item.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onItemDelete(item.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.content}
          </p>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {item.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(item.size)}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{item.tags.length - 2}
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {format(new Date(item.updatedAt), 'MMM d, yyyy')}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // List view item component
  const ListItem = ({ item }: { item: SavedItem }) => (
    <div className={cn(
      "flex items-center p-4 border-b hover:bg-muted/50 cursor-pointer",
      selectedItems.includes(item.id) ? "bg-muted" : ""
    )}>
      <input
        type="checkbox"
        checked={selectedItems.includes(item.id)}
        onChange={() => toggleItemSelection(item.id)}
        className="mr-3 rounded"
      />
      
      <div className="flex-shrink-0 mr-3">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="w-10 h-10 object-cover rounded" />
        ) : (
          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
            {getTypeIcon(item.type)}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium truncate">{item.title}</h4>
          <Badge variant="outline" className="text-xs">
            {item.type}
          </Badge>
          <div className={cn("w-2 h-2 rounded-full", getStatusColor(item.status))} />
          {item.isFavorite && (
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate mt-1">
          {item.content}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {item.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{format(new Date(item.updatedAt), 'MMM d, yyyy')}</span>
        <span>{formatFileSize(item.size)}</span>
        <span className="capitalize">{item.category}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onItemClick(item)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onItemEdit(item)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onItemArchive(item.id)}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onItemDelete(item.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Saved Items</h2>
          <p className="text-muted-foreground">
            {filteredAndSortedItems.length} of {items.length} items
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>
          
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [sort, order] = value.split('-');
          setSortBy(sort as SortBy);
          setSortOrder(order as SortOrder);
        }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date (Newest)</SelectItem>
            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="size-desc">Size (Largest)</SelectItem>
            <SelectItem value="size-asc">Size (Smallest)</SelectItem>
            <SelectItem value="type-asc">Type</SelectItem>
            <SelectItem value="category-asc">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedItems.length} item(s) selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('favorite')}
          >
            <Star className="h-3 w-3 mr-1" />
            Favorite
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('archive')}
          >
            <Archive className="h-3 w-3 mr-1" />
            Archive
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('delete')}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* Items Display */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first item to get started.'}
          </p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            : "space-y-0"
        )}>
          {viewMode === 'grid' ? (
            filteredAndSortedItems.map(item => (
              <div key={item.id} onClick={() => onItemClick(item)}>
                <GridItem item={item} />
              </div>
            ))
          ) : (
            <Card>
              <CardContent className="p-0">
                {filteredAndSortedItems.map(item => (
                  <div key={item.id} onClick={() => onItemClick(item)}>
                    <ListItem item={item} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
