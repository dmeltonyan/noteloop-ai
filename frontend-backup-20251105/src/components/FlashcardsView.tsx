import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, Check, X, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface FlashcardsViewProps {
  onBack: () => void;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const mockFlashcards: Flashcard[] = [
  {
    id: '1',
    front: 'What is a Neural Network?',
    back: 'A computing system inspired by biological neural networks, consisting of interconnected nodes that process information.',
    explanation: 'Neural networks learn patterns from data through training, adjusting connection weights to improve accuracy.',
    topic: 'Machine Learning',
    difficulty: 'medium'
  },
  {
    id: '2',
    front: 'Define Backpropagation',
    back: 'An algorithm used to calculate gradients and update weights in a neural network by propagating errors backwards.',
    explanation: 'It\'s essential for training deep learning models, allowing networks to learn from their mistakes.',
    topic: 'Machine Learning',
    difficulty: 'hard'
  },
  {
    id: '3',
    front: 'What is Overfitting?',
    back: 'When a model learns training data too well, including noise, and performs poorly on new data.',
    explanation: 'Prevented through techniques like regularization, dropout, and cross-validation.',
    topic: 'Machine Learning',
    difficulty: 'medium'
  },
  {
    id: '4',
    front: 'What is ReLU?',
    back: 'Rectified Linear Unit - an activation function that outputs the input if positive, otherwise zero.',
    explanation: 'Most popular activation function in deep learning due to computational efficiency and performance.',
    topic: 'Machine Learning',
    difficulty: 'easy'
  }
];

export function FlashcardsView({ onBack }: FlashcardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [cards, setCards] = useState(mockFlashcards);
  const [masteredCount, setMasteredCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setShowExplanation(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setMasteredCount(masteredCount + 1);
    } else {
      setReviewCount(reviewCount + 1);
    }

    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
      setIsFlipped(false);
      setShowExplanation(false);
    }, 300);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-emerald-500 to-teal-500';
      case 'medium': return 'from-blue-500 to-purple-500';
      case 'hard': return 'from-purple-500 to-pink-500';
      default: return 'from-blue-500 to-emerald-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <div className="text-white">AI Flashcards</div>
            <div className="text-sm text-slate-400">
              {currentIndex + 1} of {cards.length}
            </div>
          </div>
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setShowExplanation(false);
            }}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Check}
            label="Mastered"
            value={masteredCount}
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            icon={Clock}
            label="Review"
            value={reviewCount}
            color="from-amber-500 to-orange-500"
          />
          <StatCard
            icon={RotateCcw}
            label="Remaining"
            value={cards.length - currentIndex - 1}
            color="from-blue-500 to-purple-500"
          />
        </div>

        {/* Flashcard */}
        <div className="relative h-[500px] mb-8 perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="absolute inset-0 cursor-pointer preserve-3d"
              onClick={handleFlip}
            >
              {/* Front */}
              <div
                className="absolute inset-0 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="h-full rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-8 flex flex-col">
                  <div className={`inline-block self-start px-4 py-2 rounded-full bg-gradient-to-r ${getDifficultyColor(currentCard.difficulty)} text-white text-sm mb-4`}>
                    {currentCard.topic}
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-2xl text-white text-center">
                      {currentCard.front}
                    </p>
                  </div>

                  <div className="text-center text-slate-400 text-sm">
                    Tap to reveal answer
                  </div>
                </div>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 backface-hidden"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="h-full rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-8 flex flex-col">
                  <div className={`inline-block self-start px-4 py-2 rounded-full bg-gradient-to-r ${getDifficultyColor(currentCard.difficulty)} text-white text-sm mb-4`}>
                    Answer
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center space-y-6">
                    <p className="text-xl text-white">
                      {currentCard.back}
                    </p>

                    {showExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10"
                      >
                        <div className="text-sm text-emerald-400 mb-2">💡 AI Explanation</div>
                        <p className="text-slate-300 text-sm">
                          {currentCard.explanation}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {!showExplanation && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowExplanation(true);
                      }}
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                    >
                      Show AI Explanation
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <motion.button
              onClick={() => handleSwipe('left')}
              className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Clock className="w-8 h-8 mx-auto mb-2 text-amber-400" />
              <div className="text-white">Review Later</div>
              <div className="text-slate-400 text-sm">Need more practice</div>
            </motion.button>

            <motion.button
              onClick={() => handleSwipe('right')}
              className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <div className="text-white">I Got It!</div>
              <div className="text-slate-400 text-sm">Mark as mastered</div>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl text-white mb-1">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
