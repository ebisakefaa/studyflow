import { useState } from 'react'
import Modal from '../ui/Modal'

const COLORS = ['#d4a039','#c4503a','#6aaa7b','#4a8fa8','#b07cc6','#d4785c','#6b8fd4','#c9a84c']

export default function CreateCourseModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({ name: name.trim(), color })
    setName('')
    setColor(COLORS[0])
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="font-display text-xl font-bold mb-1">Create New Course</h2>
        <p className="text-sm text-muted mb-6">Add a course to organize your study materials.</p>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-muted mb-1.5">Course Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Programming Fundamentals"
            className="w-full px-4 py-3 bg-s1 border border-bdr rounded-xl text-txt placeholder-muted/40 font-body mb-4" maxLength={80} autoFocus />
          <label className="block text-sm text-muted mb-2">Color</label>
          <div className="flex gap-3 mb-6">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={'w-8 h-8 rounded-full transition-transform ' + (color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-s2' : 'hover:scale-110')}
                style={{ backgroundColor: c, ringColor: c }} />
            ))}
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-bdr hover:border-muted/40 rounded-xl text-sm text-muted hover:text-txt transition-all">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm">Create Course</button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
