'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useScoreboard } from '@/hooks/useScoreboard';
import { useTimer } from '@/hooks/useTimer';
import { ScorePanel } from '@/components/scoreboard/ScorePanel';
import { ScoreButton } from '@/components/scoreboard/ScoreButton';
import { TimerControls } from '@/components/scoreboard/TimerControls';
import { UndoButton } from '@/components/scoreboard/UndoButton';
import { FinishMatchModal } from '@/components/scoreboard/FinishMatchModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AreaScoreboardPage() {
  const params = useParams();
  const areaId = params.areaId as string;
  const {
    match,
    area,
    fighters,
    referee,
    loading,
    error,
    addPoints,
    addAdvantage,
    addPenalty,
    undo,
    finishMatch,
    loadMatch,
  } = useScoreboard();

  const timer = useTimer(300); // 5 minutos padrão
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (areaId) {
      loadMatch(areaId);
      timer.loadTimer(areaId);
    }
  }, [areaId, loadMatch, timer.loadTimer]);

  useEffect(() => {
    // Verificar se está em fullscreen via query param
    const urlParams = new URLSearchParams(window.location.search);
    setIsFullscreen(urlParams.get('fullscreen') === 'true');
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando placar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-red-900 border-red-700 max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-red-400 text-xl font-bold mb-2">Erro</h2>
            <p className="text-white">{error}</p>
            <Link href="/scoreboard">
              <Button className="mt-4">Voltar</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match || !area) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-white text-xl font-bold mb-2">Luta não encontrada</h2>
            <p className="text-gray-300">Esta área não possui uma luta ativa.</p>
            <Link href="/scoreboard">
              <Button className="mt-4">Voltar</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header - oculto em fullscreen */}
      {!isFullscreen && (
        <div className="flex justify-between items-center mb-4">
          <Link href="/scoreboard">
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>

          <Button
            onClick={toggleFullscreen}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            Tela Cheia
          </Button>
        </div>
      )}

      {/* Placar Principal */}
      <div className="mb-6">
        <ScorePanel
          match={match}
          fighters={fighters}
          areaName={area.name}
          refereeName={referee?.name || ''}
        />
      </div>

      {/* Controles */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Controles de Pontuação */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-bjj-gold mb-4 text-center">
              Controles de Pontuação
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Lutador 1 */}
              <div className="space-y-2">
                <h4 className="text-center text-blue-400 font-semibold">
                  {fighters[0]?.name || 'Lutador 1'}
                </h4>
                <div className="space-y-2">
                  <ScoreButton
                    onClick={() => addPoints(1, 2)}
                    label="2 pts"
                    variant="points"
                  />
                  <ScoreButton
                    onClick={() => addPoints(1, 3)}
                    label="3 pts"
                    variant="points"
                  />
                  <ScoreButton
                    onClick={() => addPoints(1, 4)}
                    label="4 pts"
                    variant="points"
                  />
                  <ScoreButton
                    onClick={() => addAdvantage(1)}
                    label="Vantagem"
                    variant="advantage"
                  />
                  <ScoreButton
                    onClick={() => addPenalty(1)}
                    label="Punição"
                    variant="penalty"
                  />
                </div>
              </div>

              {/* Lutador 2 */}
              <div className="space-y-2">
                <h4 className="text-center text-red-400 font-semibold">
                  {fighters[1]?.name || 'Lutador 2'}
                </h4>
                <div className="space-y-2">
                  <ScoreButton
                    onClick={() => addPoints(2, 2)}
                    label="2 pts"
                    variant="points"
                  />
                  <ScoreButton
                    onClick={() => addPoints(2, 3)}
                    label="3 pts"
                    variant="points"
                  />
                  <ScoreButton
                    onClick={() => addPoints(2, 4)}
                    label="4 pts"
                    variant="points"
                  />
                  <ScoreButton
                    onClick={() => addAdvantage(2)}
                    label="Vantagem"
                    variant="advantage"
                  />
                  <ScoreButton
                    onClick={() => addPenalty(2)}
                    label="Punição"
                    variant="penalty"
                  />
                </div>
              </div>

              {/* Centro - Timer e Ações */}
              <div className="col-span-2 space-y-4">
                <div className="text-center">
                  <TimerControls
                    isRunning={timer.isRunning}
                    onStart={timer.start}
                    onPause={timer.pause}
                    onReset={timer.reset}
                  />
                </div>

                <div className="flex justify-center space-x-4">
                  <UndoButton onUndo={undo} />
                  <Button
                    onClick={() => setShowFinishModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Finalizar Luta
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Finalização */}
      <FinishMatchModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onFinish={finishMatch}
        fighters={fighters}
      />
    </div>
  );
}