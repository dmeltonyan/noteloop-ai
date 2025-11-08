import { motion } from 'motion/react';
import { Brain, Zap, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface AdaptiveLearningExplainerProps {
  onContinue: () => void;
}

export function AdaptiveLearningExplainer({ onContinue }: AdaptiveLearningExplainerProps) {
  const levels = [
    {
      level: 'i',
      name: 'Comfortable',
      icon: Target,
      color: 'from-emerald-500 to-green-400',
      description: 'Content you already understand well. Perfect for review and reinforcement.',
      example: 'Review core concepts you\'ve mastered',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400'
    },
    {
      level: 'i+1',
      name: 'Optimal Challenge',
      icon: Zap,
      color: 'from-blue-500 to-cyan-400',
      description: 'Just beyond your current level. The sweet spot for efficient learning and growth.',
      example: 'New concepts built on what you know',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    {
      level: 'i+2',
      name: 'Stretch Zone',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-400',
      description: 'Challenging content that pushes your boundaries. Requires more effort but accelerates mastery.',
      example: 'Advanced topics to explore and expand',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-y-auto custom-scrollbar">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Icon */}
          <motion.div
            className="mb-6 inline-block"
            animate={{
              rotate: [0, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center mx-auto">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Adaptive AI Learning
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            NoteLoop AI uses comprehensible input theory to serve you content at the perfect difficulty level
          </p>
        </motion.div>

        {/* Learning Levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {levels.map((level, index) => {
            const Icon = level.icon;
            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${level.bgColor} backdrop-blur-sm border ${level.borderColor} rounded-3xl p-6 hover:scale-105 transition-transform`}
              >
                {/* Level Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs ${level.iconColor}`}>
                    {level.level}
                  </div>
                </div>

                <h3 className="text-xl text-white mb-2">{level.name}</h3>
                <p className="text-slate-300 text-sm mb-4">{level.description}</p>
                
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Example:</p>
                  <p className="text-sm text-slate-200">{level.example}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* How it Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-8"
        >
          <h2 className="text-2xl text-white mb-4 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-3">
                <span className="text-white">1</span>
              </div>
              <h3 className="text-white mb-2">We Analyze</h3>
              <p className="text-slate-400 text-sm">AI processes your notes to identify key concepts and difficulty levels</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-3">
                <span className="text-white">2</span>
              </div>
              <h3 className="text-white mb-2">You Learn</h3>
              <p className="text-slate-400 text-sm">Content adapts to your progress, serving optimal challenges</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-3">
                <span className="text-white">3</span>
              </div>
              <h3 className="text-white mb-2">We Adapt</h3>
              <p className="text-slate-400 text-sm">The system evolves with you, continuously optimizing your learning path</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button
            onClick={onContinue}
            className="bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full h-14 px-8"
          >
            Start Learning
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-slate-500 text-sm mt-4">
            Your personalized learning feed is being prepared...
          </p>
        </motion.div>
      </div>
    </div>
  );
}
