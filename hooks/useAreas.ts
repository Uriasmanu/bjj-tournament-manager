import { useState, useEffect, useCallback } from 'react';
import { Area, AreaPayload, AreaUpdatePayload, ScheduledMatch } from '@/types';

interface UseAreasReturn {
  areas: Area[];
  loading: boolean;
  error: string | null;
  getAreas: (name?: string) => Promise<void>;
  createArea: (payload: AreaPayload) => Promise<Area | null>;
  updateArea: (id: string, payload: AreaUpdatePayload) => Promise<Area | null>;
  deleteArea: (id: string) => Promise<boolean>;
  scheduleMatch: (areaId: string, matchId: string, order?: number, estimatedTime?: string, isMarried?: boolean) => Promise<Area | null>;
  assignReferee: (areaId: string, refereeId: string | null, assistantRefereeId?: string | null) => Promise<Area | null>;
  advanceMatch: (areaId: string) => Promise<Area | null>;
  refresh: () => Promise<void>;
}

export function useAreas(): UseAreasReturn {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    setError(message);
    console.error('useAreas error:', err);
  }, []);

  const getAreas = useCallback(async (name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = name ? `?name=${encodeURIComponent(name)}` : '';
      const response = await fetch(`/api/areas${params}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar áreas: ${response.statusText}`);
      }
      const data = await response.json();
      setAreas(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createArea = useCallback(async (payload: AreaPayload): Promise<Area | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar área');
      }

      const newArea = await response.json();
      setAreas(prev => [...prev, newArea]);
      return newArea;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const updateArea = useCallback(async (id: string, payload: AreaUpdatePayload): Promise<Area | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/areas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar área');
      }

      const updatedArea = await response.json();
      setAreas(prev => prev.map(area => area.id === id ? updatedArea : area));
      return updatedArea;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const deleteArea = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/areas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir área');
      }

      setAreas(prev => prev.filter(area => area.id !== id));
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const scheduleMatch = useCallback(async (
    areaId: string,
    matchId: string,
    order?: number,
    estimatedTime?: string,
    isMarried?: boolean
  ): Promise<Area | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/areas/${areaId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          order,
          estimatedTime,
          isMarried,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao agendar luta');
      }

      const updatedArea = await response.json();
      setAreas(prev => prev.map(area => area.id === areaId ? updatedArea : area));
      return updatedArea;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const assignReferee = useCallback(async (
    areaId: string,
    refereeId: string | null,
    assistantRefereeId?: string | null
  ): Promise<Area | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/areas/${areaId}/assign-referee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refereeId,
          assistantRefereeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atribuir árbitro');
      }

      const updatedArea = await response.json();
      setAreas(prev => prev.map(area => area.id === areaId ? updatedArea : area));
      return updatedArea;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const advanceMatch = useCallback(async (areaId: string): Promise<Area | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/areas/${areaId}/advance`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao avançar luta');
      }

      const updatedArea = await response.json();
      setAreas(prev => prev.map(area => area.id === areaId ? updatedArea : area));
      return updatedArea;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const refresh = useCallback(async () => {
    await getAreas();
  }, [getAreas]);

  // Carrega áreas inicialmente
  useEffect(() => {
    getAreas();
  }, [getAreas]);

  return {
    areas,
    loading,
    error,
    getAreas,
    createArea,
    updateArea,
    deleteArea,
    scheduleMatch,
    assignReferee,
    advanceMatch,
    refresh,
  };
}