import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      
      {/* Logo and Title */}
      <div className="text-center mb-10">
        <h1 className="text-6xl font-bold text-blue-400 mb-4">DBQuest</h1>
        <p className="text-xl text-gray-300 max-w-xl">
          A Game-Based Learning Platform for Database Concepts and SQL Practice
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🎮</div>
          <h3 className="text-lg font-semibold text-blue-300 mb-2">Game-Based Learning</h3>
          <p className="text-gray-400 text-sm">11 progressive levels across 4 database topics</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="text-lg font-semibold text-blue-300 mb-2">AI-Powered Feedback</h3>
          <p className="text-gray-400 text-sm">Personalised hints and explanations powered by Claude AI</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="text-lg font-semibold text-blue-300 mb-2">Earn Badges</h3>
          <p className="text-gray-400 text-sm">Collect 11 badges and climb the leaderboard</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/register')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl text-lg transition duration-200"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/login')}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl text-lg transition duration-200"
        >
          Login
        </button>
      </div>

    </div>
  )
}

export default Landing