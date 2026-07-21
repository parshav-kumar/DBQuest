import { useState } from 'react'

function SQLEditor({ onSubmit, loading }) {
  const [query, setQuery] = useState('')
  const [checking, setChecking] = useState(false)

  const handleSubmit = async () => {
    if (!query.trim() || loading || checking) return
    setChecking(true)
    // Artificial delay — feels like it's checking
    await new Promise(resolve => setTimeout(resolve, 2000))
    setChecking(false)
    onSubmit(query)
  }

  const isLoading = loading || checking

  return (
    <div className="w-full">
      {/* Editor Header */}
      <div className="bg-gray-700 rounded-t-xl px-4 py-2 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-gray-400 text-sm ml-2 font-mono">SQL Editor</span>
      </div>

      {/* Text Area */}
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="-- Type your SQL query here..."
        disabled={isLoading}
        className="w-full bg-gray-950 text-green-400 font-mono text-sm px-4 py-4
                   border border-gray-700 focus:outline-none focus:border-blue-500
                   resize-none disabled:opacity-50"
        rows={6}
        spellCheck={false}
      />

      {/* Run Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !query.trim()}
        className={`w-full mt-0 font-bold py-3 rounded-b-xl transition-all duration-300
                    flex items-center justify-center gap-2 border-t border-gray-700
                    ${isLoading
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : !query.trim()
                        ? 'bg-gray-600 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                    }`}
      >
        {checking ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Checking your query...
          </>
        ) : loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Running...
          </>
        ) : (
          <>▶ Run Query</>
        )}
      </button>
    </div>
  )
}

export default SQLEditor