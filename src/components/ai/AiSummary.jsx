export default function AiSummary({ summary, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8 text-muted">
        <i className="fa-solid fa-spinner fa-spin text-accent"></i>
        <span>Generating summary...</span>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div>
      <h3 className="font-display font-semibold text-sm text-accent mb-3 flex items-center gap-2">
        <i className="fa-solid fa-file-lines"></i> Summary
      </h3>
      <div className="bg-s1 border border-bdr rounded-xl p-4 text-sm text-txt/90 leading-relaxed whitespace-pre-wrap">
        {summary}
      </div>
    </div>
  )
}