import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Bell, Check, X, Clock, Users, Heart, MessageCircle, Share2, ShoppingBag } from 'lucide-react'
import { Card2035, Card2035Content } from '../components/ui/Card2035'
import { Button2035 } from '../components/ui/Button2035'
import { BackButton } from '../components/navigation/BackButton'
import { FadeIn } from '../components/motion/FadeIn'
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from '../utils/date'

interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'share' | 'follow' | 'purchase' | 'system'
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return Heart
    case 'comment':
      return MessageCircle
    case 'share':
      return Share2
    case 'purchase':
      return ShoppingBag
    case 'follow':
      return Users
    default:
      return Bell
  }
}


export default function Notifications() {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  // Enable real-time notifications
  useRealtimeNotifications({
    userId: user?.id,
    enabled: !!user,
    showToasts: false, // Don't show toasts here, already on notifications page
  })

  // Fetch notifications from API
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await apiService.getNotifications()
      if (error) throw new Error(error)
      return data || []
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const notifications = notificationsData || []
  const [notifs, setNotifs] = useState<Notification[]>(notifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Update local state when API data changes
  useEffect(() => {
    if (notificationsData) {
      setNotifs(notificationsData)
    }
  }, [notificationsData])

  const unreadCount = notifs.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifs(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
    // TODO: Call API to mark as read
  }

  const markAllAsRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    // TODO: Call API to mark all as read
    showToast('All notifications marked as read', 'success')
  }

  const deleteNotification = (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id))
    // TODO: Call API to delete notification
  }

  // const handleNotificationClick = (notification: Notification) => {
  //   markAsRead(notification.id)
  //   if (notification.link) {
  //     navigate(notification.link)
  //   }
  // }

  const filteredNotifs =
    filter === 'unread' ? notifs.filter(n => !n.read) : notifs

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/10 dark:border-gray-800 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <BackButton className="md:hidden" />
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
                  Notifications & Time Engine
                </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
              </div>
            </div>
            <Button2035 variant="secondary" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button2035>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifs.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No {filter === 'unread' ? 'unread ' : ''}notifications
                </p>
              </div>
            ) : (
              filteredNotifs.map((notif: any, index) => {
                const Icon = getNotificationIcon(notif.type)
                return (
                  <FadeIn key={notif.id} delay={index * 0.05}>
                    <Card2035
                      interactive
                      className={`border-l-4 ${
                        notif.read
                          ? 'border-gray-300 dark:border-gray-600'
                          : 'border-primary'
                      }`}
                    >
                      <Card2035Content>
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-2 rounded-lg ${
                              notif.read
                                ? 'bg-gray-100 dark:bg-gray-800'
                                : 'bg-primary/10 dark:bg-primary/20'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                notif.read
                                  ? 'text-gray-600 dark:text-gray-400'
                                  : 'text-primary'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3
                                  className={`font-semibold mb-1 ${
                                    notif.read
                                      ? 'text-gray-700 dark:text-gray-300'
                                      : 'text-gray-900 dark:text-white'
                                  }`}
                                >
                                  {notif.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {notif.message}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDistanceToNow(new Date(notif.created_at))}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {!notif.read && (
                                  <button
                                    onClick={() => markAsRead(notif.id)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notif.id)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                  title="Delete"
                                >
                                  <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card2035Content>
                  </Card2035>
                </FadeIn>
              )
            })
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
