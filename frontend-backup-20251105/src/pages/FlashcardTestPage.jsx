import { useState } from 'react'
import axios from 'axios'

export default function FlashcardTestPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [flashcards, setFlashcards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const generateFlashcards = async () => {
    if (!text.trim()) {
      alert('Please enter some text!')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/api/flashcards/generate', {
        text: text,
        num_cards: 10
      })

      if (response.data.success) {
        setFlashcards(response.data.flashcards)
        setCurrentIndex(0)
        setShowAnswer(false)
      } else {
        alert('Error: ' + response.data.error)
      }
    } catch (error) {
      console.error(error)
      alert('Failed to generate flashcards')
    } finally {
      setLoading(false)
    }
  }

  const nextCard = () => {
    setShowAnswer(false)
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
  }

  const prevCard = () => {
    setShowAnswer(false)
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const sampleText = `Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in the chloroplasts of plant cells. The process requires carbon dioxide, water, and sunlight. The main product is glucose (sugar), and oxygen is released as a byproduct. The equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2`

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0b2e 0%, #1e3a8a 50%, #000000 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center',
          background: 'linear-gradient(to right, #a78bfa, #60a5fa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🤖 AI Flashcard Generator
        </h1>
        <p style={{ textAlign: 'center', color: '#d1d5db', marginBottom: '3rem' }}>
          Powered by GPT-4
        </p>

        {flashcards.length === 0 ? (
          <div style={{
            background: 'rgba(31, 41, 55, 0.5)',
            borderRadius: '1.5rem',
            padding: '2rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              ✍️ Enter Your Study Material
            </h2>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your notes, textbook excerpt, or any study material here..."
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '1rem',
                fontSize: '1rem',
                background: '#1f2937',
                color: 'white',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setText(sampleText)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                📝 Try Sample Text
              </button>
              
              <button
                onClick={() => setText('')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: '#9ca3af',
                  border: '1px solid #4b5563',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                🗑️ Clear
              </button>
            </div>

            <button
              onClick={generateFlashcards}
              disabled={loading || !text.trim()}
              style={{
                width: '100%',
                padding: '1.25rem',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                background: loading || !text.trim() 
                  ? '#6b7280' 
                  : 'linear-gradient(to right, #9333ea, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading || !text.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Generating...' : '✨ Generate Flashcards'}
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center' }}>
              💡 Tip: More text = better flashcards (recommended: 100+ words)
            </p>
          </div>
        ) : (
          <>
            {/* Flashcard Display */}
            <div style={{
              background: 'rgba(31, 41, 55, 0.5)',
              borderRadius: '1.5rem',
              padding: '2rem',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              marginBottom: '2rem'
            }}
            onClick={() => setShowAnswer(!showAnswer)}
            >
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
                  Card {currentIndex + 1} of {flashcards.length} • 
                  Difficulty: {'⭐'.repeat(flashcards[currentIndex].difficulty)}
                </p>
                
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '2rem',
                  color: '#e5e7eb'
                }}>
                  {flashcards[currentIndex].question}
                </div>

                {showAnswer ? (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '2px solid #10b981',
                    borderRadius: '1rem',
                    padding: '2rem',
                    fontSize: '1.125rem',
                    color: '#d1fae5'
                  }}>
                    {flashcards[currentIndex].answer}
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '2px dashed #3b82f6',
                    borderRadius: '1rem',
                    padding: '2rem',
                    fontSize: '1rem',
                    color: '#93c5fd'
                  }}>
                    Click to reveal answer
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={prevCard}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                ← Previous
              </button>
              
              <button
                onClick={nextCard}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'linear-gradient(to right, #9333ea, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                Next →
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setFlashcards([])
                setText('')
              }}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'transparent',
                color: '#9ca3af',
                border: '1px solid #4b5563',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🔄 Generate New Flashcards
            </button>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0.75rem 2rem',
              background: 'transparent',
              color: '#9ca3af',
              border: '1px solid #4b5563',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
