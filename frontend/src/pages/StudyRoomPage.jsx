import React, { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Video, VideoOff, Mic, MicOff, Monitor, Share2, 
         MessageSquare, Users, Settings, X, Sparkles, 
         Hand, Send, Maximize2, Minimize2 } from 'lucide-react'

export const StudyRoomPage = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const userId = 'demo_user_123'
  
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState(null)
  const [raisedHands, setRaisedHands] = useState([])

  const videoRef = useRef(null)
  const screenShareRef = useRef(null)

  useEffect(() => {
    const inviteCode = searchParams.get('invite')
    if (inviteCode) {
      loadRoomByInvite(inviteCode)
    } else {
      loadRoom()
    }
  }, [roomId, searchParams])

  const loadRoomByInvite = async (inviteCode) => {
    try {
      setLoading(true)
      const result = await api.getRoomByInvite(inviteCode)
      if (result.success && result.room) {
        setRoom(result.room)
        // Check if user needs to sign up
        const isAuthenticated = localStorage.getItem('noteloop_authenticated') === 'true'
        if (!isAuthenticated) {
          setShowSignupPrompt(true)
        }
      } else {
        alert('Invalid invite link')
        navigate('/study-rooms')
      }
    } catch (error) {
      console.error('Failed to load room by invite:', error)
      alert('Failed to load room')
      navigate('/study-rooms')
    } finally {
      setLoading(false)
    }
  }

  const loadRoom = async () => {
    try {
      setLoading(true)
      const result = await api.getStudyRoom(roomId)
      if (result.success) {
        setRoom(result.room)
      } else {
        alert('Room not found')
        navigate('/study-rooms')
      }
    } catch (error) {
      console.error('Failed to load room:', error)
      navigate('/study-rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing (WebRTC implementation would go here)
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream
        }
        setIsScreenSharing(true)
      } else {
        // Stop screen sharing
        if (screenShareRef.current?.srcObject) {
          screenShareRef.current.srcObject.getTracks().forEach(track => track.stop())
        }
        setIsScreenSharing(false)
      }
    } catch (error) {
      console.error('Screen share error:', error)
      alert('Failed to start screen sharing')
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now(),
        user_id: userId,
        user_name: 'You',
        message: newMessage,
        timestamp: new Date().toISOString()
      }])
      setNewMessage('')
    }
  }

  const handleRaiseHand = () => {
    if (!raisedHands.includes(userId)) {
      setRaisedHands([...raisedHands, userId])
    } else {
      setRaisedHands(raisedHands.filter(id => id !== userId))
    }
  }

  const handleAIAssistance = async () => {
    if (!aiQuery.trim()) return

    try {
      const result = await api.getAITutorAssistance(roomId, {
        query: aiQuery,
        context: {
          subject: room?.subject || '',
          current_topic: room?.title || '',
          student_questions: chatMessages.filter(m => m.user_id !== userId).map(m => m.message)
        }
      })

      if (result.success) {
        setAiResponse(result.assistance)
      }
    } catch (error) {
      console.error('Failed to get AI assistance:', error)
    }
  }

  const handleLeaveRoom = async () => {
    if (confirm('Leave this study room?')) {
      try {
        await api.leaveStudyRoom(userId, roomId)
        navigate('/study-rooms')
      } catch (error) {
        console.error('Failed to leave room:', error)
        navigate('/study-rooms')
      }
    }
  }

  const handleSignupAndJoin = () => {
    // Store invite code and redirect to signup
    const inviteCode = searchParams.get('invite')
    if (inviteCode) {
      localStorage.setItem('pending_room_invite', inviteCode)
    }
    // Redirect to signup/login page
    navigate('/?signup=true&redirect=/study-room/' + roomId)
  }

  if (loading) {
    return (
      <>
        <NavigationHeader />
        <div className="loading-container">
          <Video className="spinner" size={48} />
          <p>Loading study room...</p>
        </div>
      </>
    )
  }

  if (!room) {
    return null
  }

  const isHost = room.host_id === userId || room.tutor_id === userId

  return (
    <>
      <NavigationHeader />
      {showSignupPrompt && (
        <div className="signup-prompt-overlay">
          <div className="signup-prompt-modal">
            <h2>Join This Study Room</h2>
            <p>Sign up to join this private study session</p>
            <div className="signup-prompt-actions">
              <button className="signup-btn" onClick={handleSignupAndJoin}>
                Sign Up & Join
              </button>
              <button className="skip-btn" onClick={() => setShowSignupPrompt(false)}>
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="study-room-page">
        {/* Room Header */}
        <div className="room-header-bar">
          <div className="room-info">
            <h2>{room.title}</h2>
            <div className="room-meta">
              <Users size={16} />
              <span>{room.student_count} / {room.max_students} students</span>
              {room.subject && (
                <>
                  <span>•</span>
                  <span>{room.subject}</span>
                </>
              )}
            </div>
          </div>
          <button className="leave-btn" onClick={handleLeaveRoom}>
            <X size={18} />
            Leave Room
          </button>
        </div>

        <div className="room-content">
          {/* Main Video Area */}
          <div className="video-section">
            {/* Screen Share Display */}
            {isScreenSharing && (
              <div className="screen-share-display">
                <video
                  ref={screenShareRef}
                  autoPlay
                  playsInline
                  className="screen-share-video"
                />
                <div className="screen-share-label">
                  <Monitor size={20} />
                  <span>Screen Sharing</span>
                </div>
              </div>
            )}

            {/* Video Grid */}
            <div className="video-grid">
              {/* Host Video */}
              <div className="video-tile tutor">
                <div className="video-placeholder">
                  <Video size={48} />
                </div>
                <div className="video-label">
                  <span>{room.host_name || room.tutor_name}</span>
                  {isHost && <span className="badge">Host</span>}
                </div>
              </div>

              {/* Student Videos */}
              {room.students.filter(id => id !== (room.host_id || room.tutor_id)).map((studentId, index) => (
                <div key={studentId} className="video-tile">
                  <div className="video-placeholder">
                    <Users size={48} />
                  </div>
                  <div className="video-label">
                    <span>Student {index + 1}</span>
                    {raisedHands.includes(studentId) && (
                      <Hand size={16} className="raised-hand" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="room-sidebar">
            {/* Controls */}
            <div className="room-controls">
              <button
                className={`control-btn ${isVideoOn ? 'active' : ''}`}
                onClick={() => setIsVideoOn(!isVideoOn)}
                title={isVideoOn ? 'Turn off video' : 'Turn on video'}
              >
                {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <button
                className={`control-btn ${!isMuted ? 'active' : ''}`}
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              {room.screen_share_enabled && (
                <button
                  className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                  onClick={handleScreenShare}
                  title="Share screen"
                >
                  <Monitor size={20} />
                </button>
              )}
              {isHost && room.ai_assistant_enabled && (
                <button
                  className={`control-btn ${showAIAssistant ? 'active' : ''}`}
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  title="AI Assistant"
                >
                  <Sparkles size={20} />
                </button>
              )}
              <button
                className={`control-btn ${raisedHands.includes(userId) ? 'active' : ''}`}
                onClick={handleRaiseHand}
                title="Raise hand"
              >
                <Hand size={20} />
              </button>
            </div>

            {/* AI Assistant Panel */}
            {showAIAssistant && isHost && (
              <div className="ai-assistant-panel">
                <div className="panel-header">
                  <Sparkles size={18} />
                  <h4>AI Teaching Assistant</h4>
                  <button onClick={() => setShowAIAssistant(false)}>×</button>
                </div>
                <div className="panel-content">
                  <div className="ai-query-input">
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Ask for teaching suggestions..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAIAssistance()}
                    />
                    <button onClick={handleAIAssistance}>
                      <Send size={16} />
                    </button>
                  </div>
                  {aiResponse && (
                    <div className="ai-response">
                      <h5>Suggestions:</h5>
                      <ul>
                        {aiResponse.suggestions?.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                      {aiResponse.teaching_tips && (
                        <>
                          <h5>Teaching Tips:</h5>
                          <ul>
                            {aiResponse.teaching_tips.map((tip, i) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat */}
            {room.settings?.allow_chat && (
              <div className="chat-panel">
                <div className="chat-header">
                  <MessageSquare size={18} />
                  <h4>Chat</h4>
                </div>
                <div className="chat-messages">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="chat-message">
                      <span className="message-author">{msg.user_name}:</span>
                      <span className="message-text">{msg.message}</span>
                    </div>
                  ))}
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button onClick={handleSendMessage}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .study-room-page {
          min-height: 100vh;
          padding-top: 70px;
          background: var(--color-bg-primary);
          display: flex;
          flex-direction: column;
        }

        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding-top: 80px;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: #667eea;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .room-header-bar {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 998;
        }

        .room-info h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .room-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .leave-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .leave-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .room-content {
          display: flex;
          height: calc(100vh - 140px);
          margin-top: 70px;
        }

        .video-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          gap: 1rem;
        }

        .screen-share-display {
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 16/9;
        }

        .screen-share-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .screen-share-label {
          position: absolute;
          top: 1rem;
          left: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 8px;
          color: white;
          font-weight: 600;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
          flex: 1;
        }

        .video-tile {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          aspect-ratio: 16/9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .video-tile.tutor {
          border-color: rgba(102, 126, 234, 0.5);
          background: rgba(102, 126, 234, 0.1);
        }

        .video-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .video-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
          font-weight: 600;
        }

        .badge {
          padding: 0.25rem 0.5rem;
          background: rgba(102, 126, 234, 0.3);
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .raised-hand {
          color: #fbbf24;
          animation: wave 1s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }

        .room-sidebar {
          width: 350px;
          background: rgba(15, 23, 42, 0.95);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          padding: 1rem;
          gap: 1rem;
        }

        .room-controls {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          flex-wrap: wrap;
        }

        .control-btn {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .control-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
        }

        .ai-assistant-panel,
        .chat-panel {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          max-height: 400px;
        }

        .panel-header,
        .chat-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .panel-header h4,
        .chat-header h4 {
          flex: 1;
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .panel-header button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0.25rem;
        }

        .panel-content {
          padding: 1rem;
          overflow-y: auto;
          flex: 1;
        }

        .ai-query-input {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .ai-query-input input {
          flex: 1;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
        }

        .ai-query-input button {
          padding: 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }

        .ai-response {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
        }

        .ai-response h5 {
          margin: 1rem 0 0.5rem 0;
          color: #667eea;
        }

        .ai-response ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .ai-response li {
          margin-bottom: 0.5rem;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 300px;
        }

        .chat-message {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .message-author {
          font-weight: 700;
          color: #667eea;
        }

        .message-text {
          color: rgba(255, 255, 255, 0.9);
        }

        .chat-input {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chat-input input {
          flex: 1;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
        }

        .chat-input button {
          padding: 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }

        .verification-form-section {
          background: var(--color-card-bg);
          border-radius: 16px;
          padding: 2rem;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .verification-form-section h2 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-text-primary);
        }

        .form-description {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          font-family: inherit;
        }

        .submit-verification-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-verification-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-verification-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: var(--color-card-bg);
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 16px;
          padding: 2rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .modal-header button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .cancel-btn,
        .create-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .create-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 1024px) {
          .room-content {
            flex-direction: column;
          }

          .room-sidebar {
            width: 100%;
            max-height: 400px;
          }
        }

        .signup-prompt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .signup-prompt-modal {
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.98) 0%, rgba(37, 40, 56, 0.98) 100%);
          border: 2px solid rgba(74, 144, 226, 0.5);
          border-radius: 20px;
          padding: 2.5rem;
          max-width: 500px;
          width: 90%;
          text-align: center;
          backdrop-filter: blur(20px);
        }

        .signup-prompt-modal h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'Space Grotesk', sans-serif;
        }

        .signup-prompt-modal p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          font-family: 'Space Grotesk', sans-serif;
        }

        .signup-prompt-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .signup-btn, .skip-btn {
          padding: 0.875rem 2rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .signup-btn {
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          color: white;
        }

        .signup-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
        }

        .skip-btn {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .skip-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </>
  )
}

