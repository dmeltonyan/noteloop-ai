import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [userId, setUserId] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      // Check for existing user in localStorage
      let storedUserId = localStorage.getItem('noteloop_user_id')
      
      if (!storedUserId) {
        // Create new user
        storedUserId = 'demo_user_123' // Use demo user for now
        localStorage.setItem('noteloop_user_id', storedUserId)
      }
      
      setUserId(storedUserId)
      await loadProgress(storedUserId)
    } catch (error) {
      console.error('Error initializing user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = async (uid = userId) => {
    try {
      const progressData = await api.getUserProgress(uid)
      setProgress(progressData)
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const value = {
    userId,
    progress,
    loading,
    refreshProgress: () => loadProgress()
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
