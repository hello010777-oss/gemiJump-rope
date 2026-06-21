/**
 * Types and interfaces for the Jump Rope Playground Trainer
 */

export interface StepInfo {
  id: number;
  title: string;
  subTitle: string;
  description: string;
  tip: string;
  color: string;
  bgColor: string;
  icon: string;
}

export type AppMode = 'tutorial' | 'camera';

export interface ScoreLog {
  id: string;
  date: string;
  score: number;
  speed: 'slow' | 'normal' | 'fast';
  duration: number; // in seconds
}
