
import { useState, useRef } from 'react';
import { TicketProgress } from '@/types/ticketCreation';

export const useTicketProgress = () => {
  const [progress, setProgress] = useState<TicketProgress>({
    current: 0,
    total: 0,
    percentage: 0,
    status: 'idle'
  });
  const cancelledRef = useRef(false);

  const updateProgress = (updates: Partial<TicketProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  const setProgressTotal = (total: number) => {
    setProgress({
      current: 0,
      total,
      percentage: 0,
      status: 'creating'
    });
  };

  const incrementProgress = (currentTier?: string) => {
    setProgress(prev => {
      const newCurrent = prev.current + 1;
      return {
        ...prev,
        current: newCurrent,
        percentage: Math.round((newCurrent / prev.total) * 100),
        currentTier
      };
    });
  };

  const setError = (error: string) => {
    setProgress(prev => ({
      ...prev,
      status: 'error',
      error
    }));
  };

  const setCompleted = () => {
    setProgress(prev => ({
      ...prev,
      status: 'completed'
    }));
  };

  const setCancelled = () => {
    cancelledRef.current = true;
    setProgress(prev => ({ ...prev, status: 'cancelled' }));
  };

  const resetProgress = () => {
    setProgress({
      current: 0,
      total: 0,
      percentage: 0,
      status: 'idle'
    });
    cancelledRef.current = false;
  };

  const isCancelled = () => cancelledRef.current;

  return {
    progress,
    updateProgress,
    setProgressTotal,
    incrementProgress,
    setError,
    setCompleted,
    setCancelled,
    resetProgress,
    isCancelled
  };
};
