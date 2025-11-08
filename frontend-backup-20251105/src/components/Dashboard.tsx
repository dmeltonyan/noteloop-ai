import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Clock, Zap, Award, Brain, Target, Calendar, Flame, X, Lightbulb, AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  userLevel: number;
}

const mockStats = {
  averageSession: 7,
  comprehensionIncrease: 14,
  wordsLearned: 320,
  streakDays: 12,
  topicsCompleted: 8,
  totalTime: 145,
  dailyTime: 23,
  dailyGoal: 30,
  weeklyTime: 145,
  weeklyGoal: 180,
  monthlyTime: 620,
  monthlyGoal: 800
};

const learningCurve = [
  { level: 'i', topics: 15, mastery: 95 },
  { level: 'i+1', topics: 12, mastery: 78 },
  { level: 'i+2', topics: 5, mastery: 42 }
];

const achievements = [
  { id: '1', name: '🔥 12 Day Streak', description: 'Keep the fire burning!', unlocked: true },
  { id: '2', name: '🧠 Brain Builder', description: 'Completed 100 lessons', unlocked: true },
  { id: '3', name: '⚡ Focus Master', description: 'Studied for 1 hour straight', unlocked: true },
  { id: '4', name: '🎯 Perfect Week', description: 'Study 7 days in a row', unlocked: false },
  { id: '5', name: '📚 Knowledge Guru', description: 'Master 50 topics', unlocked: false },
  { id: '6', name: '🚀 Speed Learner', description: 'Complete 20 lessons in a day', unlocked: false }
];

const recentActivity = [
  { 
    date: 'Today', 
    topics: ['Neural Networks', 'Calculus'], 
    time: 23,
    sessions: [
      {
        topic: 'Neural Networks',
        duration: 15,
        difficulty: 'i+1',
        cardsCompleted: 12,
        accuracy: 85,
        timeOfDay: '9:30 AM',
        progress: 'Completed forward propagation concepts'
      },
      {
        topic: 'Calculus',
        duration: 8,
        difficulty: 'i+1',
        cardsCompleted: 8,
        accuracy: 92,
        timeOfDay: '2:15 PM',
        progress: 'Mastered chain rule applications'
      }
    ]
  },
  { 
    date: 'Yesterday', 
    topics: ['Chemistry', 'History'], 
    time: 18,
    sessions: [
      {
        topic: 'Chemistry',
        duration: 10,
        difficulty: 'i+1',
        cardsCompleted: 9,
        accuracy: 78,
        timeOfDay: '10:00 AM',
        progress: 'Learned organic compound nomenclature'
      },
      {
        topic: 'History',
        duration: 8,
        difficulty: 'i',
        cardsCompleted: 10,
        accuracy: 95,
        timeOfDay: '4:30 PM',
        progress: 'Reviewed WWII timeline and key events'
      }
    ]
  },
  { 
    date: '2 days ago', 
    topics: ['Biology', 'Physics'], 
    time: 31,
    sessions: [
      {
        topic: 'Biology',
        duration: 18,
        difficulty: 'i',
        cardsCompleted: 15,
        accuracy: 72,
        timeOfDay: '8:45 AM',
        progress: 'Cell division and mitosis phases'
      },
      {
        topic: 'Physics',
        duration: 13,
        difficulty: 'i+2',
        cardsCompleted: 7,
        accuracy: 68,
        timeOfDay: '7:00 PM',
        progress: 'Electromagnetic induction principles'
      }
    ]
  }
];

