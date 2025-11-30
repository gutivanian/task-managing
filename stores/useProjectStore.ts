import { create } from 'zustand';
import { Project } from '@/types';

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: number, data: Partial<Project>) => void;
  deleteProject: (id: number) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  currentProject: null,

  setProjects: (projects) => set({ projects }),

  setCurrentProject: (project) => set({ currentProject: project }),

  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),

  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data, updated_at: new Date() } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...data, updated_at: new Date() }
          : state.currentProject,
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),
}));
