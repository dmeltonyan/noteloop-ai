/**
 * ConceptDetail Component
 * 
 * AUDIO IMPLEMENTATION NOTE:
 * This component includes an HTML5 audio element that plays lecture audio.
 * To add real audio to your lectures:
 * 1. Add MP3 files to your public/audio directory (e.g., public/audio/lecture-1.mp3)
 * 2. Name files to match lecture IDs (lecture-{id}.mp3)
 * 3. Or add an 'audioUrl' property to the LearningContent type in App.tsx
 * 4. Update the audio src below to use that property
 * 
 * Current implementation uses placeholder audio paths for demonstration.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, RotateCw, FileText, Lightbulb, Image as ImageIcon, Users, StickyNote, ChevronLeft, Heart, MessageCircle, Settings, Bookmark, Send, Plus, X as XIcon } from 'lucide-react';
import { LearningContent } from '../App';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';

interface ConceptDetailProps {
  content: LearningContent | null;
  onBack: () => void;
  onSaveContent: (content: LearningContent) => void;
  isContentSaved: (contentId: string) => boolean;
  onShare: (title: string, type: 'lecture' | 'clip' | 'note') => void;
}

const mockTranscript = [
  { time: 0, text: "Let's explore neural networks, a fundamental concept in machine learning.", highlight: ["neural networks", "machine learning"] },
  { time: 5, text: "A neural network is inspired by the human brain's structure.", highlight: ["human brain"] },
  { time: 10, text: "It consists of layers of interconnected nodes, or neurons.", highlight: ["nodes", "neurons"] },
  { time: 15, text: "Each connection has a weight that adjusts during training.", highlight: ["weight", "training"] },
  { time: 20, text: "This allows the network to learn patterns and make predictions.", highlight: ["learn patterns", "predictions"] }
];

const mockRelatedLessons: LearningContent[] = [
  {
    id: '2',
    title: 'Deep Learning Fundamentals',
    topic: 'Machine Learning',
    level: 'Intermediate',
    duration: 45,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    progress: 0,
    difficulty: 'i+1'
  },
  {
    id: '3',
    title: 'Backpropagation Explained',
    topic: 'Machine Learning',
    level: 'Advanced',
    duration: 50,
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    progress: 0,
    difficulty: 'i+2'
  }
];

const mockUserNotes = [
  { id: '1', text: 'Neural networks mimic brain structure', timestamp: '2:30', author: 'You' },
  { id: '2', text: 'Weights are crucial for learning', timestamp: '5:45', author: 'You' }
];

const mockCommunityNotes = [
  { id: '3', text: 'Think of neurons like decision makers - each one processes info and passes it forward', timestamp: '3:15', author: 'Sarah K.', likes: 24 },
  { id: '4', text: 'Weights adjust through gradient descent - like rolling downhill to find the best solution', timestamp: '6:20', author: 'Alex M.', likes: 18 },
  { id: '5', text: 'Helpful analogy: layers are like filters in a coffee maker - each extracts different features', timestamp: '4:10', author: 'Jordan L.', likes: 15 }
];

const explainVisuals = [
  {
    type: 'diagram',
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
    caption: 'Neural Network Architecture',
    description: 'Layers of interconnected nodes process information sequentially'
  },
  {
    type: 'diagram',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80',
    caption: 'Brain vs Neural Network',
    description: 'Biological neurons inspire artificial neural networks'
  }
];

const alternativeExplanations = [
  {
    title: 'Simple Analogy',
    text: 'Think of a neural network like a team of specialists. Each specialist (neuron) looks at information, makes a small decision, and passes it to the next specialist. Together, they solve complex problems!'
  },
  {
    title: 'Real-World Example',
    text: 'When you recognize a friend\'s face, your brain uses a similar process. First layer detects edges, second layer recognizes features like eyes and nose, final layers identify the complete face.'
  },
  {
    title: 'Step-by-Step',
    text: '1. Input data enters the network\n2. Each neuron processes data and applies weights\n3. Activation functions decide what to pass forward\n4. Output layer produces the final prediction'
  }
];

export function ConceptDetail({ content, onBack, onSaveContent, isContentSaved, onShare }: ConceptDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [showExplain, setShowExplain] = useState(false);
  const [lessonHistory, setLessonHistory] = useState<LearningContent[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LearningContent | null>(content);
  const [activeTab, setActiveTab] = useState('transcript');
  const notesRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Button animation states
  const [gotItAnimating, setGotItAnimating] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [repeatAnimating, setRepeatAnimating] = useState(false);
  const [explainAnimating, setExplainAnimating] = useState(false);
  
  // Volume control states
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  // Note management
  const [userNotes, setUserNotes] = useState(mockUserNotes);
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    setCurrentLesson(content);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [content]);

  // Effect to handle play/pause with proper cleanup
  useEffect(() => {
    if (isPlaying && currentLesson) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentLesson.duration) {
            setIsPlaying(false);
            return currentLesson.duration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, currentLesson]);

  // Sync audio playback with isPlaying state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Reset audio when lesson changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
  }, [currentLesson]);

  // Cleanup volume timeout on unmount
  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  if (!currentLesson) return null;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    
    // Clear existing timeout
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    
    // Set new timeout to hide slider after 2 seconds
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 2000);
  };

  const handleVolumeButtonClick = () => {
    setShowVolumeSlider(!showVolumeSlider);
    
    // If opening, set timeout to close
    if (!showVolumeSlider) {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
      volumeTimeoutRef.current = setTimeout(() => {
        setShowVolumeSlider(false);
      }, 3000);
    }
  };

  const handleRepeat = () => {
    setRepeatAnimating(true);
    setTimeout(() => setRepeatAnimating(false), 300);
    
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleGotIt = () => {
    setGotItAnimating(true);
    setIsPlaying(false); // Stop current video
    
    // Add current lesson to history
    setLessonHistory(prev => [...prev, currentLesson]);
    
    // Get next related lesson (for demo, just cycle through mock lessons)
    const nextLesson = mockRelatedLessons[Math.floor(Math.random() * mockRelatedLessons.length)];
    
    setTimeout(() => {
      setCurrentLesson(nextLesson);
      setCurrentTime(0);
      setIsPlaying(false);
      setShowExplain(false);
      setGotItAnimating(false);
    }, 600);
  };

  const handleGoBackToPrevious = () => {
    if (lessonHistory.length > 0) {
      const previousLesson = lessonHistory[lessonHistory.length - 1];
      setLessonHistory(prev => prev.slice(0, -1));
      setCurrentLesson(previousLesson);
      setCurrentTime(0);
      setIsPlaying(false);
      setShowExplain(false);
    }
  };

  const handleNotesClick = () => {
    setActiveTab('notes');
    setShowExplain(false);
    // Scroll to notes section
    setTimeout(() => {
      notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleExplainClick = () => {
    setExplainAnimating(true);
    setTimeout(() => setExplainAnimating(false), 300);
    
    setShowExplain(!showExplain);
    setActiveTab('transcript');
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    
    const newNote = {
      id: Date.now().toString(),
      text: newNoteText,
      timestamp: formatTime(currentTime),
      author: 'You'
    };
    
    setUserNotes([...userNotes, newNote]);
    setNewNoteText('');
    setShowAddNote(false);
  };

  const handleDeleteNote = (noteId: string) => {
    setUserNotes(userNotes.filter(note => note.id !== noteId));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTranscript = () => {
    return mockTranscript.find((t, i) => {
      const nextTime = mockTranscript[i + 1]?.time || currentLesson.duration;
      return currentTime >= t.time && currentTime < nextTime;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-32 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center flex-1 min-w-0 px-2">
            <div className="text-slate-900 dark:text-white truncate">{currentLesson.title}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 truncate">{currentLesson.topic}</div>
          </div>
          {lessonHistory.length > 0 && (
            <Button
              onClick={handleGoBackToPrevious}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
          )}
          {lessonHistory.length === 0 && <div className="w-10" />}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden aspect-video bg-slate-950"
        >
          {/* Hidden audio element for lecture audio */}
          {/* To add real audio: place MP3 files in public/audio/ directory */}
          <audio
            ref={audioRef}
            loop={false}
            preload="auto"
            onError={(e) => console.log('Audio file not found - add audio files to public/audio/ directory')}
          >
            <source src={`/audio/lecture-${currentLesson.id}.mp3`} type="audio/mpeg" />
            {/* Fallback for when specific lecture audio doesn't exist */}
            <source src="/audio/ambient-learning.mp3" type="audio/mpeg" />
          </audio>
          
          <ImageWithFallback
            src={currentLesson.thumbnail}
            alt={currentLesson.title}
            className="w-full h-full object-cover"
          />
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60 flex items-center justify-center">
            <motion.button
              onClick={handlePlayPause}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={isPlaying ? {
                boxShadow: [
                  "0 0 0 0 rgba(255, 255, 255, 0.4)",
                  "0 0 0 10px rgba(255, 255, 255, 0)",
                  "0 0 0 0 rgba(255, 255, 255, 0)"
                ]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </motion.button>
          </div>

          {/* Video controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                style={{ width: `${(currentTime / currentLesson.duration) * 100}%` }}
                animate={isPlaying ? {
                  opacity: [1, 0.8, 1],
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between text-white">
              <span className="text-sm">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(currentLesson.duration / 60)}:{(currentLesson.duration % 60).toString().padStart(2, '0')}
              </span>
              
              {/* Volume Control */}
              <div className="relative flex items-center">
                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 120, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="mr-2 overflow-hidden bg-white/10 backdrop-blur-sm rounded-full px-3 py-2"
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
                        style={{
                          background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(16, 185, 129) ${volume * 100}%, rgba(255, 255, 255, 0.2) ${volume * 100}%, rgba(255, 255, 255, 0.2) 100%)`
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.button
                  onClick={handleVolumeButtonClick}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    /* 3 Soundwave lines */
                    <div className="flex items-center gap-0.5">
                      <motion.div
                        className="w-0.5 rounded-full bg-white"
                        animate={{
                          height: volume > 0 ? (isPlaying ? ['8px', '10px', '8px'] : '8px') : '4px',
                          opacity: volume > 0 ? 1 : 0.3
                        }}
                        transition={isPlaying ? {
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        } : {}}
                      />
                      <motion.div
                        className="w-0.5 rounded-full bg-white"
                        animate={{
                          height: volume > 0.33 ? (isPlaying ? ['12px', '16px', '12px'] : '12px') : '6px',
                          opacity: volume > 0.33 ? 1 : 0.3
                        }}
                        transition={isPlaying ? {
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "easeInOut"
                        } : {}}
                      />
                      <motion.div
                        className="w-0.5 rounded-full bg-white"
                        animate={{
                          height: volume > 0.66 ? (isPlaying ? ['16px', '12px', '16px'] : '16px') : '8px',
                          opacity: volume > 0.66 ? 1 : 0.3
                        }}
                        transition={isPlaying ? {
                          duration: 0.9,
                          repeat: Infinity,
                          ease: "easeInOut"
                        } : {}}
                      />
                    </div>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Difficulty badge */}
          <div className="absolute top-4 right-4">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm shadow-lg">
              {currentLesson.difficulty}
            </div>
          </div>

          {/* Action buttons - top left */}
          <div className="absolute top-4 left-4 flex gap-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onSaveContent(currentLesson);
              }}
              className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                isContentSaved(currentLesson.id) 
                  ? 'bg-yellow-500/30 hover:bg-yellow-500/40' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: [1, 1.3, 0.9] }}
            >
              <motion.div
                animate={isContentSaved(currentLesson.id) ? {
                  rotate: [0, -10, 10, -10, 0],
                } : {}}
                transition={{ duration: 0.5 }}
              >
                <Bookmark 
                  className={`w-5 h-5 transition-colors ${
                    isContentSaved(currentLesson.id) ? 'text-yellow-400 fill-yellow-400' : 'text-white'
                  }`}
                />
              </motion.div>
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: [1, 1.2, 1] }}
            >
              <Heart 
                className={`w-5 h-5 transition-colors ${
                  isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                }`}
              />
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onShare(currentLesson.title, 'lecture');
              }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Send className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </motion.div>

        {/* Explain Section */}
        <AnimatePresence>
          {showExplain && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-slate-900 dark:text-white">Visual Explanations</h3>
                </div>

                {/* Visual Diagrams */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {explainVisuals.map((visual, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
                    >
                      <ImageWithFallback
                        src={visual.url}
                        alt={visual.caption}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="text-slate-900 dark:text-white text-sm mb-1">{visual.caption}</div>
                        <div className="text-slate-600 dark:text-slate-400 text-xs">{visual.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Alternative Explanations */}
                <div className="space-y-3">
                  {alternativeExplanations.map((explanation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-slate-900 dark:text-white text-sm mb-2">{explanation.title}</div>
                          <div className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line">{explanation.text}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs for Transcript and Notes */}
        <motion.div
          ref={notesRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <TabsTrigger 
                value="transcript"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-600 dark:text-slate-400 transition-all relative"
              >
                {isPlaying && activeTab === 'transcript' && (
                  <motion.div
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-emerald-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                Transcript
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-600 dark:text-slate-400 transition-all"
              >
                <FileText className="w-4 h-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="transcript" className="mt-4">
              <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {mockTranscript.map((item, index) => {
                  const current = getCurrentTranscript();
                  const isCurrent = current?.time === item.time;
                  
                  return (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-blue-500/20 to-emerald-400/20 border border-blue-500/30'
                          : 'bg-slate-50 dark:bg-white/5'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-w-[40px]">
                          {Math.floor(item.time / 60)}:{(item.time % 60).toString().padStart(2, '0')}
                        </span>
                        <p className="text-slate-700 dark:text-slate-200">
                          {item.text.split(' ').map((word, i) => {
                            const isHighlight = item.highlight.some(h => word.toLowerCase().includes(h.toLowerCase()));
                            return (
                              <span
                                key={i}
                                className={isHighlight ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}
                              >
                                {word}{' '}
                              </span>
                            );
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <div className="space-y-4">
                {/* Your Notes */}
                <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <StickyNote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-slate-900 dark:text-white">Your Notes</h4>
                    <Badge className="ml-auto bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                      {userNotes.length}
                    </Badge>
                  </div>
                  
                  {/* Add Note Button/Form */}
                  <div className="mb-4">
                    <AnimatePresence mode="wait">
                      {!showAddNote ? (
                        <motion.div
                          key="button"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => setShowAddNote(true)}
                            className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-xl h-12"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your Own Note
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <div className="relative">
                            <Textarea
                              value={newNoteText}
                              onChange={(e) => setNewNoteText(e.target.value)}
                              placeholder="Write your note about this concept..."
                              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-500 rounded-xl min-h-[100px] resize-none pr-10"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                  handleAddNote();
                                }
                              }}
                              autoFocus
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                              {newNoteText.length}/500
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <motion.div 
                              className="flex-1"
                              whileHover={{ scale: 1.02 }} 
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                onClick={handleAddNote}
                                disabled={!newNoteText.trim()}
                                className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Save Note
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.05 }} 
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                onClick={() => {
                                  setShowAddNote(false);
                                  setNewNoteText('');
                                }}
                                variant="outline"
                                className="border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl px-4"
                              >
                                Cancel
                              </Button>
                            </motion.div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            💡 Tip: Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">⌘/Ctrl + Enter</kbd> to save
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {userNotes.length === 0 ? (
                      <div className="text-center py-8">
                        <StickyNote className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No notes yet. Add your first note!</p>
                      </div>
                    ) : (
                      userNotes.map((note, index) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors"
                        >
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 mt-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-slate-700 dark:text-slate-200 break-words">{note.text}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500 dark:text-slate-400">{note.timestamp}</span>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handleDeleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete note"
                          >
                            <XIcon className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Community Notes */}
                <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h4 className="text-slate-900 dark:text-white">Community Notes</h4>
                    <Badge className="ml-auto bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30">
                      Helpful
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {mockCommunityNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/10 dark:hover:bg-purple-500/15 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                              {note.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-slate-900 dark:text-white">{note.author}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">•</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{note.timestamp}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-200 text-sm mb-2">{note.text}</p>
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <span>👍</span>
                              <span>{note.likes} helpful</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Fixed Bottom Navigation */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
        className="fixed bottom-0 left-0 right-0 z-30 pb-safe"
      >
        <div className="max-w-4xl mx-auto px-4 pb-6">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl shadow-slate-900/20 dark:shadow-black/40 p-4">
            <div className="flex items-center justify-center gap-3 sm:gap-6">
              <BottomActionButton
                icon={Heart}
                label="I got it"
                onClick={handleGotIt}
                buttonType="gotit"
                isAnimating={gotItAnimating}
              />
              <BottomActionButton
                icon={RotateCw}
                label="Repeat"
                onClick={handleRepeat}
                buttonType="repeat"
                isAnimating={repeatAnimating}
              />
              <BottomActionButton
                icon={Settings}
                label="Explain"
                onClick={handleExplainClick}
                buttonType="explain"
                isAnimating={explainAnimating}
                active={showExplain}
              />
              <BottomActionButton
                icon={MessageCircle}
                label="Notes"
                onClick={handleNotesClick}
                buttonType="notes"
                active={activeTab === 'notes'}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface BottomActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
  buttonType?: 'gotit' | 'repeat' | 'explain' | 'notes';
  isAnimating?: boolean;
}

function BottomActionButton({ icon: Icon, label, onClick, active, buttonType, isAnimating }: BottomActionButtonProps) {
  const getIconColor = () => {
    // I got it - red when animating
    if (buttonType === 'gotit' && isAnimating) {
      return 'text-[#FF4D4D]';
    }
    
    // Notes - mint green when active
    if (buttonType === 'notes' && active) {
      return 'text-[#06D6A0]';
    }
    
    // Default white
    return 'text-white group-hover:text-white';
  };

  const getIconAnimation = () => {
    // I got it - bounce/pop animation
    if (buttonType === 'gotit' && isAnimating) {
      return {
        scale: [1, 1.2, 1],
        transition: { 
          duration: 0.4, 
          ease: 'easeOut',
          times: [0, 0.5, 1]
        }
      };
    }
    
    // Repeat - 360° rotation
    if (buttonType === 'repeat' && isAnimating) {
      return {
        rotate: 360,
        transition: { duration: 0.4, ease: 'easeOut' }
      };
    }
    
    // Explain - pulse animation
    if (buttonType === 'explain' && isAnimating) {
      return {
        scale: [1, 1.1, 1],
        transition: { duration: 0.3, ease: 'easeOut' }
      };
    }
    
    // Notes - enlarge 10%
    if (buttonType === 'notes' && active) {
      return {
        scale: 1.1,
        transition: { duration: 0.3, ease: 'easeOut' }
      };
    }
    
    return {};
  };

  const getIconShadow = () => {
    // I got it - red glow
    if (buttonType === 'gotit' && isAnimating) {
      return 'drop-shadow-[0_0_8px_rgba(255,77,77,0.6)]';
    }
    
    // Notes - mint green glow
    if (buttonType === 'notes' && active) {
      return 'drop-shadow-[0_0_8px_rgba(6,214,160,0.6)]';
    }
    
    // Default soft glow on hover
    return 'group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]';
  };

  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group min-w-[70px]"
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#0E1A2B] shadow-lg shadow-black/20 group-hover:shadow-xl group-hover:shadow-black/30 transition-all relative overflow-visible">
        {/* Repeat button - blue glow during spin */}
        {buttonType === 'repeat' && isAnimating && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-[#4DA6FF]"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )}
        
        {/* Explain button - yellow glow pulse */}
        {buttonType === 'explain' && isAnimating && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ 
              background: 'radial-gradient(circle, rgba(255,209,102,0.4) 0%, rgba(255,209,102,0) 70%)',
              filter: 'blur(8px)'
            }}
          />
        )}
        
        <motion.div
          animate={getIconAnimation()}
          className="relative z-10"
        >
          <Icon className={`w-6 h-6 transition-all duration-300 ${getIconColor()} ${getIconShadow()}`} 
            strokeWidth={buttonType === 'gotit' && isAnimating ? 0 : 2}
            fill={buttonType === 'gotit' && isAnimating ? 'currentColor' : 
                  buttonType === 'notes' && active ? 'currentColor' : 'none'}
          />
        </motion.div>
      </div>
      <span className="text-xs text-slate-400 group-hover:text-white transition-colors">
        {label}
      </span>
    </motion.button>
  );
}
