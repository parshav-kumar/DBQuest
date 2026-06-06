import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

function QuizPage() {
  const navigate = useNavigate()
  const { topicId, levelId } = useParams()
  const token = localStorage.getItem('token')

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [hint, setHint] = useState('')
  const [explanation, setExplanation] = useState('')
  const [loadingHint, setLoadingHint] = useState(false)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)

  const questions = {
    sql: {
      1: [
        {
          question: "Which SQL statement is used to retrieve data from a database?",
          options: ["GET", "SELECT", "FETCH", "RETRIEVE"],
          answer: "SELECT",
        },
        {
          question: "Which clause is used to filter rows in a SQL query?",
          options: ["FILTER", "HAVING", "WHERE", "LIMIT"],
          answer: "WHERE",
        },
        {
          question: "What does SELECT DISTINCT do?",
          options: [
            "Selects all rows including duplicates",
            "Selects only unique values",
            "Selects the first row only",
            "Selects rows in alphabetical order"
          ],
          answer: "Selects only unique values",
        },
        {
          question: "Which of the following correctly selects all columns from a table called 'students'?",
          options: [
            "SELECT all FROM students",
            "SELECT * FROM students",
            "GET * FROM students",
            "FETCH all FROM students"
          ],
          answer: "SELECT * FROM students",
        },
        {
          question: "What is the correct order of clauses in a basic SELECT query?",
          options: [
            "FROM, WHERE, SELECT",
            "WHERE, SELECT, FROM",
            "SELECT, FROM, WHERE",
            "SELECT, WHERE, FROM"
          ],
          answer: "SELECT, FROM, WHERE",
        }
      ],
      2: [
        {
          question: "Which JOIN returns all rows from both tables, matching where possible?",
          options: ["INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN"],
          answer: "FULL OUTER JOIN",
        },
        {
          question: "Which JOIN returns only the rows that have matching values in both tables?",
          options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN"],
          answer: "INNER JOIN",
        },
        {
          question: "What does a CROSS JOIN produce?",
          options: [
            "Only matching rows",
            "The Cartesian product of two tables",
            "Rows from the left table only",
            "Rows with NULL values only"
          ],
          answer: "The Cartesian product of two tables",
        },
        {
          question: "Which JOIN returns all rows from the left table and matching rows from the right?",
          options: ["INNER JOIN", "RIGHT JOIN", "FULL JOIN", "LEFT JOIN"],
          answer: "LEFT JOIN",
        },
        {
          question: "In a LEFT JOIN, what value appears for non-matching rows from the right table?",
          options: ["0", "Empty string", "NULL", "False"],
          answer: "NULL",
        }
      ],
      3: [
        {
          question: "Which clause is used to group rows with the same values?",
          options: ["ORDER BY", "GROUP BY", "HAVING", "PARTITION BY"],
          answer: "GROUP BY",
        },
        {
          question: "Which function counts the number of rows in a group?",
          options: ["SUM()", "AVG()", "COUNT()", "MAX()"],
          answer: "COUNT()",
        },
        {
          question: "What is the difference between WHERE and HAVING?",
          options: [
            "There is no difference",
            "WHERE filters rows before grouping, HAVING filters after grouping",
            "HAVING filters rows before grouping, WHERE filters after grouping",
            "WHERE works with aggregates, HAVING does not"
          ],
          answer: "WHERE filters rows before grouping, HAVING filters after grouping",
        },
        {
          question: "Which aggregate function returns the highest value?",
          options: ["COUNT()", "SUM()", "AVG()", "MAX()"],
          answer: "MAX()",
        },
        {
          question: "Which aggregate function calculates the average value?",
          options: ["MEAN()", "AVG()", "SUM()/COUNT()", "AVERAGE()"],
          answer: "AVG()",
        }
      ]
    },
    er: {
      1: [
        {
          question: "In an ER diagram, what shape is used to represent an entity?",
          options: ["Circle", "Diamond", "Rectangle", "Triangle"],
          answer: "Rectangle",
        },
        {
          question: "What shape represents a relationship in a Chen ER diagram?",
          options: ["Rectangle", "Circle", "Diamond", "Oval"],
          answer: "Diamond",
        },
        {
          question: "Which type of attribute uniquely identifies an entity?",
          options: ["Multivalued attribute", "Derived attribute", "Key attribute", "Composite attribute"],
          answer: "Key attribute",
        },
        {
          question: "What shape represents an attribute in a Chen ER diagram?",
          options: ["Rectangle", "Diamond", "Triangle", "Oval"],
          answer: "Oval",
        },
        {
          question: "A multivalued attribute is represented by:",
          options: [
            "A single oval",
            "A double oval",
            "A dashed oval",
            "A rectangle"
          ],
          answer: "A double oval",
        }
      ],
      2: [
        {
          question: "What does cardinality describe in an ER diagram?",
          options: [
            "The number of attributes an entity has",
            "The number of instances of one entity related to another",
            "The primary key of an entity",
            "The total number of entities"
          ],
          answer: "The number of instances of one entity related to another",
        },
        {
          question: "A weak entity is represented by:",
          options: [
            "A single rectangle",
            "A double rectangle",
            "A dashed rectangle",
            "A diamond"
          ],
          answer: "A double rectangle",
        },
        {
          question: "Which relationship type allows many instances on both sides?",
          options: ["1:1", "1:N", "M:N", "N:1"],
          answer: "M:N",
        },
        {
          question: "What is a weak entity?",
          options: [
            "An entity with no attributes",
            "An entity that cannot be uniquely identified without a related entity",
            "An entity with only one attribute",
            "An entity with no relationships"
          ],
          answer: "An entity that cannot be uniquely identified without a related entity",
        },
        {
          question: "A weak entity's relationship with its owner is called:",
          options: [
            "Strong relationship",
            "Identifying relationship",
            "Weak relationship",
            "Partial relationship"
          ],
          answer: "Identifying relationship",
        }
      ],
      3: [
        {
          question: "A ternary relationship involves how many entities?",
          options: ["1", "2", "3", "4"],
          answer: "3",
        },
        {
          question: "What does ISA represent in an ER diagram?",
          options: [
            "A many-to-many relationship",
            "An inheritance or generalisation relationship",
            "A weak entity relationship",
            "A ternary relationship"
          ],
          answer: "An inheritance or generalisation relationship",
        },
        {
          question: "When converting M:N relationships to tables, what is created?",
          options: [
            "Nothing extra is needed",
            "A junction table with foreign keys from both entities",
            "A new attribute in one of the tables",
            "A composite primary key in one table"
          ],
          answer: "A junction table with foreign keys from both entities",
        },
        {
          question: "In an ISA hierarchy, the higher level entity is called:",
          options: ["Subclass", "Subtype", "Superclass", "Parent attribute"],
          answer: "Superclass",
        },
        {
          question: "A derived attribute is shown as:",
          options: [
            "A double oval",
            "A dashed oval",
            "A rectangle",
            "A filled oval"
          ],
          answer: "A dashed oval",
        }
      ]
    },
    normalisation: {
      1: [
        {
          question: "What does 1NF require?",
          options: [
            "No partial dependencies",
            "No transitive dependencies",
            "All attributes must be atomic with no repeating groups",
            "All attributes depend on the primary key"
          ],
          answer: "All attributes must be atomic with no repeating groups",
        },
        {
          question: "Which of the following violates 1NF?",
          options: [
            "A table with a single primary key",
            "A table where one cell contains multiple values",
            "A table with a composite primary key",
            "A table with a foreign key"
          ],
          answer: "A table where one cell contains multiple values",
        },
        {
          question: "Atomic values in 1NF means:",
          options: [
            "Values that can be split into smaller parts",
            "Values that cannot be divided further",
            "Values that are numeric only",
            "Values that are unique"
          ],
          answer: "Values that cannot be divided further",
        },
        {
          question: "Repeating groups in a table violate which normal form?",
          options: ["2NF", "3NF", "1NF", "BCNF"],
          answer: "1NF",
        },
        {
          question: "Which of the following is an example of an atomic value?",
          options: [
            "A cell containing 'Math, Science, English'",
            "A cell containing 'John Smith'",
            "A cell containing multiple phone numbers",
            "A cell containing a list of items"
          ],
          answer: "A cell containing 'John Smith'",
        }
      ],
      2: [
        {
          question: "What does 2NF require in addition to 1NF?",
          options: [
            "No transitive dependencies",
            "No partial dependencies on the primary key",
            "All attributes must be atomic",
            "No multivalued attributes"
          ],
          answer: "No partial dependencies on the primary key",
        },
        {
          question: "A partial dependency occurs when:",
          options: [
            "An attribute depends on the whole composite primary key",
            "An attribute depends on only part of a composite primary key",
            "An attribute depends on a non-key attribute",
            "An attribute has no dependency"
          ],
          answer: "An attribute depends on only part of a composite primary key",
        },
        {
          question: "2NF applies to tables that have:",
          options: [
            "A single column primary key only",
            "A composite primary key",
            "No primary key",
            "A foreign key"
          ],
          answer: "A composite primary key",
        },
        {
          question: "To fix a partial dependency you should:",
          options: [
            "Remove the primary key",
            "Move the partially dependent attribute to a separate table",
            "Add more attributes",
            "Combine all attributes into one table"
          ],
          answer: "Move the partially dependent attribute to a separate table",
        },
        {
          question: "If a table has a single column primary key, it is automatically in:",
          options: ["1NF only", "2NF", "3NF", "BCNF"],
          answer: "2NF",
        }
      ],
      3: [
        {
          question: "What does 3NF require in addition to 2NF?",
          options: [
            "No partial dependencies",
            "No transitive dependencies",
            "All attributes must be atomic",
            "No multivalued attributes"
          ],
          answer: "No transitive dependencies",
        },
        {
          question: "A transitive dependency occurs when:",
          options: [
            "A non-key attribute depends on another non-key attribute",
            "An attribute depends on part of the primary key",
            "An attribute has no dependency",
            "A primary key depends on a foreign key"
          ],
          answer: "A non-key attribute depends on another non-key attribute",
        },
        {
          question: "To fix a transitive dependency you should:",
          options: [
            "Remove the primary key",
            "Move the transitively dependent attribute to a new table",
            "Add more columns",
            "Merge the tables"
          ],
          answer: "Move the transitively dependent attribute to a new table",
        },
        {
          question: "In 3NF every non-key attribute must depend on:",
          options: [
            "Another non-key attribute",
            "Part of the primary key",
            "The whole primary key and nothing but the key",
            "A foreign key"
          ],
          answer: "The whole primary key and nothing but the key",
        },
        {
          question: "Which normal form eliminates transitive dependencies?",
          options: ["1NF", "2NF", "3NF", "4NF"],
          answer: "3NF",
        }
      ]
    },
    fd: {
      1: [
        {
          question: "What does the notation A → B mean in functional dependencies?",
          options: [
            "B determines A",
            "A determines B",
            "A and B are unrelated",
            "A equals B"
          ],
          answer: "A determines B",
        },
        {
          question: "A candidate key is:",
          options: [
            "Any attribute in the table",
            "A minimal set of attributes that uniquely identifies a tuple",
            "Always a single attribute",
            "The same as a foreign key"
          ],
          answer: "A minimal set of attributes that uniquely identifies a tuple",
        },
        {
          question: "Which of Armstrong's axioms states that if A → B then AC → BC?",
          options: ["Reflexivity", "Augmentation", "Transitivity", "Union"],
          answer: "Augmentation",
        },
        {
          question: "Which Armstrong axiom states that if A → B and B → C then A → C?",
          options: ["Reflexivity", "Augmentation", "Transitivity", "Decomposition"],
          answer: "Transitivity",
        },
        {
          question: "A superkey is:",
          options: [
            "A minimal set of attributes that identifies a tuple",
            "Any set of attributes that uniquely identifies a tuple",
            "Always a single attribute",
            "A foreign key reference"
          ],
          answer: "Any set of attributes that uniquely identifies a tuple",
        }
      ],
      2: [
        {
          question: "What is the closure of an attribute set X, written X+?",
          options: [
            "The set of all attributes X depends on",
            "The set of all attributes functionally determined by X",
            "The primary key of the relation",
            "The minimal cover of X"
          ],
          answer: "The set of all attributes functionally determined by X",
        },
        {
          question: "If X+ contains all attributes of the relation, then X is a:",
          options: ["Foreign key", "Partial key", "Superkey", "Derived attribute"],
          answer: "Superkey",
        },
        {
          question: "A minimal cover (canonical cover) of a set of FDs has:",
          options: [
            "Redundant FDs removed and single attributes on the right side",
            "All possible FDs included",
            "Only one FD",
            "No left side attributes"
          ],
          answer: "Redundant FDs removed and single attributes on the right side",
        },
        {
          question: "To compute X+ you start with:",
          options: [
            "An empty set",
            "All attributes of the relation",
            "X itself",
            "The primary key"
          ],
          answer: "X itself",
        },
        {
          question: "An extraneous attribute in a FD is one that:",
          options: [
            "Is needed for the FD to hold",
            "Can be removed without changing the closure",
            "Is a primary key",
            "Appears on the right side only"
          ],
          answer: "Can be removed without changing the closure",
        }
      ]
    }
  }

  const topicQuestions = questions[topicId]?.[parseInt(levelId)] || []
  const currentQ = topicQuestions[currentQuestion]

  const handleAnswer = async (option) => {
    if (answered) return
    setSelectedAnswer(option)
    setAnswered(true)

    if (option === currentQ.answer) {
      setScore(prev => prev + 1)
    }

    // Get AI explanation
    setLoadingExplanation(true)
    try {
      const response = await axios.post(
        'http://localhost:8000/ai/explain',
        {
          question: currentQ.question,
          selected_answer: option,
          correct_answer: currentQ.answer,
          topic: topicId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setExplanation(response.data.explanation)
    } catch (err) {
      setExplanation('Could not load explanation.')
    }
    setLoadingExplanation(false)
  }

  const handleHint = async () => {
    if (answered) return
    setLoadingHint(true)
    try {
      const response = await axios.post(
        'http://localhost:8000/ai/hint',
        {
          question: currentQ.question,
          topic: topicId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHint(response.data.hint)
    } catch (err) {
      setHint('Could not load hint.')
    }
    setLoadingHint(false)
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setAnswered(false)
    setHint('')
    setExplanation('')

    if (currentQuestion + 1 >= topicQuestions.length) {
      setQuizComplete(true)
    } else {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handleFinish = async () => {
    const percentage = (score / topicQuestions.length) * 100
    const passed = percentage >= 60

    try {
      // Save progress
      await axios.post(
        'http://localhost:8000/progress',
        {
          topic: topicId,
          level: parseInt(levelId),
          score: percentage,
          passed: passed
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Save badge if passed
      if (passed) {
        await axios.post(
          'http://localhost:8000/badges',
          { badge_name: `${topicId}_level_${levelId}` },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    } catch (err) {
      console.error('Error saving progress:', err)
    }

    navigate(`/results/${topicId}/${levelId}/${score}/${topicQuestions.length}`)
  }

  if (topicQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Questions not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(`/topic/${topicId}`)}
            className="text-gray-400 hover:text-white transition duration-200"
          >
            ← Back
          </button>
          <div className="text-gray-400 text-sm">
            Question {currentQuestion + 1} of {topicQuestions.length}
          </div>
          <div className="text-blue-400 font-semibold">
            Score: {score}/{topicQuestions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestion) / topicQuestions.length) * 100}%` }}
          ></div>
        </div>

        {!quizComplete ? (
          <>
            {/* Question */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-white leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="flex flex-col gap-3 mb-6">
              {currentQ.options.map((option, index) => {
                let style = 'bg-gray-800 border border-gray-700 hover:border-blue-500 cursor-pointer'

                if (answered) {
                  if (option === currentQ.answer) {
                    style = 'bg-green-900 border border-green-500'
                  } else if (option === selectedAnswer) {
                    style = 'bg-red-900 border border-red-500'
                  } else {
                    style = 'bg-gray-800 border border-gray-700 opacity-50'
                  }
                }

                return (
                  <div
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`${style} rounded-xl p-4 transition-all duration-200`}
                  >
                    <span className="text-white">{option}</span>
                  </div>
                )
              })}
            </div>

            {/* AI Hint Button */}
            {!answered && (
              <button
                onClick={handleHint}
                disabled={loadingHint}
                className="w-full bg-purple-800 hover:bg-purple-700 border border-purple-600 text-white py-3 rounded-xl mb-4 transition duration-200"
              >
                {loadingHint ? '🤖 Getting hint...' : '💡 Get AI Hint'}
              </button>
            )}

            {/* Hint Display */}
            {hint && (
              <div className="bg-purple-900 border border-purple-600 rounded-xl p-4 mb-4">
                <p className="text-purple-200 text-sm">💡 <strong>Hint:</strong> {hint}</p>
              </div>
            )}

            {/* AI Explanation */}
            {answered && (
              <div className="bg-blue-900 border border-blue-600 rounded-xl p-4 mb-6">
                {loadingExplanation ? (
                  <p className="text-blue-200 text-sm">🤖 Getting explanation...</p>
                ) : (
                  <p className="text-blue-200 text-sm">🤖 <strong>Explanation:</strong> {explanation}</p>
                )}
              </div>
            )}

            {/* Next Button */}
            {answered && (
              <button
                onClick={handleNext}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition duration-200"
              >
                {currentQuestion + 1 >= topicQuestions.length ? 'See Results' : 'Next Question →'}
              </button>
            )}
          </>
        ) : (
          /* Quiz Complete Screen */
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {score / topicQuestions.length >= 0.6 ? '🎉' : '😔'}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {score / topicQuestions.length >= 0.6 ? 'Level Complete!' : 'Not Quite!'}
            </h2>
            <p className="text-gray-400 mb-2">
              You scored {score} out of {topicQuestions.length}
            </p>
            <p className="text-gray-400 mb-8">
              {score / topicQuestions.length >= 0.6
                ? '✅ You passed! Next level unlocked.'
                : '❌ You need 60% to pass. Try again!'}
            </p>
            <button
              onClick={handleFinish}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl text-lg transition duration-200"
            >
              Continue →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default QuizPage