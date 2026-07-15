import { useState } from 'react'

export default function AiFlashcards({ flashcards, loading }) {
  const [flipped, setFlipped] = useState({})

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8 text-muted">
        <i className="fa-solid fa-spinner fa-spin text-accent"></i>
        <span>Generating flashcards...</span>
      </div>
    )
  }

  if (!flashcards || flashcards.length === 0) return null

  function toggleFlip(index) {
    setFlipped(prev => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div>
      <h3 className="font-display font-semibold text-sm text-accent mb-3 flex items-center gap-2">
        <i className="fa-solid fa-clone"></i> Flashcards ({flashcards.length})
      </h3>
      <div className="flex flex-col gap-3">
        {flashcards.map((card, i) => (
          <div key={i} onClick={() => toggleFlip(i)}
            className="cursor-pointer bg-s1 border border-bdr rounded-xl p-4 transition-all hover:border-accent/30 min-h-[80px] flex items-center">
            <div className="w-full">
              {flipped[i] ? (
                <div>
                  <div className="text-xs text-sage mb-1 font-medium">Answer</div>
                  <div className="text-sm text-txt/90">{card.back}</div>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-accent mb-1 font-medium">Question</div>
                  <div className="text-sm text-txt/90">{card.front}</div>
                </div>
              )}
            </div>
            <div className="shrink-0 ml-3 text-muted/40 text-xs">
              <i className={'fa-solid ' + (flipped[i] ? 'fa-rotate-left' : 'fa-rotate')}></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}