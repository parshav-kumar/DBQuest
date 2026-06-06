import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

function TopicPage() {
  const navigate = useNavigate()
  const { topicId } = useParams()
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
      const response = await axios.get('http://localhost:8000/progress', {
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
    blue: { text: 'text-blue-300', border: 'border-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
    purple: { text: 'text-purple-300', border: 'border-purple-500', bg: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
    green: { text: 'text-green-300', border: 'border-green-500', bg: 'bg-green-500', shadow: 'shadow-green-500/20' },
    orange: { text: 'text-orange-300', border: 'border-orange-500', bg: 'bg-orange-500', shadow: 'shadow-orange-500/20' }
  }

  const colors = colorMap[topic?.color]

  const isLevelPassed = (levelId) => {
    return progress.some(p => p.topic === topicId && p.level === levelId && p.passed)
  }

  const isLevelUnlocked = (levelId) => {
    if (levelId === 1) return true
    return isLevelPassed(levelId - 1)
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Topic not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-8">

      {/* Back button */}
      <div className="max-w-3xl mx-auto mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-white transition duration-200 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Topic Header */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-5xl">{topic.emoji}</span>
          <div>
            <h1 className={`text-3xl font-bold ${colors.text}`}>{topic.name}</h1>
            <p className="text-gray-400">{topic.description}</p>
          </div>
        </div>
      </div>

      {/* Levels */}
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {topic.levels.map((level) => {
          const passed = isLevelPassed(level.id)
          const unlocked = isLevelUnlocked(level.id)

          return (
            <div
              key={level.id}
              onClick={() => unlocked && navigate(`/quiz/${topicId}/${level.id}`)}
              className={`bg-gray-800 border rounded-xl p-6 flex items-center justify-between transition-all duration-300
                ${passed ? `border-${topic.color}-500 shadow-lg shadow-${topic.color}-500/20` : 'border-gray-700'}
                ${unlocked ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Level status icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
                  ${passed ? colors.bg : unlocked ? 'bg-gray-700' : 'bg-gray-700'}
                `}>
                  {passed ? '✅' : unlocked ? '▶️' : '🔒'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Level {level.id} — {level.name}</h3>
                  <p className="text-gray-400 text-sm">{level.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${colors.text}`}>+{level.xp} XP</p>
                <p className="text-gray-500 text-sm">5 questions</p>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default TopicPage