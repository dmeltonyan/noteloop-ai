import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { OnboardingFlow } from './components/OnboardingFlow';
import { MainFeed } from './components/MainFeed';
import { ConceptDetail } from './components/ConceptDetail';
import { FlashcardsView } from './components/FlashcardsView';
import { UploadHub } from './components/UploadHub';
import { Dashboard } from './components/Dashboard';
import { SocialLoops } from './components/SocialLoops';
import { Profile } from './components/Profile';
import { ProfileEdit, UserProfile } from './components/ProfileEdit';
import { BottomNav } from './components/BottomNav';
import { AdaptiveLearningExplainer } from './components/AdaptiveLearningExplainer';
import { ShareDialog, Friend, Group } from './components/ShareDialog';
import { SaveToFolderDialog, SavedFolder } from './components/SaveToFolderDialog';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

export type Screen = 'onboarding' | 'feed' | 'concept' | 'flashcards' | 'upload' | 'dashboard' | 'social' | 'profile' | 'profile-edit' | 'explainer';

export interface LearningContent {
  id: string;
  title: string;
  topic: string;
  level: string;
  duration: number;
  thumbnail: string;
  progress: number;
  difficulty: 'i' | 'i+1' | 'i+2';
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [selectedContent, setSelectedContent] = useState<LearningContent | null>(null);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [shouldShowExplainer, setShouldShowExplainer] = useState(false);
  const [lastExplainerDate, setLastExplainerDate] = useState<number | null>(null);
  const [lastActivityDate, setLastActivityDate] = useState<number>(Date.now());
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Your Name',
    email: 'you@example.com',
    major: '',
    school: '',
    year: '',
    bio: '',
    learningGoals: '',
    location: '',
    favoriteSubjects: []
  });
  const [savedContent, setSavedContent] = useState<LearningContent[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [contentToShare, setContentToShare] = useState<{ title: string; type: 'lecture' | 'clip' | 'note' } | null>(null);
  
  // Folder management state
  const [savedFolders, setSavedFolders] = useState<SavedFolder[]>([
    {
      id: 'all',
      name: 'All Saved',
      description: 'All your saved content',
      contentIds: [],
      createdAt: new Date(),
    }
  ]);
  const [saveFolderDialogOpen, setSaveFolderDialogOpen] = useState(false);
  const [contentToSave, setContentToSave] = useState<LearningContent | null>(null);

  // Mock friends and groups data
  const mockFriends: Friend[] = [
    { id: '1', name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?img=1', level: 'i+2', status: 'online' },
    { id: '2', name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?img=2', level: 'i+1', status: 'online' },
    { id: '3', name: 'Jordan Kim', avatar: 'https://i.pravatar.cc/150?img=3', level: 'i+2', status: 'offline' },
    { id: '4', name: 'Taylor Morgan', avatar: 'https://i.pravatar.cc/150?img=4', level: 'i', status: 'online' },
    { id: '5', name: 'Casey Williams', avatar: 'https://i.pravatar.cc/150?img=5', level: 'i+1', status: 'offline' },
    { id: '6', name: 'Riley Martinez', avatar: 'https://i.pravatar.cc/150?img=6', level: 'i+2', status: 'online' },
  ];

  const mockGroups: Group[] = [
    { id: '1', name: 'Quantum Physics Study', members: 24, avatar: '', topic: 'Physics' },
    { id: '2', name: 'Organic Chem Warriors', members: 18, avatar: '', topic: 'Chemistry' },
    { id: '3', name: 'Calculus Crew', members: 32, avatar: '', topic: 'Math' },
    { id: '4', name: 'Biology Nerds', members: 15, avatar: '', topic: 'Biology' },
    { id: '5', name: 'CS Theory Masters', members: 28, avatar: '', topic: 'Computer Science' },
  ];

  // Check if explainer should be shown (every 2 months with no activity)
  useEffect(() => {
    const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000; // ~60 days in milliseconds
    const now = Date.now();
    
    if (lastExplainerDate === null) {
      // First time user - will show after onboarding
      return;
    }
    
    const timeSinceLastExplainer = now - lastExplainerDate;
    const timeSinceLastActivity = now - lastActivityDate;
    
    if (timeSinceLastActivity > TWO_MONTHS_MS && timeSinceLastExplainer > TWO_MONTHS_MS) {
      setShouldShowExplainer(true);
    }
  }, [lastExplainerDate, lastActivityDate]);

  const handleOnboardingComplete = (level: number) => {
    setUserLevel(level);
    setHasCompletedOnboarding(true);
    setShouldShowExplainer(true);
    setCurrentScreen('explainer');
  };

  const handleExplainerComplete = () => {
    setShouldShowExplainer(false);
    setLastExplainerDate(Date.now());
    setCurrentScreen('feed');
  };

  const handleContentSelect = (content: LearningContent) => {
    setSelectedContent(content);
    setCurrentScreen('concept');
  };

  const handleBack = () => {
    setCurrentScreen('feed');
    setSelectedContent(null);
  };

  const handleNavigation = (screen: Screen) => {
    setLastActivityDate(Date.now());
    setCurrentScreen(screen);
  };

  const handleProfileSave = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentScreen('profile');
  };

  const handleSaveContent = (content: LearningContent) => {
    const isAlreadySaved = savedContent.some(item => item.id === content.id);
    
    if (isAlreadySaved) {
      // Unsave - remove from all folders and saved content
      setSavedContent(prev => prev.filter(item => item.id !== content.id));
      setSavedFolders(prev => prev.map(folder => ({
        ...folder,
        contentIds: folder.contentIds.filter(id => id !== content.id)
      })));
      toast.success('Removed from saved', {
        description: content.title,
        duration: 2000,
      });
    } else {
      // Save - add to saved content and show folder dialog
      setSavedContent(prev => [...prev, content]);
      setContentToSave(content);
      setSaveFolderDialogOpen(true);
    }
  };

  const handleSaveToFolder = (folderId: string, contentId: string) => {
    setSavedFolders(prev => prev.map(folder => {
      if (folder.id === folderId) {
        const isAlreadyInFolder = folder.contentIds.includes(contentId);
        if (isAlreadyInFolder) {
          // Remove from folder
          toast.success('Removed from collection');
          return {
            ...folder,
            contentIds: folder.contentIds.filter(id => id !== contentId)
          };
        } else {
          // Add to folder
          toast.success('Added to collection', {
            description: folder.name,
            duration: 2000,
          });
          return {
            ...folder,
            contentIds: [...folder.contentIds, contentId]
          };
        }
      }
      return folder;
    }));
  };

  const handleCreateFolderFromDialog = (name: string, description: string) => {
    const newFolder: SavedFolder = {
      id: `folder-${Date.now()}`,
      name,
      description,
      contentIds: contentToSave ? [contentToSave.id] : [],
      createdAt: new Date(),
    };
    
    setSavedFolders(prev => [...prev, newFolder]);
    toast.success('Collection created!', {
      description: name,
      duration: 2000,
    });
    
    if (contentToSave) {
      toast.success('Content saved to collection', {
        description: name,
        duration: 2000,
      });
    }
  };

  const handleShareClick = (title: string, type: 'lecture' | 'clip' | 'note') => {
    setContentToShare({ title, type });
    setShareDialogOpen(true);
  };

  const handleShareConfirm = (recipients: { friends: string[]; groups: string[] }) => {
    const totalRecipients = recipients.friends.length + recipients.groups.length;
    const friendNames = recipients.friends.map(id => mockFriends.find(f => f.id === id)?.name).filter(Boolean);
    const groupNames = recipients.groups.map(id => mockGroups.find(g => g.id === id)?.name).filter(Boolean);
    
    let description = '';
    if (friendNames.length > 0 && groupNames.length > 0) {
      description = `Sent to ${friendNames.slice(0, 2).join(', ')}${friendNames.length > 2 ? '...' : ''} and ${groupNames.length} group${groupNames.length > 1 ? 's' : ''}`;
    } else if (friendNames.length > 0) {
      description = `Sent to ${friendNames.slice(0, 3).join(', ')}${friendNames.length > 3 ? '...' : ''}`;
    } else if (groupNames.length > 0) {
      description = `Sent to ${groupNames.slice(0, 2).join(', ')}${groupNames.length > 2 ? '...' : ''}`;
    }

    toast.success(`Shared with ${totalRecipients} recipient${totalRecipients > 1 ? 's' : ''}!`, {
      description,
      duration: 3000,
    });
  };

  const isContentSaved = (contentId: string) => {
    return savedContent.some(item => item.id === contentId);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingFlow onComplete={handleOnboardingComplete} />;
      case 'explainer':
        return <AdaptiveLearningExplainer onContinue={handleExplainerComplete} />;
      case 'feed':
        return <MainFeed onContentSelect={handleContentSelect} userLevel={userLevel} onSaveContent={handleSaveContent} isContentSaved={isContentSaved} onShare={handleShareClick} />;
      case 'concept':
        return <ConceptDetail content={selectedContent} onBack={handleBack} onSaveContent={handleSaveContent} isContentSaved={isContentSaved} onShare={handleShareClick} />;
      case 'flashcards':
        return <FlashcardsView onBack={() => handleNavigation('feed')} />;
      case 'upload':
        return <UploadHub 
          onBack={() => handleNavigation('feed')} 
          onUploadComplete={() => {
            setShouldShowExplainer(true);
            setCurrentScreen('explainer');
          }}
        />;
      case 'dashboard':
        return <Dashboard userLevel={userLevel} />;
      case 'social':
        return <SocialLoops onShare={handleShareClick} />;
      case 'profile':
        return <Profile 
          userLevel={userLevel} 
          userProfile={userProfile} 
          onEditProfile={() => handleNavigation('profile-edit')} 
          savedContent={savedContent} 
          onContentSelect={handleContentSelect} 
          onSaveContent={handleSaveContent}
          savedFolders={savedFolders}
          onCreateFolder={handleCreateFolderFromDialog}
          onUpdateFolder={(folderId, updates) => {
            setSavedFolders(prev => prev.map(f => 
              f.id === folderId ? { ...f, ...updates } : f
            ));
          }}
          onDeleteFolder={(folderId) => {
            setSavedFolders(prev => prev.filter(f => f.id !== folderId));
          }}
          onAddToFolder={(folderId, contentId) => handleSaveToFolder(folderId, contentId)}
          onRemoveFromFolder={(folderId, contentId) => {
            setSavedFolders(prev => prev.map(f => {
              if (f.id === folderId) {
                return {
                  ...f,
                  contentIds: f.contentIds.filter(id => id !== contentId)
                };
              }
              return f;
            }));
          }}
        />;
      case 'profile-edit':
        return <ProfileEdit onBack={() => handleNavigation('profile')} onSave={handleProfileSave} currentProfile={userProfile} />;
      default:
        return <MainFeed onContentSelect={handleContentSelect} userLevel={userLevel} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-slate-50">
        {renderScreen()}
        {hasCompletedOnboarding && currentScreen !== 'onboarding' && currentScreen !== 'concept' && currentScreen !== 'explainer' && currentScreen !== 'profile-edit' && (
          <BottomNav currentScreen={currentScreen} onNavigate={handleNavigation} />
        )}
        <Toaster />
        <ShareDialog
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          contentTitle={contentToShare?.title || ''}
          contentType={contentToShare?.type || 'lecture'}
          friends={mockFriends}
          groups={mockGroups}
          onShare={handleShareConfirm}
        />
        <SaveToFolderDialog
          open={saveFolderDialogOpen}
          onOpenChange={setSaveFolderDialogOpen}
          folders={savedFolders}
          contentId={contentToSave?.id || ''}
          onSaveToFolder={(folderId) => {
            if (contentToSave) {
              handleSaveToFolder(folderId, contentToSave.id);
            }
          }}
          onCreateFolder={handleCreateFolderFromDialog}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
