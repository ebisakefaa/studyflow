import { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'

export default function NotificationBell({ userId, minimized }) {
  const { notifications, unreadCount, markAsRead, markAllRead, addNotification } = useNotifications(userId)
  const [isOpen, setIsOpen] = useState(false)

  const handleTest = () => {
    const in30Secs = new Date(Date.now() + 30 * 1000).toISOString()
    addNotification("Test Reminder", "Hey! This is your 30-second test reminder from StudyFlow.", in30Secs)
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={'w-full flex items-center gap-3 rounded-lg text-sm text-muted hover:text-txt transition-colors ' + (minimized ? 'p-2.5 justify-center' : 'px-3 py-2.5')} 
        title="Notifications"
      >
        <div className="relative w-4 text-center shrink-0">
          <i className="fa-solid fa-bell w-4"></i>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {!minimized && <span>Notifications</span>}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-s1 border border-bdr rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-bdr flex items-center justify-between">
            <span className="font-display font-semibold text-txt text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-accent hover:underline">Mark all read</button>
            )}
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted text-center">No notifications yet</p>
            ) : (
              notifications.map(n => (
                <button 
                  key={n.id} 
                  onClick={() => markAsRead(n.id)}
                  className={'w-full text-left p-3 border-b border-bdr/50 hover:bg-s2 transition-colors ' + (!n.is_read ? 'bg-s2/50' : '')}
                >
                  <p className="text-sm font-medium text-txt">{n.title}</p>
                  <p className="text-xs text-muted mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-sage mt-1">{new Date(n.scheduled_for).toLocaleString()}</p>
                </button>
              ))
            )}
          </div>

          <div className="p-2 border-t border-bdr">
            <button onClick={handleTest} className="w-full text-xs text-accent hover:underline py-1">
              ⏱️ Send Test Notification (30s)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}