import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Camera, Palette, Music, Bell, Shield, Target, 
         Settings, Moon, Sun, Monitor, Music2, PlayCircle, Headphones, 
         LogOut, ChevronDown, X } from 'lucide-react'

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [profile, setProfile] = useState({
    name: 'Demo User',
    email: 'demo@example.com',
    profilePicture: null,
    theme: 'dark',
    musicProvider: null,
    notifications: {
      achievements: true,
      studyReminders: true,
      weeklyReports: true,
      streaks: true
    },
    privacy: {
      showProgress: true,
      showStreaks: true,
      allowMessages: false
    },
    studyGoals: {
      dailyQuestions: 20,
      weeklyHours: 10,
      targetAccuracy: 85
    }
  })
  const [profileImagePreview, setProfileImagePreview] = useState(null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const themes = [
    { id: 'dark', name: 'Dark', icon: <Moon size={18} /> },
    { id: 'light', name: 'Light', icon: <Sun size={18} /> },
    { id: 'auto', name: 'Auto', icon: <Monitor size={18} /> }
  ]

  const musicProviders = [
    { id: 'spotify', name: 'Spotify', icon: <Music2 size={18} /> },
    { id: 'youtube', name: 'YouTube Music', icon: <PlayCircle size={18} /> },
    { id: 'apple', name: 'Apple Music', icon: <Headphones size={18} /> }
  ]

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result)
        setProfile({ ...profile, profilePicture: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleThemeChange = (themeId) => {
    setProfile({ ...profile, theme: themeId })
    document.documentElement.setAttribute('data-theme', themeId)
  }

  const handleMusicConnect = (providerId) => {
    setProfile({ ...profile, musicProvider: providerId })
    alert(`Connecting to ${musicProviders.find(p => p.id === providerId)?.name}...`)
  }

  const handleNotificationToggle = (key) => {
    setProfile({
      ...profile,
      notifications: {
        ...profile.notifications,
        [key]: !profile.notifications[key]
      }
    })
  }

  const handlePrivacyToggle = (key) => {
    setProfile({
      ...profile,
      privacy: {
        ...profile.privacy,
        [key]: !profile.privacy[key]
      }
    })
  }

  const handleGoalChange = (key, value) => {
    setProfile({
      ...profile,
      studyGoals: {
        ...profile.studyGoals,
        [key]: parseInt(value) || 0
      }
    })
  }

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button 
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {profileImagePreview ? (
          <img src={profileImagePreview} alt="Profile" className="profile-avatar-small" />
        ) : (
          <div className="profile-avatar-placeholder-small">
            <User size={20} />
          </div>
        )}
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <div className="profile-info-header">
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" className="profile-avatar-medium" />
              ) : (
                <div className="profile-avatar-placeholder-medium">
                  <User size={24} />
                </div>
              )}
              <div>
                <div className="profile-name">{profile.name}</div>
                <div className="profile-email">{profile.email}</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <X size={18} />
            </button>
          </div>

          <div className="dropdown-tabs">
            <button 
              className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <User size={16} />
              General
            </button>
            <button 
              className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <Palette size={16} />
              Theme
            </button>
            <button 
              className={`tab-btn ${activeTab === 'music' ? 'active' : ''}`}
              onClick={() => setActiveTab('music')}
            >
              <Music size={16} />
              Music
            </button>
            <button 
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} />
              Settings
            </button>
          </div>

          <div className="dropdown-content">
            {activeTab === 'general' && (
              <div className="tab-content">
                <div className="form-group">
                  <label>Profile Picture</label>
                  <label className="upload-label">
                    <Camera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    Upload Photo
                  </label>
                </div>
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <button className="save-btn">Save Changes</button>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="tab-content">
                <div className="theme-grid">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      className={`theme-card ${profile.theme === theme.id ? 'active' : ''}`}
                      onClick={() => handleThemeChange(theme.id)}
                    >
                      <div className="theme-icon">{theme.icon}</div>
                      <div className="theme-name">{theme.name}</div>
                      {profile.theme === theme.id && (
                        <div className="theme-check">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'music' && (
              <div className="tab-content">
                <div className="music-providers">
                  {musicProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className={`music-provider-card ${profile.musicProvider === provider.id ? 'connected' : ''}`}
                    >
                      <div className="provider-info">
                        <div className="provider-icon">{provider.icon}</div>
                        <div className="provider-name">{provider.name}</div>
                      </div>
                      {profile.musicProvider === provider.id ? (
                        <button className="disconnect-btn" onClick={() => setProfile({ ...profile, musicProvider: null })}>
                          Disconnect
                        </button>
                      ) : (
                        <button className="connect-btn" onClick={() => handleMusicConnect(provider.id)}>
                          Connect
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="tab-content">
                <div className="settings-section">
                  <h4>Notifications</h4>
                  {Object.entries(profile.notifications).map(([key, value]) => (
                    <div key={key} className="setting-item">
                      <div className="setting-info">
                        <div className="setting-label">
                          {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleNotificationToggle(key)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="settings-section">
                  <h4>Privacy</h4>
                  {Object.entries(profile.privacy).map(([key, value]) => (
                    <div key={key} className="setting-item">
                      <div className="setting-info">
                        <div className="setting-label">
                          {key === 'showProgress' && 'Show Progress'}
                          {key === 'showStreaks' && 'Show Study Streaks'}
                          {key === 'allowMessages' && 'Allow Messages'}
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handlePrivacyToggle(key)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="settings-section">
                  <h4>Study Goals</h4>
                  <div className="goal-item">
                    <label>Daily Questions</label>
                    <input
                      type="number"
                      value={profile.studyGoals.dailyQuestions}
                      onChange={(e) => handleGoalChange('dailyQuestions', e.target.value)}
                      min="1"
                      max="100"
                    />
                  </div>
                  <div className="goal-item">
                    <label>Weekly Hours</label>
                    <input
                      type="number"
                      value={profile.studyGoals.weeklyHours}
                      onChange={(e) => handleGoalChange('weeklyHours', e.target.value)}
                      min="1"
                      max="40"
                    />
                  </div>
                  <div className="goal-item">
                    <label>Target Accuracy</label>
                    <input
                      type="number"
                      value={profile.studyGoals.targetAccuracy}
                      onChange={(e) => handleGoalChange('targetAccuracy', e.target.value)}
                      min="50"
                      max="100"
                    />
                  </div>
                  <button className="save-btn">Save Goals</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .profile-dropdown-container {
          position: relative;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .profile-trigger:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(74, 144, 226, 0.3);
        }

        .profile-avatar-small,
        .profile-avatar-placeholder-small {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .profile-avatar-small {
          object-fit: cover;
        }

        .profile-avatar-placeholder-small {
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.2) 0%, rgba(80, 227, 194, 0.2) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4A90E2;
        }

        .chevron {
          transition: transform 0.3s ease;
          color: rgba(255, 255, 255, 0.7);
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 400px;
          max-height: 80vh;
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.98) 0%, rgba(37, 40, 56, 0.98) 100%);
          border: 2px solid rgba(74, 144, 226, 0.3);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideDown 0.3s ease;
        }

        @media (max-width: 768px) {
          .profile-dropdown {
            width: 90vw;
            max-width: 400px;
            right: 0.5rem;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .profile-info-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .profile-avatar-medium,
        .profile-avatar-placeholder-medium {
          width: 48px;
          height: 48px;
          border-radius: 50%;
        }

        .profile-avatar-medium {
          object-fit: cover;
        }

        .profile-avatar-placeholder-medium {
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.2) 0%, rgba(80, 227, 194, 0.2) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4A90E2;
        }

        .profile-name {
          font-weight: 700;
          font-size: 1rem;
          color: var(--color-text-primary);
          font-family: 'Space Grotesk', sans-serif;
        }

        .profile-email {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0.25rem;
          transition: color 0.2s ease;
        }

        .close-btn:hover {
          color: white;
        }

        .dropdown-tabs {
          display: flex;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          overflow-x: auto;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: -2px;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
        }

        .tab-btn:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .tab-btn.active {
          color: #4A90E2;
          border-bottom-color: #4A90E2;
        }

        .dropdown-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .tab-content {
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
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--color-text-primary);
        }

        .form-group input {
          padding: 0.625rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
        }

        .form-group input:focus {
          outline: none;
          border-color: #4A90E2;
        }

        .upload-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: rgba(74, 144, 226, 0.15);
          border: 1px solid rgba(74, 144, 226, 0.3);
          border-radius: 8px;
          color: #4A90E2;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .upload-label:hover {
          background: rgba(74, 144, 226, 0.25);
        }

        .save-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
        }

        .theme-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .theme-card {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }

        .theme-card:hover {
          border-color: rgba(74, 144, 226, 0.5);
        }

        .theme-card.active {
          background: rgba(74, 144, 226, 0.15);
          border-color: #4A90E2;
        }

        .theme-icon {
          color: #4A90E2;
        }

        .theme-name {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .theme-check {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .music-providers {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .music-provider-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .music-provider-card.connected {
          border-color: #50E3C2;
          background: rgba(80, 227, 194, 0.1);
        }

        .provider-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .provider-icon {
          color: #4A90E2;
        }

        .provider-name {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .connect-btn,
        .disconnect-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .connect-btn {
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          color: white;
        }

        .disconnect-btn {
          background: rgba(255, 107, 107, 0.2);
          color: #FF6B6B;
          border: 1px solid rgba(255, 107, 107, 0.4);
        }

        .settings-section {
          margin-bottom: 1.5rem;
        }

        .settings-section h4 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          font-family: 'Space Grotesk', sans-serif;
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .setting-label {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.2);
          transition: 0.3s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }

        .goal-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .goal-item label {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .goal-item input {
          padding: 0.625rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          .profile-dropdown {
            width: 90vw;
            max-width: 400px;
          }

          .theme-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

