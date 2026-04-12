import { useState, useEffect } from 'react';

interface CompetitorData {
  name: string;
  team: string;
}

export function useCompetitor(id: string | null) {
  const [data, setData] = useState<CompetitorData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ignora se não houver ID ou se for um "BYE" (folga na chave)
    if (!id || id.startsWith('bye') || id === 'null') {
        setData(null);
        return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/competitors/${id}`);
        if (!res.ok) throw new Error('Falha ao buscar');
        const json = await res.json();
        setData({ name: json.name, team: json.team });
      } catch (err) {
        console.error("Erro ao carregar competidor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { data, loading };
}