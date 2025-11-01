import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function HomePage() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.health().then(setHealth).catch(console.error).finally(() => setLoading(false))
  }, [])

  const test = async () => {
    try {
      setResult('Testing...')
      const userId = 'demo_' + Date.now()
      await api.initializeUser(userId)
      const next = await api.getNextConcept(userId)
      const res = await api.recordInteraction(userId, next.concept_index, 1)
      setResult(`✅ SUCCESS!\n\nConcept: ${next.concept_index}\nDifficulty: ${next.difficulty.toFixed(2)}\nMastery Δ: ${res.theta_change.toFixed(3)}\nOverall: ${(res.mastery_summary.overall_mastery*100).toFixed(1)}%`)
    } catch (e) {
      setResult('❌ ' + e.message)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          NoteLoop AI
        </h1>
        <p className="text-2xl text-gray-300 mb-12">Your Adaptive Algorithm • LIVE</p>
        
        {health && (
          <div className="bg-gray-800/50 rounded-3xl p-8 max-w-md mx-auto mb-8 border-2 border-green-500/30">
            <h2 className="text-2xl font-bold mb-4 text-green-400">✓ Backend Connected</h2>
            <div className="space-y-2 text-left text-lg">
              <p>Status: <span className="text-green-400">{health.status}</span></p>
              <p>Algorithm: <span className="text-green-400">{health.adaptive_engine}</span></p>
              <p>Concepts: <span className="text-green-400">{health.concepts}</span></p>
            </div>
          </div>
        )}

        <button onClick={test} className="bg-gradient-to-r from-purple-600 to-blue-600 px-12 py-5 rounded-full text-2xl font-bold shadow-2xl hover:scale-105 transition">
          🧠 Test Your Algorithm
        </button>
        
        {result && (
          <div className="bg-gray-800 rounded-3xl p-8 max-w-2xl mx-auto mt-8">
            <pre className="whitespace-pre-wrap font-mono text-sm text-left">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
