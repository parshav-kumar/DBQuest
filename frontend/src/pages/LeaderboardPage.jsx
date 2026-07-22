import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

function LeaderboardPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLeaderboard(response.data)
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
    }
    setLoading(false)
  }

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  const getMedalColor = (index) => {
    if (index === 0) return theme === 'dark' ? 'border-yellow-500 bg-yellow-900' : 'border-yellow-400 bg-yellow-50'
    if (index === 1) return theme === 'dark' ? 'border-gray-400 bg-gray-700' : 'border-gray-400 bg-gray-50'
    if (index === 2) return theme === 'dark' ? 'border-orange-500 bg-orange-900' : 'border-orange-400 bg-orange-50'
    return theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>

      {/* Navbar */}
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-5xl mb-3">🏆</p>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className={`mt-2 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Top students ranked by XP earned
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Loading leaderboard...
            </p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">😴</p>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              No students yet — be the first!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.username === username
              return (
                <div
                  key={index}
                  className={`rounded-xl p-4 border flex items-center justify-between
                              transition-all duration-200 ${getMedalColor(index)} ${
                    isCurrentUser ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* Rank + Username */}
                  <div className="flex items-center gap-4">
                    <div className="text-2xl w-10 text-center">
                      {getMedalEmoji(index)}
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        isCurrentUser ? 'text-blue-500' : ''
                      }`}>
                        {entry.username}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {entry.levels_completed} level{entry.levels_completed !== 1 ? 's' : ''} completed
                      </p>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <p className="font-bold text-yellow-500">
                      {entry.total_xp} XP
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {entry.levels_completed} levels
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-8 bg-blue-500 hover:bg-blue-600 text-white
                     font-bold py-3 rounded-xl transition duration-200"
        >
          ← Back to Dashboard
        </button>

      </div>
    </div>
  )
}

export default LeaderboardPage