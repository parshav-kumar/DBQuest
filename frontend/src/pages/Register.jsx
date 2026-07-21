import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
import { useState, useEffect } from 'react'

function Register() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({
    username: '',
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

    // Password strength validation
    const password = formData.password
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter')
      setLoading(false)
      return
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number')
      setLoading(false)
      return
    }

    try {
      await axios.post('http://localhost:8000/register', formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
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
        <h1 className="text-3xl font-bold text-blue-500 text-center mb-2">Join DBQuest</h1>
        <p className={`text-center mb-8 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Create your account to start learning
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
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              minLength={3}
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
              <span className={`ml-2 text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                (min 6 chars, 1 uppercase, 1 number)
              </span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="e.g. Hello123"
              required
              minLength={6}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className={`text-center mt-6 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>

      </div>
    </div>
  )
}

export default Register