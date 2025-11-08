import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Trophy, MessageCircle, ThumbsUp, Send, Crown, Zap, TrendingUp, Plus, X, Search, Check, BookOpen, GraduationCap, UserMinus } from 'lucide-react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { CommentsPage } from './CommentsPage';
import { GroupMessaging } from './GroupMessaging';

const mockClassmates = [
  { id: '1', name: 'Sarah Chen', avatar: 'SC', level: 'i+2', streak: 15, points: 2340 },
  { id: '2', name: 'Alex Kim', avatar: 'AK', level: 'i+1', streak: 8, points: 1890 },
  { id: '3', name: 'Jordan Lee', avatar: 'JL', level: 'i+2', streak: 12, points: 2150 },
  { id: '4', name: 'Taylor Swift', avatar: 'TS', level: 'i+1', streak: 6, points: 1620 }
];

const mockLeaderboard = [
  { id: '1', name: 'Sarah Chen', avatar: 'SC', points: 2340, change: 2, streak: 15 },
  { id: '2', name: 'Jordan Lee', avatar: 'JL', points: 2150, change: 1, streak: 12 },
  { id: '3', name: 'You', avatar: 'ME', points: 2080, change: -1, streak: 12 },
  { id: '4', name: 'Alex Kim', avatar: 'AK', points: 1890, change: 0, streak: 8 },
  { id: '5', name: 'Taylor Swift', avatar: 'TS', points: 1620, change: 3, streak: 6 },
  { id: '6', name: 'Morgan Park', avatar: 'MP', points: 1450, change: -2, streak: 4 },
  { id: '7', name: 'Casey Davis', avatar: 'CD', points: 1320, change: 1, streak: 9 },
  { id: '8', name: 'Riley Brown', avatar: 'RB', points: 1180, change: 0, streak: 3 }
];

