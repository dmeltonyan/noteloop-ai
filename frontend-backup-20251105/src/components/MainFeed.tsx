import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { RotateCcw, Play, Pause, Volume2, VolumeX, Bookmark, Send, Heart, MessageCircle, BookOpen, GraduationCap, FileText, FolderOpen, ArrowLeft } from 'lucide-react';
import { LearningContent } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface MainFeedProps {
  onContentSelect: (content: LearningContent) => void;
  userLevel: number;
  onSaveContent: (content: LearningContent) => void;
  isContentSaved: (contentId: string) => boolean;
  onShare: (title: string, type: 'lecture' | 'clip' | 'note') => void;
}

type SubjectType = string | null;

interface Subject {
  id: string;
  label: string;
  description: string;
  color: string;
  contentCount: number;
}

const subjects: Subject[] = [
  {
    id: 'Machine Learning',
    label: 'Machine Learning',
    description: '12 video lectures',
    color: 'from-blue-500 to-cyan-500',
    contentCount: 12
  },
  {
    id: 'Chemistry',
    label: 'Chemistry',
    description: '8 video lectures',
    color: 'from-purple-500 to-pink-500',
    contentCount: 8
  },
  {
    id: 'History',
    label: 'History',
    description: '6 video lectures',
    color: 'from-emerald-500 to-teal-500',
    contentCount: 6
  },
  {
    id: 'Mathematics',
    label: 'Mathematics',
    description: '15 video lectures',
    color: 'from-orange-500 to-amber-500',
    contentCount: 15
  },
  {
    id: 'Biology',
    label: 'Biology',
    description: '10 video lectures',
    color: 'from-pink-500 to-rose-500',
    contentCount: 10
  },
  {
    id: 'Physics',
    label: 'Physics',
    description: '9 video lectures',
    color: 'from-indigo-500 to-purple-500',
    contentCount: 9
  },
  {
    id: 'Literature',
    label: 'Literature',
    description: '7 video lectures',
    color: 'from-teal-500 to-emerald-500',
    contentCount: 7
  },
  {
    id: 'Programming',
    label: 'Programming',
    description: '18 video lectures',
    color: 'from-cyan-500 to-blue-500',
    contentCount: 18
  }
];

