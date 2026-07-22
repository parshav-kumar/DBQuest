import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'

function Landing() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden relative ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 px-4 py-2 rounded-xl text-sm font-semibold border transition duration-200 ${theme === 'dark'
            ? 'bg-gray-800 border-gray-600 text-yellow-400 hover:bg-gray-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
      >
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* Background gradient circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400 opacity-5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>

      {/* Logo and Title */}
      <div
        className={`text-center mb-10 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="inline-block animate-bounce mb-4">
          <span className="text-6xl">🎮</span>
        </div>
        <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          DBQuest
        </h1>
        <p className={`text-xl max-w-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
          A Game-Based Learning Platform for Database Concepts and SQL Practice
        </p>
      </div>

      {/* Feature Cards */}
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className={`animate-float-1 border rounded-xl p-6 text-center transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-500 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold text-blue-500 mb-2">Game-Based Learning</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            11 progressive levels across 4 database topics
          </p>
        </div>
        <div className={`animate-float-2 border rounded-xl p-6 text-center transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-500 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="text-lg font-semibold text-purple-500 mb-2">AI-Powered Feedback</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Personalised hints and explanations powered by Groq AI
          </p>
        </div>
        <div className={`animate-float-3 border rounded-xl p-6 text-center transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:border-green-500 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="text-lg font-semibold text-green-500 mb-2">Earn Badges</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Collect 11 badges and climb the leaderboard
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div
        className={`flex gap-4 transition-all duration-1000 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <button
          onClick={() => navigate('/register')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                     text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-200
                     shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/login')}
          className={`font-bold py-3 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105 border ${theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white'
              : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-900'
            }`}
        >
          Login
        </button>
      </div>

    </div>
  )
}

export default Landing