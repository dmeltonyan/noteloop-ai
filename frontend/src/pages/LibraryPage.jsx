import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { FileText, Calendar, BookOpen, Upload, Trash2, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { NavigationHeader } from '../components/NavigationHeader'
import { AIChatSidebar } from '../components/AIChatSidebar'
import { FolderManager } from '../components/FolderManager'

export const LibraryPage = () => {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUpload, setSelectedUpload] = useState(null)
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const navigate = useNavigate()
  const userId = 'demo_user_123'

  useEffect(() => {
    loadUploads()
  }, [])

  const loadUploads = async () => {
    try {
      setLoading(true)
      const result = await api.getUserUploads(userId)
      if (result.uploads) {
        setUploads(result.uploads.reverse()) // Most recent first
      }
    } catch (error) {
      console.error('Failed to load uploads:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <>
      <NavigationHeader />
      <div className={`upload-library ${selectedUpload ? 'with-chat' : ''}`}>
      <div className="library-header">
        <FolderManager 
          userId={userId}
          onFolderSelect={setSelectedFolderId}
          selectedFolderId={selectedFolderId}
        />
      </div>
      
      <div className="library-header">
        <div className="header-content">
          <BookOpen size={32} />
          <div>
            <h1>My Learning Library</h1>
            <p>Your uploaded materials and study content</p>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="upload-button">
          <Upload size={20} />
          <span>Upload New</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <RefreshCw size={32} className="spinner" />
          <p>Loading your library...</p>
        </div>
      ) : uploads.length === 0 ? (
        <div className="empty-library">
          <FileText size={64} />
          <h2>No Uploads Yet</h2>
          <p>Upload your first study material to get started</p>
          <button onClick={() => navigate('/')} className="primary-button">
            <Upload size={20} />
            Upload Your First File
          </button>
        </div>
      ) : (
        <div className="uploads-grid">
          {uploads.map((upload) => (
            <div key={upload.id} className="upload-card">
              <div className="card-header">
                <FileText size={24} />
                <div className="card-info">
                  <h3>{upload.filename}</h3>
                  <div className="card-meta">
                    <span><Calendar size={14} /> {formatDate(upload.uploaded_at)}</span>
                    <span>{formatFileSize(upload.file_size)}</span>
                  </div>
                </div>
              </div>
              <div className="card-stats">
                <div className="stat">
                  <span className="stat-value">{upload.concepts_created}</span>
                  <span className="stat-label">Concepts</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{upload.concepts_created * 3}</span>
                  <span className="stat-label">Questions</span>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  onClick={() => {
                    localStorage.setItem('current_upload_id', upload.id)
                    navigate(`/feed?upload_id=${upload.id}`)
                  }} 
                  className="view-button"
                >
                  Study This Material
                </button>
                <button 
                  onClick={() => setSelectedUpload(selectedUpload === upload.id ? null : upload.id)}
                  className={`chat-button ${selectedUpload === upload.id ? 'active' : ''}`}
                >
                  {selectedUpload === upload.id ? 'Close Chat' : 'Chat About This'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .upload-library {
          min-height: 100vh;
          padding: 2rem;
          padding-top: 100px;
          max-width: 1400px;
          margin: 0 auto;
          transition: padding-right 0.3s ease;
        }

        .upload-library.with-chat {
          padding-right: 380px;
        }

        .library-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(102, 126, 234, 0.3);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-content svg {
          color: #667eea;
        }

        .header-content h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-content p {
          color: rgba(255,255,255,0.7);
          margin: 0.25rem 0 0 0;
        }

        .upload-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: #667eea;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-library {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-library svg {
          color: #667eea;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-library h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .empty-library p {
          color: rgba(255,255,255,0.7);
          margin-bottom: 2rem;
        }

        .primary-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .uploads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .upload-card {
          background: var(--color-card-bg);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .upload-card:hover {
          border-color: rgba(102, 126, 234, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
        }

        .card-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .card-header svg {
          color: #667eea;
          flex-shrink: 0;
        }

        .card-info {
          flex: 1;
          min-width: 0;
        }

        .card-info h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.6);
        }

        .card-meta span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .card-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 8px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #667eea;
        }

        .stat-label {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .view-button {
          width: 100%;
          padding: 0.875rem;
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-button:hover {
          background: rgba(102, 126, 234, 0.3);
          border-color: #667eea;
        }

        @media (max-width: 768px) {
          .upload-library {
            padding: 1rem;
            padding-top: 80px;
          }

          .library-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .uploads-grid {
            grid-template-columns: 1fr;
          }
        }
        .card-actions {
          display: flex;
          gap: 0.75rem;
          flex-direction: column;
        }

        .chat-button {
          width: 100%;
          padding: 0.875rem;
          background: rgba(80, 227, 194, 0.1);
          border: 1px solid rgba(80, 227, 194, 0.3);
          border-radius: 8px;
          color: var(--color-success);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .chat-button:hover {
          background: rgba(80, 227, 194, 0.2);
          border-color: var(--color-success);
        }

        .chat-button.active {
          background: rgba(80, 227, 194, 0.2);
          border-color: var(--color-success);
        }
      `}</style>
      </div>
      
      {/* AI Chat Sidebar for selected upload */}
      {selectedUpload && (
        <AIChatSidebar 
          userId={userId}
          uploadId={selectedUpload}
          currentConcept={uploads.find(u => u.id === selectedUpload)?.filename || null}
        />
      )}
    </>
  )
}

