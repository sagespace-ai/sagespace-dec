/**
 * Unit tests for notification creation and delivery logic
 */

import { describe, it, expect } from 'vitest'

type NotificationType = 
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'purchase'
  | 'remix'

interface Notification {
  id: string
  type: NotificationType
  userId: string
  actorId: string
  resourceId?: string
  resourceType?: string
  message: string
  read: boolean
  createdAt: string
}

function createNotification(
  type: NotificationType,
  userId: string,
  actorId: string,
  resourceId?: string,
  resourceType?: string
): Notification {
  const messages: Record<NotificationType, string> = {
    like: 'liked your post',
    comment: 'commented on your post',
    follow: 'started following you',
    mention: 'mentioned you',
    purchase: 'purchased your item',
    remix: 'remixed your content',
  }

  return {
    id: `notif_${Date.now()}`,
    type,
    userId,
    actorId,
    resourceId,
    resourceType,
    message: messages[type],
    read: false,
    createdAt: new Date().toISOString(),
  }
}

function shouldNotifyUser(
  notification: Notification,
  userPreferences: Record<NotificationType, boolean>
): boolean {
  return userPreferences[notification.type] ?? true
}

function groupNotifications(notifications: Notification[]): Record<NotificationType, Notification[]> {
  return notifications.reduce((acc, notif) => {
    if (!acc[notif.type]) {
      acc[notif.type] = []
    }
    acc[notif.type].push(notif)
    return acc
  }, {} as Record<NotificationType, Notification[]>)
}

describe('Notification Creation', () => {
  it('should create like notification', () => {
    const notif = createNotification('like', 'user-1', 'user-2', 'post-1', 'feed_item')
    expect(notif.type).toBe('like')
    expect(notif.userId).toBe('user-1')
    expect(notif.actorId).toBe('user-2')
    expect(notif.message).toContain('liked')
  })

  it('should create comment notification', () => {
    const notif = createNotification('comment', 'user-1', 'user-2', 'post-1', 'feed_item')
    expect(notif.type).toBe('comment')
    expect(notif.message).toContain('commented')
  })

  it('should create follow notification', () => {
    const notif = createNotification('follow', 'user-1', 'user-2')
    expect(notif.type).toBe('follow')
    expect(notif.message).toContain('following')
  })

  it('should create mention notification', () => {
    const notif = createNotification('mention', 'user-1', 'user-2', 'comment-1', 'comment')
    expect(notif.type).toBe('mention')
    expect(notif.message).toContain('mentioned')
  })
})

describe('Notification Preferences', () => {
  it('should respect user preferences', () => {
    const notif = createNotification('like', 'user-1', 'user-2')
    const preferences = {
      like: true,
      comment: false,
      follow: true,
      mention: true,
      purchase: true,
      remix: true,
    }

    expect(shouldNotifyUser(notif, preferences)).toBe(true)
  })

  it('should not notify if preference is disabled', () => {
    const notif = createNotification('comment', 'user-1', 'user-2')
    const preferences = {
      like: true,
      comment: false,
      follow: true,
      mention: true,
      purchase: true,
      remix: true,
    }

    expect(shouldNotifyUser(notif, preferences)).toBe(false)
  })
})

describe('Notification Grouping', () => {
  it('should group notifications by type', () => {
    const notifications = [
      createNotification('like', 'user-1', 'user-2'),
      createNotification('like', 'user-1', 'user-3'),
      createNotification('comment', 'user-1', 'user-4'),
    ]

    const grouped = groupNotifications(notifications)
    expect(grouped.like).toHaveLength(2)
    expect(grouped.comment).toHaveLength(1)
  })
})
