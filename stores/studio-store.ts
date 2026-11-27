import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DocumentParams,
  ImageParams,
  ScenarioId,
  TripParams,
  VideoParams,
} from '@/lib/schemas';

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
  imageParams: ImageParams;
  documentParams: DocumentParams;
  tripParams: TripParams;
  generalIdea: string;
  history: HistoryEntry[];
  setScenario: (s: ScenarioId) => void;
  setStep: (n: number) => void;
  setVideoParams: (p: Partial<VideoParams>) => void;
  setImageParams: (p: Partial<ImageParams>) => void;
  setDocumentParams: (p: Partial<DocumentParams>) => void;
  setTripParams: (p: Partial<TripParams>) => void;
  setGeneralIdea: (s: string) => void;
  addHistory: (e: HistoryEntry) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
}

export const defaultVideoParams: VideoParams = {
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

export const defaultImageParams: ImageParams = {
  idea: '',
  aspectRatio: '16:9',
  style: '写实',
  subject: '',
  environment: '',
  lighting: '',
  negativePrompt: '',
};

export const defaultDocumentParams: DocumentParams = {
  idea: '',
  docType: '报告',
  audience: '',
  tone: '专业、清晰',
  lengthHint: '',
  mustInclude: '',
};

export const defaultTripParams: TripParams = {
  idea: '',
  destination: '',
  days: 3,
  travelers: '',
  budgetHint: '',
  interests: '',
  constraints: '',
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
      imageParams: defaultImageParams,
      documentParams: defaultDocumentParams,
      tripParams: defaultTripParams,
      generalIdea: '',
      history: [],
      setScenario: (scenario) => set({ scenario, step: 0 }),
      setStep: (step) => set({ step }),
      setVideoParams: (p) =>
        set((s) => ({ videoParams: { ...s.videoParams, ...p } })),
      setImageParams: (p) =>
        set((s) => ({ imageParams: { ...s.imageParams, ...p } })),
      setDocumentParams: (p) =>
        set((s) => ({ documentParams: { ...s.documentParams, ...p } })),
      setTripParams: (p) =>
        set((s) => ({ tripParams: { ...s.tripParams, ...p } })),
      setGeneralIdea: (generalIdea) => set({ generalIdea }),
      addHistory: (e) => set((s) => ({ history: [e, ...s.history] })),
      removeHistory: (id) =>
        set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'muse-prompt-studio' },
  ),
);
