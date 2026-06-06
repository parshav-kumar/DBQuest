import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Dashboard() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState([])
  const [badges, setBadges] = useState([])
  const username = localStorage.getItem('username')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    fetchProgress()
    fetchBadges()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await axios.get('http://localhost:8000/progress', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProgress(response.data)
    } catch (err) {
      console.error('Error fetching progress:', err)
    }
  }

  const fetchBadges = async () => {
    try {
      const response = await axios.get('http://localhost:8000/badges', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBadges(response.data)
    } catch (err) {
      console.error('Error fetching badges:', err)
    }
  }

  const getLevelsCompleted = (topic) => {
    return progress.filter(p => p.topic === topic && p.passed).length
  }

  const getTotalXP = () => {
    return progress.filter(p => p.passed).length * 100
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/')
  }

  const topics = [
    {
      id: 'sql',
      name: 'SQL Mastery',
      emoji: '🗄️',
      levels: 3,
      color: 'blue',
      description: 'SELECT, JOINs, GROUP BY'
    },
    {
      id: 'er',
      name: 'ER Diagrams',
      emoji: '📊',
      levels: 3,
      color: 'purple',
      description: 'Entities, Relationships, Advanced ER'
    },
    {
      id: 'normalisation',
      name: 'Normalisation',
      emoji: '📋',
      levels: 3,
      color: 'green',
      description: '1NF, 2NF, 3NF'
    },
    {
      id: 'fd',
      name: 'Functional Dependencies',
      emoji: '🔗',
      levels: 2,
      color: 'orange',
      description: 'FD Basics, Closures & Covers'
    }
  ]

  const colorMap = {
    blue: {
      border: 'hover:border-blue-500',
      shadow: 'hover:shadow-blue-500/20',
      text: 'text-blue-300',
      bg: 'bg-blue-500',
      progress: 'bg-blue-500'
    },
    purple: {
      border: 'hover:border-purple-500',
      shadow: 'hover:shadow-purple-500/20',
      text: 'text-purple-300',
      bg: 'bg-purple-500',
      progress: 'bg-purple-500'
    },
    green: {
      border: 'hover:border-green-500',
      shadow: 'hover:shadow-green-500/20',
      text: 'text-green-300',
      bg: 'bg-green-500',
      progress: 'bg-green-500'
    },
    orange: {
      border: 'hover:border-orange-500',
      shadow: 'hover:shadow-orange-500/20',
      text: 'text-orange-300',
      bg: 'bg-orange-500',
      progress: 'bg-orange-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-8">

      {/* Navbar */}
      <div className="flex justify-between items-center mb-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          DBQuest
        </h1>
        <div className="flex items-center gap-6">
          <span className="text-gray-300">👋 Hey, <span className="text-blue-400 font-semibold">{username}</span></span>
          <button
            onClick={() => navigate('/leaderboard')}
            className="text-gray-300 hover:text-white transition duration-200"
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
        <div className="bg-gray-800 rounded-xl p-5 text-center border border-gray-700">
          <p className="text-3xl font-bold text-blue-400">{getTotalXP()}</p>
          <p className="text-gray-400 text-sm mt-1">Total XP</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 text-center border border-gray-700">
          <p className="text-3xl font-bold text-purple-400">{badges.length}</p>
          <p className="text-gray-400 text-sm mt-1">Badges Earned</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 text-center border border-gray-700">
          <p className="text-3xl font-bold text-green-400">
            {progress.filter(p => p.passed).length}
          </p>
          <p className="text-gray-400 text-sm mt-1">Levels Completed</p>
        </div>
      </div>

      {/* Topic Cards */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-300 mb-6">Choose a Topic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => {
            const completed = getLevelsCompleted(topic.id)
            const percentage = Math.round((completed / topic.levels) * 100)
            const colors = colorMap[topic.color]

            return (
              <div
                key={topic.id}
                onClick={() => navigate(`/topic/${topic.id}`)}
                className={`bg-gray-800 border border-gray-700 ${colors.border} rounded-xl p-6 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 hover:shadow-lg ${colors.shadow}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{topic.emoji}</span>
                  <div>
                    <h3 className={`text-lg font-semibold ${colors.text}`}>{topic.name}</h3>
                    <p className="text-gray-400 text-sm">{topic.description}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{completed}/{topic.levels} levels</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`${colors.progress} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default Dashboard