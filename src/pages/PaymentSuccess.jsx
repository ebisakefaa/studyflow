import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function PaymentSuccess() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  const txRef = searchParams.get('trx_ref')

  useEffect(() => {
    if (!txRef || !user) {
      setStatus('error')
      setMessage('Missing payment reference or not logged in.')
      return
    }
    verifyPayment()
  }, [txRef, user])

  async function verifyPayment() {
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_ref: txRef })
      })
      const data = await res.json()

      if (data.error) {
        setStatus('error')
        setMessage(data.error)
        return
      }

      if (data.status === 'success') {
        const plan = data.plan || 'monthly'
        const now = new Date()
        const endDate = new Date(now)
        if (plan === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1)
        else endDate.setMonth(endDate.getMonth() + 1)

        const { error } = await supabase.from('subscriptions').upsert({
          user_id: user.id,
          plan: plan,
          status: 'active',
          chapa_reference: txRef,
          start_date: now.toISOString(),
          end_date: endDate.toISOString()
        }, { onConflict: 'user_id' })

        if (error) {
          setStatus('error')
          setMessage('Payment verified but failed to activate subscription.')
          return
        }

        setStatus('success')
        setMessage('Premium activated! You now have unlimited AI access.')
      } else {
        setStatus('error')
        setMessage('Payment not completed. Please try again.')
      }
    } catch (err) {
      setStatus('error')
      setMessage('Something went wrong. Please contact support.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <div className="bg-s2 border border-bdr rounded-2xl p-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-spinner fa-spin text-2xl text-accent"></i>
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Verifying Payment</h2>
            <p className="text-muted text-sm">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-s2 border border-bdr rounded-2xl p-8">
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-circle-check text-3xl text-success"></i>
            </div>
            <h2 className="font-display text-xl font-bold mb-2 text-success">Payment Successful</h2>
            <p className="text-muted text-sm mb-6">{message}</p>
            <button onClick={() => navigate('/')} className="w-full py-3 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors">
              Go to Dashboard
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-s2 border border-bdr rounded-2xl p-8">
            <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-circle-xmark text-3xl text-danger"></i>
            </div>
            <h2 className="font-display text-xl font-bold mb-2 text-danger">Payment Failed</h2>
            <p className="text-muted text-sm mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/')} className="px-5 py-2.5 border border-bdr hover:border-muted/40 rounded-xl text-sm text-muted hover:text-txt transition-all">Back to Dashboard</button>
              <button onClick={() => navigate('/profile')} className="px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm">Try Again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}