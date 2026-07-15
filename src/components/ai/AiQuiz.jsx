import { useState } from 'react'

export default function AiQuiz({ quiz, loading }) {
  const [selected, setSelected] = useState({})
  const [showResults, setShowResults] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8 text-muted">
        <i className="fa-solid fa-spinner fa-spin text-accent"></i>
        <span>Generating quiz...</span>
      </div>
    )
  }

  if (!quiz || quiz.length === 0) return null

  function selectOption(qIndex, option) {
    if (showResults) return
    setSelected(prev => ({ ...prev, [qIndex]: option }))
  }

  function submitQuiz() {
    setShowResults(true)
  }

  function resetQuiz() {
    setSelected({})
    setShowResults(false)
  }

  const score = quiz.filter((q, i) => selected[i] === q.correct).length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-sm text-accent flex items-center gap-2">
          <i className="fa-solid fa-circle-question"></i> Quiz ({quiz.length} questions)
        </h3>
        {showResults && (
          <div className="flex items-center gap-3">
            <span className={'text-sm font-semibold ' + (score === quiz.length ? 'text-success' : score >= quiz.length / 2 ? 'text-accent' : 'text-danger')}>
              {score}/{quiz.length}
            </span>
            <button onClick={resetQuiz} className="text-xs text-muted hover:text-accent transition-colors">Retry</button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {quiz.map((q, qi) => {
          const isCorrect = selected[qi] === q.correct
          const isWrong = showResults && selected[qi] && !isCorrect

          return (
            <div key={qi} className="bg-s1 border border-bdr rounded-xl p-4">
              <div className="text-sm font-medium mb-3">{qi + 1}. {q.question}</div>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, oi) => {
                  let classes = 'text-sm px-3 py-2 rounded-lg border transition-all cursor-pointer '
                  if (showResults && opt === q.correct) {
                    classes += 'border-success bg-success/10 text-success'
                  } else if (isWrong && opt === selected[qi]) {
                    classes += 'border-danger bg-danger/10 text-danger'
                  } else if (selected[qi] === opt && !showResults) {
                    classes += 'border-accent bg-accent/10 text-accent'
                  } else {
                    classes += 'border-bdr text-muted hover:border-muted/40 hover:text-txt'
                  }
                  return (
                    <button key={oi} onClick={() => selectOption(qi, opt)} className={classes} disabled={showResults}>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {!showResults && Object.keys(selected).length > 0 && (
        <button onClick={submitQuiz} className="w-full mt-4 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm">
          Submit Answers
        </button>
      )}
    </div>
  )
}