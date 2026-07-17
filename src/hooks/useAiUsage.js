import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const FREE_LIMIT = 10

export function useAiUsage(userId) {
  const [isPremium, setIsPremium] = useState(false)
  const [freeUsed, setFreeUsed] = useState(0)

  useEffect(() => {
    if (!userId || !supabase) return
    const stored = localStorage.getItem('sf_ai_usage')
    if (stored) {
      const all = JSON.parse(stored)
      setFreeUsed(all[userId]?.total || 0)
    }

    supabase.from('subscriptions').select('id, status, end_date')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .then(({ data }) => {
        setIsPremium(data && data.length > 0)
      })
      .catch(() => setIsPremium(false))
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