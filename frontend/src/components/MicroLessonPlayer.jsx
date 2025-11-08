import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import '../styles/micro_lesson.css'

export const MicroLessonPlayer = ({ video, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [revealedText, setRevealedText] = useState('')
  const [showFullScript, setShowFullScript] = useState(false)

  const utteranceRef = useRef(null)
  const timerRef = useRef(null)
  const textRevealRef = useRef(null)

  useEffect(() => {
    if (!video?.script) return

    // Calculate duration based on word count
    const wordCount = video.script.split(' ').length
    const estimatedDuration = (wordCount / 150) * 60 // 150 words per minute
    setDuration(estimatedDuration)

    // Load voices
    speechSynthesis.getVoices()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (textRevealRef.current) clearInterval(textRevealRef.current)
      speechSynthesis.cancel()
    }
  }, [video])

  const handlePlay = () => {
    if (!video?.script) return

    const utterance = new SpeechSynthesisUtterance(video.script)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = isMuted ? 0 : 1.0

    const voices = speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0]
    
    if (preferredVoice) utterance.voice = preferredVoice

    utterance.onstart = () => {
      setIsPlaying(true)
      
      // Progress timer
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1
          if (newTime >= duration) {
            clearInterval(timerRef.current)
            return duration
          }
          return newTime
        })
      }, 100)

      // Animated text reveal
      const words = video.script.split(' ')
      let wordIndex = 0
      const wordsPerSecond = 150 / 60 // 2.5 words per second
      const revealInterval = 1000 / wordsPerSecond

      textRevealRef.current = setInterval(() => {
        if (wordIndex < words.length) {
          setRevealedText(words.slice(0, wordIndex + 1).join(' '))
          wordIndex++
        } else {
          clearInterval(textRevealRef.current)
          setShowFullScript(true)
        }
      }, revealInterval)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setShowFullScript(true)
      if (timerRef.current) clearInterval(timerRef.current)
      if (textRevealRef.current) clearInterval(textRevealRef.current)
      setTimeout(() => onComplete?.(), 1000)
    }

    utterance.onerror = (e) => {
      console.error('❌ TTS error:', e)
      setIsPlaying(false)
      setShowFullScript(true)
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  const handlePause = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (textRevealRef.current) clearInterval(textRevealRef.current)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 1.0 : 0
    }
  }

  if (!video) {
    return (
      <div className="micro-lesson-player-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="micro-lesson-player-container">
      {/* Visual Area */}
      <div className="visual-render-area">
        {/* Animated Gradient Background */}
        <div className="gradient-overlay"></div>
        
        {/* Floating Particles */}
        <div className="floating-particles">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`
              }}
            ></div>
          ))}
        </div>

        {/* Content Display */}
        <div className="content-display">
          {/* Title */}
          <div className="lesson-title-wrapper">
            <h2 className="lesson-title">{video.title}</h2>
          </div>

          {/* Animated Script Text */}
          <div className="script-display">
            {isPlaying && !showFullScript ? (
              <div className="animated-text">
                {revealedText}
                <span className="text-cursor">|</span>
              </div>
            ) : showFullScript ? (
              <div className="full-text">{video.script}</div>
            ) : (
              <div className="ready-text">
                <Play size={48} className="play-icon-large" />
                <p>Click play to start learning</p>
              </div>
            )}
          </div>

          {/* Audio Visualizer */}
          {isPlaying && (
            <div className="audio-visualizer">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="visualizer-bar"
                  style={{
                    animationDelay: `${i * 0.08}s`
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="lesson-controls">
        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
          <div className="time-display">
            <span>{Math.floor(currentTime)}s</span>
            <span className="time-separator">/</span>
            <span>{Math.floor(duration)}s</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="control-buttons">
          <button 
            className="control-button play-button"
            onClick={isPlaying ? handlePause : handlePlay}
          >
            {isPlaying ? (
              <>
                <Pause size={20} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span>Play Lesson</span>
              </>
            )}
          </button>

          <button 
            className="control-button mute-button"
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      <style>{`
        .micro-lesson-player-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1rem;
        }

        .visual-render-area {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: var(--border-radius-2xl);
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          background: #1a1a2e;
        }

        .gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            #667eea 0%, 
            #764ba2 25%,
            #f093fb 50%,
            #4facfe 75%,
            #00f2fe 100%
          );
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .floating-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          animation: floatParticle linear infinite;
        }

        @keyframes floatParticle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(var(--random-x, 50px)), calc(var(--random-y, -100px))) scale(0);
            opacity: 0;
          }
        }

        .content-display {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          background: linear-gradient(to top, 
            rgba(0,0,0,0.8) 0%, 
            rgba(0,0,0,0.4) 30%,
            transparent 100%
          );
        }

        .lesson-title-wrapper {
          text-align: center;
          margin-bottom: auto;
          padding-top: 1rem;
        }

        .lesson-title {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          text-shadow: 2px 2px 12px rgba(0,0,0,0.8);
          animation: fadeInDown 0.6s ease-out;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .script-display {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          margin: 1rem 0;
        }

        .animated-text {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          text-align: center;
          line-height: 1.8;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.9);
          animation: fadeIn 0.3s ease;
          max-width: 800px;
        }

        .text-cursor {
          display: inline-block;
          width: 2px;
          animation: blink 1s steps(2) infinite;
          margin-left: 4px;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .full-text {
          font-size: 1.25rem;
          font-weight: 500;
          color: white;
          text-align: center;
          line-height: 1.8;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.9);
          max-width: 800px;
          animation: fadeIn 0.5s ease;
        }

        .ready-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: white;
          animation: pulse 2s ease-in-out infinite;
        }

        .play-icon-large {
          width: 64px;
          height: 64px;
          opacity: 0.9;
        }

        .ready-text p {
          font-size: 1.25rem;
          font-weight: 600;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.9);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }

        .audio-visualizer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 60px;
          margin-top: auto;
        }

        .visualizer-bar {
          width: 6px;
          height: 12px;
          background: white;
          border-radius: 3px;
          animation: visualizerPulse 1s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }

        @keyframes visualizerPulse {
          0%, 100% { height: 12px; }
          50% { height: 48px; }
        }

        .lesson-controls {
          margin-top: 1.5rem;
          background: var(--color-card-bg);
          border-radius: var(--border-radius-xl);
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .progress-section {
          margin-bottom: 1.5rem;
        }

        .progress-bar-container {
          margin-bottom: 0.75rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
          transition: width 0.1s linear;
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.6);
        }

        .time-display {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          color: rgba(255,255,255,0.8);
          font-size: 0.9375rem;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        .time-separator {
          color: rgba(255,255,255,0.4);
        }

        .control-buttons {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .control-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .play-button {
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .play-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .play-button:active {
          transform: translateY(0);
        }

        .mute-button {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 0.875rem;
        }

        .mute-button:hover {
          background: rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .lesson-title {
            font-size: 1.5rem;
          }

          .animated-text,
          .full-text {
            font-size: 1.125rem;
          }

          .ready-text p {
            font-size: 1rem;
          }

          .control-button {
            padding: 0.75rem 1.25rem;
            font-size: 0.9375rem;
          }

          .content-display {
            padding: 1.5rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .lesson-title {
            font-size: 1.25rem;
          }

          .animated-text,
          .full-text {
            font-size: 1rem;
          }

          .audio-visualizer {
            height: 40px;
          }

          .visualizer-bar {
            width: 4px;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  )
}
