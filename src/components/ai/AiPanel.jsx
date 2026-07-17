import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../hooks/useAiUsage'
import { extractTextFromPdf } from '../../lib/pdfExtractor'
import AiSummary from './AiSummary'
import AiFlashcards from './AiFlashcards'
import AiQuiz from './AiQuiz'
import AiAsk from './AiAsk'
import PremiumGate from './PremiumGate'

const TABS = [
  { id: 'summary', label: 'Summary', icon: 'fa-file-lines' },
  { id: 'flashcards', label: 'Flashcards', icon: 'fa-clone' },
  { id: 'quiz', label: 'Quiz', icon: 'fa-circle-question' },
  { id: 'ask', label: 'Ask', icon: 'fa-comments' },
]

export default function AiPanel({ url }) {
  const [activeTab, setActiveTab] = useState('summary')
  const [extracting, setExtracting] = useState(false)
  const [summary, setSummary] = useState(null)
  const [flashcards, setFlashcards] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState({})
  const [blocked, setBlocked] = useState(false)
  const { addToast } = useToast()
  const { user } = useAuth()
  const { canUse, use: markUsed, getRemaining } = useAiUsage(user?.id)

  async function getText() {
    setExtracting(true)
    try {
      const text = await extractTextFromPdf(url)
      setExtracting(false)
      return text
    } catch (err) {
      setExtracting(false)
      addToast('Failed to extract text from PDF', 'error')
      return null
    }
  }

  async function callApi(endpoint, body) {
    const res = await fetch('/api/ai/' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data
  }

  async function handleTabClick(tabId) {
    setActiveTab(tabId)

    if (tabId === 'ask') return

    if (!canUse()) {
      setBlocked(true)
      return
    }

    setBlocked(false)
    setLoading(prev => ({ ...prev, [tabId]: true }))
    const text = await getText()
    if (!text) { setLoading(prev => ({ ...prev, [tabId]: false })); return }

    try {
      let result
      if (tabId === 'summary') {
        result = await callApi('summarize', { text: text.slice(0, 15000) })
        if (result.summary) setSummary(result.summary)
      } else if (tabId === 'flashcards') {
        result = await callApi('flashcards', { text: text.slice(0, 15000) })
        if (result.flashcards) setFlashcards(result.flashcards)
      } else if (tabId === 'quiz') {
        result = await callApi('quiz', { text: text.slice(0, 15000) })
        if (result.quiz) setQuiz(result.quiz)
      }

      markUsed()
    } catch (err) {
      addToast(err.message, 'error')
    }

    setLoading(prev => ({ ...prev, [tabId]: false }))
  }

  async function handleAsk(question) {
    if (!canUse()) {
      setBlocked(true)
      setActiveTab('ask')
      return 'You have used all your free AI requests. Upgrade to Premium for unlimited access.'
    }

    const text = await getText()
    if (!text) return 'Failed to extract text from document.'

    try {
      const result = await callApi('ask', { text: text.slice(0, 15000), question })
      markUsed()
      return result.answer
    } catch (err) {
      addToast(err.message, 'error')
      return 'Sorry, something went wrong.'
    }
  }

  function handleUpgrade() { addToast('Premium coming soon! Stay tuned.', 'info') }

  return (
    <div className="bg-s2 border border-bdr rounded-xl overflow-hidden">
      <div className="flex border-b border-bdr">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => handleTabClick(tab.id)}
            className={'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ' + (activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-txt')}>
            <i className={'fa-solid ' + tab.icon + ' text-xs'}></i>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="p-4">
        {extracting && (
          <div className="flex items-center gap-3 py-8 text-muted">
            <i className="fa-solid fa-spinner fa-spin text-accent"></i>
            <span>Extracting text from PDF...</span>
          </div>
        )}
        {!extracting && blocked && (
          <PremiumGate feature="AI tools" onUpgrade={handleUpgrade} />
        )}
        {!extracting && !blocked && activeTab === 'summary' && <AiSummary summary={summary} loading={loading.summary} />}
        {!extracting && !blocked && activeTab === 'flashcards' && <AiFlashcards flashcards={flashcards} loading={loading.flashcards} />}
        {!extracting && !blocked && activeTab === 'quiz' && <AiQuiz quiz={quiz} loading={loading.quiz} />}
        {!extracting && !blocked && activeTab === 'ask' && <AiAsk onAsk={handleAsk} loading={loading.ask} />}
      </div>
    </div>
  )
}