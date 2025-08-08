import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { RenderStage } from '@/hooks/useFFmpeg';

interface RenderState {
  isRendering: boolean;
  renderingProjectId: string | null;
  progress: number;
  stage: RenderStage;
  debugLogs: string[];
}

interface RenderContextType extends RenderState {
  startRender: (projectId: string) => void;
  endRender: () => void;
  updateProgress: (progress: number, stage: RenderStage) => void;
  addLog: (log: string) => void;
  clearLogs: () => void;
}

const RenderContext = createContext<RenderContextType | undefined>(undefined);

export const RenderProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<RenderState>({
    isRendering: false,
    renderingProjectId: null,
    progress: 0,
    stage: 'idle',
    debugLogs: [],
  });

  const startRender = useCallback((projectId: string) => {
    setState({
      isRendering: true,
      renderingProjectId: projectId,
      progress: 0,
      stage: 'idle',
      debugLogs: [`[${new Date().toLocaleTimeString()}] Renderização iniciada para o projeto: ${projectId}`],
    });
  }, []);

  const endRender = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isRendering: false,
      progress: 0,
      stage: 'idle',
    }));
  }, []);

  const updateProgress = useCallback((progress: number, stage: RenderStage) => {
    setState(prevState => ({
      ...prevState,
      progress,
      stage,
    }));
  }, []);

  const addLog = useCallback((log: string) => {
    setState(prevState => ({
      ...prevState,
      debugLogs: [...prevState.debugLogs, log],
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      debugLogs: [],
    }));
  }, []);

  return (
    <RenderContext.Provider value={{ ...state, startRender, endRender, updateProgress, addLog, clearLogs }}>
      {children}
    </RenderContext.Provider>
  );
};

export const useRender = () => {
  const context = useContext(RenderContext);
  if (context === undefined) {
    throw new Error('useRender must be used within a RenderProvider');
  }
  return context;
};