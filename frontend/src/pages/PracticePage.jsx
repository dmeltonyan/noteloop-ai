import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const PracticePage = () => {
  const [quizzes, setQuizzes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      const feed = await api.getFeed('demo_user_123', 50)
      const quizItems = feed.filter(item => item.type === 'quiz')
      setQuizzes(quizItems)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleAnswer = async (quizId, answer, isCorrect) => {
    if (isCorrect) setScore(score + 1)
    await api.submitAnswer('demo_user_123', quizId, answer)
    
    setTimeout(() => {
      if (currentIndex < quizzes.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        alert(`Practice complete! Score: ${score + (isCorrect ? 1 : 0)}/${quizzes.length}`)
        navigate('/progress')
      }
    }, 2000)
  }

  if (loading) {
    return (
      <>
        <NavigationHeader />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
          <div className="loading-spinner"></div>
        </div>
      </>
    )
  }

  if (quizzes.length === 0) {
    return (
      <>
        <NavigationHeader />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', paddingTop: '60px' }}>
          <h2>📚 Practice Mode</h2>
          <p>Upload content first!</p>
          <button onClick={() => navigate('/')} className="action-plan-button">Go Home</button>
        </div>
      </>
    )
  }

  const currentQuiz = quizzes[currentIndex]?.content

  return (
    <>
      <NavigationHeader />
      
      <div style={{ minHeight: '100vh', padding: '80px 1rem 2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1>🧠 Practice Mode</h1>
            <p>Question {currentIndex + 1} of {quizzes.length} • Score: {score}/{currentIndex}</p>
          </div>

          {currentQuiz && <QuizDisplay quiz={currentQuiz} onAnswer={handleAnswer} />}
        </div>
      </div>
    </>
  )
}

const QuizDisplay = ({ quiz, onAnswer }) => {
  const [selected, setSelected] = useState(null)
  const [correct, setCorrect] = useState(null)

  const handleSelect = (answer) => {
    if (selected) return
    setSelected(answer)
    const isCorrect = answer === quiz.correct_answer
    setCorrect(isCorrect)
    onAnswer(quiz.id, answer, isCorrect)
  }

  return (
    <div style={{ background: 'var(--color-card-bg)', padding: '2rem', borderRadius: '16px' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{quiz.question}</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {quiz.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(option)}
            disabled={!!selected}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: selected === option ? (correct ? 'var(--color-success)' : 'var(--color-secondary)') : 'transparent',
              background: selected === option ? (correct ? 'var(--color-success)' : 'var(--color-secondary)') : 'var(--color-border-subtle)',
              color: 'white',
              cursor: selected ? 'default' : 'pointer',
              textAlign: 'left',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <span style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
              {String.fromCharCode(65 + i)}
            </span>
            <span style={{ flex: 1 }}>{option}</span>
            {selected && option === quiz.correct_answer && <CheckCircle size={20} />}
          </button>
        ))}
      </div>

      {selected && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          borderRadius: '12px',
          background: correct ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          border: `2px solid ${correct ? 'var(--color-success)' : 'var(--color-secondary)'}`,
          color: correct ? 'var(--color-success)' : 'var(--color-secondary)'
        }}>
          <strong>{correct ? '✅ Correct!' : '❌ Incorrect'}</strong>
          {quiz.explanation && <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{quiz.explanation}</p>}
        </div>
      )}
    </div>
  )
}
