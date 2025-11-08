import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { Video, Users, Share2, Sparkles, Clock, Calendar, 
         Plus, Search, Monitor, MessageSquare, Hand, Settings,
         Copy, Check, Link2 } from 'lucide-react'

export const StudyRoomsPage = () => {
  const [rooms, setRooms] = useState([])
  const [myRooms, setMyRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('discover') // discover, my-rooms, create
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedInvite, setCopiedInvite] = useState(null)
  const userId = 'demo_user_123'

  const [newRoom, setNewRoom] = useState({
    title: '',
    description: '',
    subject: '',
    max_students: 10,
    is_public: false,
    scheduled_time: ''
  })

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      setLoading(true)
      const [publicData, hostData] = await Promise.all([
        api.getPublicStudyRooms(),
        api.getHostRooms(userId)
      ])
      setRooms(publicData.rooms || [])
      setMyRooms(hostData.rooms || [])
    } catch (error) {
      console.error('Failed to load rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async () => {
    try {
      const result = await api.createStudyRoom(userId, newRoom)
      if (result.success) {
        await loadRooms()
        setShowCreateModal(false)
        setNewRoom({
          title: '',
          description: '',
          subject: '',
          max_students: 10,
          is_public: false,
          scheduled_time: ''
        })
        setActiveTab('my-rooms')
        // Show invite link
        if (result.invite_link) {
          setCopiedInvite(result.room.id)
          setTimeout(() => setCopiedInvite(null), 3000)
        }
      }
    } catch (error) {
      console.error('Failed to create room:', error)
      alert('Failed to create room')
    }
  }

  const handleJoinRoom = async (roomId) => {
    try {
      const result = await api.joinStudyRoom(userId, roomId)
      if (result.success) {
        window.location.href = `/study-room/${roomId}`
      }
    } catch (error) {
      console.error('Failed to join room:', error)
      alert('Failed to join room')
    }
  }

  const copyInviteLink = (room) => {
    const inviteLink = `${window.location.origin}${room.invite_link || `/study-room/${room.id}`}`
    navigator.clipboard.writeText(inviteLink)
    setCopiedInvite(room.id)
    setTimeout(() => setCopiedInvite(null), 3000)
  }

  if (loading) {
    return (
      <>
        <NavigationHeader />
        <div className="loading-container">
          <Video className="spinner" size={48} />
          <p>Loading study rooms...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <NavigationHeader />
      <div className="study-rooms-page">
        <div className="rooms-header">
          <div className="header-content">
            <Video size={40} />
            <div>
              <h1>Private Study Rooms</h1>
              <p>Create private rooms and invite students to join live sessions</p>
            </div>
          </div>
          <button 
            className="create-room-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            <span>Create Room</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="rooms-tabs">
          <button 
            className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            <Search size={18} />
            Discover Rooms ({rooms.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'my-rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-rooms')}
          >
            <Video size={18} />
            My Rooms ({myRooms.length})
          </button>
        </div>

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="rooms-section">
            {rooms.length === 0 ? (
              <div className="empty-state">
                <Video size={64} />
                <h3>No Public Rooms Available</h3>
                <p>Create your own room to get started!</p>
                <button 
                  className="primary-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={20} />
                  Create Room
                </button>
              </div>
            ) : (
              <div className="rooms-grid">
                {rooms.map(room => (
                  <RoomCard 
                    key={room.id} 
                    room={room}
                    onJoin={() => handleJoinRoom(room.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Rooms Tab */}
        {activeTab === 'my-rooms' && (
          <div className="rooms-section">
            {myRooms.length === 0 ? (
              <div className="empty-state">
                <Video size={64} />
                <h3>No Rooms Created</h3>
                <p>Create your first study room to start hosting sessions</p>
                <button 
                  className="primary-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={20} />
                  Create Room
                </button>
              </div>
            ) : (
              <div className="rooms-grid">
                {myRooms.map(room => (
                  <RoomCard 
                    key={room.id} 
                    room={room}
                    isOwner={true}
                    onJoin={() => handleJoinRoom(room.id)}
                    onCopyInvite={() => copyInviteLink(room)}
                    copied={copiedInvite === room.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          room={newRoom}
          setRoom={setNewRoom}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .study-rooms-page {
          min-height: 100vh;
          padding: 100px 2rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
          color: #4A90E2;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .rooms-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-content svg {
          color: #4A90E2;
        }

        .rooms-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: -0.02em;
        }

        .rooms-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0.5rem 0 0 0;
          font-size: 1rem;
          font-family: 'Space Grotesk', sans-serif;
        }

        .create-room-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .create-room-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
        }

        .rooms-tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.5rem;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: -2px;
        }

        .tab-btn:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .tab-btn.active {
          color: #4A90E2;
          border-bottom-color: #4A90E2;
        }

        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .room-card {
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.95) 0%, rgba(37, 40, 56, 0.95) 100%);
          border: 2px solid rgba(74, 144, 226, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          backdrop-filter: blur(10px);
        }

        .room-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          border-color: rgba(74, 144, 226, 0.5);
        }

        .room-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .room-title {
          flex: 1;
        }

        .room-title h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: 'Space Grotesk', sans-serif;
        }

        .room-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          font-family: 'JetBrains Mono', monospace;
        }

        .room-status {
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }

        .room-status.active {
          background: rgba(80, 227, 194, 0.2);
          color: #50E3C2;
        }

        .room-status.scheduled {
          background: rgba(74, 144, 226, 0.2);
          color: #4A90E2;
        }

        .room-description {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1rem;
          font-size: 0.9375rem;
          line-height: 1.6;
          font-family: 'Space Grotesk', sans-serif;
        }

        .room-features {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(74, 144, 226, 0.1);
          border-radius: 8px;
        }

        .room-feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          font-family: 'Space Grotesk', sans-serif;
        }

        .room-feature svg {
          color: #4A90E2;
        }

        .room-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .room-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .room-stat-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: #4A90E2;
          font-family: 'JetBrains Mono', monospace;
        }

        .room-stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }

        .room-actions {
          display: flex;
          gap: 0.75rem;
        }

        .join-btn, .invite-btn {
          flex: 1;
          padding: 0.875rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .join-btn:hover, .invite-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .invite-btn.copied {
          background: linear-gradient(135deg, #50E3C2 0%, #4A90E2 100%);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-state svg {
          color: #4A90E2;
          opacity: 0.5;
          margin-bottom: 1.5rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          font-family: 'Space Grotesk', sans-serif;
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          font-family: 'Space Grotesk', sans-serif;
        }

        .primary-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
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
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.98) 0%, rgba(37, 40, 56, 0.98) 100%);
          border: 2px solid rgba(74, 144, 226, 0.3);
          border-radius: 20px;
          padding: 2rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          backdrop-filter: blur(20px);
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
          font-family: 'Space Grotesk', sans-serif;
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

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          font-family: 'Space Grotesk', sans-serif;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          font-family: 'Space Grotesk', sans-serif;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
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
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .create-btn {
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          color: white;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .study-rooms-page {
            padding: 80px 1rem 1rem;
          }

          .rooms-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .rooms-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}

const RoomCard = ({ room, isOwner = false, onJoin, onCopyInvite, copied = false }) => {
  const formatTime = (timeStr) => {
    if (!timeStr) return null
    const date = new Date(timeStr)
    return date.toLocaleString()
  }

  return (
    <div className="room-card">
      <div className="room-header">
        <div className="room-title">
          <h3>{room.title}</h3>
          <div className="room-meta">
            <span>By {room.host_name || room.tutor_name}</span>
            {room.subject && (
              <>
                <span>•</span>
                <span>{room.subject}</span>
              </>
            )}
          </div>
        </div>
        <span className={`room-status ${room.status}`}>
          {room.status}
        </span>
      </div>

      {room.description && (
        <p className="room-description">{room.description}</p>
      )}

      <div className="room-features">
        {room.screen_share_enabled && (
          <div className="room-feature">
            <Monitor size={16} />
            <span>Screen Share</span>
          </div>
        )}
        {room.ai_assistant_enabled && (
          <div className="room-feature">
            <Sparkles size={16} />
            <span>AI Assistant</span>
          </div>
        )}
        {room.whiteboard_enabled && (
          <div className="room-feature">
            <Share2 size={16} />
            <span>Whiteboard</span>
          </div>
        )}
      </div>

      <div className="room-stats">
        <div className="room-stat">
          <div className="room-stat-value">{room.student_count}</div>
          <div className="room-stat-label">Students</div>
        </div>
        <div className="room-stat">
          <div className="room-stat-value">{room.max_students}</div>
          <div className="room-stat-label">Max</div>
        </div>
        {room.scheduled_time && (
          <div className="room-stat">
            <Clock size={16} />
            <div className="room-stat-label">{formatTime(room.scheduled_time)}</div>
          </div>
        )}
      </div>

      <div className="room-actions">
        {isOwner && (
          <button 
            className={`invite-btn ${copied ? 'copied' : ''}`}
            onClick={onCopyInvite}
          >
            {copied ? <Check size={18} /> : <Link2 size={18} />}
            {copied ? 'Copied!' : 'Copy Invite'}
          </button>
        )}
        <button className="join-btn" onClick={onJoin}>
          <Video size={18} />
          {isOwner ? 'Start Session' : 'Join Room'}
        </button>
      </div>
    </div>
  )
}

const CreateRoomModal = ({ room, setRoom, onClose, onCreate }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Study Room</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Room Title</label>
            <input
              type="text"
              value={room.title}
              onChange={(e) => setRoom({ ...room, title: e.target.value })}
              placeholder="e.g., Calculus 101 Tutoring"
            />
          </div>
          <div className="form-group">
            <label>Subject/Topic</label>
            <input
              type="text"
              value={room.subject}
              onChange={(e) => setRoom({ ...room, subject: e.target.value })}
              placeholder="e.g., Mathematics, Biology"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={room.description}
              onChange={(e) => setRoom({ ...room, description: e.target.value })}
              placeholder="Describe what you'll cover in this session..."
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Max Students</label>
            <input
              type="number"
              value={room.max_students}
              onChange={(e) => setRoom({ ...room, max_students: parseInt(e.target.value) || 10 })}
              min={1}
              max={50}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={room.is_public}
                onChange={(e) => setRoom({ ...room, is_public: e.target.checked })}
              />
              Make room public (discoverable by others)
            </label>
          </div>
          <div className="form-group">
            <label>Schedule Time (Optional)</label>
            <input
              type="datetime-local"
              value={room.scheduled_time}
              onChange={(e) => setRoom({ ...room, scheduled_time: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="create-btn" onClick={onCreate}>Create Room</button>
        </div>
      </div>
    </div>
  )
}
