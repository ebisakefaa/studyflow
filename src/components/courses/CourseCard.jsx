export default function CourseCard({ course, docCount, tags, onClick, onDelete }) {
  return (
    <div onClick={onClick} className="course-card bg-s2 border border-bdr rounded-xl p-5 cursor-pointer group transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: course.color + '20' }}>
          <i className="fa-solid fa-book" style={{ color: course.color }}></i>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(course) }}
          className="w-7 h-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-s3 text-muted hover:text-danger transition-all"
          aria-label="Delete course">
          <i className="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>
      <h3 className="font-display font-semibold mb-1 truncate">{course.name}</h3>
      <p className="text-sm text-muted">{docCount} document{docCount !== 1 ? 's' : ''}</p>
      {tags.length > 0 && (
        <div className="mt-3 flex gap-1.5 flex-wrap">
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-s3 text-muted">{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}
