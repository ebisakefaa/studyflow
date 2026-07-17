import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import PremiumModal from '../ui/PremiumModal'

export default function PremiumGate({ feature, onUpgrade }) {
  const { user } = useAuth()
  const [showPricing, setShowPricing] = useState(false)

  return (
    <>
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
          <i className="fa-solid fa-crown text-2xl text-accent"></i>
        </div>
        <h3 className="font-display font-bold text-lg mb-2">Premium Feature</h3>
        <p className="text-muted text-sm mb-5">You have used your free {feature} generation.</p>
        <button onClick={() => setShowPricing(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm">
          <i className="fa-solid fa-crown text-xs"></i> Upgrade to Premium
        </button>
        {onUpgrade && <button onClick={onUpgrade} className="text-muted/40 text-xs mt-3 hover:text-muted transition-colors">Maybe later</button>}
      </div>
      <PremiumModal open={showPricing} onClose={() => setShowPricing(false)} user={user} />
    </>
  )
}