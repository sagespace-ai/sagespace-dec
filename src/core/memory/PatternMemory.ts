/**
 * Pattern Memory
 * Tracks user preferences (non-personal, no PII)
 */

export interface Pattern {
  id: string;
  type: 'preference' | 'behavior' | 'pattern';
  data: Record<string, any>;
  frequency: number;
  lastSeen: string;
}

export class PatternMemory {
  private patterns: Map<string, Pattern> = new Map();
  // PHASE 1: Added size limit to prevent unbounded growth (audit requirement: 100 items max)
  private readonly MAX_PATTERNS = 100;

  /**
   * Record a pattern
   * PHASE 1: Enforces size limit to prevent memory leaks
   */
  record(type: 'preference' | 'behavior' | 'pattern', data: Record<string, any>): void {
    const id = `${type}-${JSON.stringify(data).slice(0, 50)}`;
    const existing = this.patterns.get(id);

    if (existing) {
      existing.frequency++;
      existing.lastSeen = new Date().toISOString();
    } else {
      // PHASE 1: Enforce size limit - remove oldest if at capacity
      if (this.patterns.size >= this.MAX_PATTERNS) {
        const sortedPatterns = Array.from(this.patterns.entries())
          .sort((a, b) => new Date(a[1].lastSeen).getTime() - new Date(b[1].lastSeen).getTime());
        // Remove oldest pattern
        this.patterns.delete(sortedPatterns[0][0]);
      }

      this.patterns.set(id, {
        id,
        type,
        data,
        frequency: 1,
        lastSeen: new Date().toISOString(),
      });
    }
  }

  /**
   * Get patterns by type
   */
  getPatterns(type?: 'preference' | 'behavior' | 'pattern'): Pattern[] {
    const all = Array.from(this.patterns.values());
    return type ? all.filter((p) => p.type === type) : all;
  }

  /**
   * Get most frequent patterns
   */
  getFrequent(limit = 10): Pattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  /**
   * Clear patterns (for privacy)
   */
  clear(): void {
    this.patterns.clear();
  }
}

// Singleton instance
let patternMemoryInstance: PatternMemory | null = null;

export function getPatternMemory(): PatternMemory {
  if (!patternMemoryInstance) {
    patternMemoryInstance = new PatternMemory();
  }
  return patternMemoryInstance;
}
