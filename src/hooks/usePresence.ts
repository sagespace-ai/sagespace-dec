import { useState, useEffect } from 'react';
import { DeviceType, ConnectionQuality } from '../core/presence/types';

/**
 * Hook for device presence
 * Detects device type and connection quality
 */
export function usePresence() {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Detect device type
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);

    // Detect connection quality
    const updateConnection = () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        setConnectionQuality('offline');
        return;
      }

      setIsOnline(true);

      // Check if navigator.connection is available
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g') {
          setConnectionQuality('excellent');
        } else if (effectiveType === '3g') {
          setConnectionQuality('good');
        } else if (effectiveType === '2g') {
          setConnectionQuality('fair');
        } else {
          setConnectionQuality('poor');
        }
      } else {
        // Fallback: assume good connection if online
        setConnectionQuality('good');
      }
    };

    updateConnection();
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);

    // Check connection periodically
    const interval = setInterval(updateConnection, 5000);

    return () => {
      window.removeEventListener('resize', updateDeviceType);
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
      clearInterval(interval);
    };
  }, []);

  return {
    deviceType,
    connectionQuality,
    isOnline,
  };
}
