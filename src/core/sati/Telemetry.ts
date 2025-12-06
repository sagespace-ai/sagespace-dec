/**
 * Telemetry System
 * Tracks system events and issues
 */

import { TelemetryEvent } from './types';

class Telemetry {
  private events: TelemetryEvent[] = [];
  // PHASE 1: Reduced from 1000 to 200 to prevent unbounded growth (audit requirement)
  private maxEvents = 200;

  /**
   * Record an event
   */
  record(event: Omit<TelemetryEvent, 'id' | 'timestamp' | 'resolved'>): void {
    const telemetryEvent: TelemetryEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    this.events.push(telemetryEvent);

    // PHASE 1: Enforce size limit to prevent memory leaks
    // Keep only recent events (remove oldest when at capacity)
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Get unresolved issues
   */
  getUnresolvedIssues(): TelemetryEvent[] {
    return this.events.filter((e) => !e.resolved);
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 100): TelemetryEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Resolve an issue
   */
  resolve(eventId: string): void {
    const event = this.events.find((e) => e.id === eventId);
    if (event) {
      event.resolved = true;
    }
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }
}

// Singleton instance
let telemetryInstance: Telemetry | null = null;

export function getTelemetry(): Telemetry {
  if (!telemetryInstance) {
    telemetryInstance = new Telemetry();
  }
  return telemetryInstance;
}
