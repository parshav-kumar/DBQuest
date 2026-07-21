import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
import ReactMarkdown from 'react-markdown'

function DBBot() {
  const { theme } = useTheme()
  const token = localStorage.getItem('token')
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm DBBot 🤖 — ask me anything about SQL, ER diagrams, normalisation or functional dependencies!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen, streamingText])

  // Don't show DBBot if not logged in (must come AFTER all hooks)
  if (!token) return null

  // Typewriter effect — types out the bot reply character by character
  // Uses dynamic chunk sizing so short AND long responses both finish in ~2 seconds
  const typewriterEffect = (text) => {
    setIsStreaming(true)
    setStreamingText('')
    let i = 0
    // For short text: 1 char at a time. For long text: bigger chunks. Always ~80 steps total.
    const chunkSize = Math.max(1, Math.floor(text.length / 80))
    const interval = setInterval(() => {
      i += chunkSize
      if (i < text.length) {
        setStreamingText(text.slice(0, i))
      } else {
        // Show the full text briefly, then move it into the messages array
        setStreamingText(text)
        clearInterval(interval)
        setTimeout(() => {
          setIsStreaming(false)
          setStreamingText('')
          setMessages(prev => [...prev, { role: 'bot', text }])
          setLoading(false)
        }, 100)
      }
    }, 20) // 20ms per step = smooth ~1.6 second animation
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(
        'http://localhost:8000/ai/chat',
        { question: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      typewriterEffect(response.data.response)
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that. Try again!" }])
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Shared markdown component config — keeps formatting clean inside chat bubbles
  const markdownComponents = {
    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    code: ({ children }) => (
      <code className="bg-black/10 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
    ),
  }

  return (
    <>
      {/* Floating Button — pulse ring draws attention when chat is closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Animated ping ring behind the button */}
          <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-60" />
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-16 h-16 rounded-full bg-gradient-to-r
                       from-blue-500 to-purple-600 shadow-lg hover:shadow-xl
                       hover:scale-110 transition-all duration-300
                       flex items-center justify-center text-3xl"
          >
            🤖
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 h-[32rem] rounded-2xl shadow-2xl
                          flex flex-col z-50 overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3
                           flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="text-white font-bold text-sm">DBBot</p>
                <p className="text-blue-100 text-xs">Your database tutor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 w-7 h-7 rounded-full
                         flex items-center justify-center transition duration-200"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                  }`}
                >
                  {msg.role === 'bot' ? (
                    <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {/* Typewriter streaming bubble — shows while bot is "typing" */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-100'
                    : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                }`}>
                  <ReactMarkdown components={markdownComponents}>{streamingText}</ReactMarkdown>
                  {/* Blinking cursor at the end */}
                  <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-0.5 animate-pulse align-middle rounded-sm" />
                </div>
              </div>
            )}

            {/* "Thinking" bubble — shown while waiting for API response, before streaming starts */}
            {loading && !isStreaming && (
              <div className="flex justify-start">
                <div className={`rounded-2xl px-4 py-2 text-sm flex items-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`px-3 py-3 border-t flex items-center gap-2 ${
            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask DBBot a question..."
              disabled={loading}
              className={`flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none
                          focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400'
              }`}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400
                         text-white w-9 h-9 rounded-xl flex items-center
                         justify-center transition duration-200"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default DBBot
