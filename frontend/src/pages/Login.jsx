import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
import { useState, useEffect } from 'react'

function Login() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
const [loading, setLoading] = useState(false)

useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(''), 4000)
    return () => clearTimeout(timer)
  }
}, [error])
    
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, formData)
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('username', response.data.username)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 relative ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 px-4 py-2 rounded-xl text-sm font-semibold border transition duration-200 ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-600 text-yellow-400 hover:bg-gray-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
      >
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className={`rounded-2xl p-8 w-full max-w-md ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'
      }`}>

        {/* Header */}
        <h1 className="text-3xl font-bold text-blue-500 text-center mb-2">Welcome Back</h1>
        <p className={`text-center mb-8 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Login to continue your learning journey
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white text-sm rounded-lg p-3 mb-6 text-center animate-fade-out">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={`text-sm mb-1 block ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-900 border border-gray-200'
              }`}
            />
          </div>
          <div>
            <label className={`text-sm mb-1 block ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-900 border border-gray-200'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600
                       text-white font-bold py-3 rounded-xl text-lg
                       transition duration-200 mt-2"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Register Link */}
        <p className={`text-center mt-6 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Register here
          </span>
        </p>

      </div>
    </div>
  )
}

export default Login