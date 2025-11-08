import React, { useState } from 'react'
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import { AILoadingAnimation } from './AILoadingAnimation'
import { OAuthLogin } from './OAuthLogin'

export const FileUploadArea = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState(0)
  const [showLogin, setShowLogin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is authenticated (in production, check actual auth state)
    return localStorage.getItem('noteloop_authenticated') === 'true'
  })

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      if (!isAuthenticated) {
        setShowLogin(true)
        // Store file temporarily
        const fileInput = document.getElementById('file-input')
        if (fileInput) {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(files[0])
          fileInput.files = dataTransfer.files
        }
        return
      }
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      if (!isAuthenticated) {
        setShowLogin(true)
        return
      }
      handleFileUpload(files[0])
    }
  }

  const handleLogin = (userData) => {
    console.log('User logged in:', userData)
    setIsAuthenticated(true)
    localStorage.setItem('noteloop_authenticated', 'true')
    localStorage.setItem('noteloop_user', JSON.stringify(userData))
    setShowLogin(false)
    // Trigger file upload if file was selected
    const fileInput = document.getElementById('file-input')
    if (fileInput?.files?.length > 0) {
      handleFileUpload(fileInput.files[0])
    }
  }

  const handleSkipLogin = () => {
    setShowLogin(false)
    // Allow guest upload
    const fileInput = document.getElementById('file-input')
    if (fileInput?.files?.length > 0) {
      handleFileUpload(fileInput.files[0])
    }
  }

  const handleFileUpload = async (file) => {
    setUploading(true)
    setError(null)
    setUploadProgress(0)
    setCurrentStage(0)

    try {
      console.log('📤 Uploading:', file.name)
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error(`File too large. Max size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`)
      }

      // Progress stages
      const stages = [
        'Uploading file...',
        'Analyzing document structure...',
        'Extracting key concepts...',
        'Generating personalized questions...',
        'Creating learning materials...',
        'Finalizing your content...'
      ]

      // Track processing progress after upload completes
      let processingStartTime = null
      const processingProgressInterval = setInterval(() => {
        if (processingStartTime && uploadProgress < 95) {
          // Simulate processing progress (90-95%) while waiting for backend
          const elapsed = Date.now() - processingStartTime
          const estimatedProcessingTime = 5000 // 5 seconds estimate
          const processingProgress = Math.min(90 + (elapsed / estimatedProcessingTime) * 5, 95)
          setUploadProgress(processingProgress)
          const stageProgress = (processingProgress / 100) * stages.length
          setCurrentStage(Math.min(Math.floor(stageProgress), stages.length - 1))
        }
      }, 200)

      // Upload with real progress tracking
      const result = await api.uploadFile(file, (progressData) => {
        if (progressData.type === 'upload') {
          // Real upload progress (0-90%)
          const uploadPercent = Math.min((progressData.progress * 0.9), 90)
          setUploadProgress(uploadPercent)
          const stageProgress = (uploadPercent / 100) * stages.length
          setCurrentStage(Math.min(Math.floor(stageProgress), stages.length - 1))
          
          // When upload reaches 90%, start processing simulation
          if (uploadPercent >= 90 && !processingStartTime) {
            processingStartTime = Date.now()
          }
        } else if (progressData.type === 'complete') {
          clearInterval(processingProgressInterval)
          setUploadProgress(100)
          setCurrentStage(stages.length - 1)
        }
      })
      
      clearInterval(processingProgressInterval)
      
      // Ensure 100% is set
      setUploadProgress(100)
      setCurrentStage(stages.length - 1)
      
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 800))
      
      if (result.success) {
        console.log('✅ Upload successful:', result)
        onUploadSuccess?.(result)
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (err) {
      console.error('❌ Upload error:', err)
      setError(err.message || 'Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setCurrentStage(0)
    }
  }

  return (
    <>
      {showLogin && (
        <OAuthLogin 
          onLogin={handleLogin}
          onSkip={handleSkipLogin}
        />
      )}
      <div className="upload-container">
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploading ? (
          <AILoadingAnimation 
            stages={[
              'Uploading file...',
              'Analyzing document structure...',
              'Extracting key concepts...',
              'Generating personalized questions...',
              'Creating learning materials...',
              'Finalizing your content...'
            ]}
            currentStage={currentStage}
            showProgress={true}
          />
        ) : (
          <>
            <Upload size={48} className="upload-icon" />
            <h3>Upload Study Materials</h3>
            <p>Drag & drop or click to select files</p>
            <p className="upload-formats">Supports: PDF, TXT, MD, DOCX (Max 10MB)</p>
            
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.txt,.md,.docx"
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" className="upload-button">
              <File size={18} />
              Choose File
            </label>
          </>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <style>{`
        .upload-container {
          width: 100%;
          max-width: 600px;
          margin: 2rem auto;
        }

        .upload-area {
          border: 3px dashed rgba(255,255,255,0.2);
          border-radius: var(--border-radius-2xl);
          padding: 3rem 2rem;
          text-align: center;
          transition: all 0.3s ease;
          background: var(--color-card-bg);
          cursor: pointer;
        }

        .upload-area:hover {
          border-color: var(--color-primary);
          background: rgba(102, 126, 234, 0.05);
        }

        .upload-area.dragging {
          border-color: var(--color-primary);
          background: rgba(102, 126, 234, 0.1);
          transform: scale(1.02);
        }

        .upload-area.uploading {
          border-color: var(--color-primary);
          cursor: wait;
        }

        .upload-icon {
          color: var(--color-primary);
          margin-bottom: 1rem;
        }

        .upload-area h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .upload-area p {
          color: rgba(255,255,255,0.7);
          margin-bottom: 0.5rem;
        }

        .upload-formats {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 1.5rem;
        }

        .upload-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .upload-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .upload-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          color: var(--color-primary);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .upload-status h3 {
          margin-bottom: 0;
        }

        .upload-error {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
          padding: 1rem 1.5rem;
          background: rgba(220, 38, 38, 0.1);
          border: 2px solid var(--color-secondary);
          border-radius: 12px;
          color: var(--color-secondary);
          font-weight: 600;
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @media (max-width: 768px) {
          .upload-area {
            padding: 2rem 1rem;
          }

          .upload-area h3 {
            font-size: 1.25rem;
          }
        }
      `}</style>
      </div>
    </>
  )
}
