import { useState } from 'react'
import Modal from './Modal'

const PLANS = [
  { id: 'monthly', name: 'Monthly', price: '200', period: '/month', features: ['Unlimited AI summaries', 'Unlimited flashcards', 'Unlimited quizzes', 'AI question answering', 'Smart search', 'Study planner'] },
  { id: 'yearly', name: 'Yearly', price: '2000', period: '/year', badge: 'Save 2 months', features: ['Everything in Monthly', 'Priority support', 'Early access to new features', 'Best value'] }
]

export default function PremiumModal({ open, onClose, user }) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('monthly')

  async function handleSubscribe(plan) {
    setSelectedPlan(plan.id)
    setLoading(true)

    try {
      const res = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, amount: plan.price, plan: plan.id })
      })
      const data = await res.json()

      if (data.error || !data.checkout_url) {
        alert(data.error || 'Payment setup failed. Check your Chapa API key.')
        setLoading(false)
        return
      }

      window.location.href = data.checkout_url
    } catch (err) {
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <i className="fa-solid fa-crown text-2xl text-accent"></i>
          </div>
          <h2 className="font-display text-xl font-bold mb-1">Upgrade to Premium</h2>
          <p className="text-sm text-muted">Get unlimited AI-powered study tools.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {PLANS.map(plan => (
            <button key={plan.id} onClick={() => handleSubscribe(plan)} disabled={loading}
              className={'relative text-left p-4 rounded-xl border-2 transition-all ' + (selectedPlan === plan.id ? 'border-accent bg-accent/5' : 'border-bdr hover:border-muted/40')}>
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-success text-bg px-2 py-0.5 rounded-full">{plan.badge}</span>
              )}
              <div className="text-xs text-muted mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs text-muted">ETB</span>
                <span className="text-2xl font-display font-bold text-txt">{plan.price}</span>
                <span className="text-xs text-muted">{plan.period}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-s1 border border-bdr rounded-xl p-4">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">What you get</div>
          <div className="flex flex-col gap-2">
            {PLANS[1].features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-txt/70">
                <i className="fa-solid fa-check text-success text-xs w-4 text-center"></i>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 mt-4 text-muted text-sm">
            <i className="fa-solid fa-spinner fa-spin"></i> Redirecting to payment...
          </div>
        )}
      </div>
    </Modal>
  )
}