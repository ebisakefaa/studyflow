export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 rounded-3xl bg-s3 flex items-center justify-center mb-6">
        <i className="fa-solid fa-compass text-3xl text-muted/30"></i>
      </div>
      <h1 className="font-display text-4xl font-bold mb-3">404</h1>
      <p className="text-muted text-lg mb-6">Page not found</p>
      <a href="/" className="px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm">Go to Dashboard</a>
    </div>
  )
}
