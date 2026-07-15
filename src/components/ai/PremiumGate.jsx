export default function PremiumGate({ feature, onUpgrade }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
        <i className="fa-solid fa-crown text-2xl text-accent"></i>
      </div>
      <h3 className="font-display font-bold text-lg mb-2">Premium Feature</h3>
      <p className="text-muted text-sm mb-1">You have used your free {feature} generation.</p>
      <p className="text-muted text-sm mb-5">Upgrade to StudyFlow Premium for unlimited AI-powered study tools.</p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button onClick={onUpgrade} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm">
          <i className="fa-solid fa-crown text-xs"></i> Upgrade to Premium
        </button>
      </div>
      <p className="text-muted/40 text-xs mt-4">One free use per feature included with your account.</p>
    </div>
  )
}