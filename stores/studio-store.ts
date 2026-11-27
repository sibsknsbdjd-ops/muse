import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScenarioId, VideoParams } from '@/lib/schemas';

export interface HistoryEntry {
  id: string;
  scenario: ScenarioId;
  zh: string;
  en: string;
  createdAt: number;
}

interface StudioState {
  scenario: ScenarioId;
  step: number;
  videoParams: VideoParams;
  history: HistoryEntry[];
  setScenario: (s: ScenarioId) => void;
  setStep: (n: number) => void;
  setVideoParams: (p: Partial<VideoParams>) => void;
  addHistory: (e: HistoryEntry) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
}

const defaultVideoParams: VideoParams = {
  idea: '',
  durationSeconds: 10,
  aspectRatio: '16:9',
  style: '写实',
  subject: '',
  environment: '',
  lighting: '',
  cameraMovement: '',
  shots: [],
  audio: '',
  negativePrompt: '',
};

/**
 * Studio state. Persisted so drafts survive refresh (localStorage for guests;
 * cloud sync for signed-in users lands in a later iteration).
 */
export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      scenario: 'video',
      step: 0,
      videoParams: defaultVideoParams,
      history: [],
      setScenario: (scenario) => set({ scenario, step: 0 }),
      setStep: (step) => set({ step }),
      setVideoParams: (p) =>
        set((s) => ({ videoParams: { ...s.videoParams, ...p } })),
      addHistory: (e) => set((s) => ({ history: [e, ...s.history] })),
      removeHistory: (id) =>
        set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'muse-prompt-studio' },
  ),
);