const futurePlanning = [
  {
    subject: 'Math',
    recommendedTime: '45 min/week',
    sessions: 3,
    priority: 'High',
    reason: 'Strong mastery (85%) - maintain momentum with challenging problems',
    color: '#3b82f6',
    icon: '🧮',
    detailedPlan: {
      currentLevel: 'i+1',
      nextMilestone: 'Complete advanced derivatives and integration',
      weeklyBreakdown: [
        { day: 'Monday', duration: '15 min', topic: 'Derivatives of Complex Functions', type: 'i+1' },
        { day: 'Wednesday', duration: '15 min', topic: 'Integration Techniques', type: 'i+1' },
        { day: 'Friday', duration: '15 min', topic: 'Applications & Word Problems', type: 'i+2' }
      ],
      specificTopics: [
        { name: 'Chain Rule Mastery', difficulty: 'i+1', status: 'In Progress', progress: 65 },
        { name: 'U-Substitution', difficulty: 'i+1', status: 'Ready', progress: 0 },
        { name: 'Integration by Parts', difficulty: 'i+2', status: 'Locked', progress: 0 },
        { name: 'Related Rates Problems', difficulty: 'i+2', status: 'Locked', progress: 0 }
      ],
      aiInsights: [
        'Your calculus foundation is strong. Focus on application problems to solidify understanding',
        'Consider attempting i+2 content on Fridays when your focus is typically highest',
        'Chain rule practice shows 65% mastery - 2 more sessions should complete this topic'
      ]
    }
  },
  {
    subject: 'Chemistry',
    recommendedTime: '60 min/week',
    sessions: 4,
    priority: 'Medium',
    reason: 'Consistent progress - focus on complex molecular structures',
    color: '#10b981',
    icon: '⚗️',
    detailedPlan: {
      currentLevel: 'i+1',
      nextMilestone: 'Master organic chemistry nomenclature',
      weeklyBreakdown: [
        { day: 'Monday', duration: '15 min', topic: 'Functional Groups Review', type: 'i' },
        { day: 'Tuesday', duration: '15 min', topic: 'IUPAC Naming Conventions', type: 'i+1' },
        { day: 'Thursday', duration: '15 min', topic: 'Isomers & Stereochemistry', type: 'i+1' },
        { day: 'Saturday', duration: '15 min', topic: 'Reaction Mechanisms', type: 'i+2' }
      ],
      specificTopics: [
        { name: 'Alkanes & Alkenes', difficulty: 'i', status: 'Completed', progress: 100 },
        { name: 'Functional Group Identification', difficulty: 'i+1', status: 'In Progress', progress: 45 },
        { name: 'Stereoisomers', difficulty: 'i+1', status: 'Ready', progress: 0 },
        { name: 'Nucleophilic Substitution', difficulty: 'i+2', status: 'Locked', progress: 0 }
      ],
      aiInsights: [
        'Vocabulary acquisition in chemistry is above average - leverage this strength',
        'Visual learning aids recommended for stereochemistry (use 3D models)',
        'Space out sessions to 15 min each for optimal retention of nomenclature rules'
      ]
    }
  },
  {
    subject: 'History',
    recommendedTime: '40 min/week',
    sessions: 3,
    priority: 'Medium',
    reason: 'Build consistency with shorter, frequent study sessions',
    color: '#8b5cf6',
    icon: '📚',
    detailedPlan: {
      currentLevel: 'i',
      nextMilestone: 'Complete World War II timeline and causes',
      weeklyBreakdown: [
        { day: 'Tuesday', duration: '15 min', topic: 'Pre-War Political Climate', type: 'i' },
        { day: 'Thursday', duration: '12 min', topic: 'Major Battles & Turning Points', type: 'i+1' },
        { day: 'Sunday', duration: '13 min', topic: 'Post-War Consequences', type: 'i+1' }
      ],
      specificTopics: [
        { name: 'Treaty of Versailles Impact', difficulty: 'i', status: 'In Progress', progress: 70 },
        { name: 'Rise of Totalitarian Regimes', difficulty: 'i+1', status: 'Ready', progress: 0 },
        { name: 'D-Day & Operation Overlord', difficulty: 'i+1', status: 'Locked', progress: 0 },
        { name: 'Cold War Origins', difficulty: 'i+2', status: 'Locked', progress: 0 }
      ],
      aiInsights: [
        'Historical context retention is improving - keep connecting events causally',
        'Last studied 2 days ago - maintain 3x weekly schedule to prevent knowledge decay',
        'Consider creating timeline visualizations to improve retention by 40%'
      ]
    }
  },
  {
    subject: 'Physics',
    recommendedTime: '50 min/week',
    sessions: 4,
    priority: 'High',
    reason: 'Excellent consistency (88%) - ready for advanced topics',
    color: '#f59e0b',
    icon: '⚡',
    detailedPlan: {
      currentLevel: 'i+1',
      nextMilestone: 'Master electromagnetism fundamentals',
      weeklyBreakdown: [
        { day: 'Monday', duration: '12 min', topic: 'Electric Fields & Forces', type: 'i+1' },
        { day: 'Wednesday', duration: '13 min', topic: 'Magnetic Fields & Induction', type: 'i+1' },
        { day: 'Thursday', duration: '12 min', topic: 'Circuits & Ohm\'s Law', type: 'i+1' },
        { day: 'Saturday', duration: '13 min', topic: 'Electromagnetic Waves', type: 'i+2' }
      ],
      specificTopics: [
        { name: 'Coulomb\'s Law', difficulty: 'i+1', status: 'In Progress', progress: 80 },
        { name: 'Electric Potential Energy', difficulty: 'i+1', status: 'Ready', progress: 0 },
        { name: 'Faraday\'s Law of Induction', difficulty: 'i+2', status: 'Ready', progress: 0 },
        { name: 'Maxwell\'s Equations (Intro)', difficulty: 'i+2', status: 'Locked', progress: 0 }
      ],
      aiInsights: [
        'Your physics consistency (88%) is outstanding - you\'re ahead of schedule',
        'Strong mathematical foundation makes you ready for i+2 electromagnetic content',
        'Consider challenging yourself with problem-solving competitions to maintain engagement'
      ]
    }
  },
  {
    subject: 'Biology',
    recommendedTime: '35 min/week',
    sessions: 5,
    priority: 'High',
    reason: 'Needs attention - break into 5-7 min daily micro-sessions',
    color: '#ec4899',
    icon: '🧬',
    detailedPlan: {
      currentLevel: 'i',
      nextMilestone: 'Build foundation in cellular processes',
      weeklyBreakdown: [
        { day: 'Monday', duration: '7 min', topic: 'Cell Structure Review', type: 'i' },
        { day: 'Tuesday', duration: '7 min', topic: 'Mitosis Phases', type: 'i' },
        { day: 'Wednesday', duration: '7 min', topic: 'Meiosis vs Mitosis', type: 'i+1' },
        { day: 'Friday', duration: '7 min', topic: 'DNA Replication Basics', type: 'i+1' },
        { day: 'Sunday', duration: '7 min', topic: 'Practice & Review', type: 'i' }
      ],
      specificTopics: [
        { name: 'Organelle Functions', difficulty: 'i', status: 'In Progress', progress: 40 },
        { name: 'Cell Division Overview', difficulty: 'i', status: 'Ready', progress: 0 },
        { name: 'Chromosomes & Genetics Intro', difficulty: 'i+1', status: 'Locked', progress: 0 },
        { name: 'Protein Synthesis', difficulty: 'i+1', status: 'Locked', progress: 0 }
      ],
      aiInsights: [
        'Lower mastery (62%) detected - micro-sessions (5-7 min) recommended to prevent overwhelm',
        'Last studied 3 days ago - immediate action needed to prevent further knowledge decay',
        'Visual flashcards showing cellular processes could boost retention by 35%'
      ]
    }
  }
];

