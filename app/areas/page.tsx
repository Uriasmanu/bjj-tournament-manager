'use client';

import { useState, useMemo } from 'react';
import { useAreas } from '@/hooks/useAreas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  Clock,
  Trophy,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { AreaForm } from '@/components/AreaForm';
import { AreaCard } from '@/components/AreaCard';
import type { Area } from '@/types'; // Adjust import path as needed

export default function AreasPage() {
  const { areas, loading, error, deleteArea, refresh } = useAreas();
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingAreaId, setDeletingAreaId] = useState<string | null>(null);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const totalAreas = areas.length;
    const activeMatches = areas.filter((area: Area) => area.currentMatchId).length;
    const areasWithReferees = areas.filter((area: Area) => area.refereeId).length;
    const totalScheduledMatches = areas.reduce((sum: number, area: Area) => sum + area.scheduledMatches.length, 0);

    return {
      totalAreas,
      activeMatches,
      areasWithReferees,
      totalScheduledMatches,
    };
  }, [areas]);

  // Filtragem das áreas
  const filteredAreas = useMemo(() => {
    return areas.filter((area: Area) =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [areas, searchTerm]);

  const handleCreateArea = () => {
    setEditingArea(null);
    setShowForm(true);
  };

  const handleEditArea = (area: Area) => {
    setEditingArea(area);
    setShowForm(true);
  };

  const handleDeleteArea = async (areaId: string) => {
    const success = await deleteArea(areaId);
    if (success) {
      setDeletingAreaId(null);
      refresh(); // Recarrega os dados
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingArea(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar áreas</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refresh} className="bg-bjj-gold text-bjj-black hover:bg-bjj-gold-dark hover:text-white">
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header com gradiente BJJ */}
      <div className="bg-gradient-to-r from-bjj-black to-gray-800 text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-bjj-gold rounded-lg shadow-lg">
                <MapPin className="w-8 h-8 text-bjj-black" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  ÁREAS DE LUTA
                </h1>
                <p className="text-gray-300 mt-1">
                  Gerencie tatames e programação de lutas
                </p>
              </div>
            </div>

            <Button
              onClick={handleCreateArea}
              className="bg-bjj-gold text-bjj-black hover:bg-bjj-gold-dark hover:text-white font-bold px-6 py-3 shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Área
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Áreas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? <Skeleton className="h-8 w-12" /> : stats.totalAreas}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-bjj-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lutas Ativas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {loading ? <Skeleton className="h-8 w-12" /> : stats.activeMatches}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Com Árbitros</p>
                  <p className="text-3xl font-bold text-bjj-blue">
                    {loading ? <Skeleton className="h-8 w-12" /> : stats.areasWithReferees}
                  </p>
                </div>
                <Users className="w-8 h-8 text-bjj-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lutas Agendadas</p>
                  <p className="text-3xl font-bold text-bjj-gold">
                    {loading ? <Skeleton className="h-8 w-12" /> : stats.totalScheduledMatches}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-bjj-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <Card className="bg-white border border-gray-200 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar áreas por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-300 text-gray-900 focus:ring-bjj-gold focus:border-bjj-gold"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-bjj-blue text-bjj-blue hover:bg-bjj-blue hover:text-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>

              <Button
                variant="outline"
                onClick={refresh}
                disabled={loading}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4 mr-2" />
                )}
                Atualizar
              </Button>
            </div>

            {showFilters && (
              <>
                <Separator className="my-4" />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-bjj-blue hover:text-white">
                    Com Luta Ativa
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-bjj-blue hover:text-white">
                    Sem Árbitro
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-bjj-blue hover:text-white">
                    Com Fila
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-bjj-blue hover:text-white">
                    Disponíveis
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Lista de Áreas */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white border border-gray-200 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-bjj-black to-gray-800">
                  <Skeleton className="h-6 w-32 bg-gray-700" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAreas.length === 0 ? (
          <Card className="bg-white border border-gray-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'Nenhuma área encontrada' : 'Nenhuma área cadastrada'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando a primeira área de luta do torneio.'
                }
              </p>
              <Button
                onClick={handleCreateArea}
                className="bg-bjj-gold text-bjj-black hover:bg-bjj-gold-dark hover:text-white font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira área
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAreas.map((area: Area) => (
              <AreaCard
                key={area.id}
                area={area}
                onEdit={() => handleEditArea(area)}
                onDelete={() => setDeletingAreaId(area.id)}
              />
            ))}
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        <AlertDialog open={!!deletingAreaId} onOpenChange={() => setDeletingAreaId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Tem certeza que deseja excluir esta área? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-300 text-gray-600 hover:bg-gray-50">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingAreaId && handleDeleteArea(deletingAreaId)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de Formulário */}
        {showForm && (
          <AreaForm
            area={editingArea}
            onClose={handleFormClose}
          />
        )}
      </div>
    </div>
  );
}