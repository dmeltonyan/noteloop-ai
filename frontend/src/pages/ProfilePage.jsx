import React, { useState, useEffect } from 'react'
import { NavigationHeader } from '../components/NavigationHeader'
import { User, Camera, Palette, Music, Bell, Shield, Target, 
         Settings, Moon, Sun, Monitor, Music2, PlayCircle, Headphones } from 'lucide-react'

export const ProfilePage = () => {
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

  const [activeTab, setActiveTab] = useState('general')
  const [profileImagePreview, setProfileImagePreview] = useState(null)

  const themes = [
    { id: 'dark', name: 'Dark', icon: <Moon size={20} />, colors: { primary: '#4A90E2', accent: '#50E3C2' } },
    { id: 'light', name: 'Light', icon: <Sun size={20} />, colors: { primary: '#4A90E2', accent: '#50E3C2' } },
    { id: 'auto', name: 'Auto', icon: <Monitor size={20} />, colors: { primary: '#4A90E2', accent: '#50E3C2' } }
  ]

  const musicProviders = [
    { id: 'spotify', name: 'Spotify', icon: <Music2 size={20} /> },
    { id: 'youtube', name: 'YouTube Music', icon: <PlayCircle size={20} /> },
    { id: 'apple', name: 'Apple Music', icon: <Headphones size={20} /> }
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
    // Apply theme (would update CSS variables in production)
    document.documentElement.setAttribute('data-theme', themeId)
  }

  const handleMusicConnect = (providerId) => {
    setProfile({ ...profile, musicProvider: providerId })
    // In production, this would open OAuth flow
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
    <>
      <NavigationHeader />
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">
                  <User size={48} />
                </div>
              )}
              <label className="avatar-upload-btn">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div className="profile-info">
              <h1>{profile.name}</h1>
              <p>{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <User size={18} />
            General
          </button>
          <button 
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <Palette size={18} />
            Appearance
          </button>
          <button 
            className={`tab-btn ${activeTab === 'music' ? 'active' : ''}`}
            onClick={() => setActiveTab('music')}
          >
            <Music size={18} />
            Music
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} />
            Notifications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Shield size={18} />
            Privacy
          </button>
          <button 
            className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            <Target size={18} />
            Goals
          </button>
        </div>

        <div className="profile-content">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="profile-section">
              <h2>Account Information</h2>
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

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="profile-section">
              <h2>Theme Selection</h2>
              <p className="section-description">Choose your preferred theme</p>
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

          {/* Music Tab */}
          {activeTab === 'music' && (
            <div className="profile-section">
              <h2>Music Integration</h2>
              <p className="section-description">Connect your music service to enhance your study sessions</p>
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

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="profile-section">
              <h2>Notification Preferences</h2>
              <p className="section-description">Choose what notifications you want to receive</p>
              <div className="settings-list">
                {Object.entries(profile.notifications).map(([key, value]) => (
                  <div key={key} className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">
                        {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </div>
                      <div className="setting-description">
                        {key === 'achievements' && 'Get notified when you unlock achievements'}
                        {key === 'studyReminders' && 'Receive reminders to study'}
                        {key === 'weeklyReports' && 'Get weekly progress reports'}
                        {key === 'streaks' && 'Notifications about your study streaks'}
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
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="profile-section">
              <h2>Privacy Settings</h2>
              <p className="section-description">Control what information is visible to others</p>
              <div className="settings-list">
                {Object.entries(profile.privacy).map(([key, value]) => (
                  <div key={key} className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">
                        {key === 'showProgress' && 'Show Progress'}
                        {key === 'showStreaks' && 'Show Study Streaks'}
                        {key === 'allowMessages' && 'Allow Messages'}
                      </div>
                      <div className="setting-description">
                        {key === 'showProgress' && 'Make your learning progress visible to others'}
                        {key === 'showStreaks' && 'Display your study streaks publicly'}
                        {key === 'allowMessages' && 'Allow other users to send you messages'}
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
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="profile-section">
              <h2>Study Goals</h2>
              <p className="section-description">Set your learning targets</p>
              <div className="goals-list">
                <div className="goal-item">
                  <div className="goal-info">
                    <label>Daily Questions</label>
                    <p>Target number of questions per day</p>
                  </div>
                  <input
                    type="number"
                    value={profile.studyGoals.dailyQuestions}
                    onChange={(e) => handleGoalChange('dailyQuestions', e.target.value)}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="goal-item">
                  <div className="goal-info">
                    <label>Weekly Study Hours</label>
                    <p>Target hours per week</p>
                  </div>
                  <input
                    type="number"
                    value={profile.studyGoals.weeklyHours}
                    onChange={(e) => handleGoalChange('weeklyHours', e.target.value)}
                    min="1"
                    max="40"
                  />
                </div>
                <div className="goal-item">
                  <div className="goal-info">
                    <label>Target Accuracy</label>
                    <p>Goal accuracy percentage</p>
                  </div>
                  <input
                    type="number"
                    value={profile.studyGoals.targetAccuracy}
                    onChange={(e) => handleGoalChange('targetAccuracy', e.target.value)}
                    min="50"
                    max="100"
                  />
                </div>
              </div>
              <button className="save-btn">Save Goals</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .profile-page {
          min-height: 100vh;
          padding: 100px 2rem 2rem;
          max-width: 1000px;
          margin: 0 auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .profile-header {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .profile-avatar-section {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .avatar-container {
          position: relative;
        }

        .profile-avatar,
        .profile-avatar-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(74, 144, 226, 0.5);
        }

        .profile-avatar-placeholder {
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.2) 0%, rgba(80, 227, 194, 0.2) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4A90E2;
        }

        .avatar-upload-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 3px solid var(--color-bg-primary);
          color: white;
          transition: all 0.3s ease;
        }

        .avatar-upload-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
        }

        .profile-info h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'Space Grotesk', sans-serif;
        }

        .profile-info p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-size: 1rem;
        }

        .profile-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.5rem;
          overflow-x: auto;
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
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: -2px;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .tab-btn.active {
          color: #4A90E2;
          border-bottom-color: #4A90E2;
        }

        .profile-content {
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.95) 0%, rgba(37, 40, 56, 0.95) 100%);
          border: 2px solid rgba(74, 144, 226, 0.2);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .profile-section h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary);
          font-family: 'Space Grotesk', sans-serif;
        }

        .section-description {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          font-size: 0.9375rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 0.9375rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.875rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
        }

        .form-group input:focus {
          outline: none;
          border-color: #4A90E2;
        }

        .save-btn {
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
        }

        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .theme-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          position: relative;
        }

        .theme-card:hover {
          border-color: rgba(74, 144, 226, 0.5);
          transform: translateY(-2px);
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
          color: var(--color-text-primary);
        }

        .theme-check {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .music-providers {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .music-provider-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .music-provider-card.connected {
          border-color: #50E3C2;
          background: rgba(80, 227, 194, 0.1);
        }

        .provider-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .provider-icon {
          color: #4A90E2;
        }

        .provider-name {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .connect-btn,
        .disconnect-btn {
          padding: 0.625rem 1.25rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
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

        .settings-list,
        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .setting-item,
        .goal-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .setting-info,
        .goal-info {
          flex: 1;
        }

        .setting-label,
        .goal-info label {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
          display: block;
        }

        .setting-description,
        .goal-info p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .goal-item input {
          width: 100px;
          padding: 0.625rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          text-align: center;
          font-family: 'Inter', sans-serif;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
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
          border-radius: 26px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
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
          transform: translateX(24px);
        }

        @media (max-width: 768px) {
          .profile-page {
            padding: 80px 1rem 1rem;
          }

          .profile-avatar-section {
            flex-direction: column;
            text-align: center;
          }

          .profile-tabs {
            overflow-x: scroll;
          }

          .theme-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}