// Subject breakdown data for analytics modal
const subjectBreakdown = {
  avgSession: [
    { subject: 'Math', value: 12, color: '#3b82f6', mastery: 85, consistency: 92 },
    { subject: 'Chemistry', value: 8, color: '#10b981', mastery: 72, consistency: 78 },
    { subject: 'History', value: 5, color: '#8b5cf6', mastery: 68, consistency: 65 },
    { subject: 'Physics', value: 9, color: '#f59e0b', mastery: 79, consistency: 88 },
    { subject: 'Biology', value: 6, color: '#ec4899', mastery: 62, consistency: 71 }
  ],
  comprehension: [
    { subject: 'Math', value: 18, color: '#3b82f6', mastery: 85, rate: '+18%' },
    { subject: 'Chemistry', value: 12, color: '#10b981', mastery: 72, rate: '+12%' },
    { subject: 'History', value: 8, color: '#8b5cf6', mastery: 68, rate: '+8%' },
    { subject: 'Physics', value: 15, color: '#f59e0b', mastery: 79, rate: '+15%' },
    { subject: 'Biology', value: 10, color: '#ec4899', mastery: 62, rate: '+10%' }
  ],
  words: [
    { subject: 'Math', value: 85, color: '#3b82f6', mastery: 85, newTerms: 15 },
    { subject: 'Chemistry', value: 92, color: '#10b981', mastery: 72, newTerms: 22 },
    { subject: 'History', value: 68, color: '#8b5cf6', mastery: 68, newTerms: 18 },
    { subject: 'Physics', value: 45, color: '#f59e0b', mastery: 79, newTerms: 8 },
    { subject: 'Biology', value: 30, color: '#ec4899', mastery: 62, newTerms: 5 }
  ],
  streak: [
    { subject: 'Math', value: 12, color: '#3b82f6', mastery: 85, lastStudied: 'Today' },
    { subject: 'Chemistry', value: 8, color: '#10b981', mastery: 72, lastStudied: 'Today' },
    { subject: 'History', value: 5, color: '#8b5cf6', mastery: 68, lastStudied: '2 days ago' },
    { subject: 'Physics', value: 12, color: '#f59e0b', mastery: 79, lastStudied: 'Today' },
    { subject: 'Biology', value: 3, color: '#ec4899', mastery: 62, lastStudied: '3 days ago' }
  ]
};

