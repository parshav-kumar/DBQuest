import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

function Dashboard() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [progress, setProgress] = useState([])
  const [badges, setBadges] = useState([])
  const [showBadges, setShowBadges] = useState(false)
  const [showXP, setShowXP] = useState(false)
  const [showLevels, setShowLevels] = useState(false)
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
    const xpMap = { 1: 100, 2: 150, 3: 200 }
    return progress
      .filter(p => p.passed)
      .reduce((total, p) => total + (xpMap[p.level] || 100), 0)
  }

  const getXPBreakdown = () => {
    const xpMap = { 1: 100, 2: 150, 3: 200 }
    const topicNames = {
      sql: 'SQL Mastery',
      er: 'ER Diagrams',
      normalisation: 'Normalisation',
      fd: 'Functional Dependencies'
    }
    return progress
      .filter(p => p.passed)
      .map(p => ({
        topic: topicNames[p.topic] || p.topic,
        level: p.level,
        xp: xpMap[p.level] || 100
      }))
      .sort((a, b) => a.topic.localeCompare(b.topic))
  }

  const getCompletedLevels = () => {
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
    const levelNames = {
      sql: { 1: 'SELECT Basics', 2: 'JOINs', 3: 'GROUP BY' },
      er: { 1: 'Entities & Attributes', 2: 'Relationships', 3: 'Advanced ER' },
      normalisation: { 1: 'First Normal Form', 2: 'Second Normal Form', 3: 'Third Normal Form' },
      fd: { 1: 'FD Basics', 2: 'Closures & Covers' }
    }
    return progress
      .filter(p => p.passed)
      .map(p => ({
        topic: topicNames[p.topic] || p.topic,
        emoji: topicEmojis[p.topic] || '📚',
        level: p.level,
        levelName: levelNames[p.topic]?.[p.level] || `Level ${p.level}`
      }))
      .sort((a, b) => a.topic.localeCompare(b.topic))
  }

  const formatBadgeName = (badgeName) => {
    const badgeMap = {
      'sql_level_1': { label: 'SQL Mastery — Level 1', emoji: '🗄️', color: 'blue' },
      'sql_level_2': { label: 'SQL Mastery — Level 2', emoji: '🗄️', color: 'blue' },
      'sql_level_3': { label: 'SQL Mastery — Level 3', emoji: '🗄️', color: 'blue' },
      'er_level_1':  { label: 'ER Diagrams — Level 1', emoji: '📊', color: 'purple' },
      'er_level_2':  { label: 'ER Diagrams — Level 2', emoji: '📊', color: 'purple' },
      'er_level_3':  { label: 'ER Diagrams — Level 3', emoji: '📊', color: 'purple' },
      'normalisation_level_1': { label: 'Normalisation — Level 1', emoji: '📋', color: 'green' },
      'normalisation_level_2': { label: 'Normalisation — Level 2', emoji: '📋', color: 'green' },
      'normalisation_level_3': { label: 'Normalisation — Level 3', emoji: '📋', color: 'green' },
      'fd_level_1': { label: 'Functional Dependencies — Level 1', emoji: '🔗', color: 'orange' },
      'fd_level_2': { label: 'Functional Dependencies — Level 2', emoji: '🔗', color: 'orange' },
    }
    return badgeMap[badgeName] || { label: badgeName, emoji: '🏅', color: 'yellow' }
  }

  const colorBadgeMap = {
    blue:   { bg: 'bg-blue-900',   border: 'border-blue-500',   text: 'text-blue-300' },
    purple: { bg: 'bg-purple-900', border: 'border-purple-500', text: 'text-purple-300' },
    green:  { bg: 'bg-green-900',  border: 'border-green-500',  text: 'text-green-300' },
    orange: { bg: 'bg-orange-900', border: 'border-orange-500', text: 'text-orange-300' },
    yellow: { bg: 'bg-yellow-900', border: 'border-yellow-500', text: 'text-yellow-300' },
  }

  const topics = [
    { id: 'sql', name: 'SQL Mastery', emoji: '🗄️', levels: 3, color: 'blue', description: 'SELECT, JOINs, GROUP BY' },
    { id: 'er', name: 'ER Diagrams', emoji: '📊', levels: 3, color: 'purple', description: 'Entities, Relationships, Advanced ER' },
    { id: 'normalisation', name: 'Normalisation', emoji: '📋', levels: 3, color: 'green', description: '1NF, 2NF, 3NF' },
    { id: 'fd', name: 'Functional Dependencies', emoji: '🔗', levels: 2, color: 'orange', description: 'FD Basics, Closures & Covers' }
  ]

  const colorMap = {
    blue:   { border: 'hover:border-blue-500',   shadow: 'hover:shadow-blue-500/20',   text: 'text-blue-500',   progress: 'bg-blue-500' },
    purple: { border: 'hover:border-purple-500', shadow: 'hover:shadow-purple-500/20', text: 'text-purple-500', progress: 'bg-purple-500' },
    green:  { border: 'hover:border-green-500',  shadow: 'hover:shadow-green-500/20',  text: 'text-green-500',  progress: 'bg-green-500' },
    orange: { border: 'hover:border-orange-500', shadow: 'hover:shadow-orange-500/20', text: 'text-orange-500', progress: 'bg-orange-500' }
  }

  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center
                   justify-center z-50 px-4"
        onClick={onClose}
      >
        <div
          className={`rounded-2xl p-6 w-full max-w-md max-h-96 overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className={`text-sm px-3 py-1 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ✕ Close
            </button>
          </div>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>

      {/* Navbar */}
      <Navbar />

      <div className="px-6 py-8 max-w-5xl mx-auto">

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mb-10">

          {/* Total XP — clickable */}
          <div
            onClick={() => getTotalXP() > 0 && setShowXP(true)}
            className={`rounded-xl p-5 text-center border transition-all duration-200 ${
              getTotalXP() > 0
                ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-blue-500'
                : ''
            } ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <p className="text-3xl font-bold text-blue-500">{getTotalXP()}</p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Total XP {getTotalXP() > 0 }
            </p>
          </div>

          {/* Badges — clickable */}
          <div
            onClick={() => badges.length > 0 && setShowBadges(true)}
            className={`rounded-xl p-5 text-center border transition-all duration-200 ${
              badges.length > 0
                ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-purple-500'
                : ''
            } ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <p className="text-3xl font-bold text-purple-500">{badges.length}</p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Badges Earned {badges.length > 0 }
            </p>
          </div>

          {/* Levels Completed — clickable */}
          <div
            onClick={() => progress.filter(p => p.passed).length > 0 && setShowLevels(true)}
            className={`rounded-xl p-5 text-center border transition-all duration-200 ${
              progress.filter(p => p.passed).length > 0
                ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-green-500'
                : ''
            } ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <p className="text-3xl font-bold text-green-500">
              {progress.filter(p => p.passed).length}
            </p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Levels Completed {progress.filter(p => p.passed).length > 0}
            </p>
          </div>
        </div>

        {/* Topic Cards */}
        <h2 className={`text-xl font-semibold mb-6 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Choose a Topic
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => {
            const completed = getLevelsCompleted(topic.id)
            const percentage = Math.round((completed / topic.levels) * 100)
            const colors = colorMap[topic.color]
            return (
              <div
                key={topic.id}
                onClick={() => navigate(`/topic/${topic.id}`)}
                className={`border rounded-xl p-6 cursor-pointer transform hover:-translate-y-1
                            transition-all duration-300 hover:shadow-lg ${colors.border} ${colors.shadow} ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{topic.emoji}</span>
                  <div>
                    <h3 className={`text-lg font-semibold ${colors.text}`}>{topic.name}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {topic.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                  <div className={`flex justify-between text-sm mb-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <span>{completed}/{topic.levels} levels</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`${colors.progress} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* XP Modal */}
      <Modal
        show={showXP}
        onClose={() => setShowXP(false)}
        title={`⚡ XP Breakdown — ${getTotalXP()} Total`}
      >
        <div className="flex flex-col gap-3">
          {getXPBreakdown().map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-center rounded-xl px-4 py-3 border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div>
                <p className={`text-sm font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.topic}
                </p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Level {item.level}
                </p>
              </div>
              <p className="font-bold text-blue-500">+{item.xp} XP</p>
            </div>
          ))}
          <div className={`flex justify-between items-center rounded-xl px-4 py-3 border mt-2 ${
            theme === 'dark'
              ? 'bg-blue-900 border-blue-500'
              : 'bg-blue-50 border-blue-300'
          }`}>
            <p className={`font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Total XP
            </p>
            <p className="font-bold text-blue-500">{getTotalXP()} XP</p>
          </div>
        </div>
      </Modal>

      {/* Badges Modal */}
      <Modal
        show={showBadges}
        onClose={() => setShowBadges(false)}
        title={`🏅 My Badges (${badges.length})`}
      >
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge, index) => {
            const { label, emoji, color } = formatBadgeName(badge.badge_name)
            const badgeColors = colorBadgeMap[color]
            return (
              <div
                key={index}
                className={`rounded-xl p-4 text-center border ${
                  theme === 'dark'
                    ? `${badgeColors.bg} ${badgeColors.border}`
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className="text-3xl mb-1">{emoji}</p>
                <p className={`text-xs font-semibold ${
                  theme === 'dark' ? badgeColors.text : 'text-gray-700'
                }`}>
                  {label}
                </p>
                <p className="text-lg mt-1">🏅</p>
              </div>
            )
          })}
        </div>
      </Modal>

      {/* Levels Modal */}
      <Modal
        show={showLevels}
        onClose={() => setShowLevels(false)}
        title={`✅ Completed Levels (${progress.filter(p => p.passed).length})`}
      >
        <div className="flex flex-col gap-3">
          {getCompletedLevels().map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className={`text-sm font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.topic}
                </p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Level {item.level} — {item.levelName}
                </p>
              </div>
              <span className="ml-auto text-green-500 font-bold">✅</span>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  )
}

export default Dashboard