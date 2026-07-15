import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useAiUsage } from '../hooks/useAiUsage'
import { supabase } from '../lib/supabase'
import { getInitials } from '../lib/utils'

export default function Profile({ onBack }) {
  const { user, signOut } = useAuth()
  const { addToast } = useToast()
  const { getUsed, getRemaining, FREE_LIMIT } = useAiUsage(user?.id)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ courses: 0, documents: 0, storage: 0 })

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || user.user_metadata?.name || '')
    }
  }, [user])

  useEffect(() => {
    async function fetchStats() {
      if (!user) return
      const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      const { count: docCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      const { data: docSizes } = await supabase.from('documents').select('size').eq('user_id', user.id)
      const totalStorage = (docSizes || []).reduce((s, d) => s + (d.size || 0), 0)
      setStats({ courses: courseCount || 0, documents: docCount || 0, storage: totalStorage })
    }
    fetchStats()
  }, [user])

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  async function handleSaveName() {
    if (!name.trim()) { addToast('Name cannot be empty', 'error'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
    if (error) { addToast(error.message, 'error') }
    else { addToast('Name updated', 'success'); setEditing(false) }
    setSaving(false)
  }

  async function handleSignOut() {
    await signOut()
  }

  const initials = getInitials(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'U')
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <div className="animate-[viewIn_0.35s_ease-out] max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <button onClick={onBack} className="hover:text-txt transition-colors">Dashboard</button>
        <i className="fa-solid fa-chevron-right text-xs text-muted/40"></i>
        <span className="text-txt">Profile</span>
      </div>

      <div className="bg-s2 border border-bdr rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5 mb-6">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xl font-bold font-display shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-s1 border border-bdr rounded-lg text-txt font-body text-sm"
                  autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setName(user?.user_metadata?.full_name || ''); setEditing(false) } }} />
                <button onClick={handleSaveName} disabled={saving}
                  className="px-3 py-2 bg-accent hover:bg-accent-l text-bg rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? '...' : 'Save'}
                </button>
                <button onClick={() => { setName(user?.user_metadata?.full_name || ''); setEditing(false) }}
                  className="px-3 py-2 border border-bdr hover:border-muted/40 rounded-lg text-sm text-muted transition-colors">
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <h2 className="font-display text-xl font-bold">{user?.user_metadata?.full_name || user?.user_metadata?.name || 'No name set'}</h2>
                <p className="text-sm text-muted">{user?.email}</p>
              </div>
            )}
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-s3 text-muted hover:text-txt transition-colors" title="Edit name">
              <i className="fa-solid fa-pen text-xs"></i>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-s1 border border-bdr rounded-xl p-4 text-center">
            <div className="font-display text-2xl font-bold text-accent">{stats.courses}</div>
            <div className="text-xs text-muted mt-1">Courses</div>
          </div>
          <div className="bg-s1 border border-bdr rounded-xl p-4 text-center">
            <div className="font-display text-2xl font-bold text-sage">{stats.documents}</div>
            <div className="text-xs text-muted mt-1">Documents</div>
          </div>
          <div className="bg-s1 border border-bdr rounded-xl p-4 text-center">
            <div className="font-display text-2xl font-bold text-txt">{formatSize(stats.storage)}</div>
            <div className="text-xs text-muted mt-1">Storage</div>
          </div>
        </div>
      </div>

      <div className="bg-s2 border border-bdr rounded-2xl p-6 mb-6">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <i className="fa-solid fa-wand-magic-sparkles text-accent text-sm"></i> AI Usage
        </h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Free requests used</span>
            <span className="font-medium">{getUsed()} / {FREE_LIMIT}</span>
          </div>
          <div className="w-full h-2.5 bg-s1 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{
              width: Math.min(100, (getUsed() / FREE_LIMIT) * 100) + '%',
              backgroundColor: getUsed() >= FREE_LIMIT ? 'var(--color-danger)' : getUsed() >= FREE_LIMIT * 0.7 ? 'var(--color-accent)' : 'var(--color-success)'
            }}></div>
          </div>
        </div>
        {getUsed() >= FREE_LIMIT ? (
          <div className="flex items-center gap-3 p-3 bg-accent/10 border border-accent/20 rounded-xl">
            <i className="fa-solid fa-crown text-accent"></i>
            <div className="flex-1">
              <div className="text-sm font-medium">All free uses consumed</div>
              <div className="text-xs text-muted">Upgrade to Premium for unlimited AI access</div>
            </div>
            <button onClick={() => addToast('Premium coming soon!', 'info')} className="px-3 py-1.5 bg-accent hover:bg-accent-l text-bg rounded-lg text-xs font-semibold transition-colors">Upgrade</button>
          </div>
        ) : (
          <p className="text-sm text-muted">You have <strong className="text-txt">{getRemaining()}</strong> free AI request{getRemaining() !== 1 ? 's' : ''} remaining.</p>
        )}
      </div>

      <div className="bg-s2 border border-bdr rounded-2xl p-6">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <i className="fa-solid fa-gear text-muted text-sm"></i> Account
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-4 py-3 bg-s1 border border-bdr rounded-xl">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-calendar text-muted text-sm w-4 text-center"></i>
              <span className="text-sm">Joined</span>
            </div>
            <span className="text-sm text-muted">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-s1 border border-bdr rounded-xl">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-right-from-bracket text-muted text-sm w-4 text-center"></i>
              <span className="text-sm">Sign Out</span>
            </div>
            <button onClick={handleSignOut} className="text-sm text-danger hover:text-danger/80 transition-colors font-medium">Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  )
}