const mockContent: LearningContent[] = [
  {
    id: '1',
    title: 'Neural Networks — Concept 2 of 5',
    topic: 'Machine Learning',
    level: 'i+1',
    duration: 60,
    thumbnail: 'https://images.unsplash.com/photo-1760900199593-381d2716a970?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyYWwlMjBuZXR3b3JrcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYxNjg2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 0,
    difficulty: 'i+1'
  },
  {
    id: '2',
    title: 'Deep Learning Fundamentals',
    topic: 'Machine Learning',
    level: 'i+2',
    duration: 70,
    thumbnail: 'https://images.unsplash.com/photo-1760900199593-381d2716a970?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyYWwlMjBuZXR3b3JrcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYxNjg2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 25,
    difficulty: 'i+2'
  },
  {
    id: '3',
    title: 'Supervised Learning Basics',
    topic: 'Machine Learning',
    level: 'i',
    duration: 45,
    thumbnail: 'https://images.unsplash.com/photo-1760900199593-381d2716a970?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyYWwlMjBuZXR3b3JrcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYxNjg2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 0,
    difficulty: 'i'
  },
  {
    id: '4',
    title: 'Organic Chemistry Basics',
    topic: 'Chemistry',
    level: 'i+1',
    duration: 45,
    thumbnail: 'https://images.unsplash.com/photo-1682391427624-61a45b5c7797?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBtb2xlY3VsZXMlMjBzY2llbmNlfGVufDF8fHx8MTc2MTY4NjY2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 30,
    difficulty: 'i+1'
  },
  {
    id: '5',
    title: 'Chemical Bonding Explained',
    topic: 'Chemistry',
    level: 'i',
    duration: 40,
    thumbnail: 'https://images.unsplash.com/photo-1682391427624-61a45b5c7797?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBtb2xlY3VsZXMlMjBzY2llbmNlfGVufDF8fHx8MTc2MTY4NjY2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 0,
    difficulty: 'i'
  },
  {
    id: '6',
    title: 'Ancient Rome — Rise and Fall',
    topic: 'History',
    level: 'i',
    duration: 55,
    thumbnail: 'https://images.unsplash.com/photo-1717606344894-66e5696bcd18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3J5JTIwYW5jaWVudCUyMGNpdmlsaXphdGlvbnxlbnwxfHx8fDE3NjE2NDI5ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 0,
    difficulty: 'i'
  },
  {
    id: '7',
    title: 'World War II Overview',
    topic: 'History',
    level: 'i+1',
    duration: 60,
    thumbnail: 'https://images.unsplash.com/photo-1717606344894-66e5696bcd18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3J5JTIwYW5jaWVudCUyMGNpdmlsaXphdGlvbnxlbnwxfHx8fDE3NjE2NDI5ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 50,
    difficulty: 'i+1'
  },
  {
    id: '8',
    title: 'Calculus: Derivatives Explained',
    topic: 'Mathematics',
    level: 'i+2',
    duration: 50,
    thumbnail: 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMGVxdWF0aW9uc3xlbnwxfHx8fDE3NjE2NTY4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 0,
    difficulty: 'i+2'
  },
  {
    id: '9',
    title: 'Linear Algebra Introduction',
    topic: 'Mathematics',
    level: 'i+1',
    duration: 55,
    thumbnail: 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMGVxdWF0aW9uc3xlbnwxfHx8fDE3NjE2NTY4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 0,
    difficulty: 'i+1'
  },
  {
    id: '10',
    title: 'Cell Division & Mitosis',
    topic: 'Biology',
    level: 'i+1',
    duration: 40,
    thumbnail: 'https://images.unsplash.com/photo-1636386689060-37d233b5d345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW9sb2d5JTIwY2VsbHMlMjBtaWNyb3Njb3BlfGVufDF8fHx8MTc2MTY0Mjk4NHww&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 75,
    difficulty: 'i+1'
  },
  {
    id: '11',
    title: 'DNA Structure and Replication',
    topic: 'Biology',
    level: 'i+2',
    duration: 50,
    thumbnail: 'https://images.unsplash.com/photo-1636386689060-37d233b5d345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW9sb2d5JTIwY2VsbHMlMjBtaWNyb3Njb3BlfGVufDF8fHx8MTc2MTY0Mjk4NHww&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 0,
    difficulty: 'i+2'
  },
  {
    id: '12',
    title: 'Quantum Mechanics Intro',
    topic: 'Physics',
    level: 'i+2',
    duration: 65,
    thumbnail: 'https://images.unsplash.com/photo-1760900199593-381d2716a970?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyYWwlMjBuZXR3b3JrcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYxNjg2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 0,
    difficulty: 'i+2'
  },
  {
    id: '13',
    title: 'Newton Laws of Motion',
    topic: 'Physics',
    level: 'i',
    duration: 45,
    thumbnail: 'https://images.unsplash.com/photo-1760900199593-381d2716a970?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyYWwlMjBuZXR3b3JrcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYxNjg2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 40,
    difficulty: 'i'
  },
  {
    id: '14',
    title: 'Shakespeare Sonnets Analysis',
    topic: 'Literature',
    level: 'i+1',
    duration: 50,
    thumbnail: 'https://images.unsplash.com/photo-1717606344894-66e5696bcd18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3J5JTIwYW5jaWVudCUyMGNpdmlsaXphdGlvbnxlbnwxfHx8fDE3NjE2NDI5ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 20,
    difficulty: 'i+1'
  },
  {
    id: '15',
    title: 'Modern Poetry Themes',
    topic: 'Literature',
    level: 'i+2',
    duration: 55,
    thumbnail: 'https://images.unsplash.com/photo-1717606344894-66e5696bcd18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3J5JTIwYW5jaWVudCUyMGNpdmlsaXphdGlvbnxlbnwxfHx8fDE3NjE2NDI5ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 0,
    difficulty: 'i+2'
  },
  {
    id: '16',
    title: 'Python Functions Deep Dive',
    topic: 'Programming',
    level: 'i+1',
    duration: 55,
    thumbnail: 'https://images.unsplash.com/photo-1760900199593-381d2716a970?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyYWwlMjBuZXR3b3JrcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYxNjg2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 0,
    difficulty: 'i+1'
  },
  {
    id: '17',
    title: 'Data Structures Explained',
    topic: 'Programming',
    level: 'i+2',
    duration: 60,
    thumbnail: 'https://images.unsplash.com/photo-1760900199593-381d2716a970?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyYWwlMjBuZXR3b3JrcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYxNjg2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 15,
    difficulty: 'i+2'
  }
];

