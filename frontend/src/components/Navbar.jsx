import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const username = localStorage.getItem('username')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/')
  }

  return (
    <nav className={`w-full px-6 py-4 flex items-center justify-between border-b ${
      theme === 'dark'
        ? 'bg-gray-900 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>

      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        className="cursor-pointer flex items-center gap-2"
      >
        <span className="text-2xl">🎮</span>
        <span className={`text-xl font-bold ${
          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
        }`}>
          DBQuest
        </span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {/* Leaderboard */}
        <button
          onClick={() => navigate('/leaderboard')}
          className={`text-sm font-semibold transition duration-200 ${
            theme === 'dark'
              ? 'text-gray-300 hover:text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏆 Leaderboard
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition duration-200 ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-600 text-yellow-400 hover:bg-gray-700'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        {/* Username */}
        <span className={`text-sm font-medium ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          👤 {username}
        </span>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition duration-200 ${
            theme === 'dark'
              ? 'bg-red-900 hover:bg-red-800 text-red-300'
              : 'bg-red-100 hover:bg-red-200 text-red-600'
          }`}
        >
          Logout
        </button>

      </div>
    </nav>
  )
}

export default Navbar