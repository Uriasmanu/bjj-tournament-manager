'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AreaSelector } from '@/components/scoreboard/AreaSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Area } from '@/types';

export default function ScoreboardPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setError(null);
        const response = await fetch('/api/areas');
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate and filter areas to prevent empty IDs
        const validAreas = Array.isArray(data) 
          ? data.filter((area: Area) => 
              area && 
              area.id && 
              typeof area.id === 'string' && 
              area.id.trim() !== '' &&
              area.name &&
              typeof area.name === 'string' &&
              area.name.trim() !== ''
            )
          : [];
        
        console.log('Valid areas loaded:', validAreas.length);
        setAreas(validAreas);
        
        if (validAreas.length === 0 && data.length > 0) {
          console.warn('Some areas were filtered out due to invalid IDs or names');
        }
      } catch (error) {
        console.error('Erro ao buscar áreas:', error);
        setError(error instanceof Error ? error.message : 'Falha ao carregar áreas');
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  const handleAreaSelect = (areaId: string) => {
    // Prevent navigation with empty or invalid IDs
    if (!areaId || areaId.trim() === '') {
      console.error('Invalid area ID attempted:', areaId);
      return;
    }
    router.push(`/scoreboard/${areaId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-bjj-gold">Placar de Lutas</h2>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-300">
              Selecione uma Área
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300 mb-4">
                Selecione uma área para abrir o placar
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200">
                  <p>Erro ao carregar áreas: {error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm underline hover:text-red-100"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
              
              <AreaSelector
                areas={areas}
                selectedAreaId={null}
                onAreaChange={handleAreaSelect}
                loading={loading}
              />
            </div>

            {!loading && !error && areas.length === 0 && (
              <div className="text-center text-gray-400">
                <p>Nenhuma área cadastrada.</p>
                <p>Cadastre áreas para começar a usar o placar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}