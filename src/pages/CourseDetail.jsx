import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import { formatSize, formatDate } from '../lib/utils'
import UploadModal from '../components/documents/UploadModal'
import EditTagsModal from '../components/documents/EditTagsModal'
import DeleteDocModal from '../components/documents/DeleteDocModal'
import DeleteCourseModal from '../components/courses/DeleteCourseModal'
import PdfViewer from '../components/documents/PdfViewer'
import EmptyState from '../components/ui/EmptyState'

export default function CourseDetail({ courseId, user, onBack }) {
  const [course, setCourse] = useState(null)
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editDoc, setEditDoc] = useState(null)
  const [deleteDoc, setDeleteDoc] = useState(null)
  const [deleteCourseOpen, setDeleteCourseOpen] = useState(false)
  const [viewDoc, setViewDoc] = useState(null)
  const { addToast } = useToast()

  async function fetchData() {
    setLoading(true)
    const { data: cData } = await supabase.from('courses').select('*').eq('id', courseId).eq('user_id', user.id).single()
    const { data: dData } = await supabase.from('documents').select('*').eq('course_id', courseId).eq('user_id', user.id).order('uploaded_at', { ascending: false })
    setCourse(cData)
    setDocs(dData || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [courseId, user.id])

  async function handleUpload(file, tags) {
    const filePath = user.id + '/' + courseId + '/' + Date.now() + '_' + file.name
    const { error: uploadErr } = await supabase.storage.from('documents').upload(filePath, file)
    if (uploadErr) { addToast(uploadErr.message, 'error'); return }
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
    const { error: dbErr } = await supabase.from('documents').insert({
      user_id: user.id, course_id: courseId, name: file.name,
      storage_path: filePath, file_url: urlData.publicUrl,
      size: file.size, tags
    })
    if (dbErr) { addToast(dbErr.message, 'error'); return }
    addToast('"' + file.name + '" uploaded', 'success')
    fetchData()
  }

  async function handleSaveTags(docId, newTags) {
    const { error } = await supabase.from('documents').update({ tags: newTags }).eq('id', docId)
    if (error) { addToast(error.message, 'error'); return }
    addToast('Tags updated', 'success')
    fetchData()
  }

  async function handleDeleteDoc(doc) {
    await supabase.storage.from('documents').remove([doc.storage_path])
    const { error } = await supabase.from('documents').delete().eq('id', doc.id)
    if (error) { addToast(error.message, 'error'); return }
    addToast('Document deleted', 'success')
    fetchData()
  }

  async function handleDeleteCourse() {
    const docPaths = docs.map(d => d.storage_path)
    if (docPaths.length > 0) await supabase.storage.from('documents').remove(docPaths)
    await supabase.from('documents').delete().eq('course_id', courseId)
    const { error } = await supabase.from('courses').delete().eq('id', courseId)
    if (error) { addToast(error.message, 'error'); return }
    addToast('Course deleted', 'success')
    onBack()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <i className="fa-solid fa-spinner fa-spin mr-3 text-accent"></i> Loading...
      </div>
    )
  }

  if (!course) { onBack(); return null }

  if (viewDoc) {
    return <PdfViewer url={viewDoc.file_url} name={viewDoc.name} onClose={() => setViewDoc(null)} />
  }

  const allTags = [...new Set(docs.flatMap(d => d.tags || []))].sort()
  let filtered = docs
  if (tagFilter) filtered = filtered.filter(d => (d.tags || []).includes(tagFilter))
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || (d.tags || []).some(t => t.toLowerCase().includes(q)))
  }
  const totalSize = docs.reduce((s, d) => s + (d.size || 0), 0)

  return (
    <div className="animate-[viewIn_0.35s_ease-out]">
      <div className="flex items-center gap-2 text-sm text-muted mb-5">
        <button onClick={onBack} className="hover:text-txt transition-colors">Dashboard</button>
        <i className="fa-solid fa-chevron-right text-xs text-muted/40"></i>
        <span className="text-txt">{course.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: course.color + '20' }}>
            <i className="fa-solid fa-book text-lg" style={{ color: course.color }}></i>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{course.name}</h1>
            <p className="text-sm text-muted">{docs.length} document{docs.length !== 1 ? 's' : ''} &middot; {formatSize(totalSize)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setUploadOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm">
            <i className="fa-solid fa-cloud-arrow-up text-sm"></i> Upload PDF
          </button>
          <button onClick={() => setDeleteCourseOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-bdr hover:border-danger/50 hover:bg-danger/10 text-muted hover:text-danger transition-all" aria-label="Delete course">
            <i className="fa-solid fa-trash-can text-sm"></i>
          </button>
        </div>
      </div>

      <div className="relative mb-5">
        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50 text-sm"></i>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents or tags..."
          className="w-full pl-10 pr-4 py-2.5 bg-s2 border border-bdr rounded-xl text-sm text-txt placeholder-muted/40 font-body" />
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setTagFilter(null)} className={'text-xs px-3 py-1.5 rounded-full border transition-all ' + (!tagFilter ? 'bg-accent text-bg border-accent' : 'bg-s2 text-muted border-bdr hover:border-muted/30')}>All</button>
          {allTags.map(t => (
            <button key={t} onClick={() => setTagFilter(t)} className={'text-xs px-3 py-1.5 rounded-full border transition-all ' + (tagFilter === t ? 'bg-accent text-bg border-accent' : 'bg-s2 text-muted border-bdr hover:border-muted/30')}>{t}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="fa-file-circle-plus"
          title={search || tagFilter ? 'No matching documents' : 'No documents yet'}
          description={search || tagFilter ? 'Try adjusting your search or filter.' : 'Upload your first PDF to get started.'}
          action={!search && !tagFilter ? () => setUploadOpen(true) : null}
          actionLabel="Upload PDF"
        />
      ) : (
        <div className="bg-s2 border border-bdr rounded-xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-2.5 text-xs font-semibold text-muted/50 uppercase tracking-wider border-b border-bdr">
            <div className="col-span-5">Name</div>
            <div className="col-span-3">Tags</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filtered.map((d, i) => (
            <div key={d.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center px-5 py-3.5 hover:bg-accent/5 transition-colors" style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-bdr)' : 'none' }}>
              <div className="sm:col-span-5 flex items-center gap-3 cursor-pointer" onClick={() => setViewDoc(d)}>
                <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0"><i className="fa-solid fa-file-pdf text-danger text-sm"></i></div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate hover:text-accent transition-colors">{d.name}</div>
                  <div className="text-xs text-muted sm:hidden">{formatSize(d.size)} &middot; {formatDate(d.uploaded_at)}</div>
                </div>
              </div>
              <div className="sm:col-span-3 flex flex-wrap gap-1">
                {(d.tags || []).map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-s3 text-muted">{t}</span>)}
              </div>
              <div className="sm:col-span-2 text-sm text-muted hidden sm:block">{formatSize(d.size)}<br /><span className="text-xs text-muted/60">{formatDate(d.uploaded_at)}</span></div>
              <div className="sm:col-span-2 flex items-center gap-1 sm:justify-end">
                <button onClick={() => setEditDoc(d)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-s3 text-muted hover:text-sage transition-colors" title="Edit tags" aria-label="Edit tags"><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                <button onClick={() => setViewDoc(d)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-s3 text-muted hover:text-accent transition-colors" title="View" aria-label="View"><i className="fa-solid fa-eye text-xs"></i></button>
                <button onClick={() => setDeleteDoc(d)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-s3 text-muted hover:text-danger transition-colors" title="Delete" aria-label="Delete"><i className="fa-solid fa-trash-can text-xs"></i></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={handleUpload} courseName={course.name} />
      <EditTagsModal open={!!editDoc} onClose={() => setEditDoc(null)} document={editDoc} onSave={handleSaveTags} />
      <DeleteDocModal open={!!deleteDoc} onClose={() => setDeleteDoc(null)} document={deleteDoc} onConfirm={() => handleDeleteDoc(deleteDoc)} />
      <DeleteCourseModal open={deleteCourseOpen} onClose={() => setDeleteCourseOpen(false)} course={course} docCount={docs.length} onConfirm={handleDeleteCourse} />
    </div>
  )
}
