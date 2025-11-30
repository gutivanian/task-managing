import { create } from 'zustand';

interface TimerStore {
  activeTaskId: number | null;
  seconds: number;
  isRunning: boolean;
  startTimer: (taskId: number) => void;
  stopTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  setSeconds: (seconds: number) => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
  activeTaskId: null,
  seconds: 0,
  isRunning: false,

  startTimer: (taskId) =>
    set({
      activeTaskId: taskId,
      isRunning: true,
    }),

  stopTimer: () =>
    set({
      isRunning: false,
    }),

  resetTimer: () =>
    set({
      activeTaskId: null,
      seconds: 0,
      isRunning: false,
    }),

  tick: () =>
    set((state) => ({
      seconds: state.isRunning ? state.seconds + 1 : state.seconds,
    })),

  setSeconds: (seconds) => set({ seconds }),
}));
