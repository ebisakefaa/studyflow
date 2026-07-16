function toLocalDateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export default function WeekView({ sessions, courses, weekMonday, onDateClick, onToggle, onDelete }) {
  const today = toLocalDateStr(new Date())
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekMonday)
    d.setDate(weekMonday.getDate() + i)
    days.push(d)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      {days.map(day => {
        const dayStr = toLocalDateStr(day)
        const daySessions = sessions.filter(s => s.date === dayStr).sort((a, b) => a.start_time.localeCompare(b.start_time))
        const isToday = dayStr === today
        const isPast = dayStr < today

        return (
          <div key={dayStr} className={'rounded-xl border p-3 min-h-[140px] transition-colors ' + (isToday ? 'border-accent/40 bg-accent/5' : isPast ? 'border-bdr/50 bg-s2/50' : 'border-bdr bg-s2')}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs text-muted uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={'text-lg font-display font-bold ' + (isToday ? 'text-accent' : 'text-txt')}>{day.getDate()}</div>
              </div>
              {daySessions.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">{daySessions.length}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {daySessions.slice(0, 3).map(s => {
                const course = courses.find(c => c.id === s.course_id)
                return (
                  <div key={s.id} className="group flex items-start gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); onToggle(s) }}
                      className={'mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ' + (s.completed ? 'border-success bg-success/20' : 'border-muted/30 hover:border-accent')}
                      aria-label="Toggle completed">
                      {s.completed && <i className="fa-solid fa-check" style={{ fontSize: '7px', color: 'var(--color-success)' }}></i>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={'text-xs truncate ' + (s.completed ? 'line-through text-muted/50' : 'text-txt/80')}>{s.title}</div>
                      <div className="text-[10px] text-muted/50">{s.start_time}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(s) }} className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center text-muted/40 hover:text-danger transition-all" aria-label="Delete">
                      <i className="fa-solid fa-xmark" style={{ fontSize: '9px' }}></i>
                    </button>
                  </div>
                )
              })}
              {daySessions.length > 3 && (
                <div className="text-[10px] text-muted/40">+{daySessions.length - 3} more</div>
              )}
            </div>
            {!isPast && (
              <button onClick={() => onDateClick(dayStr)} className="w-full mt-2 py-1 text-[10px] text-muted/30 hover:text-accent transition-colors">
                <i className="fa-solid fa-plus"></i>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}