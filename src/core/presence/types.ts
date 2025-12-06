/**
 * Presence System Types
 * Multi-device presence tracking
 */

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

export interface MultiDevicePresence {
  deviceType: DeviceType;
  connectionQuality: ConnectionQuality;
  isOnline: boolean;
  lastSeen: string;
}