export function MainFeed({ onContentSelect, userLevel, onSaveContent, isContentSaved, onShare }: MainFeedProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>(null);
  const [contents, setContents] = useState(mockContent);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [mutedId, setMutedId] = useState<string | null>(null);
  const [likedContent, setLikedContent] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter contents based on selected subject
  const filteredContents = selectedSubject 
    ? contents.filter(content => content.topic === selectedSubject)
    : contents;

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setCurrentIndex(0);
  };

  const handleBack = () => {
    setSelectedSubject(null);
    setCurrentIndex(0);
  };

  const handleLike = (contentId: string) => {
    const isLiked = likedContent.has(contentId);
    
    setLikedContent(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });

    // Show toast notification
    if (!isLiked) {
      toast.success('Added to likes!', {
        duration: 2000,
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setContents([...mockContent].sort(() => Math.random() - 0.5));
      setIsRefreshing(false);
    }, 1500);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.scrollHeight / filteredContents.length;
    const index = Math.round(scrollPosition / itemHeight);
    setCurrentIndex(index);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'i': return 'from-emerald-500 to-teal-500';
      case 'i+1': return 'from-blue-500 to-purple-500';
      case 'i+2': return 'from-purple-500 to-pink-500';
      default: return 'from-blue-500 to-emerald-400';
    }
  };

  // Subject Selection Screen
  if (!selectedSubject) {
    return (
      <motion.div 
        className="h-screen overflow-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
        
        {/* Header */}
        <div className="relative z-10 pt-16 pb-8 px-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-white mb-2">Your Learning Library</h1>
            <p className="text-slate-400">Select a subject to watch video lectures</p>
          </motion.div>
        </div>

        {/* Subject Grid */}
        <div className="relative z-10 px-6 max-w-4xl mx-auto pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject, index) => {
              return (
                <motion.button
                  key={subject.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSubjectSelect(subject.id)}
                  className="group relative p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all overflow-hidden"
                >
                  {/* Gradient background on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} p-4 mb-4 shadow-lg group-hover:shadow-xl transition-shadow flex items-center justify-center`}>
                      <span className="text-white text-2xl">{subject.label.charAt(0)}</span>
                    </div>
                    <h3 className="text-white mb-2 text-left">{subject.label}</h3>
                    <p className="text-slate-400 text-sm text-left">{subject.description}</p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute top-6 right-6 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="fixed bottom-8 left-0 right-0 text-center pointer-events-none"
        >
          <p className="text-slate-500 text-sm">Tap any subject to explore AI-generated video lectures</p>
        </motion.div>
      </motion.div>
    );
  }

  // Video Feed Screen
  return (
    <motion.div 
      className="h-screen overflow-hidden relative"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {/* Top bar with back button and level indicator */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-slate-900/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <motion.button
            onClick={handleBack}
            className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <motion.div
            className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Level i+{userLevel}
          </motion.div>
          <div className="text-slate-300 text-sm whitespace-nowrap">Swipe to explore</div>
        </div>
      </div>

      {/* Pull to refresh indicator */}
      {isRefreshing && (
        <div className="absolute top-20 left-0 right-0 z-20 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RotateCcw className="w-4 h-4" />
              </motion.div>
              <span className="whitespace-nowrap">Generating new i+1 videos...</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory custom-scrollbar"
      >
        {filteredContents.map((content, index) => (
          <div
            key={content.id}
            className="h-screen snap-start snap-always flex items-center justify-center p-4 relative"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-md h-[85vh] rounded-3xl overflow-hidden relative cursor-pointer"
              onClick={() => onContentSelect(content)}
            >
              {/* Background image with gradient overlay */}
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/90" />
              </div>

              {/* Glassmorphism card overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60 backdrop-blur-[2px]" />

              {/* Save button */}
              <motion.button
                className={`absolute top-6 right-6 z-10 p-3 rounded-full backdrop-blur-md border transition-all ${
                  isContentSaved(content.id) 
                    ? 'bg-blue-500/30 border-blue-400/50' 
                    : 'bg-white/10 border-white/20'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: [1, 1.3, 0.9] }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveContent(content);
                }}
              >
                <motion.div
                  animate={isContentSaved(content.id) ? {
                    rotate: [0, -10, 10, -10, 0],
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Bookmark 
                    className={`w-5 h-5 transition-all ${isContentSaved(content.id) ? 'fill-blue-400 text-blue-400' : 'text-white'}`}
                  />
                </motion.div>
              </motion.button>

              {/* Content info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                {/* Difficulty badge */}
                <motion.div
                  className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getDifficultyColor(content.difficulty)} text-white text-sm`}
                  whileHover={{ scale: 1.05 }}
                >
                  {content.difficulty}
                </motion.div>

                {/* Title and topic */}
                <div className="space-y-1">
                  <h3 className="text-white mb-1 line-clamp-2 leading-tight">{content.title}</h3>
                  <p className="text-slate-300 text-sm truncate">{content.topic}</p>
                </div>

                {/* Progress bar */}
                {content.progress > 0 && (
                  <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${content.progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(content.id);
                      }}
                      className={`flex items-center gap-2 transition-colors ${
                        likedContent.has(content.id) ? 'text-pink-400' : 'text-white hover:text-pink-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: [1, 1.3, 0.9] }}
                    >
                      <motion.div
                        animate={likedContent.has(content.id) ? {
                          scale: [1, 1.3, 1],
                        } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart className={`w-5 h-5 ${likedContent.has(content.id) ? 'fill-pink-400' : ''}`} />
                      </motion.div>
                      <span className="text-sm">{248 + (likedContent.has(content.id) ? 1 : 0)}</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onContentSelect(content);
                      }}
                      className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">32</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare(content.title, 'lecture');
                      }}
                      className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Play className="w-4 h-4" />
                    {content.duration}s
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Progress indicators */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 space-y-2">
        {filteredContents.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-gradient-to-b from-blue-500 to-emerald-400 h-12'
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