const mockSharedClips = [
  {
    id: '1',
    user: 'Sarah Chen',
    avatar: 'SC',
    topic: 'Quantum Mechanics',
    title: 'Wave-Particle Duality Explained',
    likes: 24,
    comments: 8,
    timeAgo: '2h ago',
    thumbnail: 'https://images.unsplash.com/photo-1760900199593-381d2716a970?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyYWwlMjBuZXR3b3JrcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYxNjg2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '2',
    user: 'Alex Kim',
    avatar: 'AK',
    topic: 'Chemistry',
    title: 'Balancing Chemical Equations',
    likes: 18,
    comments: 5,
    timeAgo: '5h ago',
    thumbnail: 'https://images.unsplash.com/photo-1682391427624-61a45b5c7797?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBtb2xlY3VsZXMlMjBzY2llbmNlfGVufDF8fHx8MTc2MTY4NjY2Mnww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '3',
    user: 'Jordan Lee',
    avatar: 'JL',
    topic: 'Mathematics',
    title: 'Derivatives Made Simple',
    likes: 31,
    comments: 12,
    timeAgo: '1d ago',
    thumbnail: 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMGVxdWF0aW9uc3xlbnwxfHx8fDE3NjE2NTY4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

const mockChallenges = [
  { id: '1', name: 'Speed Round', description: '10 questions in 5 minutes', reward: '100 XP', participants: 12 },
  { id: '2', name: 'Topic Master', description: 'Complete all Biology basics', reward: '250 XP', participants: 8 },
  { id: '3', name: 'Perfect Score', description: 'Get 100% on any quiz', reward: '150 XP', participants: 15 }
];

const mockStudyGroups = [
  {
    id: '1',
    name: 'Physics 101 Study Squad',
    members: 8,
    subject: 'Physics',
    classCode: 'PHYS-101',
    description: 'Weekly study sessions for Physics 101',
    isJoined: true,
    avatar: 'P1'
  },
  {
    id: '2',
    name: 'Organic Chemistry Masters',
    members: 12,
    subject: 'Chemistry',
    classCode: 'CHEM-220',
    description: 'Acing organic chemistry together',
    isJoined: true,
    avatar: 'OC'
  },
  {
    id: '3',
    name: 'Calculus Study Group',
    members: 6,
    subject: 'Mathematics',
    classCode: 'MATH-151',
    description: 'Daily practice problems and discussions',
    isJoined: false,
    avatar: 'CS'
  }
];

const mockAvailableUsers = [
  { id: '1', name: 'Emma Wilson', avatar: 'EW', subject: 'Physics', classCode: 'PHYS-101' },
  { id: '2', name: 'Liam Chen', avatar: 'LC', subject: 'Chemistry', classCode: 'CHEM-220' },
  { id: '3', name: 'Sophia Martinez', avatar: 'SM', subject: 'Physics', classCode: 'PHYS-101' },
  { id: '4', name: 'Noah Davis', avatar: 'ND', subject: 'Mathematics', classCode: 'MATH-151' },
  { id: '5', name: 'Olivia Brown', avatar: 'OB', subject: 'Chemistry', classCode: 'CHEM-220' },
];

interface SocialLoopsProps {
  onShare: (title: string, type: 'lecture' | 'clip' | 'note') => void;
}

export function SocialLoops({ onShare }: SocialLoopsProps) {
  const [selectedTab, setSelectedTab] = useState('feed');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [filterSameSubject, setFilterSameSubject] = useState(false);
  const [filterSameClass, setFilterSameClass] = useState(false);
  const [studyGroups, setStudyGroups] = useState(mockStudyGroups);
  const [likedClips, setLikedClips] = useState<Set<string>>(new Set());
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [showGroupMessaging, setShowGroupMessaging] = useState<string | null>(null);

  const handleCreateGroup = () => {
    if (!newGroupName) return;
    
    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      members: selectedMembers.length + 1,
      subject: selectedSubject,
      classCode: selectedClass,
      description: newGroupDescription,
      isJoined: true,
      avatar: newGroupName.substring(0, 2).toUpperCase()
    };
    
    setStudyGroups([newGroup, ...studyGroups]);
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setSelectedSubject('');
    setSelectedClass('');
    setSelectedMembers([]);
    setFilterSameSubject(false);
    setFilterSameClass(false);
  };

  const handleLikeClip = (clipId: string) => {
    setLikedClips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clipId)) {
        newSet.delete(clipId);
      } else {
        newSet.add(clipId);
      }
      return newSet;
    });
  };

  const handleCommentClick = (clipId: string) => {
    setShowCommentsFor(clipId);
  };

  const filteredUsers = mockAvailableUsers.filter(user => {
    if (filterSameSubject && filterSameClass) {
      return user.subject === selectedSubject && user.classCode === selectedClass;
    }
    if (filterSameSubject) {
      return user.subject === selectedSubject;
    }
    if (filterSameClass) {
      return user.classCode === selectedClass;
    }
    return true;
  });

  const toggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24 pt-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl text-white mb-2">Study Loops</h1>
          <p className="text-slate-400">Learn together with your classmates</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            <TabsTrigger 
              value="groups"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-400 transition-all"
            >
              <Users className="w-4 h-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger 
              value="feed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-400 transition-all"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Feed
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-400 transition-all"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Ranks
            </TabsTrigger>
            <TabsTrigger 
              value="challenges"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-400 transition-all"
            >
              <Zap className="w-4 h-4 mr-2" />
              Challenges
            </TabsTrigger>
          </TabsList>

          {/* Study Groups Tab */}
          <TabsContent value="groups" className="mt-6 space-y-4">
            {/* Create Group Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full h-14"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Study Group
              </Button>
            </motion.div>

            {/* Study Groups List */}
            <div className="space-y-4">
              {studyGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 hover:bg-white/10 transition-colors">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-400 text-white text-xl">
                          {group.avatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white text-lg mb-1">{group.name}</h3>
                            <p className="text-slate-400 text-sm mb-2">{group.description}</p>
                          </div>
                          {group.isJoined && (
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                              <Check className="w-3 h-3 mr-1" />
                              Joined
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {group.subject}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {group.classCode}
                          </Badge>
                          <Badge variant="secondary" className="bg-white/10 text-slate-300 border-white/20">
                            {group.members} members
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              onClick={() => setShowGroupDetails(group.id)}
                              className="w-full bg-white/5 text-white border border-white/20 hover:bg-white/10 rounded-full transition-all"
                            >
                              View Group
                            </Button>
                          </motion.div>
                          {!group.isJoined && (
                            <motion.div 
                              className="flex-1" 
                              whileHover={{ scale: 1.02 }} 
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                onClick={() => {
                                  setStudyGroups(studyGroups.map(g => 
                                    g.id === group.id ? { ...g, isJoined: true, members: g.members + 1 } : g
                                  ));
                                  // Temporary visual feedback
                                  const btn = document.activeElement as HTMLButtonElement;
                                  if (btn) {
                                    btn.textContent = '✓ Joined!';
                                    setTimeout(() => {
                                      btn.textContent = 'Join Group';
                                    }, 2000);
                                  }
                                }}
                                className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full transition-all"
                              >
                                Join Group
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Feed Tab */}
          <TabsContent value="feed" className="mt-6 space-y-4">
            {/* Classmates Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4">
                <h3 className="text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Your Study Group
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {mockClassmates.map((classmate, index) => (
                    <motion.div
                      key={classmate.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-shrink-0 text-center"
                    >
                      <div className="relative mb-2">
                        <Avatar className="w-16 h-16 border-2 border-blue-500">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-400 text-white">
                            {classmate.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 border-2 border-slate-900 flex items-center justify-center text-xs">
                          {classmate.streak}
                        </div>
                      </div>
                      <div className="text-white text-sm mb-1">{classmate.name.split(' ')[0]}</div>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                        {classmate.level}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Shared Clips */}
            <div className="space-y-4">
              {mockSharedClips.map((clip, index) => (
                <motion.div
                  key={clip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden hover:bg-white/10 transition-colors">
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-400 text-white">
                            {clip.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-white text-sm">{clip.user}</div>
                          <div className="text-slate-400 text-xs">{clip.timeAgo}</div>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          {clip.topic}
                        </Badge>
                      </div>

                      <div className="relative rounded-xl overflow-hidden mb-4 aspect-video">
                        <ImageWithFallback
                          src={clip.thumbnail}
                          alt={clip.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
                          <h4 className="text-white">{clip.title}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeClip(clip.id);
                          }}
                          className="flex items-center gap-2 group"
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.3 }}
                          >
                            <ThumbsUp 
                              className={`w-5 h-5 transition-colors ${
                                likedClips.has(clip.id)
                                  ? 'text-[#FF3B30] fill-[#FF3B30]'
                                  : 'text-[#94A3B8] group-hover:text-red-400'
                              }`}
                            />
                          </motion.div>
                          <span className={`text-sm transition-colors ${
                            likedClips.has(clip.id) ? 'text-[#FF3B30]' : 'text-slate-400'
                          }`}>
                            {clip.likes + (likedClips.has(clip.id) ? 1 : 0)}
                          </span>
                        </motion.button>
                        
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCommentClick(clip.id);
                          }}
                          className="flex items-center gap-2 group"
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.3 }}
                          >
                            <MessageCircle 
                              className={`w-5 h-5 transition-colors ${
                                showCommentsFor === clip.id
                                  ? 'text-[#22C55E] fill-[#22C55E]'
                                  : 'text-[#94A3B8] group-hover:text-green-400'
                              }`}
                            />
                          </motion.div>
                          <span className={`text-sm transition-colors ${
                            showCommentsFor === clip.id ? 'text-[#22C55E]' : 'text-slate-400'
                          }`}>
                            {clip.comments}
                          </span>
                        </motion.button>
                        
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShare(clip.title, 'clip');
                          }}
                          className="flex items-center gap-2 text-[#94A3B8] hover:text-emerald-400 transition-colors ml-auto"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Send className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border-b border-white/10">
                  <h3 className="text-xl text-white mb-2">Weekly Leaderboard</h3>
                  <p className="text-slate-400 text-sm">Top learners this week</p>
                </div>

                <div className="divide-y divide-white/10">
                  {mockLeaderboard.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 flex items-center gap-4 ${
                        user.name === 'You' ? 'bg-blue-500/10' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-8 text-center">
                        {index === 0 ? (
                          <Crown className="w-6 h-6 text-yellow-400 mx-auto" />
                        ) : index === 1 ? (
                          <Crown className="w-6 h-6 text-slate-400 mx-auto" />
                        ) : index === 2 ? (
                          <Crown className="w-6 h-6 text-orange-400 mx-auto" />
                        ) : (
                          <span className="text-slate-400 text-lg">#{index + 1}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={`${
                          user.name === 'You'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'bg-gradient-to-br from-blue-500 to-emerald-400'
                        } text-white`}>
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name and Streak */}
                      <div className="flex-1">
                        <div className="text-white">{user.name}</div>
                        <div className="text-slate-400 text-sm flex items-center gap-2">
                          🔥 {user.streak} day streak
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="text-white">{user.points.toLocaleString()}</div>
                        <div className="text-xs flex items-center gap-1">
                          {user.change > 0 ? (
                            <>
                              <TrendingUp className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">+{user.change}</span>
                            </>
                          ) : user.change < 0 ? (
                            <>
                              <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
                              <span className="text-red-400">{user.change}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="mt-6 space-y-4">
            {mockChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-white text-lg">{challenge.name}</h3>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{challenge.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          {challenge.reward}
                        </Badge>
                        <span className="text-slate-400">
                          {challenge.participants} participants
                        </span>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={() => alert(`Joined challenge: ${challenge.name}!`)}
                        className="bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full"
                      >
                        Join
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white">Create Study Group</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Group Name */}
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Group Name</label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Physics 101 Study Squad"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Description</label>
                  <Input
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="What's this group about?"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Subject</label>
                  <Input
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    placeholder="e.g., Physics, Chemistry, Mathematics"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12"
                  />
                </div>

                {/* Class Code */}
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Class Code (Optional)</label>
                  <Input
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    placeholder="e.g., PHYS-101"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12"
                  />
                </div>

                {/* Member Filters */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Find Members
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={filterSameSubject}
                        onCheckedChange={(checked) => setFilterSameSubject(checked as boolean)}
                        className="border-white/20"
                      />
                      <span className="text-sm text-slate-300">
                        Only show people studying {selectedSubject || 'the same subject'}
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={filterSameClass}
                        onCheckedChange={(checked) => setFilterSameClass(checked as boolean)}
                        className="border-white/20"
                      />
                      <span className="text-sm text-slate-300">
                        Only show people in {selectedClass || 'the same class'}
                      </span>
                    </label>
                  </div>

                  {/* Available Users */}
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar-thin pr-2">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedMembers.includes(user.id)}
                            onCheckedChange={() => toggleMember(user.id)}
                            className="border-white/20"
                          />
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-400 text-white">
                              {user.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-white text-sm">{user.name}</div>
                            <div className="text-slate-400 text-xs flex items-center gap-2">
                              <span>{user.subject}</span>
                              {user.classCode && (
                                <>
                                  <span>•</span>
                                  <span>{user.classCode}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm text-center py-4">
                        {filterSameSubject || filterSameClass
                          ? 'No users found with these filters'
                          : 'Enter subject or class to find members'}
                      </p>
                    )}
                  </div>

                  {selectedMembers.length > 0 && (
                    <p className="text-sm text-slate-400 mt-3">
                      {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-white/5 text-white border border-white/20 hover:bg-white/10 rounded-full h-12 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Create Group
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Details Modal */}
      <AnimatePresence>
        {showGroupDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGroupDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {studyGroups.find(g => g.id === showGroupDetails) && (() => {
                const group = studyGroups.find(g => g.id === showGroupDetails)!;
                return (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl text-white">{group.name}</h2>
                      <button
                        onClick={() => setShowGroupDetails(null)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Group Info */}
                      <Card className="bg-white/5 border-white/10 p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <Avatar className="w-16 h-16">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-400 text-white text-xl">
                              {group.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-white text-xl mb-2">{group.name}</h3>
                            <p className="text-slate-400 mb-3">{group.description}</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {group.subject}
                              </Badge>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                {group.classCode}
                              </Badge>
                              <Badge variant="secondary" className="bg-white/10 text-slate-300 border-white/20">
                                {group.members} members
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Group Activity */}
                      <Card className="bg-white/5 border-white/10 p-6">
                        <h4 className="text-white mb-4">Recent Activity</h4>
                        <div className="space-y-3">
                          {[
                            { user: 'Sarah K.', action: 'completed Quantum Mechanics Quiz', time: '2h ago' },
                            { user: 'Alex M.', action: 'shared a study guide', time: '5h ago' },
                            { user: 'Jordan L.', action: 'started a study session', time: '1d ago' }
                          ].map((activity, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                                  {activity.user.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <span className="text-white">{activity.user}</span>
                                <span className="text-slate-400"> {activity.action}</span>
                              </div>
                              <span className="text-slate-500 text-xs">{activity.time}</span>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              onClick={() => {
                                setShowGroupMessaging(group.id);
                                setShowGroupDetails(null);
                              }}
                              className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full h-12"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message Group
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              onClick={() => setShowGroupDetails(null)}
                              variant="outline" 
                              className="w-full border-white/20 text-white hover:bg-white/5 rounded-full h-12"
                            >
                              Close
                            </Button>
                          </motion.div>
                        </div>
                        
                        {/* Leave Group Button - Only show if user is joined */}
                        {studyGroups.find(g => g.id === group.id)?.isJoined && (
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              onClick={() => {
                                if (confirm(`Are you sure you want to leave ${group.name}?`)) {
                                  setStudyGroups(studyGroups.map(g => 
                                    g.id === group.id ? { ...g, isJoined: false, members: Math.max(0, g.members - 1) } : g
                                  ));
                                  setShowGroupDetails(null);
                                }
                              }}
                              variant="outline"
                              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-full h-12"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Leave Group
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Messaging Modal */}
      <AnimatePresence>
        {showGroupMessaging && (() => {
          const group = studyGroups.find(g => g.id === showGroupMessaging);
          if (!group) return null;
          
          // Generate mock members for the group
          const groupMembers = [
            { id: '1', name: 'Sarah K.', avatar: 'SK', status: 'online' as const },
            { id: '2', name: 'Alex M.', avatar: 'AM', status: 'online' as const },
            { id: '3', name: 'Jordan L.', avatar: 'JL', status: 'offline' as const },
            { id: '4', name: 'Emma W.', avatar: 'EW', status: 'online' as const },
            { id: '5', name: 'You', avatar: 'ME', status: 'online' as const }
          ];

          return (
            <GroupMessaging
              groupName={group.name}
              members={groupMembers}
              onClose={() => setShowGroupMessaging(null)}
            />
          );
        })()}
      </AnimatePresence>

      {/* Comments Page */}
      <AnimatePresence>
        {showCommentsFor && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50"
          >
            <CommentsPage
              onBack={() => setShowCommentsFor(null)}
              clipTitle={mockSharedClips.find(c => c.id === showCommentsFor)?.title || ''}
              clipUser={mockSharedClips.find(c => c.id === showCommentsFor)?.user || ''}
              commentsCount={mockSharedClips.find(c => c.id === showCommentsFor)?.comments || 0}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
