'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AreaSelector } from '@/components/scoreboard/AreaSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area } from '@/types';

export default function ScoreboardPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch('/api/areas');
        if (response.ok) {
          const data = await response.json();
          setAreas(data);
        }
      } catch (error) {
        console.error('Erro ao buscar áreas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  const handleAreaSelect = (areaId: string) => {
    router.push(`/scoreboard/${areaId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-bjj-gold">
              Placar de Lutas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300 mb-4">
                Selecione uma área com luta ativa para abrir o placar
              </p>
              <AreaSelector
                areas={areas}
                selectedAreaId={null}
                onAreaChange={handleAreaSelect}
                loading={loading}
              />
            </div>

            {areas.filter(a => a.currentMatchId).length === 0 && !loading && (
              <div className="text-center text-gray-400">
                <p>Nenhuma área com luta ativa no momento.</p>
                <p>Agende lutas nas áreas para começar a usar o placar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}