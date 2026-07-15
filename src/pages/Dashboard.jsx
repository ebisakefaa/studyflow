import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import { getGreeting, formatSize } from '../lib/utils'
import CourseCard from '../components/courses/CourseCard'
import CreateCourseModal from '../components/courses/CreateCourseModal'
import DeleteCourseModal from '../components/courses/DeleteCourseModal'
import EmptyState from '../components/ui/EmptyState'

export default function Dashboard({ user, onNavigateCourse }) {
  const [courses, setCourses] = useState([])
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { addToast } = useToast()

  async function fetchData() {
    setLoading(true)
    const { data: courseData, error: cErr } = await supabase
      .from('courses')
      .select('id, name, color, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (cErr) { addToast('Failed to load courses', 'error'); setLoading(false); return }

    const { data: docData, error: dErr } = await supabase
      .from('documents')
      .select('id, name, course_id, size, uploaded_at, tags')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })
      .limit(5)
    if (dErr) { addToast('Failed to load documents', 'error') }

    const coursesWithCount = courseData.map(c => ({
      ...c,
      doc_count: (docData || []).filter(d => d.course_id === c.id).length
    }))

    setCourses(coursesWithCount)
    setRecentDocs(docData || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [user.id])

  async function handleCreate({ name, color }) {
    const { error } = await supabase.from('courses').insert({ user_id: user.id, name, color })
    if (error) { addToast(error.message, 'error'); return }
    addToast('"' + name + '" created', 'success')
    fetchData()
  }

  async function handleDelete(course) {
    const { error: dErr } = await supabase.from('documents').delete().eq('course_id', course.id)
    const { error: cErr } = await supabase.from('courses').delete().eq('id', course.id)
    if (cErr) { addToast(cErr.message, 'error'); return }
    addToast('Course deleted', 'success')
    setDeleteTarget(null)
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <i className="fa-solid fa-spinner fa-spin mr-3 text-accent"></i> Loading...
      </div>
    )
  }

  const totalDocs = recentDocs.length
  const totalSize = recentDocs.reduce((s, d) => s + (d.size || 0), 0)
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Student'

  return (
    <div className="animate-[viewIn_0.35s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">{getGreeting()}, {firstName}</h1>
          <p className="text-muted">Here is an overview of your workspace.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors">
          <i className="fa-solid fa-plus text-sm"></i> New Course
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-s2 border border-bdr rounded-xl p-4">
          <div className="text-muted text-xs font-medium uppercase tracking-wider mb-1">Courses</div>
          <div className="font-display text-2xl font-bold text-accent">{courses.length}</div>
        </div>
        <div className="bg-s2 border border-bdr rounded-xl p-4">
          <div className="text-muted text-xs font-medium uppercase tracking-wider mb-1">Documents</div>
          <div className="font-display text-2xl font-bold text-sage">{totalDocs}</div>
        </div>
        <div className="bg-s2 border border-bdr rounded-xl p-4 col-span-2 sm:col-span-1">
          <div className="text-muted text-xs font-medium uppercase tracking-wider mb-1">Storage Used</div>
          <div className="font-display text-2xl font-bold text-txt">{formatSize(totalSize)}</div>
        </div>
      </div>

      <h2 className="font-display text-lg font-semibold mb-4">Your Courses</h2>
      {courses.length === 0 ? (
        <EmptyState icon="fa-graduation-cap" title="No courses yet" description="Create your first course to start organizing study materials." action={() => setCreateOpen(true)} actionLabel="Get Started" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {courses.map(c => <CourseCard key={c.id} course={c} docCount={c.doc_count} tags={[]} onClick={() => onNavigateCourse(c.id)} onDelete={setDeleteTarget} />)}
        </div>
      )}

      {recentDocs.length > 0 && (
        <>
          <h2 className="font-display text-lg font-semibold mb-4">Recent Uploads</h2>
          <div className="bg-s2 border border-bdr rounded-xl overflow-hidden">
            {recentDocs.map((d, i) => {
              const course = courses.find(c => c.id === d.course_id)
              return (
                <div key={d.id} onClick={() => onNavigateCourse(d.course_id)} className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-accent/5 transition-colors" style={{ borderBottom: i < recentDocs.length - 1 ? '1px solid var(--color-bdr)' : 'none' }}>
                  <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0"><i className="fa-solid fa-file-pdf text-danger text-sm"></i></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.name}</div>
                    <div className="text-xs text-muted">{course ? course.name : 'Unknown'} &middot; {formatSize(d.size)}</div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-xs text-muted/40"></i>
                </div>
              )
            })}
          </div>
        </>
      )}

      <CreateCourseModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      <DeleteCourseModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} course={deleteTarget} docCount={deleteTarget?.doc_count || 0} onConfirm={() => handleDelete(deleteTarget)} />
    </div>
  )
}
