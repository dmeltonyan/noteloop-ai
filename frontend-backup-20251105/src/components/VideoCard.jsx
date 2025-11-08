import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { colors, typography, spacing, borderRadius, shadows } from '../styles/design-system'

export default function VideoCard({ video, conceptName, onNext }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(video.likes || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    // Record view
    api.recordVideoView(video.video_id)
  }, [video.video_id])

  const handleLike = async () => {
    if (!liked) {
      try {
        await api.likeVideo(video.video_id)
        setLikes(likes + 1)
        setLiked(true)
      } catch (error) {
        console.error('Error liking video:', error)
      }
    }
  }

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        await api.addComment(video.video_id, newComment)
        setComments([...comments, { text: newComment, timestamp_seconds: 0 }])
        setNewComment('')
      } catch (error) {
        console.error('Error adding comment:', error)
      }
    }
  }

  const loadComments = async () => {
    try {
      const data = await api.getVideoComments(video.video_id)
      setComments(data.comments)
      setShowComments(true)
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  return (
    <div style={styles.container}>
      {/* Video Content Area */}
      <div style={styles.videoArea}>
        <div style={styles.conceptBadge}>{conceptName}</div>
        
        <h2 style={styles.title}>{video.title}</h2>
        
        <div style={styles.scriptContainer}>
          <p style={styles.script}>{video.script}</p>
        </div>
        
        <div style={styles.duration}>
          ⏱️ {video.duration}s
        </div>
      </div>

      {/* Interaction Bar */}
      <div style={styles.interactionBar}>
        <button 
          style={{...styles.iconButton, ...(liked ? styles.iconButtonActive : {})}}
          onClick={handleLike}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? colors.accent.cyan : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span style={styles.iconLabel}>{likes}</span>
        </button>

        <button style={styles.iconButton} onClick={loadComments}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span style={styles.iconLabel}>{comments.length}</span>
        </button>

        <button style={styles.iconButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span style={styles.iconLabel}>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={styles.commentsSection}>
          <h3 style={styles.commentsTitle}>Comments</h3>
          
          <div style={styles.commentsList}>
            {comments.map((comment, idx) => (
              <div key={idx} style={styles.comment}>
                <p style={styles.commentText}>{comment.text}</p>
                {comment.timestamp_seconds > 0 && (
                  <span style={styles.commentTime}>
                    {Math.floor(comment.timestamp_seconds / 60)}:{(comment.timestamp_seconds % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={styles.commentInput}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button style={styles.sendButton} onClick={handleAddComment}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Next Button */}
      <button style={styles.nextButton} onClick={onNext}>
        <span>Next</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  
  videoArea: {
    flex: 1,
    padding: spacing.xl,
    display: 'flex',
    flexDirection: 'column',
  },
  
  conceptBadge: {
    alignSelf: 'flex-start',
    background: colors.gradients.purple,
    color: 'white',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
    color: colors.text.primary,
  },
  
  scriptContainer: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: spacing.lg,
  },
  
  script: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.text.secondary,
  },
  
  duration: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    textAlign: 'center',
  },
  
  interactionBar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: spacing.lg,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(27, 40, 56, 0.8)',
  },
  
  iconButton: {
    background: 'transparent',
    border: 'none',
    color: colors.text.secondary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xs,
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  
  iconButtonActive: {
    color: colors.accent.cyan,
  },
  
  iconLabel: {
    fontSize: typography.fontSize.xs,
  },
  
  commentsSection: {
    padding: spacing.lg,
    background: 'rgba(0, 0, 0, 0.5)',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  
  commentsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  
  commentsList: {
    marginBottom: spacing.md,
  },
  
  comment: {
    padding: spacing.sm,
    marginBottom: spacing.sm,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.md,
  },
  
  commentText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  
  commentTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
  },
  
  commentInput: {
    display: 'flex',
    gap: spacing.sm,
  },
  
  input: {
    flex: 1,
    padding: spacing.sm,
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
  },
  
  sendButton: {
    padding: `${spacing.sm} ${spacing.md}`,
    background: colors.gradients.cyan,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    cursor: 'pointer',
  },
  
  nextButton: {
    position: 'fixed',
    bottom: spacing.xl,
    right: spacing.xl,
    padding: `${spacing.md} ${spacing.lg}`,
    background: colors.gradients.cyan,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    cursor: 'pointer',
    boxShadow: shadows.glow,
  },
}
