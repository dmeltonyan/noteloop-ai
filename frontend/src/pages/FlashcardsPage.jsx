import React from 'react'
import { useNavigate } from 'react-router-dom'

export const FlashcardsPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '3rem' }}>🎴</h1>
      <h2>Flashcards Mode</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)' }}>Coming soon! This feature is under development.</p>
      <button onClick={() => navigate('/')} className="action-plan-button">
        Back to Home
      </button>
    </div>
  )
}
