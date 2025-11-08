import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface ThemeBackgroundProps {
  themeId: string;
  className?: string;
}

export function ThemeBackground({ themeId, className = '' }: ThemeBackgroundProps) {
  // Ensure the component has dimensions
  const fullClassName = `w-full h-full ${className}`;
  
  switch (themeId) {
    case 'starter':
      return <StarterTheme className={fullClassName} />;
    case 'ocean':
      return <OceanTheme className={fullClassName} />;
    case 'sunset':
      return <SunsetTheme className={fullClassName} />;
    case 'forest':
      return <ForestTheme className={fullClassName} />;
    case 'royal':
      return <RoyalTheme className={fullClassName} />;
    case 'cyber':
      return <CyberTheme className={fullClassName} />;
    case 'aurora':
      return <AuroraTheme className={fullClassName} />;
    case 'phoenix':
      return <PhoenixTheme className={fullClassName} />;
    case 'cosmic':
      return <CosmicTheme className={fullClassName} />;
    case 'legendary':
      return <LegendaryTheme className={fullClassName} />;
    default:
      return <StarterTheme className={fullClassName} />;
  }
}

// Starter Theme - Simple flowing circles
function StarterTheme({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 ${className}`}>
      {/* Floating circles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/20 backdrop-blur-sm"
          style={{
            width: 40 + i * 25,
            height: 40 + i * 25,
            left: `${10 + i * 10}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Ocean Theme - Animated waves
function OceanTheme({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500 ${className}`}>
      {/* Wave layers */}
      <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <motion.path
          d="M0,60 Q300,90 600,60 T1200,60 L1200,120 L0,120 Z"
          fill="rgba(255,255,255,0.2)"
          animate={{
            d: [
              "M0,60 Q300,90 600,60 T1200,60 L1200,120 L0,120 Z",
              "M0,80 Q300,50 600,80 T1200,80 L1200,120 L0,120 Z",
              "M0,60 Q300,90 600,60 T1200,60 L1200,120 L0,120 Z",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
      <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <motion.path
          d="M0,80 Q300,50 600,80 T1200,80 L1200,120 L0,120 Z"
          fill="rgba(255,255,255,0.15)"
          animate={{
            d: [
              "M0,80 Q300,50 600,80 T1200,80 L1200,120 L0,120 Z",
              "M0,60 Q300,90 600,60 T1200,60 L1200,120 L0,120 Z",
              "M0,80 Q300,50 600,80 T1200,80 L1200,120 L0,120 Z",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
      {/* Bubbles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/30 border-2 border-white/40"
          style={{
            width: 8 + i * 4,
            height: 8 + i * 4,
            left: `${8 + i * 8}%`,
            bottom: -20,
          }}
          animate={{
            y: [-20, -200],
            opacity: [1, 0],
            x: [0, (i % 2 === 0 ? 15 : -15)],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Sunset Theme - Rotating sun rays
function SunsetTheme({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 ${className}`}>
      {/* Sun rays */}
      <motion.div
        className="absolute -top-10 -right-10 w-48 h-48"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-2 h-24 bg-gradient-to-b from-yellow-200/50 to-transparent origin-top"
            style={{
              transform: `rotate(${i * 30}deg) translateX(-50%)`,
            }}
          />
        ))}
      </motion.div>
      {/* Glowing sun circle */}
      <motion.div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-yellow-300/30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-yellow-200/40 shadow-lg"
          style={{
            width: 6 + (i % 4) * 3,
            height: 6 + (i % 4) * 3,
            left: `${(i * 5) % 100}%`,
            top: `${(i * 7) % 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 2.5 + (i % 3) * 0.5,
            repeat: Infinity,
            delay: (i % 5) * 0.4,
          }}
        />
      ))}
    </div>
  );
}

// Forest Theme - Leaves falling
function ForestTheme({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-500 to-lime-400 ${className}`}>
      {/* Tree silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-900/40 to-transparent" />
      {/* Falling leaves */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${5 + i * 6.5}%`,
            top: -30,
          }}
          animate={{
            y: [0, 250],
            rotate: [0, 360, 720],
            x: [0, (i % 2 === 0 ? 40 : -40), 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 20 20">
            <path
              d="M10 0 Q15 5 10 10 Q5 5 10 0 M10 10 Q15 15 10 20 Q5 15 10 10"
              fill="rgba(255,255,255,0.4)"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.5"
            />
          </svg>
        </motion.div>
      ))}
      {/* Light beams */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 w-20 h-full bg-gradient-to-b from-yellow-200/20 to-transparent blur-sm"
          style={{
            left: `${15 + i * 25}%`,
            transform: 'skewX(-12deg)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: i * 0.9,
          }}
        />
      ))}
    </div>
  );
}

// Royal Theme - Crown jewels and sparkles
function RoyalTheme({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 ${className}`}>
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-400/20 via-transparent to-transparent" />
      
      {/* Diamond grid pattern */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(4)].map((_, row) => (
          <div key={row} className="flex justify-around" style={{ marginTop: row * 35 }}>
            {[...Array(6)].map((_, col) => (
              <motion.div
                key={col}
                className="w-5 h-5 border-2 border-white/60"
                style={{ transform: 'rotate(45deg)' }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: (row + col) * 0.15,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Floating jewels */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + i * 8}%`,
            top: `${15 + (i % 4) * 22}%`,
          }}
          animate={{
            y: [-15, 15, -15],
            rotate: [0, 180, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-8 h-8 bg-white/40 transform rotate-45 shadow-lg" style={{
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)'
          }} />
        </motion.div>
      ))}
    </div>
  );
}

// Cyber Theme - Matrix-style digital rain and grid
function CyberTheme({ className }: { className: string }) {
  const [digits, setDigits] = useState<Array<{ id: number; x: number; delay: number; char: string }>>([]);

  useEffect(() => {
    const chars = ['0', '1', '█', '▓', '▒'];
    const newDigits = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: (i * 3.3) % 100,
      delay: Math.random() * 2,
      char: chars[Math.floor(Math.random() * chars.length)],
    }));
    setDigits(newDigits);
  }, []);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 ${className}`}>
      {/* Cyber grid */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="cyber-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cyber-grid)" />
        </svg>
      </div>
      
      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
        style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)' }}
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Digital rain */}
      {digits.map((digit) => (
        <motion.div
          key={digit.id}
          className="absolute text-cyan-200 font-mono text-sm font-bold"
          style={{ 
            left: `${digit.x}%`, 
            top: -20,
            textShadow: '0 0 10px rgba(34, 211, 238, 0.8)'
          }}
          animate={{
            y: [0, 250],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: digit.delay,
            ease: "linear",
          }}
        >
          {digit.char}
        </motion.div>
      ))}
      
      {/* Glowing nodes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 rounded-full bg-cyan-300"
          style={{
            left: `${15 + i * 12}%`,
            top: `${25 + (i % 3) * 25}%`,
            boxShadow: '0 0 25px rgba(34, 211, 238, 1)',
          }}
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Aurora Theme - Northern lights shimmer
function AuroraTheme({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 ${className}`}>
      {/* Aurora waves */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-x-0 h-32 opacity-40 blur-xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${
              i % 3 === 0 ? 'rgba(34, 197, 94, 0.6)' : 
              i % 3 === 1 ? 'rgba(59, 130, 246, 0.6)' : 
              'rgba(168, 85, 247, 0.6)'
            }, transparent)`,
            top: `${i * 20}%`,
          }}
          animate={{
            x: ['-100%', '200%'],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 6 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
        />
      ))}
      
      {/* Stars */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
            height: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
            left: `${(i * 3.3) % 100}%`,
            top: `${(i * 7) % 100}%`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 1.5 + (i % 3),
            repeat: Infinity,
            delay: (i % 4) * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// Phoenix Theme - Rising flames
function PhoenixTheme({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 ${className}`}>
      {/* Flame particles */}
      {[...Array(35)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-sm"
          style={{
            width: 12 + (i % 5) * 6,
            height: 12 + (i % 5) * 6,
            left: `${(i * 2.8) % 100}%`,
            bottom: -30,
            background: `radial-gradient(circle, ${
              i % 3 === 0 ? '#fef3c7' : i % 3 === 1 ? '#fdba74' : '#f87171'
            }, transparent)`,
          }}
          animate={{
            y: [-30, -280],
            x: [0, (i % 2 === 0 ? 40 : -40)],
            opacity: [1, 0.8, 0],
            scale: [1, 1.5, 0.5],
          }}
          transition={{
            duration: 1.5 + (i % 3) * 0.5,
            repeat: Infinity,
            delay: (i % 5) * 0.2,
            ease: "easeOut",
          }}
        />
      ))}
      
      {/* Heat waves */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`heat-${i}`}
          className="absolute inset-x-0 h-20 bg-gradient-to-t from-orange-300/20 to-transparent blur-md"
          style={{
            bottom: `${i * 30}%`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scaleY: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.7,
          }}
        />
      ))}
      
      {/* Phoenix silhouette with glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 100 100">
          <path
            d="M50 20 Q60 30 50 45 Q40 30 50 20 M30 35 Q40 45 30 60 M70 35 Q60 45 70 60 M50 45 L50 80 M35 70 Q45 75 50 80 M65 70 Q55 75 50 80"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2.5"
            fill="none"
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}

// Cosmic Theme - Galaxy with rotating stars
function CosmicTheme({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500 ${className}`}>
      {/* Rotating galaxy */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(60)].map((_, i) => {
          const angle = (i / 60) * Math.PI * 2;
          const radius = 15 + (i % 6) * 18;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: i % 4 === 0 ? 3 : 2,
                height: i % 4 === 0 ? 3 : 2,
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
              }}
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [1, 2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.025,
              }}
            />
          );
        })}
      </motion.div>
      
      {/* Nebula clouds */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: 180,
            height: 180,
            left: `${20 + i * 22}%`,
            top: `${25 + (i % 2) * 35}%`,
            background: `radial-gradient(circle, ${
              i === 0 ? 'rgba(139, 92, 246, 0.4)' : 
              i === 1 ? 'rgba(236, 72, 153, 0.4)' : 
              i === 2 ? 'rgba(59, 130, 246, 0.4)' :
              'rgba(168, 85, 247, 0.4)'
            }, transparent)`,
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 7 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Shooting stars */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: '0%',
            top: `${20 + i * 30}%`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 1)',
          }}
          animate={{
            x: [0, 300],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Legendary Theme - Ultimate shimmer with all effects
function LegendaryTheme({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 ${className}`}>
      {/* Radial pulse */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)',
        }}
        animate={{
          scale: [1, 1.6, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
        }}
      />
      
      {/* Rainbow rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: 100 + i * 80,
            height: 100 + i * 80,
            borderColor: i === 0 ? 'rgba(251, 191, 36, 0.3)' : i === 1 ? 'rgba(236, 72, 153, 0.3)' : 'rgba(168, 85, 247, 0.3)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}
      
      {/* Diamond rain */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${(i * 2.5) % 100}%`,
            top: -30,
          }}
          animate={{
            y: [0, 350],
            rotate: [0, 720],
            opacity: [0, 1, 1, 0],
            scale: [0.3, 1.2, 0.3],
          }}
          transition={{
            duration: 3 + (i % 3) * 0.5,
            repeat: Infinity,
            delay: (i % 8) * 0.3,
            ease: "linear",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 20 20">
            <path
              d="M10 0 L15 7 L10 20 L5 7 Z"
              fill="rgba(255,255,255,0.7)"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1"
              filter="url(#diamond-glow)"
            />
            <defs>
              <filter id="diamond-glow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>
        </motion.div>
      ))}
      
      {/* Sparkle bursts */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${12 + i * 9}%`,
            top: `${18 + (i % 4) * 22}%`,
          }}
        >
          {[...Array(8)].map((_, j) => (
            <motion.div
              key={j}
              className="absolute w-1.5 h-6 bg-gradient-to-t from-white to-yellow-200 rounded-full origin-bottom"
              style={{
                transform: `rotate(${j * 45}deg)`,
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
              }}
              animate={{
                scaleY: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.25 + j * 0.08,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      ))}
      
      {/* Golden particles */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full bg-yellow-100"
          style={{
            left: `${(i * 2) % 100}%`,
            top: `${(i * 3.7) % 100}%`,
            boxShadow: '0 0 12px rgba(251, 191, 36, 1)',
          }}
          animate={{
            scale: [0, 2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: (i % 10) * 0.25,
          }}
        />
      ))}
    </div>
  );
}
