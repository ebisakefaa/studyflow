import { useState, useRef } from 'react'
import Modal from '../ui/Modal'

const PRESET_TAGS = ['Lecture','Assignment','Tutorial','Lab','Notes','Reading','Syllabus','Exam','Important']

export default function UploadModal({ open, onClose, onUpload, courseName }) {
  const [file, setFile] = useState(null)
  const [tags, setTags] = useState(new Set())
  const [customTag, setCustomTag] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  function processFile(f) {
    if (f.type !== 'application/pdf') { return 'Only PDF files are supported' }
    if (f.size > 10 * 1024 * 1024) { return 'File exceeds 10 MB limit' }
    setFile(f)
    return null
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0])
  }

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

  function handleSubmit() {
    if (!file) return
    onUpload(file, [...tags])
    setFile(null)
    setTags(new Set())
    setCustomTag('')
    onClose()
  }

  function handleClose() {
    setFile(null)
    setTags(new Set())
    setCustomTag('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="p-6">
        <h2 className="font-display text-xl font-bold mb-1">Upload PDF</h2>
        <p className="text-sm text-muted mb-5">Add a document to <strong className="text-txt">{courseName}</strong>.</p>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={'border-2 border-dashed rounded-xl p-8 text-center mb-4 cursor-pointer transition-colors ' + (dragging ? 'border-accent bg-accent/5' : 'border-bdr hover:border-muted/40')}
          >
            <i className="fa-solid fa-cloud-arrow-up text-3xl text-muted/30 mb-3"></i>
            <p className="text-sm text-muted mb-1">Drag and drop a PDF here, or click to browse</p>
            <p className="text-xs text-muted/50">Maximum file size: 10 MB</p>
            <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => e.target.files[0] && processFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="bg-s1 border border-bdr rounded-xl p-3 flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0"><i className="fa-solid fa-file-pdf text-danger text-sm"></i></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{file.name}</div>
              <div className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <button onClick={() => setFile(null)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-s3 text-muted hover:text-danger transition-colors">
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>
        )}

        <label className="block text-sm text-muted mb-2">Tags (optional)</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
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
          <button onClick={handleClose} className="px-5 py-2.5 border border-bdr hover:border-muted/40 rounded-xl text-sm text-muted hover:text-txt transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={!file} className="px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm disabled:opacity-50">Upload</button>
        </div>
      </div>
    </Modal>
  )
}
