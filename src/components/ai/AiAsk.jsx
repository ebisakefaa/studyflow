import { useState } from 'react'

export default function AiAsk({ onAsk, loading }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!question.trim() || loading) return
    setAnswer('')
    const result = await onAsk(question.trim())
    setAnswer(result)
  }

  return (
    <div>
      <h3 className="font-display font-semibold text-sm text-accent mb-3 flex items-center gap-2">
        <i className="fa-solid fa-comments"></i> Ask a Question
      </h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask anything about this document..."
          className="flex-1 px-3 py-2 bg-s1 border border-bdr rounded-lg text-sm text-txt placeholder-muted/40 font-body"
          disabled={loading} />
        <button type="submit" disabled={loading || !question.trim()}
          className="px-4 py-2 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-lg transition-colors text-sm disabled:opacity-50">
          Ask
        </button>
      </form>
      {loading && (
        <div className="flex items-center gap-3 py-4 text-muted">
          <i className="fa-solid fa-spinner fa-spin text-accent"></i>
          <span>Thinking...</span>
        </div>
      )}
      {answer && !loading && (
        <div className="bg-s1 border border-bdr rounded-xl p-4 text-sm text-txt/90 leading-relaxed whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </div>
  )
}