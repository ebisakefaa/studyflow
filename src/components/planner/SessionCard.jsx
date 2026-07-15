export default function SessionCard({ session, course, onToggle, onDelete }) {
  return (
    <div className={'bg-s1 border rounded-xl p-4 transition-all ' + (session.completed ? 'border-success/20 opacity-60' : 'border-bdr hover:border-accent/20')}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(session)}
          className={'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ' + (session.completed ? 'border-success bg-success/20 text-success' : 'border-bdr hover:border-accent')}
          aria-label="Toggle completed">
          {session.completed && <i className="fa-solid fa-check text-xs"></i>}
        </button>
        <div className="flex-1 min-w-0">
          <div className={'text-sm font-medium ' + (session.completed ? 'line-through text-muted' : 'text-txt')}>{session.title}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: course?.color || '#666' }}></span>
            <span className="text-xs text-muted">{course?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted/60">
            <span><i className="fa-regular fa-calendar mr-1"></i>{formatDate(session.date)}</span>
            <span><i className="fa-regular fa-clock mr-1"></i>{session.start_time}{session.end_time ? ' - ' + session.end_time : ''}</span>
          </div>
        </div>
        <button onClick={() => onDelete(session)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-s3 text-muted hover:text-danger transition-colors shrink-0" aria-label="Delete session">
          <i className="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}