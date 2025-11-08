import React, { useState, useEffect, useRef } from 'react'
import './VideoPlayer.css'

const VideoPlayer = ({ video, onComplete, onQuizTrigger }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const utteranceRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!video?.script) return

    // Estimate duration (150 words per minute)
    const wordCount = video.script.split(' ').length
    const estimatedDuration = (wordCount / 150) * 60
    setDuration(estimatedDuration)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      speechSynthesis.cancel()
    }
  }, [video])

  const handlePlay = () => {
    if (!video?.script) return

    const utterance = new SpeechSynthesisUtterance(video.script)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Get best voice
    const voices = speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices[0]
    
    if (preferredVoice) utterance.voice = preferredVoice

    utterance.onstart = () => {
      setIsPlaying(true)
      
      // Progress timer
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            clearInterval(timerRef.current)
            return duration
          }
          return prev + 0.1
        })
      }, 100)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      if (timerRef.current) clearInterval(timerRef.current)
      setTimeout(() => onComplete?.(), 500)
    }

    utterance.onerror = (e) => {
      console.error('TTS error:', e)
      setIsPlaying(false)
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  const handlePause = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  return (
    <div className="video-player">
      {/* Animated background */}
      <div className="video-visual">
        <div className="animated-gradient"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="video-content-overlay">
          <h2 className="video-title">{video?.title}</h2>
          <div className="waveform">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className={`wave-bar ${isPlaying ? 'active' : ''}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="video-controls">
        <button 
          className="control-btn"
          onClick={isPlaying ? handlePause : handlePlay}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="time-display">
            {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </div>
        </div>
      </div>

      {/* Transcript */}
      <details className="video-transcript">
        <summary>📝 View Transcript</summary>
        <p>{video?.script}</p>
      </details>
    </div>
  )
}

export default VideoPlayer
