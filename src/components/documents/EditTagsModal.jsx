import { useState } from 'react'
import Modal from '../ui/Modal'

const PRESET_TAGS = ['Lecture','Assignment','Tutorial','Lab','Notes','Reading','Syllabus','Exam','Important']

export default function EditTagsModal({ open, onClose, document, onSave }) {
  const [tags, setTags] = useState(new Set(document?.tags || []))
  const [customTag, setCustomTag] = useState('')

  if (!document) return null

  function toggleTag(tag) {
    setTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  function addCustomTag() {
    const t = customTag.trim()
    if (!t || tags.has(t)) return
    setTags(prev => new Set([...prev, t]))
    setCustomTag('')
  }

  function handleSave() {
    onSave(document.id, [...tags])
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="font-display text-xl font-bold mb-1">Edit Tags</h2>
        <p className="text-sm text-muted mb-5">Manage tags for <strong className="text-txt">{document.name}</strong>.</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRESET_TAGS.map((t) => (
            <button key={t} type="button" onClick={() => toggleTag(t)}
              className={'text-xs px-3 py-1.5 rounded-full border transition-all ' + (tags.has(t) ? 'bg-accent text-bg border-accent' : 'bg-s1 text-muted border-bdr hover:border-muted/30')}>
              {t}
            </button>
          ))}
          {[...tags].filter(t => !PRESET_TAGS.includes(t)).map((t) => (
            <button key={t} type="button" onClick={() => toggleTag(t)}
              className="text-xs px-3 py-1.5 rounded-full border bg-accent text-bg border-accent transition-all">
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-5">
          <input type="text" value={customTag} onChange={(e) => setCustomTag(e.target.value)} placeholder="Add custom tag..." maxLength={30}
            className="flex-1 px-3 py-2 bg-s1 border border-bdr rounded-lg text-sm text-txt placeholder-muted/40 font-body"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag() } }} />
          <button type="button" onClick={addCustomTag} className="px-3 py-2 bg-s1 border border-bdr hover:border-muted/40 rounded-lg text-sm text-muted hover:text-txt transition-all">Add</button>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 border border-bdr hover:border-muted/40 rounded-xl text-sm text-muted hover:text-txt transition-all">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm">Save Tags</button>
        </div>
      </div>
    </Modal>
  )
}
