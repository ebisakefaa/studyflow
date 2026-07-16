import { useState } from 'react'
import Modal from '../ui/Modal'

function localDateStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export default function CreateSessionModal({ open, onClose, courses, defaultDate, onCreate }) {
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate || localDateStr())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  function handleSubmit(e) {
    e.preventDefault()
    if (!courseId || !title.trim()) return
    onCreate({
      course_id: courseId,
      title: title.trim(),
      date,
      start_time: startTime,
      end_time: endTime || null
    })
    setCourseId(''); setTitle(''); setStartTime('09:00'); setEndTime('10:00')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="font-display text-xl font-bold mb-1">Schedule Study Session</h2>
        <p className="text-sm text-muted mb-6">Plan your study time.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-muted mb-1.5">Course</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-4 py-3 bg-s1 border border-bdr rounded-xl text-txt font-body appearance-none">
              <option value="">Select a course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">What to study</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 5 - Arrays"
              className="w-full px-4 py-3 bg-s1 border border-bdr rounded-xl text-txt placeholder-muted/40 font-body" maxLength={100} autoFocus />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-s1 border border-bdr rounded-xl text-txt font-body" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1.5">Start Time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-s1 border border-bdr rounded-xl text-txt font-body" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">End Time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-s1 border border-bdr rounded-xl text-txt font-body" />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-bdr hover:border-muted/40 rounded-xl text-sm text-muted hover:text-txt transition-all">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm">Schedule</button>
          </div>
        </form>
      </div>
    </Modal>
  )
}