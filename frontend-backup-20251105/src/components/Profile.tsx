import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings, Star, Upload, Heart, Clock, Moon, Sun, Bell, Lock, LogOut, Play as PlayIcon, Eye, FileText, Bookmark, Palette, Trophy, Zap, Crown, Sparkles, FolderPlus, Folder, MoreVertical, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { useTheme } from './ThemeProvider';
import { UserProfile } from './ProfileEdit';
import { LearningContent } from '../App';
import { Progress } from './ui/progress';
import { ThemeBackground } from './GradientThemeBackgrounds';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export interface SavedFolder {
  id: string;
  name: string;
  description?: string;
  contentIds: string[];
  createdAt: Date;
  coverImage?: string;
}

interface ProfileProps {
  userLevel: number;
  userProfile: UserProfile;
  onEditProfile: () => void;
  savedContent: LearningContent[];
  onContentSelect: (content: LearningContent) => void;
  onSaveContent: (content: LearningContent) => void;
  savedFolders?: SavedFolder[];
  onCreateFolder?: (name: string, description: string) => void;
  onUpdateFolder?: (folderId: string, updates: Partial<SavedFolder>) => void;
  onDeleteFolder?: (folderId: string) => void;
  onAddToFolder?: (folderId: string, contentId: string) => void;
  onRemoveFromFolder?: (folderId: string, contentId: string) => void;
}

const userStats = {
  totalXP: 2080,
  uploadsCount: 12,
  favoritesCount: 48,
  totalTime: 145,
  quizScore: 87 // Average quiz score percentage
};

interface GradientTheme {
  id: string;
  name: string;
  description: string;
  gradient: string;
  unlockCondition: string;
  requiredTime: number; // hours
  requiredQuizScore: number; // percentage
  unlocked: boolean;
  tier: 'starter' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  special?: boolean;
}

const gradientThemes: GradientTheme[] = [
  {
    id: 'starter',
    name: 'Starter Flow',
    description: 'Your first learning journey begins',
    gradient: 'from-blue-500 via-purple-500 to-emerald-500',
    unlockCondition: 'Unlocked by default',
    requiredTime: 0,
    requiredQuizScore: 0,
    unlocked: true,
    tier: 'starter'
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Cool and refreshing like ocean waves',
    gradient: 'from-blue-400 via-cyan-400 to-teal-500',
    unlockCondition: 'Study for 10 hours',
    requiredTime: 10,
    requiredQuizScore: 0,
    unlocked: true,
    tier: 'bronze'
  },
  {
    id: 'sunset',
    name: 'Golden Sunset',
    description: 'Warm gradients of a beautiful sunset',
    gradient: 'from-orange-500 via-pink-500 to-purple-600',
    unlockCondition: 'Study for 25 hours',
    requiredTime: 25,
    requiredQuizScore: 0,
    unlocked: true,
    tier: 'bronze'
  },
  {
    id: 'forest',
    name: 'Forest Canopy',
    description: 'Natural greens with golden highlights',
    gradient: 'from-emerald-600 via-green-500 to-lime-400',
    unlockCondition: 'Study for 50 hours & 70% quiz average',
    requiredTime: 50,
    requiredQuizScore: 70,
    unlocked: true,
    tier: 'silver'
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    description: 'Majestic purples with deep blues',
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    unlockCondition: 'Study for 75 hours & 75% quiz average',
    requiredTime: 75,
    requiredQuizScore: 75,
    unlocked: false,
    tier: 'silver'
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    description: 'Electric neon with digital vibes',
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    unlockCondition: 'Study for 100 hours & 80% quiz average',
    requiredTime: 100,
    requiredQuizScore: 80,
    unlocked: false,
    tier: 'gold',
    special: true
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Dancing lights of the northern sky',
    gradient: 'from-green-400 via-blue-500 to-purple-600',
    unlockCondition: 'Study for 150 hours & 85% quiz average',
    requiredTime: 150,
    requiredQuizScore: 85,
    unlocked: false,
    tier: 'gold',
    special: true
  },
  {
    id: 'phoenix',
    name: 'Phoenix Fire',
    description: 'Rising flames of determination',
    gradient: 'from-red-500 via-orange-500 to-yellow-400',
    unlockCondition: 'Study for 200 hours & 90% quiz average',
    requiredTime: 200,
    requiredQuizScore: 90,
    unlocked: false,
    tier: 'platinum',
    special: true
  },
  {
    id: 'cosmic',
    name: 'Cosmic Galaxy',
    description: 'Infinite cosmos with stardust sparkles',
    gradient: 'from-indigo-900 via-purple-700 to-pink-500',
    unlockCondition: 'Study for 300 hours & 95% quiz average',
    requiredTime: 300,
    requiredQuizScore: 95,
    unlocked: false,
    tier: 'platinum',
    special: true
  },
  {
    id: 'legendary',
    name: 'Legendary Scholar',
    description: 'The ultimate achievement - shimmer and shine',
    gradient: 'from-yellow-400 via-pink-500 to-purple-600',
    unlockCondition: 'Study for 500 hours & 98% quiz average',
    requiredTime: 500,
    requiredQuizScore: 98,
    unlocked: false,
    tier: 'diamond',
    special: true
  }
];

