import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TopicPage from './pages/TopicPage'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import PreTestPage from './pages/PreTestPage'
import PostTestPage from './pages/PostTestPage'
import DBBot from './components/DBBot'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/topic/:topicId" element={<TopicPage />} />
        <Route path="/quiz/:topicId/:levelId" element={<QuizPage />} />
        <Route path="/results/:topicId/:levelId/:score/:total" element={<ResultsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/pretest/:topicId" element={<PreTestPage />} />
        <Route path="/posttest/:topicId" element={<PostTestPage />} />
      </Routes>
      <DBBot />
    </Router>
  )
}

export default App