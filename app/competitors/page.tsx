'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Search, Upload, Download, Trash2, Edit,
  Eye, EyeOff, Users, Filter, HardHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { beltLabels, Competitor } from '@/types';
import { BeltBadge } from './BeltBadge';
import { CompetitorForm } from './CompetitorForm';

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBelt, setFilterBelt] = useState<string>('all');
  const [filterTeam, setFilterTeam] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);

  const fetchCompetitors = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('name', searchTerm);
    if (filterBelt !== 'all') params.append('belt', filterBelt);
    if (filterTeam) params.append('team', filterTeam);
    if (showInactive) params.append('showInactive', 'true');

    try {
      const response = await fetch(`/api/competitors?${params.toString()}`);
      const data = await response.json();
      setCompetitors(data);
    } catch (error) {
      toast.error('Erro ao carregar competidores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, [searchTerm, filterBelt, filterTeam, showInactive]);

  const handleCreateCompetitor = async (data: any) => {
    const response = await fetch('/api/competitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success('Competidor cadastrado com sucesso!');
      fetchCompetitors();
    } else {
      const error = await response.json();
      toast.error(error.error || 'Erro ao cadastrar competidor');
    }
  };

  const handleUpdateCompetitor = async (data: any) => {
    if (!editingCompetitor) return;

    const response = await fetch(`/api/competitors/${editingCompetitor.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success('Competidor atualizado com sucesso!');
      fetchCompetitors();
      setEditingCompetitor(null);
    } else {
      const error = await response.json();
      toast.error(error.error || 'Erro ao atualizar competidor');
    }
  };

  const handleDeleteCompetitor = async (id: string, name: string) => {
    if (confirm(`Deseja excluir ${name}? O registro será mantido no histórico.`)) {
      const response = await fetch(`/api/competitors/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Competidor excluído com sucesso!');
        fetchCompetitors();
      } else {
        toast.error('Erro ao excluir competidor');
      }
    }
  };

  const handleReactivateCompetitor = async (id: string) => {
    const response = await fetch(`/api/competitors/${id}`, {
      method: 'PATCH',
    });

    if (response.ok) {
      toast.success('Competidor reativado com sucesso!');
      fetchCompetitors();
    } else {
      const error = await response.json();
      toast.error(error.error || 'Erro ao reativar competidor');
    }
  };

  const openEditForm = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setFormOpen(true);
  };

  const handleExport = async () => {
    const response = await fetch('/api/competitors/export');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Gerar o nome do arquivo no frontend mesmo
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const filename = `competidores_export_${year}${month}${day}_${hours}${minutes}${seconds}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-[#F8F9FA] overflow-hidden flex flex-col">
      <div className="container mx-auto p-6 space-y-6 flex flex-col h-full">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-bjj-black p-3 rounded-lg shadow-lg">
              <Users className="w-8 h-8 text-bjj-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-bjj-black tracking-tight uppercase">Competidores</h1>
              <p className="text-gray-500 font-medium">Gestão de atletas e graduações</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="flex-1 md:flex-none border-gray-300 text-bjj-blue font-semibold cursor-pointer hover:!bg-bjj-blue hover:!text-white"
            >
              <Upload className="w-4 h-4 mr-2" /> Importar
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              className="flex-1 md:flex-none border-gray-300 text-bjj-blue font-semibold cursor-pointer hover:!bg-bjj-blue hover:!text-white"
            >
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
            <Button
              onClick={() => { setEditingCompetitor(null); setFormOpen(true); }}
              className="flex-1 md:flex-none bg-bjj-gold text-black hover:bg-bjj-gold-dark font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Atleta
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">

          <Card className="lg:col-span-1 bg-white border-none shadow-md flex flex-col overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 flex-shrink-0">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2 text-bjj-black">
                <Filter className="w-4 h-4 text-bjj-gold" /> Filtros Avançados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Busca</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Nome do atleta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-gray-50 border-gray-200 text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Graduação</label>
                <Select value={filterBelt} onValueChange={setFilterBelt}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-500">
                    <SelectValue placeholder="Todas as faixas" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border shadow-md">
                    <SelectItem value="all">Todas as faixas</SelectItem>
                    {Object.entries(beltLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Academia</label>
                <Input
                  placeholder="Nome da equipe..."
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-500"
                />
              </div>

              <Separator className="my-2" />
              <Button
                variant={showInactive ? "default" : "outline"}
                onClick={() => setShowInactive(!showInactive)}
                className={`w-full justify-start gap-2 ${showInactive
                  ? 'bg-bjj-blue text-white hover:bg-bjj-blue/90 cursor-pointer'
                  : 'border-gray-200 text-gray-900 hover:bg-gray-100 hover:text-gray-900 cursor-pointer'
                  }`}
              >
                {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showInactive ? "Ocultar Inativos" : "Mostrar Inativos"}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 bg-white border-none shadow-md flex flex-col overflow-hidden">

            <div className="flex flex-col h-full">
              <div className="flex-shrink-0 bg-bjj-black shadow-md rounded-t-lg">
                <div className="grid grid-cols-12 gap-4 px-4 py-3">
                  <div className="col-span-4 text-white font-bold uppercase text-xs">Atleta</div>
                  <div className="col-span-2 text-white font-bold uppercase text-xs">Equipe</div>
                  <div className="col-span-2 text-white font-bold uppercase text-xs text-center">Info</div>
                  <div className="col-span-2 text-white font-bold uppercase text-xs">Faixa</div>
                  <div className="col-span-2 text-white font-bold uppercase text-xs text-right px-6">Ações</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-gray-100">
                  {loading ? (
                    <div className="text-center py-20 text-gray-400 font-medium">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-4 border-bjj-gold border-t-transparent rounded-full animate-spin" />
                        Sincronizando atletas...
                      </div>
                    </div>
                  ) : competitors.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      Nenhum competidor encontrado.
                    </div>
                  ) : (
                    competitors.map((competitor) => (
                      <div
                        key={competitor.id}
                        className={`grid grid-cols-12 gap-4 px-4 py-3 transition-colors ${!competitor.isActive ? 'bg-gray-50/50' : 'hover:bg-bjj-gold/5'
                          }`}
                      >
                        <div className="col-span-4">
                          <div className="flex flex-col">
                            <span className={`font-bold ${!competitor.isActive ? 'text-gray-400 line-through' : 'text-bjj-black'}`}>
                              {competitor.name}
                            </span>
                            {competitor.coach && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase">
                                <HardHat className="w-3 h-3" /> {competitor.coach}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2 text-gray-600 font-medium">{competitor.team}</div>
                        <div className="col-span-2">
                          <div className="flex flex-col items-center gap-1">
                            <Badge variant="outline" className="text-[10px] border-gray-200 text-gray-500 bg-white">
                              {competitor.weight}kg
                            </Badge>
                            <Badge variant="outline" className="text-[10px] border-gray-200 text-gray-500 bg-white">
                              {competitor.age} anos
                            </Badge>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <BeltBadge belt={competitor.belt} />
                        </div>
                        <div className="col-span-2 text-right px-6">
                          <div className="flex justify-end gap-2">
                            {competitor.isActive ? (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => openEditForm(competitor)}
                                  className="h-8 w-8 text-bjj-blue hover:bg-bjj-blue hover:text-white cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteCompetitor(competitor.id, competitor.name)}
                                  className="h-8 w-8 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleReactivateCompetitor(competitor.id)}
                                className="rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all cursor-pointer"
                              >
                                Reativar
                              </Button>
                            )}
                          </div>
                          {!competitor.isActive && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-400 border-gray-200 mt-4">INATIVO</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <CompetitorForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={editingCompetitor ? handleUpdateCompetitor : handleCreateCompetitor}
          initialData={editingCompetitor ? {
            name: editingCompetitor.name,
            team: editingCompetitor.team,
            weight: editingCompetitor.weight,
            age: editingCompetitor.age,
            belt: editingCompetitor.belt,
            coach: editingCompetitor.coach || '',
          } : undefined}
          title={editingCompetitor ? 'Editar Atleta' : 'Novo Registro de Atleta'}
        />
      </div>
    </div>
  );
}