const mockUploads = [
  { id: '1', name: 'Machine Learning Notes.pdf', date: 'Oct 20, 2025', topics: 5 },
  { id: '2', name: 'Chemistry Lab Report.docx', date: 'Oct 18, 2025', topics: 3 },
  { id: '3', name: 'History Essay Notes.pdf', date: 'Oct 15, 2025', topics: 4 }
];

const mockFavorites = [
  { id: '1', title: 'Neural Networks Basics', topic: 'ML', duration: '60s' },
  { id: '2', title: 'Organic Chemistry 101', topic: 'Chemistry', duration: '45s' },
  { id: '3', title: 'Ancient Rome History', topic: 'History', duration: '55s' },
  { id: '4', title: 'Calculus Derivatives', topic: 'Math', duration: '50s' }
];

export function Profile({ 
  userLevel, 
  userProfile, 
  onEditProfile, 
  savedContent, 
  onContentSelect, 
  onSaveContent,
  savedFolders: propFolders,
  onCreateFolder: propCreateFolder,
  onUpdateFolder: propUpdateFolder,
  onDeleteFolder: propDeleteFolder,
  onAddToFolder: propAddToFolder,
  onRemoveFromFolder: propRemoveFromFolder,
}: ProfileProps) {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<string | null>(null);
  const [playingFavorite, setPlayingFavorite] = useState<string | null>(null);
  const [selectedGradient, setSelectedGradient] = useState<string>('starter');
  const [previewGradient, setPreviewGradient] = useState<string | null>(null);
  
  // Folder management state - use props if provided, otherwise use local state
  const [localFolders, setLocalFolders] = useState<SavedFolder[]>([
    {
      id: 'all',
      name: 'All Saved',
      description: 'All your saved content',
      contentIds: [],
      createdAt: new Date(),
    }
  ]);
  const savedFolders = propFolders || localFolders;
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'starter': return Star;
      case 'bronze': return Trophy;
      case 'silver': return Zap;
      case 'gold': return Crown;
      case 'platinum': return Sparkles;
      case 'diamond': return Crown;
      default: return Star;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'starter': return 'from-slate-400 to-slate-500';
      case 'bronze': return 'from-orange-600 to-amber-700';
      case 'silver': return 'from-slate-300 to-slate-400';
      case 'gold': return 'from-yellow-500 to-yellow-600';
      case 'platinum': return 'from-cyan-400 to-blue-500';
      case 'diamond': return 'from-purple-500 to-pink-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  // Folder management functions
  const createFolder = () => {
    if (!newFolderName.trim()) return;
    
    if (propCreateFolder) {
      propCreateFolder(newFolderName, newFolderDescription);
    } else {
      const newFolder: SavedFolder = {
        id: `folder-${Date.now()}`,
        name: newFolderName,
        description: newFolderDescription,
        contentIds: [],
        createdAt: new Date(),
      };
      setLocalFolders([...localFolders, newFolder]);
    }
    
    setNewFolderName('');
    setNewFolderDescription('');
    setIsCreatingFolder(false);
  };

  const deleteFolder = (folderId: string) => {
    if (folderId === 'all') return; // Can't delete "All Saved"
    
    if (propDeleteFolder) {
      propDeleteFolder(folderId);
    } else {
      setLocalFolders(localFolders.filter(f => f.id !== folderId));
    }
    
    if (currentFolder === folderId) {
      setCurrentFolder(null);
    }
  };

  const updateFolder = (folderId: string, updates: Partial<SavedFolder>) => {
    if (propUpdateFolder) {
      propUpdateFolder(folderId, updates);
    } else {
      setLocalFolders(localFolders.map(f => 
        f.id === folderId ? { ...f, ...updates } : f
      ));
    }
  };

  const addContentToFolder = (folderId: string, contentId: string) => {
    if (propAddToFolder) {
      propAddToFolder(folderId, contentId);
    } else {
      setLocalFolders(localFolders.map(f => {
        if (f.id === folderId) {
          return {
            ...f,
            contentIds: f.contentIds.includes(contentId) 
              ? f.contentIds 
              : [...f.contentIds, contentId]
          };
        }
        return f;
      }));
    }
  };

  const removeContentFromFolder = (folderId: string, contentId: string) => {
    if (propRemoveFromFolder) {
      propRemoveFromFolder(folderId, contentId);
    } else {
      setLocalFolders(localFolders.map(f => {
        if (f.id === folderId) {
          return {
            ...f,
            contentIds: f.contentIds.filter(id => id !== contentId)
          };
        }
        return f;
      }));
    }
  };

  const getFolderContent = (folderId: string) => {
    const folder = savedFolders.find(f => f.id === folderId);
    if (!folder) return [];
    if (folderId === 'all') return savedContent;
    return savedContent.filter(c => folder.contentIds.includes(c.id));
  };

  const currentGradient = gradientThemes.find(g => g.id === (previewGradient || selectedGradient)) || gradientThemes[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-24 pt-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="relative bg-white dark:bg-slate-900 backdrop-blur-md border-slate-200 dark:border-blue-400/50 dark:shadow-lg dark:shadow-blue-500/20 p-8 overflow-hidden">
            {/* Animated background - only visible in dark mode */}
            <div className="absolute inset-0 hidden dark:block">
              <ThemeBackground themeId={currentGradient.id} className="absolute inset-0" />
              {/* Subtle overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/20" />
            </div>
            {/* Content overlay */}
            <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Avatar className="w-24 h-24 border-4 border-slate-200 dark:border-white/30 dark:shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl">
                    ME
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white text-sm shadow-lg">
                  i+{userLevel}
                </div>
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left min-w-0">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <h1 className="text-slate-900 dark:text-white line-clamp-1 dark:drop-shadow-lg">Your Profile</h1>
                  <Badge className={`bg-gradient-to-r ${getTierColor(currentGradient.tier)} text-white border-0 text-xs shadow-lg`}>
                    {currentGradient.tier.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-1 line-clamp-1 dark:drop-shadow-md">Level {userLevel} Learner • {userStats.totalXP} XP</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-1 dark:drop-shadow-md">Theme: {currentGradient.name}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 dark:shadow-lg dark:backdrop-blur-sm">
                    ⚡ 12 Day Streak
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 dark:shadow-lg dark:backdrop-blur-sm">
                    🧠 Brain Builder
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 dark:shadow-lg dark:backdrop-blur-sm">
                    🎯 Focus Master
                  </Badge>
                </div>
              </div>

              {/* Edit Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onEditProfile}
                  className="bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/30 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all dark:shadow-lg dark:backdrop-blur-sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </motion.div>
            </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Star, label: 'Total XP', value: userStats.totalXP.toLocaleString(), color: 'from-yellow-500 to-orange-500' },
            { icon: Bookmark, label: 'Saved', value: savedContent.length, color: 'from-blue-500 to-cyan-500' },
            { icon: Heart, label: 'Favorites', value: userStats.favoritesCount, color: 'from-pink-500 to-red-500' },
            { icon: Clock, label: 'Study Time', value: `${userStats.totalTime}h`, color: 'from-emerald-500 to-teal-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-4 text-center cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl text-slate-900 dark:text-white mb-1 truncate">{stat.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="uploads" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <TabsTrigger 
              value="uploads"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-600 dark:text-slate-400 transition-all"
            >
              <Upload className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Uploads</span>
            </TabsTrigger>
            <TabsTrigger 
              value="saved"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-600 dark:text-slate-400 transition-all"
            >
              <Bookmark className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
            <TabsTrigger 
              value="favorites"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-600 dark:text-slate-400 transition-all"
            >
              <Heart className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Likes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="themes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-600 dark:text-slate-400 transition-all"
            >
              <Palette className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Themes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-600 dark:text-slate-400 transition-all"
            >
              <Settings className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Uploads Tab */}
          <TabsContent value="uploads" className="mt-6 space-y-3">
            {mockUploads.map((upload, index) => (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-4 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-900 dark:text-white mb-1 truncate">{upload.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="whitespace-nowrap">{upload.date}</span>
                        <span>•</span>
                        <span className="whitespace-nowrap">{upload.topics} topics generated</span>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        onClick={() => setSelectedUpload(upload.id)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved" className="mt-6 space-y-4">
            {currentFolder === null ? (
              /* Folder Grid View */
              <>
                {/* Header with Create Button */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-900 dark:text-white">Collections</h3>
                  <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white hover:from-blue-600 hover:to-emerald-500">
                        <FolderPlus className="w-4 h-4 mr-2" />
                        New Collection
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-white">Create New Collection</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">
                          Organize your saved content into collections
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="folder-name" className="text-slate-900 dark:text-white">Collection Name</Label>
                          <Input
                            id="folder-name"
                            placeholder="e.g., Physics Lectures, Math Notes..."
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="folder-description" className="text-slate-900 dark:text-white">Description (Optional)</Label>
                          <Input
                            id="folder-description"
                            placeholder="Brief description of this collection"
                            value={newFolderDescription}
                            onChange={(e) => setNewFolderDescription(e.target.value)}
                            className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreatingFolder(false)} className="dark:border-white/10 dark:text-white">
                          Cancel
                        </Button>
                        <Button onClick={createFolder} className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white">
                          Create Collection
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Folders Grid */}
                {savedContent.length === 0 ? (
                  <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center mx-auto mb-4">
                      <Bookmark className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white mb-2">No Saved Content</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Start saving lectures and learning content to access them later
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {savedFolders.map((folder, index) => {
                      const folderContent = getFolderContent(folder.id);
                      const coverImage = folderContent[0]?.thumbnail;
                      
                      return (
                        <motion.div
                          key={folder.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className="relative bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 overflow-hidden cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-all group"
                            onClick={() => setCurrentFolder(folder.id)}
                          >
                            {/* Cover Image/Preview */}
                            <div className="relative h-32 bg-gradient-to-br from-slate-200 dark:from-slate-700 to-slate-300 dark:to-slate-800">
                              {coverImage ? (
                                <>
                                  <img src={coverImage} alt={folder.name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Folder className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                                </div>
                              )}
                              
                              {/* Folder Actions */}
                              {folder.id !== 'all' && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-2 right-2 w-8 h-8 p-0 bg-black/40 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-4 h-4 text-white" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingFolder(folder.id);
                                      }}
                                      className="text-slate-900 dark:text-white"
                                    >
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFolder(folder.id);
                                      }}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>

                            {/* Folder Info */}
                            <div className="p-4">
                              <h4 className="text-slate-900 dark:text-white mb-1 truncate">{folder.name}</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {folderContent.length} {folderContent.length === 1 ? 'item' : 'items'}
                              </p>
                              {folder.description && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                                  {folder.description}
                                </p>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* Folder Content View */
              <>
                {/* Back Button and Folder Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentFolder(null)}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <div className="flex-1">
                    <h3 className="text-slate-900 dark:text-white">
                      {savedFolders.find(f => f.id === currentFolder)?.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {getFolderContent(currentFolder).length} items
                    </p>
                  </div>
                </div>

                {/* Content List */}
                {getFolderContent(currentFolder).length === 0 ? (
                  <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-12 text-center">
                    <Folder className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                    <h3 className="text-slate-900 dark:text-white mb-2">Empty Collection</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Save content to this collection to see it here
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {getFolderContent(currentFolder).map((content, index) => (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-4 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => onContentSelect(content)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                              <img 
                                src={content.thumbnail} 
                                alt={content.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-slate-900 dark:text-white mb-1 truncate">{content.title}</h4>
                              <div className="flex items-center gap-3 text-sm flex-wrap">
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                                  {content.topic}
                                </Badge>
                                <span className="text-slate-500 dark:text-slate-400">{content.duration}s</span>
                                <Badge className={`${
                                  content.difficulty === 'i' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                                  content.difficulty === 'i+1' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30' :
                                  'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
                                }`}>
                                  {content.difficulty}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-600 dark:text-slate-400"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                                {currentFolder !== 'all' && (
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeContentFromFolder(currentFolder, content.id);
                                    }}
                                    className="text-slate-900 dark:text-white"
                                  >
                                    Remove from collection
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSaveContent(content);
                                  }}
                                  className="text-red-600 dark:text-red-400"
                                >
                                  Unsave
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="mt-6 space-y-3">
            {mockFavorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-4 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-white fill-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-slate-900 dark:text-white mb-1 truncate">{favorite.title}</h4>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                            {favorite.topic}
                          </Badge>
                          <span className="text-slate-500 dark:text-slate-400">{favorite.duration}</span>
                        </div>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        onClick={() => setPlayingFavorite(favorite.id)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <PlayIcon className="w-4 h-4 mr-1" />
                        Play
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="mt-6 space-y-6">
            {/* Current Theme */}
            <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-6">
              <h3 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Current Theme
              </h3>
              <motion.div
                key={currentGradient.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative h-32 rounded-2xl overflow-hidden"
              >
                {/* Animated background */}
                <ThemeBackground themeId={currentGradient.id} className="absolute inset-0" />
                {/* Content overlay */}
                <div className="relative z-10 p-6">
                  <h4 className="text-white text-2xl mb-2 drop-shadow-lg">{currentGradient.name}</h4>
                  <p className="text-white/90 text-sm drop-shadow-md">{currentGradient.description}</p>
                </div>
              </motion.div>
            </Card>

            {/* Progress toward next unlock */}
            <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-6">
              <h3 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                Your Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Study Time</span>
                    <span className="text-sm text-slate-900 dark:text-white">{userStats.totalTime} / 500 hours</span>
                  </div>
                  <Progress value={(userStats.totalTime / 500) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Quiz Average</span>
                    <span className="text-sm text-slate-900 dark:text-white">{userStats.quizScore}%</span>
                  </div>
                  <Progress value={userStats.quizScore} className="h-2" />
                </div>
              </div>
            </Card>

            {/* Available Themes Grid */}
            <div>
              <h3 className="text-slate-900 dark:text-white mb-4">All Themes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gradientThemes.map((theme, index) => {
                  const TierIcon = getTierIcon(theme.tier);
                  const isUnlocked = theme.unlocked || (userStats.totalTime >= theme.requiredTime && userStats.quizScore >= theme.requiredQuizScore);
                  
                  return (
                    <motion.div
                      key={theme.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={isUnlocked ? { scale: 1.02 } : {}}
                      onHoverStart={() => isUnlocked && setPreviewGradient(theme.id)}
                      onHoverEnd={() => setPreviewGradient(null)}
                    >
                      <Card
                        className={`relative overflow-hidden border-slate-200 dark:border-white/10 transition-all ${
                          isUnlocked 
                            ? 'cursor-pointer hover:border-slate-300 dark:hover:border-white/20' 
                            : 'opacity-60'
                        } ${selectedGradient === theme.id ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => isUnlocked && setSelectedGradient(theme.id)}
                      >
                        {/* Theme preview */}
                        <div className="relative h-24 overflow-hidden">
                          {/* Animated background */}
                          <ThemeBackground themeId={theme.id} className="absolute inset-0" />
                          
                          {/* Lock overlay for locked themes */}
                          {!isUnlocked && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                              <Lock className="w-8 h-8 text-white" />
                            </div>
                          )}
                          {/* Selected indicator */}
                          {selectedGradient === theme.id && isUnlocked && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center z-10">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400" />
                            </div>
                          )}
                          {/* Tier badge */}
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(theme.tier)} flex items-center gap-1 z-10 shadow-lg`}>
                            <TierIcon className="w-3 h-3 text-white" />
                            <span className="text-white text-xs capitalize">{theme.tier}</span>
                          </div>
                        </div>
                        {/* Theme info */}
                        <div className="p-4 bg-white dark:bg-white/5">
                          <h4 className="text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                            {theme.name}
                            {theme.special && isUnlocked && <Sparkles className="w-4 h-4 text-yellow-500" />}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{theme.description}</p>
                          {isUnlocked ? (
                            <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs">
                              ✓ Unlocked
                            </Badge>
                          ) : (
                            <div className="space-y-1">
                              <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30 text-xs">
                                🔒 Locked
                              </Badge>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                {theme.unlockCondition}
                              </p>
                              {theme.requiredTime > userStats.totalTime && (
                                <div className="mt-2">
                                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                    {theme.requiredTime - userStats.totalTime} more hours needed
                                  </div>
                                  <Progress value={(userStats.totalTime / theme.requiredTime) * 100} className="h-1" />
                                </div>
                              )}
                              {theme.requiredQuizScore > userStats.quizScore && (
                                <div className="mt-2">
                                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                    {theme.requiredQuizScore - userStats.quizScore}% quiz improvement needed
                                  </div>
                                  <Progress value={(userStats.quizScore / theme.requiredQuizScore) * 100} className="h-1" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 divide-y divide-slate-200 dark:divide-white/10">
              {/* Appearance */}
              <div className="p-6 space-y-4">
                <h3 className="text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  Appearance
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-900 dark:text-white text-sm mb-1">Dark Mode</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Use dark theme</div>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
              </div>

              <Separator className="bg-slate-200 dark:bg-white/10" />

              {/* Notifications */}
              <div className="p-6 space-y-4">
                <h3 className="text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5" />
                  Notifications
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-900 dark:text-white text-sm mb-1">Push Notifications</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Receive study reminders</div>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
              </div>

              <Separator className="bg-slate-200 dark:bg-white/10" />

              {/* Focus Mode (Easter Egg) */}
              <div className="p-6 space-y-4">
                <h3 className="text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Moon className="w-5 h-5" />
                  Focus Mode 🎯
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-900 dark:text-white text-sm mb-1">Enable Focus Mode</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">25 min Pomodoro session</div>
                  </div>
                  <Switch checked={focusMode} onCheckedChange={setFocusMode} />
                </div>
                {focusMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30"
                  >
                    <div className="text-purple-700 dark:text-purple-300 text-sm">
                      🎉 Easter Egg Unlocked! Focus Mode will silence all notifications for 25 minutes.
                    </div>
                  </motion.div>
                )}
              </div>

              <Separator className="bg-slate-200 dark:bg-white/10" />

              {/* Privacy & Security */}
              <div className="p-6 space-y-4">
                <h3 className="text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5" />
                  Privacy & Security
                </h3>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Manage Subscription
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Privacy Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Data & Storage
                </Button>
              </div>

              <Separator className="bg-slate-200 dark:bg-white/10" />

              {/* Account */}
              <div className="p-6">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Details Modal */}
      <AnimatePresence>
        {selectedUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUpload(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-slate-900 dark:text-white">Upload Details</h2>
                <Button
                  onClick={() => setSelectedUpload(null)}
                  variant="ghost"
                  size="icon"
                  className="text-slate-600 dark:text-slate-400"
                >
                  ✕
                </Button>
              </div>

              {mockUploads.find(u => u.id === selectedUpload) && (
                <div className="space-y-4">
                  <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div className="flex-1">
                        <h3 className="text-slate-900 dark:text-white">{mockUploads.find(u => u.id === selectedUpload)?.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{mockUploads.find(u => u.id === selectedUpload)?.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-4">
                      <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                        {mockUploads.find(u => u.id === selectedUpload)?.topics} topics generated
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      This document has been processed and converted into {mockUploads.find(u => u.id === selectedUpload)?.topics} learning topics. 
                      Each topic has been transformed into bite-sized video content optimized for your learning level.
                    </p>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white">
                        View Content
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className="w-full border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300">
                        Download
                      </Button>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playing Favorite Modal */}
      <AnimatePresence>
        {playingFavorite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPlayingFavorite(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-video bg-slate-950">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full border-4 border-t-blue-500 border-r-emerald-400 border-b-purple-500 border-l-pink-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={() => setPlayingFavorite(null)}
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full"
                  >
                    ✕
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-xl mb-2">
                    {mockFavorites.find(f => f.id === playingFavorite)?.title}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Video player simulation - Content would play here
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
