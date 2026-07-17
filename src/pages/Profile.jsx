import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useAiUsage } from '../hooks/useAiUsage'
import { formatDate } from '../lib/utils'
import PremiumModal from '../components/ui/PremiumModal'

export default function Profile({ onBack }) {
  const { user, signOut } = useAuth()
  const { addToast } = useToast()
  const { getUsed, getRemaining, reset: resetAiUsage, isPremium, FREE_LIMIT } = useAiUsage(user?.id)
  const [name, setName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ courses: 0, docs: 0, storage: 0 })
  const [subscription, setSubscription] = useState(null)

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'
  const email = user?.email || ''
  const createdAt = user?.created_at
  const isGoogle = user?.app_metadata?.provider === 'google'

  useEffect(() => {
    setName(displayName)
    setNameInput(displayName)
    fetchStats()
    fetchSubscription()
  }, [user])

  async function fetchStats() {
    const { data: courses } = await supabase.from('courses').select('id').eq('user_id', user.id)
    const { data: docs } = await supabase.from('documents').select('size').eq('user_id', user.id)
    setStats({ courses: courses?.length || 0, docs: docs?.length || 0, storage: docs?.reduce((s, d) => s + (d.size || 0), 0) || 0 })
  }

  async function fetchSubscription() {
    const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1)
    setSubscription(data?.[0] || null)
  }

  async function saveName() {
    if (!nameInput.trim()) return
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: nameInput.trim() } })
    if (error) { addToast(error.message, 'error') }
    else { setName(nameInput.trim()); setEditingName(false); addToast('Name updated', 'success') }
    setLoading(false)
  }

  async function handleSignOut() { await signOut() }
  function handleResetAi() { resetAiUsage(); addToast('AI uses reset to ' + FREE_LIMIT, 'success') }

  function formatStorage(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="animate-[viewIn_0.35s_ease-out] max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <button onClick={onBack} className="hover:text-txt transition-colors">Dashboard</button>
        <i className="fa-solid fa-chevron-right text-xs text-muted/40"></i>
        <span className="text-txt">Profile</span>
      </div>

      <div className="bg-s2 border border-bdr rounded-xl p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 text-accent flex items-center justify-center text-xl font-bold font-display shrink-0">{initials}</div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex gap-2 mb-1">
                <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="flex-1 px-3 py-2 bg-s1 border border-bdr rounded-lg text-sm text-txt font-body" onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }} autoFocus maxLength={50} />
                <button onClick={saveName} disabled={loading} className="px-3 py-2 bg-accent text-bg rounded-lg text-sm font-medium disabled:opacity-50">Save</button>
                <button onClick={() => { setEditingName(false); setNameInput(name) }} className="px-3 py-2 bg-s1 border border-bdr rounded-lg text-sm text-muted hover:text-txt">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-xl font-bold truncate">{name}</h2>
                <button onClick={() => setEditingName(true)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-s3 text-muted hover:text-txt transition-colors" title="Edit name"><i className="fa-solid fa-pen text-xs"></i></button>
              </div>
            )}
            <p className="text-sm text-muted truncate">{email}</p>
            <div className="flex items-center gap-2 mt-1">
              {isGoogle && <span className="text-xs px-2 py-0.5 rounded-full bg-s3 text-muted"><i className="fa-brands fa-google mr-1"></i>Google</span>}
              {isPremium && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent"><i className="fa-solid fa-crown mr-1"></i>Premium</span>}
              {createdAt && <span className="text-xs text-muted/50">Joined {formatDate(createdAt)}</span>}
            </div>
          </div>
        </div>
      </div>

      {subscription && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-accent"><i className="fa-solid fa-crown text-xs"></i> Premium Active</div>
              <div className="text-xs text-muted mt-0.5">{subscription.plan === 'yearly' ? 'Yearly plan' : 'Monthly plan'} &middot; Renews {formatDate(subscription.end_date)}</div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-bg font-medium">ACTIVE</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-s2 border border-bdr rounded-xl p-4 text-center">
          <div className="text-2xl font-bold font-display text-accent">{stats.courses}</div>
          <div className="text-xs text-muted mt-1">Courses</div>
        </div>
        <div className="bg-s2 border border-bdr rounded-xl p-4 text-center">
          <div className="text-2xl font-bold font-display text-sage">{stats.docs}</div>
          <div className="text-xs text-muted mt-1">Documents</div>
        </div>
        <div className="bg-s2 border border-bdr rounded-xl p-4 text-center">
          <div className="text-2xl font-bold font-display text-txt">{formatStorage(stats.storage)}</div>
          <div className="text-xs text-muted mt-1">Storage</div>
        </div>
      </div>

      <div className="bg-s2 border border-bdr rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles text-accent text-sm"></i> AI Usage
            {isPremium && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent ml-2">Unlimited</span>}
          </h3>
          {isPremium ? (
            <div className="text-sm text-muted">You have unlimited AI access with your Premium plan.</div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted">{getUsed()} of {FREE_LIMIT} used</span>
                    <span className="text-muted">{getRemaining()} remaining</span>
                  </div>
                  <div className="w-full h-2.5 bg-s1 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: (getUsed() / FREE_LIMIT * 100) + '%', backgroundColor: getRemaining() === 0 ? 'var(--color-danger)' : 'var(--color-accent)' }}></div>
                  </div>
                </div>
              </div>
              <button onClick={handleResetAi} className="text-sm text-accent hover:text-accent-l transition-colors font-medium">
                <i className="fa-solid fa-arrow-rotate-left mr-1.5 text-xs"></i> Reset free uses
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-s2 border border-bdr rounded-xl overflow-hidden">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-6 py-4 text-sm text-danger hover:bg-danger/5 transition-colors">
          <i className="fa-solid fa-right-from-bracket w-4 text-center"></i> Sign Out
        </button>
      </div>
    </div>
  )
}