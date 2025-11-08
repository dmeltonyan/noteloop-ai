import { motion } from 'motion/react';
import { Home, Upload, TrendingUp, Users, User } from 'lucide-react';
import { Screen } from '../App';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const navItems = [
  { id: 'feed' as Screen, icon: Home, label: 'Feed' },
  { id: 'upload' as Screen, icon: Upload, label: 'Upload' },
  { id: 'dashboard' as Screen, icon: TrendingUp, label: 'Stats' },
  { id: 'social' as Screen, icon: Users, label: 'Social' },
  { id: 'profile' as Screen, icon: User, label: 'Profile' }
];

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-400/20 rounded-2xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isActive
                        ? 'text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text'
                        : 'text-slate-400'
                    }`}
                    style={isActive ? { 
                      stroke: 'url(#gradient)',
                      strokeWidth: 2
                    } : {}}
                  />
                  {isActive && (
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}
                </div>

                <span
                  className={`text-xs transition-colors relative ${
                    isActive
                      ? 'text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Gesture indicator */}
        <div className="h-1 w-32 mx-auto bg-white/10 rounded-full mb-2" />
      </div>
    </div>
  );
}
