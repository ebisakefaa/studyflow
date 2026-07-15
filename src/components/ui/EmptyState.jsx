export default function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div className="bg-s2 border border-bdr border-dashed rounded-xl p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-s3 flex items-center justify-center mx-auto mb-4">
        <i className={'fa-solid ' + icon + ' text-2xl text-muted/40'}></i>
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted text-sm mb-5 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action}
          className="px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm"
        >
          {actionLabel || 'Get Started'}
        </button>
      )}
    </div>
  )
}
