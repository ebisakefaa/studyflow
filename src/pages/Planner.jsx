import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import CreateSessionModal from '../components/planner/CreateSessionModal'
import DeleteSessionModal from '../components/planner/DeleteSessionModal'
import WeekView from '../components/planner/WeekView'
import SessionCard from '../components/planner/SessionCard'
import EmptyState from '../components/ui/EmptyState'

export default function Planner({ onBack }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [sessions, setSessions] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [view, setView] = useState('week')
  const [createOpen, setCreateOpen] = useState(false)
  const [defaultDate, setDefaultDate] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filterCourse, setFilterCourse] = useState('')

  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() + weekOffset * 7)

  useEffect(() => { fetchData() }, [user.id, weekOffset])

  async function fetchData() {
    setLoading(true)
    const start = getWeekStart(currentDate)
    const end = getWeekEnd(currentDate)

    const [cRes, sRes] = await Promise.all([
      supabase.from('courses').select('id, name, color').eq('user_id', user.id),
      supabase.from('study_sessions').select('*').eq('user_id', user.id).gte('date', start).lte('date', end).order('date', { ascending: true }).order('start_time', { ascending: true })
    ])

    setCourses(cRes.data || [])
    setSessions(sRes.data || [])
    setLoading(false)
  }

  function getWeekStart(date) {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - ((day + 6) % 7))
    return toDateStr(d)
  }

  function getWeekEnd(date) {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - ((day + 6) % 7) + 6)
    return toDateStr(d)
  }

  function toDateStr(d) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + day
  }

  function prevWeek() { setWeekOffset(w => w - 1) }
  function nextWeek() { setWeekOffset(w => w + 1) }
  function goToday() { setWeekOffset(0) }

  const filteredSessions = filterCourse ? sessions.filter(s => s.course_id === filterCourse) : sessions
  const upcomingSessions = filteredSessions.filter(s => !s.completed).sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time))
  const completedCount = filteredSessions.filter(s => s.completed).length
  const weekLabel = formatDateRange(currentDate)

  async function handleCreate(data) {
    const { error } = await supabase.from('study_sessions').insert({ ...data, user_id: user.id })
    if (error) { addToast(error.message, 'error'); return }
    addToast('Session scheduled', 'success')
    fetchData()
  }

  async function handleToggle(session) {
    const { error } = await supabase.from('study_sessions').update({ completed: !session.completed }).eq('id', session.id)
    if (error) { addToast(error.message, 'error'); return }
    fetchData()
  }

  async function handleDelete(session) {
    const { error } = await supabase.from('study_sessions').delete().eq('id', session.id)
    if (error) { addToast(error.message, 'error'); return }
    addToast('Session deleted', 'success')
    fetchData()
  }

  function handleDateClick(dateStr) {
    setDefaultDate(dateStr)
    setCreateOpen(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted"><i className="fa-solid fa-spinner fa-spin mr-3 text-accent"></i>Loading...</div>
  }

  return (
    <div className="animate-[viewIn_0.35s_ease-out]">
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <button onClick={onBack} className="hover:text-txt transition-colors">Dashboard</button>
        <i className="fa-solid fa-chevron-right text-xs text-muted/40"></i>
        <span className="text-txt">Study Planner</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Study Planner</h1>
          <p className="text-sm text-muted">{completedCount}/{filteredSessions.length} sessions completed this week</p>
        </div>
        <button onClick={() => { setDefaultDate(''); setCreateOpen(true) }} className="btn-press flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm">
          <i className="fa-solid fa-plus text-sm"></i> Schedule Session
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-s2 text-muted hover:text-txt transition-colors"><i className="fa-solid fa-chevron-left text-xs"></i></button>
          <button onClick={goToday} className="px-3 py-1.5 text-sm text-muted hover:text-accent transition-colors">Today</button>
          <button onClick={nextWeek} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-s2 text-muted hover:text-txt transition-colors"><i className="fa-solid fa-chevron-right text-xs"></i></button>
          <span className="text-sm font-medium ml-2">{weekLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="px-3 py-1.5 bg-s2 border border-bdr rounded-lg text-sm text-txt font-body appearance-none">
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex rounded-lg border border-bdr overflow-hidden">
            <button onClick={() => setView('week')} className={'px-3 py-1.5 text-xs font-medium transition-colors ' + (view === 'week' ? 'bg-accent text-bg' : 'bg-s2 text-muted hover:text-txt')}>Week</button>
            <button onClick={() => setView('list')} className={'px-3 py-1.5 text-xs font-medium transition-colors ' + (view === 'list' ? 'bg-accent text-bg' : 'bg-s2 text-muted hover:text-txt')}>List</button>
          </div>
        </div>
      </div>

      {filteredSessions.length > 0 && (
        <div className="mb-4">
          <div className="w-full h-1.5 bg-s2 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: (completedCount / filteredSessions.length * 100) + '%' }}></div>
          </div>
        </div>
      )}

      {filteredSessions.length === 0 ? (
        <EmptyState icon="fa-calendar-plus" title="No sessions this week" description="Schedule your first study session to stay on track." action={() => { setDefaultDate(''); setCreateOpen(true) }} actionLabel="Schedule Session" />
      ) : view === 'week' ? (
        <WeekView sessions={filteredSessions} courses={courses} currentDate={currentDate} onDateClick={handleDateClick} onToggle={handleToggle} onDelete={(s) => setDeleteTarget(s)} />
      ) : (
        <div className="flex flex-col gap-3">
          {upcomingSessions.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-muted/50 uppercase tracking-wider mb-2">Upcoming</div>
              {upcomingSessions.map(s => <SessionCard key={s.id} session={s} course={courses.find(c => c.id === s.course_id)} onToggle={handleToggle} onDelete={(s) => setDeleteTarget(s)} />)}
            </div>
          )}
          {filteredSessions.filter(s => s.completed).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted/50 uppercase tracking-wider mb-2">Completed</div>
              {filteredSessions.filter(s => s.completed).map(s => <SessionCard key={s.id} session={s} course={courses.find(c => c.id === s.course_id)} onToggle={handleToggle} onDelete={(s) => setDeleteTarget(s)} />)}
            </div>
          )}
        </div>
      )}

      <CreateSessionModal open={createOpen} onClose={() => setCreateOpen(false)} courses={courses} defaultDate={defaultDate} onCreate={handleCreate} />
      <DeleteSessionModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} session={deleteTarget} onConfirm={() => handleDelete(deleteTarget)} />
    </div>
  )
}

function formatDateRange(date) {
  const start = new Date(date)
  const day = start.getDay()
  const monday = new Date(start)
  monday.setDate(start.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  if (monday.getMonth() === sunday.getMonth()) {
    return monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + ' - ' + sunday.getDate()
  }
  return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' - ' + sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}