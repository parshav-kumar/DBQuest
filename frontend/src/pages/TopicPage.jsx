import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

function TopicPage() {
  const navigate = useNavigate()
  const { topicId } = useParams()
  const { theme } = useTheme()
  const [progress, setProgress] = useState([])
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProgress(response.data)
    } catch (err) {
      console.error('Error fetching progress:', err)
    }
  }

  const topicData = {
    sql: {
      name: 'SQL Mastery',
      emoji: '🗄️',
      color: 'blue',
      description: 'Master SQL from basic SELECT statements to complex JOINs and aggregations',
      levels: [
        { id: 1, name: 'SELECT Basics', description: 'SELECT, WHERE, DISTINCT', xp: 100 },
        { id: 2, name: 'JOINs', description: 'INNER, LEFT, CROSS JOINs', xp: 150 },
        { id: 3, name: 'GROUP BY', description: 'Aggregates, HAVING clause', xp: 200 }
      ]
    },
    er: {
      name: 'ER Diagrams',
      emoji: '📊',
      color: 'purple',
      description: 'Learn to design and read Entity Relationship diagrams',
      levels: [
        { id: 1, name: 'Entities & Attributes', description: 'Shapes, keys, attribute types', xp: 100 },
        { id: 2, name: 'Relationships', description: 'Cardinality, weak entities, M:N', xp: 150 },
        { id: 3, name: 'Advanced ER', description: 'Ternary, ISA, ERD-to-schema', xp: 200 }
      ]
    },
    normalisation: {
      name: 'Normalisation',
      emoji: '📋',
      color: 'green',
      description: 'Understand database normalisation from 1NF to 3NF',
      levels: [
        { id: 1, name: 'First Normal Form', description: 'Atomic values, no repeating groups', xp: 100 },
        { id: 2, name: 'Second Normal Form', description: 'Partial dependencies', xp: 150 },
        { id: 3, name: 'Third Normal Form', description: 'Transitive dependencies', xp: 200 }
      ]
    },
    fd: {
      name: 'Functional Dependencies',
      emoji: '🔗',
      color: 'orange',
      description: 'Master functional dependencies, closures and minimal covers',
      levels: [
        { id: 1, name: 'FD Basics', description: 'Notation, candidate keys, Armstrong axioms', xp: 100 },
        { id: 2, name: 'Closures & Covers', description: 'X+ algorithm, minimal covers', xp: 150 }
      ]
    }
  }

  const topic = topicData[topicId]

  const colorMap = {
    blue:   { text: 'text-blue-500',   border: 'border-blue-500',   bg: 'bg-blue-500',   shadow: 'shadow-blue-500/20' },
    purple: { text: 'text-purple-500', border: 'border-purple-500', bg: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
    green:  { text: 'text-green-500',  border: 'border-green-500',  bg: 'bg-green-500',  shadow: 'shadow-green-500/20' },
    orange: { text: 'text-orange-500', border: 'border-orange-500', bg: 'bg-orange-500', shadow: 'shadow-orange-500/20' }
  }

  const colors = colorMap[topic?.color]

  const isLevelPassed = (levelId) => {
    return progress.some(p => p.topic === topicId && p.level === levelId && p.passed)
  }

  const isLevelUnlocked = (levelId) => {
    if (levelId === 1) return true
    return isLevelPassed(levelId - 1)
  }

  // Level 1 goes to pre-test first
  // Level 2+ go directly to quiz
  const handleLevelClick = (levelId) => {
    if (!isLevelUnlocked(levelId)) return
    if (levelId === 1) {
      navigate(`/pretest/${topicId}`)
    } else {
      navigate(`/quiz/${topicId}/${levelId}`)
    }
  }

  if (!topic) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <p>Topic not found</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>

      {/* Navbar */}
      <Navbar />

      <div className="px-6 py-8 max-w-3xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`mb-6 flex items-center gap-2 transition duration-200 ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          ← Back to Dashboard
        </button>

        {/* Topic Header */}
        <div className="flex items-center gap-4 mb-10">
          <span className="text-5xl">{topic.emoji}</span>
          <div>
            <h1 className={`text-3xl font-bold ${colors.text}`}>{topic.name}</h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              {topic.description}
            </p>
          </div>
        </div>

        {/* Evaluation Info Banner */}
        <div className={`rounded-xl p-4 border mb-6 ${
          theme === 'dark'
            ? 'bg-yellow-900 border-yellow-600'
            : 'bg-yellow-50 border-yellow-400'
        }`}>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'
          }`}>
            📋 <strong>Evaluation Mode:</strong> Clicking Level 1 will take you to a short
            pre-test first to measure your starting knowledge. This takes about 2 minutes.
          </p>
        </div>

        {/* Levels */}
        <div className="flex flex-col gap-4">
          {topic.levels.map((level) => {
            const passed = isLevelPassed(level.id)
            const unlocked = isLevelUnlocked(level.id)

            return (
              <div
                key={level.id}
                onClick={() => handleLevelClick(level.id)}
                className={`border rounded-xl p-6 flex items-center justify-between
                            transition-all duration-300
                            ${passed
                              ? `${colors.border} shadow-lg ${colors.shadow}`
                              : theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                            }
                            ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}
                            ${unlocked
                              ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'
                              : 'opacity-50 cursor-not-allowed'
                            }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
                    ${passed
                      ? colors.bg
                      : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    {passed ? '✅' : unlocked ? '▶️' : '🔒'}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Level {level.id} — {level.name}
                      {level.id === 1 && (
                        <span className="ml-2 text-xs bg-blue-500 text-white
                                         px-2 py-0.5 rounded-full">
                          Pre-test first
                        </span>
                      )}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {level.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${colors.text}`}>+{level.xp} XP</p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    5 questions
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TopicPage