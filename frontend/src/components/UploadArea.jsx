import { useRef, useState } from 'react'
import { api } from '../services/api'
import { colors, typography, spacing, borderRadius } from '../styles/design-system'

export default function UploadArea({ onUploadComplete }) {
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState('')

  const handleFileSelect = async (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFiles(files)
    }
  }

  const processFiles = async (files) => {
    setUploading(true)
    setError('')
    setUploadStatus('📤 Uploading files...')

    try {
      let successCount = 0
      
      for (let file of files) {
        setUploadStatus(`📝 Processing ${file.name}...`)
        
        try {
          const result = await api.uploadFile(file)
          console.log('Upload result:', result)
          successCount++
          
          setUploadStatus(`✅ Processed ${successCount}/${files.length} files`)
        } catch (err) {
          console.error(`Error processing ${file.name}:`, err)
          setError(`Failed to process ${file.name}`)
        }
      }
      
      if (successCount > 0) {
        setUploadStatus(`🎉 Success! Generated content from ${successCount} file(s)`)
        setTimeout(() => {
          if (onUploadComplete) onUploadComplete()
        }, 2000)
      } else {
        setError('No files could be processed')
        setUploading(false)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setShowCamera(true)
    } catch (error) {
      console.error('Camera error:', error)
      setError('Could not access camera')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
      
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
        await processFiles([file])
        stopCamera()
      })
    }
  }

  return (
    <div style={styles.container}>
      {!uploading && !showCamera && (
        <>
          <div 
            style={styles.uploadArea}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.pptx,.txt,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <div style={styles.uploadIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.accent.cyan} strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <p style={styles.uploadText}>Click to upload notes</p>
            <p style={styles.uploadHint}>PDF, DOCX, PPTX, TXT, or images</p>

            <div style={styles.fileTypes}>
              {['PDF', 'DOCX', 'TXT', 'PNG', 'JPG'].map(type => (
                <span key={type} style={styles.fileTypeBadge}>{type}</span>
              ))}
            </div>
          </div>

          <button style={styles.cameraButton} onClick={startCamera}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>Use Camera</span>
          </button>

          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}
        </>
      )}

      {showCamera && (
        <div style={styles.cameraView}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={styles.video}
          />
          <div style={styles.cameraControls}>
            <button style={styles.captureButton} onClick={captureImage}>
              📸 Capture
            </button>
            <button style={styles.cancelButton} onClick={stopCamera}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {uploading && (
        <div style={styles.uploadingState}>
          <div style={styles.spinner}></div>
          <p style={styles.uploadingText}>{uploadStatus}</p>
          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
  },
  
  uploadArea: {
    padding: spacing['2xl'],
    border: `2px dashed ${colors.accent.cyan}40`,
    borderRadius: borderRadius.xl,
    background: 'rgba(27, 40, 56, 0.5)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: spacing.lg,
    transition: 'all 0.3s ease',
  },
  
  uploadIcon: {
    width: '80px',
    height: '80px',
    background: `${colors.accent.cyan}20`,
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  
  uploadText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  
  uploadHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    marginBottom: spacing.lg,
  },
  
  fileTypes: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  
  fileTypeBadge: {
    padding: `${spacing.sm} ${spacing.md}`,
    background: 'rgba(107, 114, 128, 0.3)',
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  
  cameraButton: {
    width: '100%',
    padding: spacing.lg,
    background: colors.gradients.purple,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    cursor: 'pointer',
    marginBottom: spacing.md,
  },
  
  error: {
    padding: spacing.md,
    background: 'rgba(239, 68, 68, 0.1)',
    border: `1px solid ${colors.accent.red}`,
    borderRadius: borderRadius.md,
    color: colors.accent.red,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  
  cameraView: {
    position: 'relative',
    width: '100%',
  },
  
  video: {
    width: '100%',
    borderRadius: borderRadius.xl,
  },
  
  cameraControls: {
    display: 'flex',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  
  captureButton: {
    flex: 1,
    padding: spacing.lg,
    background: colors.gradients.green,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    cursor: 'pointer',
  },
  
  cancelButton: {
    flex: 1,
    padding: spacing.lg,
    background: colors.gradients.red,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    cursor: 'pointer',
  },
  
  uploadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  
  spinner: {
    width: '4rem',
    height: '4rem',
    border: '4px solid transparent',
    borderTopColor: colors.accent.cyan,
    borderBottomColor: colors.accent.cyan,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: spacing.lg,
  },
  
  uploadingText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
  },
}
