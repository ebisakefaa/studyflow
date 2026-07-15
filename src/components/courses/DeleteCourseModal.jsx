import Modal from '../ui/Modal'

export default function DeleteCourseModal({ open, onClose, course, docCount, onConfirm }) {
  if (!course) return null
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-trash-can text-2xl text-danger"></i>
        </div>
        <h2 className="font-display text-xl font-bold mb-2">Delete Course</h2>
        <p className="text-muted text-sm mb-1">Are you sure you want to delete <strong className="text-txt">{course.name}</strong>?</p>
        {docCount > 0 && <p className="text-danger text-sm mb-1">This will also delete {docCount} document{docCount !== 1 ? 's' : ''} inside this course.</p>}
        <p className="text-muted/50 text-xs mb-6">This action cannot be undone.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2.5 border border-bdr hover:border-muted/40 rounded-xl text-sm text-muted hover:text-txt transition-all">Cancel</button>
          <button onClick={() => { onConfirm(); onClose() }} className="px-5 py-2.5 bg-danger hover:bg-danger/80 text-white font-display font-semibold rounded-xl transition-colors text-sm">Delete</button>
        </div>
      </div>
    </Modal>
  )
}
