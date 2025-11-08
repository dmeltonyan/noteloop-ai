const API_BASE_URL = 'http://localhost:8000'

class ApiService {
  async getFeed(userId, limit = 30, uploadId = null) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (uploadId) params.append('upload_id', uploadId)
    const response = await fetch(`${API_BASE_URL}/api/feed/${userId}?${params}`)
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

  async uploadFile(file, onProgress) {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const xhr = new XMLHttpRequest()
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100
          onProgress({
            type: 'upload',
            progress: Math.min(percentComplete, 90), // Cap at 90% until backend confirms
            loaded: e.loaded,
            total: e.total
          })
        }
      })
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (onProgress) {
              onProgress({ type: 'complete', progress: 100 })
            }
            resolve(response)
          } catch (e) {
            reject(new Error('Failed to parse response'))
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      })
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'))
      })
      
      xhr.open('POST', `${API_BASE_URL}/api/upload`)
      xhr.send(formData)
    })
  }

  async chatWithAI(userId, message, uploadId = null) {
    const response = await fetch(`${API_BASE_URL}/api/chat/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, upload_id: uploadId })
    })
    if (!response.ok) throw new Error('Failed to chat')
    return response.json()
  }

  async explainConcept(userId, conceptText, question = '') {
    const response = await fetch(`${API_BASE_URL}/api/chat/${userId}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept_text: conceptText, question })
    })
    if (!response.ok) throw new Error('Failed to explain')
    return response.json()
  }

  async getUserUploads(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/uploads`)
    if (!response.ok) throw new Error('Failed to fetch uploads')
    return response.json()
  }

  async getChatHistory(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/chat-history`)
    if (!response.ok) throw new Error('Failed to fetch chat history')
    return response.json()
  }

  async generateStudyGuide(userId, uploadId, concepts) {
    const response = await fetch(`${API_BASE_URL}/api/study-guide/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        upload_id: uploadId,
        concepts: concepts
      })
    })
    if (!response.ok) throw new Error('Failed to generate study guide')
    return response.json()
  }

  async getUserAnalytics(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/analytics`)
    if (!response.ok) throw new Error('Failed to fetch analytics')
    return response.json()
  }

  async getLearningInsights(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/learning-insights`)
    if (!response.ok) throw new Error('Failed to fetch insights')
    return response.json()
  }

  async getDueReviews(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/spaced-repetition/due`)
    if (!response.ok) throw new Error('Failed to fetch due reviews')
    return response.json()
  }

  async reviewConcept(userId, conceptId, quality) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/spaced-repetition/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept_id: conceptId, quality })
    })
    if (!response.ok) throw new Error('Failed to review concept')
    return response.json()
  }

  async getAchievements(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/achievements`)
    if (!response.ok) throw new Error('Failed to fetch achievements')
    return response.json()
  }

  async checkAchievements(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/achievements/check`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to check achievements')
    return response.json()
  }

  async getStreaks(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/streaks`)
    if (!response.ok) throw new Error('Failed to fetch streaks')
    return response.json()
  }

  async getStudyPlans(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/study-plans`)
    if (!response.ok) throw new Error('Failed to fetch study plans')
    return response.json()
  }

  async createStudyPlan(userId, concepts, durationDays) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/study-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concepts, duration_days: durationDays })
    })
    if (!response.ok) throw new Error('Failed to create study plan')
    return response.json()
  }

  async getFlashcards(userId, uploadId = null) {
    const params = uploadId ? `?upload_id=${uploadId}` : ''
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/flashcards${params}`)
    if (!response.ok) throw new Error('Failed to fetch flashcards')
    return response.json()
  }

  async startTutorSession(userId, topic = null) {
    const response = await fetch(`${API_BASE_URL}/api/tutor/${userId}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    })
    if (!response.ok) throw new Error('Failed to start tutor session')
    return response.json()
  }

  async tutorMessage(userId, sessionId, message) {
    const response = await fetch(`${API_BASE_URL}/api/tutor/${userId}/session/${sessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    if (!response.ok) throw new Error('Failed to send tutor message')
    return response.json()
  }

  async tutorGenerateQuestion(userId, sessionId, conceptId = null) {
    const params = conceptId ? `?concept_id=${conceptId}` : ''
    const response = await fetch(`${API_BASE_URL}/api/tutor/${userId}/session/${sessionId}/question${params}`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to generate question')
    return response.json()
  }

  async getTutorSessions(userId) {
    const response = await fetch(`${API_BASE_URL}/api/tutor/${userId}/sessions`)
    if (!response.ok) throw new Error('Failed to fetch tutor sessions')
    return response.json()
  }

  async getAnalytics(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/analytics`)
    if (!response.ok) throw new Error('Failed to fetch analytics')
    return response.json()
  }

  async getRewards(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/rewards`)
    if (!response.ok) throw new Error('Failed to fetch rewards')
    return response.json()
  }

  async spendRewards(userId, item, cost) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/rewards/spend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, cost })
    })
    if (!response.ok) throw new Error('Failed to spend rewards')
    return response.json()
  }

  async getDailyBonus(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/rewards/daily-bonus`)
    if (!response.ok) throw new Error('Failed to fetch daily bonus')
    return response.json()
  }

  async getForgettingCurve(userId, conceptId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/forgetting-curve/${conceptId}`)
    if (!response.ok) throw new Error('Failed to fetch forgetting curve')
    return response.json()
  }

  async getExamReadiness(userId, examConcepts = null, daysUntilExam = 7) {
    const params = new URLSearchParams({ days_until_exam: daysUntilExam.toString() })
    if (examConcepts) params.append('exam_concepts', examConcepts)
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/exam-readiness?${params}`)
    if (!response.ok) throw new Error('Failed to fetch exam readiness')
    return response.json()
  }

  async getLearningVelocity(userId, days = 7) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/learning-velocity?days=${days}`)
    if (!response.ok) throw new Error('Failed to fetch learning velocity')
    return response.json()
  }

  async getOptimalStudyTime(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/optimal-study-time`)
    if (!response.ok) throw new Error('Failed to fetch optimal study time')
    return response.json()
  }

  async getMetacognitiveData(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/metacognitive`)
    if (!response.ok) throw new Error('Failed to fetch metacognitive data')
    return response.json()
  }

  // Folder Management
  async getFolders(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/folders`)
    if (!response.ok) throw new Error('Failed to fetch folders')
    return response.json()
  }

  async createFolder(userId, name, color = '#667eea', icon = '📁', description = '') {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color, icon, description })
    })
    if (!response.ok) throw new Error('Failed to create folder')
    return response.json()
  }

  async updateFolder(userId, folderId, updates) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/folders/${folderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error('Failed to update folder')
    return response.json()
  }

  async addToFolder(userId, folderId, uploadId = null, quizId = null) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/folders/${folderId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upload_id: uploadId, quiz_id: quizId })
    })
    if (!response.ok) throw new Error('Failed to add to folder')
    return response.json()
  }

  async deleteFolder(userId, folderId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/folders/${folderId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete folder')
    return response.json()
  }

  // Learning Style
  async getLearningStyleQuestionnaire(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/learning-style/questionnaire`)
    if (!response.ok) throw new Error('Failed to fetch questionnaire')
    return response.json()
  }

  async assessLearningStyle(userId, responses) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/learning-style/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses })
    })
    if (!response.ok) throw new Error('Failed to assess learning style')
    return response.json()
  }

  async getLearningStyle(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/learning-style`)
    if (!response.ok) throw new Error('Failed to fetch learning style')
    return response.json()
  }

  // Quiz Saving
  async saveQuiz(userId, quizId, folderId = null) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/quizzes/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: quizId, folder_id: folderId })
    })
    if (!response.ok) throw new Error('Failed to save quiz')
    return response.json()
  }

  async getSavedQuizzes(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/quizzes/saved`)
    if (!response.ok) throw new Error('Failed to fetch saved quizzes')
    return response.json()
  }

  // Advanced Analytics
  async getAdvancedAnalytics(userId, days = 30) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/analytics/advanced?days=${days}`)
    if (!response.ok) throw new Error('Failed to fetch advanced analytics')
    return response.json()
  }

  // Collaboration
  async createStudyGroup(userId, name, description = '', isPublic = false) {
    const response = await fetch(`${API_BASE_URL}/api/collaboration/groups?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, is_public: isPublic })
    })
    if (!response.ok) throw new Error('Failed to create study group')
    return response.json()
  }

  async getUserGroups(userId) {
    const response = await fetch(`${API_BASE_URL}/api/collaboration/groups/user/${userId}`)
    if (!response.ok) throw new Error('Failed to fetch groups')
    return response.json()
  }

  async getPublicGroups() {
    const response = await fetch(`${API_BASE_URL}/api/collaboration/groups/public`)
    if (!response.ok) throw new Error('Failed to fetch public groups')
    return response.json()
  }

  async joinGroup(userId, groupId, referrerId = null) {
    const response = await fetch(`${API_BASE_URL}/api/collaboration/groups/${groupId}/join?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrer_id: referrerId })
    })
    if (!response.ok) throw new Error('Failed to join group')
    return response.json()
  }

  async joinGroupByInvite(userId, inviteCode) {
    const response = await fetch(`${API_BASE_URL}/api/collaboration/groups/invite/${inviteCode}/join?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Failed to join group')
    return response.json()
  }

  async getGroupByInvite(inviteCode) {
    const response = await fetch(`${API_BASE_URL}/api/collaboration/groups/invite/${inviteCode}`)
    if (!response.ok) throw new Error('Failed to fetch group')
    return response.json()
  }

  async shareFolder(userId, groupId, folderId) {
    const response = await fetch(`${API_BASE_URL}/api/collaboration/groups/${groupId}/share/folder?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder_id: folderId })
    })
    if (!response.ok) throw new Error('Failed to share folder')
    return response.json()
  }

  async shareQuiz(userId, groupId, quizId) {
    const response = await fetch(`${API_BASE_URL}/api/collaboration/groups/${groupId}/share/quiz?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: quizId })
    })
    if (!response.ok) throw new Error('Failed to share quiz')
    return response.json()
  }

  async createChallenge(userId, groupId, type, target, durationDays = 7) {
    const response = await fetch(`${API_BASE_URL}/api/collaboration/groups/${groupId}/challenges?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, target, duration_days: durationDays })
    })
    if (!response.ok) throw new Error('Failed to create challenge')
    return response.json()
  }

  // Tutor Verification
  async applyTutorVerification(userId, applicationData) {
    const response = await fetch(`${API_BASE_URL}/api/tutors/verify/apply?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    })
    if (!response.ok) throw new Error('Failed to apply for verification')
    return response.json()
  }

  async getTutorProfile(userId) {
    const response = await fetch(`${API_BASE_URL}/api/tutors/${userId}/profile`)
    if (!response.ok) throw new Error('Failed to fetch tutor profile')
    return response.json()
  }

  async getVerifiedTutors(subject = null) {
    const url = subject 
      ? `${API_BASE_URL}/api/tutors/verified?subject=${subject}`
      : `${API_BASE_URL}/api/tutors/verified`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch verified tutors')
    return response.json()
  }

  // Study Rooms
  async createStudyRoom(hostId, roomData) {
    const response = await fetch(`${API_BASE_URL}/api/study-rooms?host_id=${hostId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    })
    if (!response.ok) throw new Error('Failed to create study room')
    return response.json()
  }

  async getStudyRoom(roomId) {
    const response = await fetch(`${API_BASE_URL}/api/study-rooms/${roomId}`)
    if (!response.ok) throw new Error('Failed to fetch study room')
    return response.json()
  }

  async joinStudyRoom(userId, roomId) {
    const response = await fetch(`${API_BASE_URL}/api/study-rooms/${roomId}/join?user_id=${userId}`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to join study room')
    return response.json()
  }

  async leaveStudyRoom(userId, roomId) {
    const response = await fetch(`${API_BASE_URL}/api/study-rooms/${roomId}/leave?user_id=${userId}`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to leave study room')
    return response.json()
  }

  async getHostRooms(hostId) {
    const response = await fetch(`${API_BASE_URL}/api/study-rooms/host/${hostId}`)
    if (!response.ok) throw new Error('Failed to fetch host rooms')
    return response.json()
  }

  async getRoomByInvite(inviteCode) {
    const response = await fetch(`${API_BASE_URL}/api/study-rooms/invite/${inviteCode}`)
    if (!response.ok) throw new Error('Failed to fetch room by invite')
    return response.json()
  }

  async getPublicStudyRooms(subject = null) {
    const url = subject
      ? `${API_BASE_URL}/api/study-rooms/public?subject=${subject}`
      : `${API_BASE_URL}/api/study-rooms/public`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch public rooms')
    return response.json()
  }

  async getAITutorAssistance(roomId, data) {
    const response = await fetch(`${API_BASE_URL}/api/study-rooms/${roomId}/ai-assistance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to get AI assistance')
    return response.json()
  }

  // Free LLM Processing Endpoints
  async processText(text) {
    const response = await fetch(`${API_BASE_URL}/api/process-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    if (!response.ok) throw new Error('Failed to process text')
    return response.json()
  }

  async extractConcepts(text) {
    const response = await fetch(`${API_BASE_URL}/api/extract-concepts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    if (!response.ok) throw new Error('Failed to extract concepts')
    return response.json()
  }

  async generateSummary(text, length = 'medium') {
    const response = await fetch(`${API_BASE_URL}/api/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, length })
    })
    if (!response.ok) throw new Error('Failed to generate summary')
    return response.json()
  }

  async generateFlashcards(concepts, count = 10) {
    const response = await fetch(`${API_BASE_URL}/api/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concepts, count })
    })
    if (!response.ok) throw new Error('Failed to generate flashcards')
    return response.json()
  }

  async generateQuizLLM(concepts, difficulty = 'mixed', questionCount = 10) {
    const response = await fetch(`${API_BASE_URL}/api/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        concepts, 
        difficulty, 
        question_count: questionCount 
      })
    })
    if (!response.ok) throw new Error('Failed to generate quiz')
    return response.json()
  }

  async generateStudyPlanLLM(concepts, userLevel = 'intermediate', durationDays = 7) {
    const response = await fetch(`${API_BASE_URL}/api/study-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        concepts, 
        user_level: userLevel, 
        duration_days: durationDays 
      })
    })
    if (!response.ok) throw new Error('Failed to generate study plan')
    return response.json()
  }

  async generateTopicOutline(text) {
    const response = await fetch(`${API_BASE_URL}/api/topic-outline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    if (!response.ok) throw new Error('Failed to generate outline')
    return response.json()
  }
}

const api = new ApiService()
export { api }
