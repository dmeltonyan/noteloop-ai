const API_BASE_URL = 'http://localhost:8000'

class ApiService {
  async getFeed(userId, limit = 30) {
    const response = await fetch(`${API_BASE_URL}/api/feed/${userId}?limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch feed')
    return response.json()
  }

  async submitAnswer(userId, quizId, answer) {
    const response = await fetch(`${API_BASE_URL}/api/quiz/answer/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: quizId, user_answer: answer })
    })
    if (!response.ok) throw new Error('Failed to submit answer')
    return response.json()
  }

  async getUserProgress(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/progress`)
    if (!response.ok) throw new Error('Failed to fetch progress')
    return response.json()
  }

  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) throw new Error('Failed to upload file')
    return response.json()
  }

  async likeVideo(videoId) {
    const response = await fetch(`${API_BASE_URL}/api/video/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId })
    })
    if (!response.ok) throw new Error('Failed to like video')
    return response.json()
  }

  async recordVideoView(videoId) {
    const response = await fetch(`${API_BASE_URL}/api/video/view/${videoId}`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to record view')
    return response.json()
  }
}

export const api = new ApiService()
