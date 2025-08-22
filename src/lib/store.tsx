import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectInput, ProjectResult } from '@/types';

interface ProjectStore {
  input: ProjectInput;
  result: ProjectResult | null;
  updateInput: (updates: Partial<ProjectInput>) => void;
  updateResult: (result: ProjectResult) => void;
  reset: () => void;
  saveDraft: () => void;
  loadDraft: () => void;
  clearDraft: () => void;
  saveJourney: () => void;
  loadJourneys: () => ProjectResult[];
  deleteJourney: (id: string) => void;
}

const ProjectStoreContext = createContext<ProjectStore | null>(null);

const createDefaultInput = (): ProjectInput => ({
  id: `proj_${Date.now()}`,
  profile: {
    goals_ranked: [],
  },
  decisions: [],
  horizon_years: 3,
  sliders: { risk: 50, black_swan: 30, travel: 50, wfh: 70 },
  ui_prefs: { num_timelines: 3, mode: "Quick" }
});

export const ProjectStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [input, setInput] = useState<ProjectInput>(createDefaultInput);
  const [result, setResult] = useState<ProjectResult | null>(null);

  useEffect(() => {
    loadDraft();
  }, []);

  useEffect(() => {
    saveDraft();
  }, [input]);

  const updateInput = (updates: Partial<ProjectInput>) => {
    setInput(prev => ({ ...prev, ...updates }));
  };

  const updateResult = (newResult: ProjectResult) => {
    setResult(newResult);
  };

  const reset = () => {
    setInput(createDefaultInput());
    setResult(null);
    clearDraft();
  };

  const saveDraft = () => {
    localStorage.setItem('northstar-draft', JSON.stringify(input));
  };

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('northstar-draft');
      if (draft) {
        setInput(JSON.parse(draft));
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('northstar-draft');
  };

  const saveJourney = () => {
    if (!result) return;
    const saved = JSON.parse(localStorage.getItem('saved-journeys') || '[]');
    const withId = { ...result, savedAt: new Date().toISOString(), savedId: Date.now().toString() };
    saved.push(withId);
    localStorage.setItem('saved-journeys', JSON.stringify(saved));
  };

  const loadJourneys = (): ProjectResult[] => {
    const saved = JSON.parse(localStorage.getItem('saved-journeys') || '[]');
    return saved;
  };

  const deleteJourney = (id: string) => {
    const saved = JSON.parse(localStorage.getItem('saved-journeys') || '[]');
    const filtered = saved.filter((journey: any) => journey.savedId !== id);
    localStorage.setItem('saved-journeys', JSON.stringify(filtered));
  };

  const store: ProjectStore = {
    input,
    result,
    updateInput,
    updateResult,
    reset,
    saveDraft,
    loadDraft,
    clearDraft,
    saveJourney,
    loadJourneys,
    deleteJourney,
  };

  return (
    <ProjectStoreContext.Provider value={store}>
      {children}
    </ProjectStoreContext.Provider>
  );
};

export const useProjectStore = () => {
  const context = useContext(ProjectStoreContext);
  if (!context) {
    throw new Error('useProjectStore must be used within ProjectStoreProvider');
  }
  return context;
};