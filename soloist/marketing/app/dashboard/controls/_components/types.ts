// SHARED TYPES FOR MARKETING CONTROLS
// /Users/matthewsimon/Projects/acdc-digital/soloist/marketing/app/dashboard/controls/_components/types.ts

export interface FeedbackState {
  status: 'idle' | 'working' | 'error' | 'success';
  message?: string;
}

export interface ControlsProps {
  // Future expansion for mode switching, etc.
}
