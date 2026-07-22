import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

function PostTestPage() {
  const navigate = useNavigate()
  const { topicId } = useParams()
  const { theme } = useTheme()
  const token = localStorage.getItem('token')

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [testComplete, setTestComplete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preScore, setPreScore] = useState(null)

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

  const questions = {
    sql: [
      {
        question: "Which SQL statement is used to retrieve data from a database?",
        options: ["INSERT", "SELECT", "UPDATE", "DELETE"],
        answer: "SELECT"
      },
      {
        question: "Which SQL clause is used to filter rows based on a condition?",
        options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"],
        answer: "WHERE"
      },
      {
        question: "Which keyword removes duplicate values from query results?",
        options: ["UNIQUE", "DISTINCT", "DIFFERENT", "FILTER"],
        answer: "DISTINCT"
      },
      {
        question: "Which SQL clause is used to sort query results?",
        options: ["GROUP BY", "ORDER BY", "FILTER BY", "SORT BY"],
        answer: "ORDER BY"
      },
      {
        question: "Which SQL function counts the number of rows in a result?",
        options: ["SUM()", "AVG()", "COUNT()", "MAX()"],
        answer: "COUNT()"
      }
    ],
    er: [
      {
        question: "In a Chen ER diagram, what shape is used to represent an entity?",
        options: ["Circle", "Diamond", "Rectangle", "Triangle"],
        answer: "Rectangle"
      },
      {
        question: "In a Chen ER diagram, what shape represents an attribute?",
        options: ["Rectangle", "Diamond", "Triangle", "Oval"],
        answer: "Oval"
      },
      {
        question: "Which type of attribute uniquely identifies an entity in an ER diagram?",
        options: ["Derived attribute", "Multivalued attribute", "Key attribute", "Composite attribute"],
        answer: "Key attribute"
      },
      {
        question: "In a Chen ER diagram, what shape represents a relationship between entities?",
        options: ["Rectangle", "Oval", "Diamond", "Triangle"],
        answer: "Diamond"
      },
      {
        question: "What is a weak entity in an ER diagram?",
        options: [
          "An entity with no attributes",
          "An entity that cannot be uniquely identified without a related entity",
          "An entity with only one attribute",
          "An entity with no relationships"
        ],
        answer: "An entity that cannot be uniquely identified without a related entity"
      }
    ],
    normalisation: [
      {
        question: "What does First Normal Form (1NF) require?",
        options: [
          "No partial dependencies",
          "No transitive dependencies",
          "All attributes must be atomic with no repeating groups",
          "All attributes depend on a foreign key"
        ],
        answer: "All attributes must be atomic with no repeating groups"
      },
      {
        question: "Which of the following violates 1NF?",
        options: [
          "A table with a single primary key",
          "A table where one cell contains multiple values",
          "A table with a composite primary key",
          "A table with a foreign key"
        ],
        answer: "A table where one cell contains multiple values"
      },
      {
        question: "What does 'atomic value' mean in the context of 1NF?",
        options: [
          "A value that can be split into smaller parts",
          "A value that cannot be divided further",
          "A value that is numeric only",
          "A value that is unique"
        ],
        answer: "A value that cannot be divided further"
      },
      {
        question: "What does 2NF require in addition to 1NF?",
        options: [
          "No transitive dependencies",
          "No partial dependencies on the primary key",
          "All attributes must be atomic",
          "No multivalued attributes"
        ],
        answer: "No partial dependencies on the primary key"
      },
      {
        question: "Which normal form specifically eliminates transitive dependencies?",
        options: ["1NF", "2NF", "3NF", "4NF"],
        answer: "3NF"
      }
    ],
    fd: [
      {
        question: "What does the notation A → B mean in functional dependencies?",
        options: [
          "B determines A",
          "A determines B",
          "A and B are unrelated",
          "A equals B"
        ],
        answer: "A determines B"
      },
      {
        question: "What is a candidate key in a relation?",
        options: [
          "Any attribute in the table",
          "A minimal set of attributes that uniquely identifies a tuple",
          "Always a single attribute",
          "The same as a foreign key"
        ],
        answer: "A minimal set of attributes that uniquely identifies a tuple"
      },
      {
        question: "Which of Armstrong's axioms states that if A → B then AC → BC?",
        options: ["Reflexivity", "Augmentation", "Transitivity", "Union"],
        answer: "Augmentation"
      },
      {
        question: "What is a superkey in a relation?",
        options: [
          "A minimal set of attributes that identifies a tuple",
          "Any set of attributes that uniquely identifies a tuple",
          "Always a single attribute",
          "A foreign key reference"
        ],
        answer: "Any set of attributes that uniquely identifies a tuple"
      },
      {
        question: "Which Armstrong axiom states that if A → B and B → C then A → C?",
        options: ["Reflexivity", "Augmentation", "Transitivity", "Decomposition"],
        answer: "Transitivity"
      }
    ]
  }

  // Shuffle options once per session — different from pre-test order
  const shuffledQuestions = useMemo(() => {
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)
    return (questions[topicId] || []).map(q => ({
      ...q,
      options: shuffle(q.options)
    }))
  }, [topicId])

  const currentQ = shuffledQuestions[currentQuestion]

  const handleAnswer = (option) => {
    if (answered) return
    setSelectedAnswer(option)
    setAnswered(true)
    if (option === currentQ.answer) {
      setScore(prev => prev + 1)
    }
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setAnswered(false)
    if (currentQuestion + 1 >= shuffledQuestions.length) {
      savePostScore()
      setTestComplete(true)
    } else {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const savePostScore = async () => {
    setSaving(true)
    const postPercentage = (score / shuffledQuestions.length) * 100
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/scores`,
        {
          test_type: 'post',
          topic: topicId,
          score: postPercentage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const scoresResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/scores`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const preTests = scoresResponse.data.filter(
        s => s.test_type === 'pre' && s.topic === topicId
      )
      if (preTests.length > 0) {
        setPreScore(preTests[0].score)
      }
    } catch (err) {
      console.error('Error saving post-test score:', err)
    }
    setSaving(false)
  }

  const postPercentage = Math.round((score / shuffledQuestions.length) * 100)
  const learningGain = preScore !== null
    ? Math.round(postPercentage - preScore)
    : null

  if (shuffledQuestions.length === 0) {
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

      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">{topicEmojis[topicId]}</span>
          <h1 className="text-2xl font-bold mt-3">Post-Test</h1>
          <p className={`text-sm mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {topicNames[topicId]} — Same 5 questions as before
          </p>
        </div>

        {!testComplete ? (
          <>
            {/* Info Banner */}
            <div className={`rounded-xl p-4 border mb-6 ${
              theme === 'dark'
                ? 'bg-green-900 border-green-600'
                : 'bg-green-50 border-green-300'
            }`}>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-green-200' : 'text-green-700'
              }`}>
                🎓 Well done for completing Level 1! Answer these same questions
                again to measure how much you've learned.
              </p>
            </div>

            {/* Progress */}
            <div className="flex justify-between items-center mb-4">
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Question {currentQuestion + 1} of {shuffledQuestions.length}
              </p>
              <p className="text-sm text-green-500 font-semibold">
                Post-Test
              </p>
            </div>

            {/* Progress Bar */}
            <div className={`w-full rounded-full h-2 mb-6 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentQuestion / shuffledQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className={`rounded-xl p-6 border mb-6 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <h2 className={`text-lg font-semibold leading-relaxed ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {currentQ.question}
              </h2>
            </div>

            {/* Options — no correct/wrong highlighting */}
            <div className="flex flex-col gap-3 mb-6">
              {currentQ.options.map((option, index) => {
                let style = theme === 'dark'
                  ? 'bg-gray-800 border border-gray-700 hover:border-green-500 cursor-pointer'
                  : 'bg-white border border-gray-200 hover:border-green-500 cursor-pointer shadow-sm'

                if (answered && option === selectedAnswer) {
                  style = theme === 'dark'
                    ? 'bg-green-900 border border-green-500'
                    : 'bg-green-50 border border-green-500'
                }

                return (
                  <div
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`${style} rounded-xl p-4 transition-all duration-200`}
                  >
                    <span className={
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }>
                      {option}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Next Button */}
            {answered && (
              <button
                onClick={handleNext}
                className="w-full bg-green-600 hover:bg-green-700 text-white
                           font-bold py-3 rounded-xl transition duration-200"
              >
                {currentQuestion + 1 >= shuffledQuestions.length
                  ? 'Finish Post-Test'
                  : 'Next Question →'}
              </button>
            )}
          </>
        ) : (
          /* Results Comparison */
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Evaluation Complete!
            </h2>
            <p className={`mb-8 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Here's how your knowledge improved after using DBQuest
            </p>

            {/* Score Comparison */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className={`rounded-xl p-5 text-center border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <p className="text-3xl font-bold text-orange-500">
                  {preScore !== null ? `${Math.round(preScore)}%` : '—'}
                </p>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Pre-Test
                </p>
              </div>
              <div className={`rounded-xl p-5 text-center border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <p className="text-3xl font-bold text-green-500">
                  {postPercentage}%
                </p>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Post-Test
                </p>
              </div>
              <div className={`rounded-xl p-5 text-center border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <p className={`text-3xl font-bold ${
                  learningGain > 0
                    ? 'text-blue-500'
                    : learningGain === 0
                      ? 'text-gray-500'
                      : 'text-red-500'
                }`}>
                  {learningGain !== null
                    ? `${learningGain > 0 ? '+' : ''}${learningGain}%`
                    : '—'}
                </p>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Learning Gain
                </p>
              </div>
            </div>

            {/* Message */}
            <div className={`rounded-xl p-5 border mb-8 ${
              theme === 'dark'
                ? 'bg-blue-900 border-blue-600'
                : 'bg-blue-50 border-blue-300'
            }`}>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
              }`}>
                {learningGain > 0
                  ? `🎉 Amazing! You improved by ${learningGain}% after using DBQuest. Your score has been recorded for the study.`
                  : learningGain === 0
                    ? '👍 You maintained your score. Your result has been recorded for the study.'
                    : '📊 Your result has been recorded for the study. Thank you for participating!'
                }
              </p>
            </div>

            {/* Back to Dashboard */}
            <button
              onClick={() => navigate('/dashboard')}
              disabled={saving}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600
                         text-white font-bold py-3 rounded-xl transition duration-200"
            >
              {saving ? 'Saving...' : '🏠 Back to Dashboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostTestPage