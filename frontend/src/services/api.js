import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export default {
  getConcepts() {
    return api.get('/api/concepts')
  },
  createConcept(data) {
    return api.post('/api/concepts', data)
  },
  generateQuiz(topic) {
    return api.post('/api/quiz', { topic })
  },
  uploadFile(formData) {
    return api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