export function Dashboard({ userLevel }: DashboardProps) {
  const [selectedStat, setSelectedStat] = useState<'avgSession' | 'comprehension' | 'words' | 'streak' | null>(null);
  const [selectedPlanSubject, setSelectedPlanSubject] = useState<string | null>(null);
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);

  const getStatTitle = (stat: string) => {
    switch (stat) {
      case 'avgSession': return 'Session Time Analysis';
      case 'comprehension': return 'Comprehension Growth';
      case 'words': return 'Vocabulary Breakdown';
      case 'streak': return 'Study Consistency';
      default: return 'Analytics';
    }
  };

  const getRecommendations = (stat: string) => {
    const data = subjectBreakdown[stat as keyof typeof subjectBreakdown];
    const sorted = [...data].sort((a, b) => a.mastery - b.mastery);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];

    switch (stat) {
      case 'avgSession':
        return [
          `Focus on ${weakest.subject} - Your average session is ${weakest.value} min with ${weakest.mastery}% mastery`,
          `${strongest.subject} is going well! Consider challenging yourself with i+2 level content`,
          `Aim for 10-15 minute sessions in ${weakest.subject} to build consistency`
        ];
      case 'comprehension':
        return [
          `${weakest.subject} shows slower growth (${weakest.rate}). Try breaking concepts into smaller chunks`,
          `Your ${strongest.subject} comprehension is excellent! You're ready for advanced topics`,
          `Consider mixing i+1 and i content in ${weakest.subject} to build confidence`
        ];
      case 'words':
        return [
          `${weakest.subject} needs vocabulary attention - Only ${weakest.value} words learned`,
          `Great progress in ${strongest.subject} with ${strongest.value} terms mastered!`,
          `Use flashcard mode for ${weakest.subject} to accelerate vocabulary acquisition`
        ];
      case 'streak':
        return [
          `${weakest.subject} hasn't been studied in ${weakest.value === 3 ? '3 days' : 'a while'} - Risk of knowledge decay`,
          `Excellent consistency in ${strongest.subject}! Keep the momentum going`,
          `Try studying ${weakest.subject} for just 5 minutes daily to rebuild your streak`
        ];
      default:
        return [];
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
          <h1 className="text-3xl text-white mb-2">Learning Analytics</h1>
          <p className="text-slate-400">Track your progress and achievements</p>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <StatCard
              icon={Clock}
              label="Avg Session"
              value={`${mockStats.averageSession} min`}
              color="from-blue-500 to-cyan-500"
              delay={0}
              onClick={() => setSelectedStat('avgSession')}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <StatCard
              icon={TrendingUp}
              label="Comprehension"
              value={`+${mockStats.comprehensionIncrease}%`}
              color="from-emerald-500 to-teal-500"
              delay={0.1}
              onClick={() => setSelectedStat('comprehension')}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <StatCard
              icon={Brain}
              label="Words Learned"
              value={mockStats.wordsLearned.toString()}
              color="from-purple-500 to-pink-500"
              delay={0.2}
              onClick={() => setSelectedStat('words')}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <StatCard
              icon={Flame}
              label="Streak"
              value={`${mockStats.streakDays} days`}
              color="from-orange-500 to-red-500"
              delay={0.3}
              onClick={() => setSelectedStat('streak')}
            />
          </motion.div>
        </div>

        {/* Learning Curve Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-white">Your Learning Curve</h2>
              <Badge className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white border-0">
                Level i+{userLevel}
              </Badge>
            </div>

            <div className="space-y-4">
              {learningCurve.map((level, index) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${
                        level.level === 'i' ? 'from-emerald-500 to-teal-500' :
                        level.level === 'i+1' ? 'from-blue-500 to-purple-500' :
                        'from-purple-500 to-pink-500'
                      } text-white text-xs`}>
                        {level.level}
                      </div>
                      <span className="text-slate-300">{level.topics} topics</span>
                    </div>
                    <span className="text-white">{level.mastery}% mastery</span>
                  </div>
                  <div className="relative">
                    <Progress value={level.mastery} className="h-2" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <div className="text-white text-sm mb-1">i→i+1→i+2 Progression</div>
                  <div className="text-slate-400 text-xs">
                    You're advancing through difficulty levels at an optimal pace. Keep up the great work!
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl text-white">Achievements</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className={`p-4 rounded-xl border transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                      : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.name.split(' ')[0]}</div>
                  <div className="text-white text-sm mb-1">
                    {achievement.name.split(' ').slice(1).join(' ')}
                  </div>
                  <div className="text-slate-400 text-xs">{achievement.description}</div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl text-white">Recent Activity</h2>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="rounded-xl bg-white/5 border border-white/5 overflow-hidden"
                >
                  {/* Activity Header - Clickable */}
                  <motion.div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setExpandedActivity(expandedActivity === index ? null : index)}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white">{activity.date}</span>
                        <motion.div
                          animate={{ rotate: expandedActivity === index ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </motion.div>
                        {expandedActivity !== index && (
                          <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-slate-500"
                          >
                            Click to view details
                          </motion.span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {activity.topics.map((topic) => (
                          <Badge
                            key={topic}
                            variant="secondary"
                            className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-emerald-400">{activity.time} min</div>
                      <div className="text-xs text-slate-400">study time</div>
                    </div>
                  </motion.div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedActivity === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                          {activity.sessions.map((session, sessionIndex) => (
                            <motion.div
                              key={sessionIndex}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: sessionIndex * 0.1 }}
                              className="p-4 rounded-lg bg-white/5 border border-white/5"
                            >
                              {/* Session Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-white">{session.topic}</h4>
                                    <Badge 
                                      className={`text-xs border-0 ${
                                        session.difficulty === 'i' ? 'bg-emerald-500/20 text-emerald-300' :
                                        session.difficulty === 'i+1' ? 'bg-blue-500/20 text-blue-300' :
                                        'bg-purple-500/20 text-purple-300'
                                      }`}
                                    >
                                      {session.difficulty}
                                    </Badge>
                                  </div>
                                  <p className="text-slate-400 text-xs">{session.timeOfDay}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-emerald-400">{session.duration} min</div>
                                </div>
                              </div>

                              {/* Progress Description */}
                              <div className="flex items-start gap-2 mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-slate-300 text-sm">{session.progress}</p>
                              </div>

                              {/* Session Stats */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-white/5">
                                  <div className="text-slate-400 text-xs mb-1">Cards Completed</div>
                                  <div className="text-white">{session.cardsCompleted}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5">
                                  <div className="text-slate-400 text-xs mb-1">Accuracy</div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-white">{session.accuracy}%</div>
                                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${session.accuracy}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className={`h-full ${
                                          session.accuracy >= 85 ? 'bg-emerald-400' :
                                          session.accuracy >= 70 ? 'bg-blue-400' :
                                          'bg-yellow-400'
                                        }`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}

                          {/* Daily Summary */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 mt-4"
                          >
                            <div className="text-xs text-slate-300">
                              <span className="text-emerald-400">Great progress!</span> You completed {activity.sessions.reduce((sum, s) => sum + s.cardsCompleted, 0)} cards across {activity.sessions.length} sessions with an average accuracy of {Math.round(activity.sessions.reduce((sum, s) => sum + s.accuracy, 0) / activity.sessions.length)}%.
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Daily Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl text-white mb-1">Daily Goal</h3>
                <p className="text-slate-400 text-sm">{mockStats.dailyTime} / {mockStats.dailyGoal} minutes</p>
              </div>
              <div className="text-3xl">☀️</div>
            </div>
            <Progress value={(mockStats.dailyTime / mockStats.dailyGoal) * 100} className="h-3" />
            <p className="text-slate-400 text-sm mt-3">
              {mockStats.dailyGoal - mockStats.dailyTime} more minutes to complete today's goal!
            </p>
          </Card>
        </motion.div>

        {/* Weekly Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-emerald-500/10 backdrop-blur-sm border-blue-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl text-white mb-1">Weekly Goal</h3>
                <p className="text-slate-400 text-sm">{mockStats.weeklyTime} / {mockStats.weeklyGoal} minutes</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
            <Progress value={(mockStats.weeklyTime / mockStats.weeklyGoal) * 100} className="h-3" />
            <p className="text-slate-400 text-sm mt-3">
              {mockStats.weeklyGoal - mockStats.weeklyTime} more minutes to reach your weekly goal!
            </p>
          </Card>
        </motion.div>

        {/* Monthly Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border-orange-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl text-white mb-1">Monthly Goal</h3>
                <p className="text-slate-400 text-sm">{mockStats.monthlyTime} / {mockStats.monthlyGoal} minutes</p>
              </div>
              <div className="text-3xl">🗓️</div>
            </div>
            <Progress value={(mockStats.monthlyTime / mockStats.monthlyGoal) * 100} className="h-3" />
            <p className="text-slate-400 text-sm mt-3">
              {mockStats.monthlyGoal - mockStats.monthlyTime} more minutes to achieve your monthly goal!
            </p>
          </Card>
        </motion.div>

        {/* Future Planning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl text-white">AI Study Planning</h2>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-500/30">
              <p className="text-slate-200 text-sm">
                Based on your learning patterns and mastery levels, here's how you should allocate your study time this week:
              </p>
            </div>

            <div className="space-y-4">
              {futurePlanning.map((plan, index) => (
                <motion.div
                  key={plan.subject}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  className="p-5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
                  onClick={() => setSelectedPlanSubject(plan.subject)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{plan.icon}</div>
                      <div>
                        <h3 className="text-white">{plan.subject}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={`text-xs border-0 ${
                              plan.priority === 'High' 
                                ? 'bg-red-500/20 text-red-300' 
                                : 'bg-yellow-500/20 text-yellow-300'
                            }`}
                          >
                            {plan.priority} Priority
                          </Badge>
                          <span className="text-slate-400 text-xs">{plan.sessions}x sessions/week</span>
                        </div>
                      </div>
                    </div>
                    <div 
                      className="px-4 py-2 rounded-full text-white text-sm"
                      style={{ backgroundColor: plan.color + '40', borderColor: plan.color + '60' }}
                    >
                      {plan.recommendedTime}
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm pl-11">{plan.reason}</p>
                  <div className="pl-11 mt-2">
                    <span className="text-blue-400 text-xs">Click for detailed study plan →</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-emerald-300 text-sm mb-1">AI Learning Tip</div>
                  <div className="text-slate-300 text-xs">
                    This plan adapts weekly based on your progress. Shorter, frequent sessions are recommended for subjects with lower mastery to prevent cognitive overload while maintaining engagement.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Analytics Detail Modal */}
      <AnimatePresence>
        {selectedStat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedStat(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-white/10 rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl text-white mb-2">{getStatTitle(selectedStat)}</h2>
                  <p className="text-slate-400">Subject breakdown and personalized recommendations</p>
                </div>
                <button
                  onClick={() => setSelectedStat(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Bar Chart */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                  <h3 className="text-white mb-4">Distribution by Subject</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={subjectBreakdown[selectedStat]}>
                      <XAxis 
                        dataKey="subject" 
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {subjectBreakdown[selectedStat].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Pie Chart */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                  <h3 className="text-white mb-4">Proportion Overview</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={subjectBreakdown[selectedStat]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ subject, percent }) => `${subject} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subjectBreakdown[selectedStat].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Subject Details */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 mb-6">
                <h3 className="text-white mb-4">Subject Performance</h3>
                <div className="space-y-3">
                  {[...subjectBreakdown[selectedStat]]
                    .sort((a, b) => b.value - a.value)
                    .map((subject, index) => (
                      <motion.div
                        key={subject.subject}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: subject.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-white mb-1 truncate">{subject.subject}</div>
                            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                              <span className="whitespace-nowrap">Mastery: {subject.mastery}%</span>
                              {selectedStat === 'comprehension' && <span className="whitespace-nowrap">Growth: {subject.rate}</span>}
                              {selectedStat === 'words' && <span className="whitespace-nowrap">New: +{subject.newTerms}</span>}
                              {selectedStat === 'streak' && <span className="whitespace-nowrap">Last: {subject.lastStudied}</span>}
                              {selectedStat === 'avgSession' && <span className="whitespace-nowrap">Consistency: {subject.consistency}%</span>}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl text-white whitespace-nowrap">
                              {subject.value}
                              {selectedStat === 'avgSession' && ' min'}
                              {selectedStat === 'comprehension' && '%'}
                              {selectedStat === 'streak' && ' days'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </Card>

              {/* AI Recommendations */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-emerald-500/10 backdrop-blur-sm border-blue-500/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-white">AI-Powered Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {getRecommendations(selectedStat).map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/5"
                    >
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">{recommendation}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-emerald-300 text-xs text-center">
                    💡 These recommendations are based on your learning curve and i+1 comprehensible input model
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study Plan Detail Modal */}
      <AnimatePresence>
        {selectedPlanSubject && (() => {
          const plan = futurePlanning.find(p => p.subject === selectedPlanSubject);
          if (!plan) return null;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPlanSubject(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 border border-white/10 rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{plan.icon}</div>
                    <div>
                      <h2 className="text-2xl text-white mb-1">{plan.subject} Study Plan</h2>
                      <p className="text-slate-400">AI-generated personalized learning path</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPlanSubject(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Current Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 p-4">
                    <div className="text-slate-400 text-sm mb-1">Current Level</div>
                    <div className="text-2xl text-white">{plan.detailedPlan.currentLevel}</div>
                  </Card>
                  <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 p-4">
                    <div className="text-slate-400 text-sm mb-1">Sessions/Week</div>
                    <div className="text-2xl text-white">{plan.sessions}x</div>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 p-4">
                    <div className="text-slate-400 text-sm mb-1">Total Time</div>
                    <div className="text-2xl text-white">{plan.recommendedTime}</div>
                  </Card>
                </div>

                {/* Next Milestone */}
                <Card className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20 p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-yellow-400 mb-1">Next Milestone</div>
                      <div className="text-white">{plan.detailedPlan.nextMilestone}</div>
                    </div>
                  </div>
                </Card>

                {/* Weekly Breakdown */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 mb-6">
                  <h3 className="text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    This Week's Schedule
                  </h3>
                  <div className="space-y-3">
                    {plan.detailedPlan.weeklyBreakdown.map((session, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 text-slate-300 text-sm">{session.day}</div>
                          <div className="flex-1">
                            <div className="text-white mb-1">{session.topic}</div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={`text-xs border-0 ${
                                  session.type === 'i' ? 'bg-emerald-500/20 text-emerald-300' :
                                  session.type === 'i+1' ? 'bg-blue-500/20 text-blue-300' :
                                  'bg-purple-500/20 text-purple-300'
                                }`}
                              >
                                {session.type}
                              </Badge>
                              <span className="text-slate-400 text-xs">{session.duration}</span>
                            </div>
                          </div>
                        </div>
                        <Clock className="w-5 h-5 text-slate-400" />
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Specific Topics */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 mb-6">
                  <h3 className="text-white mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Learning Topics
                  </h3>
                  <div className="space-y-3">
                    {plan.detailedPlan.specificTopics.map((topic, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className="p-4 rounded-xl bg-white/5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-white">{topic.name}</h4>
                              <Badge 
                                className={`text-xs border-0 ${
                                  topic.difficulty === 'i' ? 'bg-emerald-500/20 text-emerald-300' :
                                  topic.difficulty === 'i+1' ? 'bg-blue-500/20 text-blue-300' :
                                  'bg-purple-500/20 text-purple-300'
                                }`}
                              >
                                {topic.difficulty}
                              </Badge>
                            </div>
                            <div className="text-slate-400 text-sm mb-2">
                              Status: <span className={`${
                                topic.status === 'Completed' ? 'text-emerald-400' :
                                topic.status === 'In Progress' ? 'text-yellow-400' :
                                topic.status === 'Ready' ? 'text-blue-400' :
                                'text-slate-500'
                              }`}>{topic.status}</span>
                            </div>
                            {topic.progress > 0 && (
                              <div>
                                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                  <span>Progress</span>
                                  <span>{topic.progress}%</span>
                                </div>
                                <Progress value={topic.progress} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* AI Insights */}
                <Card className="bg-gradient-to-br from-blue-500/10 to-emerald-500/10 backdrop-blur-sm border-blue-500/20 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-white">AI Learning Insights</h3>
                  </div>
                  <div className="space-y-3">
                    {plan.detailedPlan.aiInsights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/5"
                      >
                        <Zap className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-300 text-sm">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-emerald-300 text-xs text-center">
                      💡 This plan adapts based on your progress and learning patterns
                    </p>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  delay: number;
  onClick: () => void;
}

function StatCard({ icon: Icon, label, value, color, delay, onClick }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="bg-white/5 backdrop-blur-sm border-white/10 p-4 hover:bg-white/10 transition-all cursor-pointer"
        onClick={onClick}
      >
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-2xl text-white mb-1 truncate">{value}</div>
        <div className="text-xs text-slate-400 truncate">{label}</div>
        <div className="text-xs text-blue-400 mt-2 whitespace-nowrap">Click for details →</div>
      </Card>
    </motion.div>
  );
}
