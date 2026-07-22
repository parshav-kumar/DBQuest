import confetti from 'canvas-confetti'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

function ResultsPage() {
  const navigate = useNavigate()
  const { topicId, levelId, score, total } = useParams()
  const { theme } = useTheme()
  const token = localStorage.getItem('token')

  const [recommendation, setRecommendation] = useState('')
  const [loadingRec, setLoadingRec] = useState(true)

  // Cap score so it never exceeds total
  const totalNum = parseInt(total)
  const scoreNum = Math.min(parseInt(score), totalNum)
  const percentage = Math.round((scoreNum / totalNum) * 100)
  const passed = percentage >= 60
  const isLevel1 = parseInt(levelId) === 1

  const topicNames = {
    sql: 'SQL Mastery',
    er: 'ER Diagrams',
    normalisation: 'Normalisation',
    fd: 'Functional Dependencies'
  }

  const topicEmojis = {
    sql: '🗄️',
    er: '📊',
    normalisation: '📋',
    fd: '🔗'
  }

  useEffect(() => {
    fetchRecommendation()

    // 🎉 Big confetti burst if passed
    if (passed) {
      const duration = 3000
      const end = Date.now() + duration
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b']
        })
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b']
        })
        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }
  }, [])

  const fetchRecommendation = async () => {
    setLoadingRec(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/ai/recommend`,
        {
          question: String(percentage),
          topic: topicId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRecommendation(response.data.recommendation)
    } catch {
      setRecommendation('Keep practising to strengthen your understanding of this topic.')
    }
    setLoadingRec(false)
  }

  const getMaxLevels = (topic) => {
    const maxLevels = {
      sql: 3,
      er: 3,
      normalisation: 3,
      fd: 2
    }
    return maxLevels[topic] || 3
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>

      {/* Navbar */}
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Topic Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">{topicEmojis[topicId]}</span>
          <h2 className={`text-lg mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {topicNames[topicId]} — Level {levelId}
          </h2>
        </div>

        {/* Result Banner */}
        <div className={`rounded-2xl p-8 text-center mb-6 border ${
          passed
            ? 'bg-green-900 border-green-500'
            : 'bg-red-900 border-red-500'
        }`}>
          <div className="text-6xl mb-4">
            {passed ? '🎉' : '😔'}
          </div>
          <h1 className={`text-4xl font-bold mb-2 ${
            passed ? 'text-green-300' : 'text-red-300'
          }`}>
            {passed ? 'Level Passed!' : 'Not Quite!'}
          </h1>
          <p className={`text-lg ${
            passed ? 'text-green-400' : 'text-red-400'
          }`}>
            {passed
              ? '✅ Next level unlocked!'
              : '❌ You need 60% to pass. Give it another go!'}
          </p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`rounded-xl p-5 text-center border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <p className="text-3xl font-bold text-blue-500">
              {scoreNum}/{totalNum}
            </p>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Score
            </p>
          </div>
          <div className={`rounded-xl p-5 text-center border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <p className={`text-3xl font-bold ${
              passed ? 'text-green-500' : 'text-red-500'
            }`}>
              {percentage}%
            </p>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Percentage
            </p>
          </div>
          <div className={`rounded-xl p-5 text-center border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <p className="text-3xl font-bold text-yellow-500">
              {passed ? '+100' : '+0'}
            </p>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              XP Earned
            </p>
          </div>
        </div>

        {/* Badge Earned */}
        {passed && (
          <div className={`rounded-xl p-5 text-center border mb-6 ${
            theme === 'dark'
              ? 'bg-gray-800 border-yellow-600'
              : 'bg-yellow-50 border-yellow-400'
          }`}>
            <p className="text-4xl mb-2">🏅</p>
            <p className={`font-bold text-lg ${
              theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
            }`}>
              Badge Earned!
            </p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {topicNames[topicId]} — Level {levelId} Badge
            </p>
          </div>
        )}

        {/* Post-test banner — only on Level 1 when passed */}
        {passed && isLevel1 && (
          <div className={`rounded-xl p-5 border mb-6 ${
            theme === 'dark'
              ? 'bg-green-900 border-green-600'
              : 'bg-green-50 border-green-400'
          }`}>
            <p className={`text-sm font-bold mb-1 ${
              theme === 'dark' ? 'text-green-300' : 'text-green-700'
            }`}>
              📝 One More Step!
            </p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-green-200' : 'text-green-600'
            }`}>
              Please take the post-test to complete your evaluation.
              It's the same 3 questions as before — takes 2 minutes!
            </p>
          </div>
        )}

        {/* AI Recommendation */}
        <div className={`rounded-xl p-5 border mb-8 ${
          theme === 'dark'
            ? 'bg-blue-900 border-blue-600'
            : 'bg-blue-50 border-blue-300'
        }`}>
          <p className={`text-sm font-bold mb-2 ${
            theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
          }`}>
            🤖 AI Study Recommendation
          </p>
          {loadingRec ? (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
            }`}>
              Getting personalised recommendation...
            </p>
          ) : (
            <p className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
            }`}>
              {recommendation}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">

          {/* Post-test button — only on Level 1 when passed */}
          {passed && isLevel1 && (
            <button
              onClick={() => navigate(`/posttest/${topicId}`)}
              className="w-full bg-green-600 hover:bg-green-700 text-white
                         font-bold py-3 rounded-xl transition duration-200"
            >
              📝 Take Post-Test →
            </button>
          )}

          {/* Next Level button — Level 2 and 3 only */}
          {passed && !isLevel1 && parseInt(levelId) < getMaxLevels(topicId) && (
            <button
              onClick={() => navigate(`/quiz/${topicId}/${parseInt(levelId) + 1}`)}
              className="w-full bg-green-600 hover:bg-green-700 text-white
                         font-bold py-3 rounded-xl transition duration-200"
            >
              ▶ Next Level →
            </button>
          )}

          {/* Back to Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white
                       font-bold py-3 rounded-xl transition duration-200"
          >
            🏠 Back to Dashboard
          </button>

          {/* Try Again */}
          <button
            onClick={() => {
              navigate(`/quiz/${topicId}/${levelId}`)
              window.location.reload()
            }}
            className={`w-full font-bold py-3 rounded-xl transition duration-200 border ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-white'
                : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-900'
            }`}
          >
            🔄 Try Again
          </button>

        </div>
      </div>
    </div>
  )
}

export default ResultsPage