import { useState, useEffect } from 'react'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''

async function checkSubscription(userId) {
  if (!userId || !SUPABASE_URL || !SUPABASE_KEY) return false
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/subscriptions?select=id,status,end_date&user_id=eq.' + userId + '&status=eq.active&end_date=gte.' + new Date().toISOString(),
      { headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' })
    const { data } = await res.json()
    return data && data.length > 0
  } catch { return false }
}

const FREE_LIMIT = 10

export function useAiUsage(userId) {
  const [isPremium, setIsPremium] = useState(false)
  const [freeUsed, setFreeUsed] = useState(0)

  useEffect(() => {
    if (!userId) return
    const stored = localStorage.getItem('sf_ai_usage')
    if (stored) {
      const all = JSON.parse(stored)
      setFreeUsed(all[userId]?.total || 0)
    }
    checkSubscription(userId).then(premium => setIsPremium(premium))
  }, [userId])

  function canUse() {
    if (isPremium) return true
    return freeUsed < FREE_LIMIT
  }

  function use() {
    if (isPremium) return
    const newCount = freeUsed + 1
    setFreeUsed(newCount)
    const all = JSON.parse(localStorage.getItem('sf_ai_usage') || '{}')
    if (!all[userId]) all[userId] = { total: 0 }
    all[userId].total = newCount
    localStorage.setItem('sf_ai_usage', JSON.stringify(all))
    return newCount
  }

  function getRemaining() {
    if (isPremium) return Infinity
    return Math.max(0, FREE_LIMIT - freeUsed)
  }

  function getUsed() {
    if (isPremium) return 'Unlimited'
    return freeUsed
  }

  function reset() {
    const all = JSON.parse(localStorage.getItem('sf_ai_usage') || '{}')
    if (all[userId]) all[userId].total = 0
    localStorage.setItem('sf_ai_usage', JSON.stringify(all))
    setFreeUsed(0)
  }

  return { canUse, use, getRemaining, getUsed, isPremium, reset, FREE_LIMIT }
}