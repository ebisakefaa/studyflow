import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { formatDate } from '../lib/utils'
import EmptyState from '../components/ui/EmptyState'

export default function Search({ onBack }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [courses, setCourses] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setSearched(true)

    try {
      const [cRes, sRes] = await Promise.all([
        supabase.from('courses').select('id, name, color').eq('user_id', user.id),
        fetch('/api/ai/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query.trim(), userId: user.id })
        }).then(r => r.json())
      ])

      setCourses(cRes.data || [])
      if (sRes.error) throw new Error(sRes.error)
      setResults(sRes.results || [])
    } catch (err) {
      addToast(err.message, 'error')
      setResults([])
    }

    setSearching(false)
  }

  function getCourse(courseId) {
    return courses.find(c => c.id === courseId)
  }

  return (
    <div className="animate-[viewIn_0.35s_ease-out] max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <button onClick={onBack} className="hover:text-txt transition-colors">Dashboard</button>
        <i className="fa-solid fa-chevron-right text-xs text-muted/40"></i>
        <span className="text-txt">Smart Search</span>
      </div>

      <h1 className="font-display text-2xl font-bold mb-6">Search Your Documents</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-muted/50"></i>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for concepts, terms, definitions..."
            className="w-full pl-12 pr-4 py-4 bg-s2 border border-bdr rounded-xl text-txt placeholder-muted/40 font-body text-lg focus:outline-none focus:border-accent transition-colors" autoFocus />
        </div>
      </form>

      {searching && (
        <div className="flex items-center gap-3 py-12 text-muted justify-center">
          <i className="fa-solid fa-spinner fa-spin text-accent text-lg"></i>
          <span>Searching across your documents...</span>
        </div>
      )}

      {!searching && searched && results.length === 0 && (
        <EmptyState icon="fa-magnifying-glass" title="No results found" description="Try different keywords or check if your documents have been processed." />
      )}

      {!searching && results.length > 0 && (
        <div>
          <p className="text-sm text-muted mb-4">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          <div className="flex flex-col gap-4">
            {results.map((r, i) => {
              const course = getCourse(r.course_id)
              return (
                <div key={r.id} className="bg-s2 border border-bdr rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-file-pdf text-danger text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{r.name}</div>
                      {course && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color }}></span>
                          <span className="text-xs text-muted">{course.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {r.snippets.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {r.snippets.map((snippet, si) => (
                        <div key={si} className="bg-s1 border border-bdr rounded-lg p-3 text-sm text-muted leading-relaxed">
                          <span className="text-accent font-medium">Match {si + 1}:</span>{' '}
                          <span className="text-txt/70">{highlightMatch(snippet, query)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!searching && !searched && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-s2 flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-magnifying-glass text-2xl text-muted/30"></i>
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">Search across all your documents</h3>
          <p className="text-muted text-sm max-w-md mx-auto">Type a concept, term, or question to find matching content from your uploaded PDFs.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['photosynthesis', 'Newton laws', 'binary search', 'supply and demand', 'mitosis'].map(suggestion => (
              <button key={suggestion} onClick={() => { setQuery(suggestion) }}
                className="text-xs px-3 py-1.5 rounded-full bg-s2 border border-bdr text-muted hover:text-accent hover:border-accent/30 transition-all">
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function highlightMatch(text, query) {
  if (!query.trim()) return text
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  let result = text
  words.forEach(word => {
    const regex = new RegExp('(' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi')
    result = result.replace(regex, '<mark class="bg-accent/30 text-accent rounded px-0.5">$1</mark>')
  })
  return result
}