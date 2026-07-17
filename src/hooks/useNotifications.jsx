import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_for', { ascending: false })
      .limit(20)
    if (!error && data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }, [userId])

  // Ask for browser permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Fetch on load
  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  // Check for due notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!userId) return
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .lte('scheduled_for', new Date().toISOString())
      
      if (data && data.length > 0) {
        data.forEach(n => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(n.title, { body: n.message })
          }
          supabase.from('notifications').update({ is_read: true }).eq('id', n.id)
        })
        fetchNotifications()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [userId, fetchNotifications])

  const addNotification = async (title, message, scheduledFor) => {
    if (!userId) return
    await supabase.from('notifications').insert({
      user_id: userId, title, message, scheduled_for: scheduledFor
    })
    fetchNotifications()
  }

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    fetchNotifications()
  }

  const markAllRead = async () => {
    if (!userId) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    fetchNotifications()
  }

  return { notifications, unreadCount, addNotification, markAsRead, markAllRead }
}