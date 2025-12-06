/**
 * Harmony System Types
 * Tracks balance across Work, Play, and Life
 */

export type HarmonyScore = number; // 0-100

export interface HarmonyState {
  score: HarmonyScore;
  workTime: number; // seconds
  playTime: number; // seconds
  idleTime: number; // seconds
  lastUpdated: string;
}

export interface HarmonyMessage {
  text: string;
  tone: 'calm' | 'encouraging' | 'suggestive';
}
