'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Upload, Download, Trash2, Edit,
  Eye, EyeOff, Users, Filter, HardHat, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { beltLabels, Referee } from '@/types';
import { ImportRefereesModal } from './ImportRefereesModal';
import { RefereesForm } from './RefereesForm';

export default function RefereesPage() {
  const [Referees, setReferees] = useState<Referee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBelt, setFilterBelt] = useState<string>('all');
  const [filterTeam, setFilterTeam] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingReferee, setEditingReferee] = useState<Referee | null>(null);

  const fetchReferees = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('name', searchTerm);
    if (filterBelt !== 'all') params.append('belt', filterBelt);
    if (filterTeam) params.append('team', filterTeam);
    if (showInactive) params.append('showInactive', 'true');

    try {
      const response = await fetch(`/api/Referees?${params.toString()}`);
      const data = await response.json();
      setReferees(data);
    } catch (error) {
      toast.error('Erro ao carregar Arbitros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferees();
  }, [searchTerm, filterBelt, filterTeam, showInactive]);

  const handleCreateReferee = async (data: any) => {
    const response = await fetch('/api/Referees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success('Competidor cadastrado com sucesso!');
      fetchReferees();
    } else {
      const error = await response.json();
      toast.error(error.error || 'Erro ao cadastrar competidor');
    }
  };

  const handleUpdateReferee = async (data: any) => {
    if (!editingReferee) return;

    const response = await fetch(`/api/Referees/${editingReferee.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success('Competidor atualizado com sucesso!');
      fetchReferees();
      setEditingReferee(null);
    } else {
      const error = await response.json();
      toast.error(error.error || 'Erro ao atualizar competidor');
    }
  };

  const handleDeleteReferee = async (id: string, name: string) => {
    if (confirm(`Deseja excluir ${name}? O registro será mantido no histórico.`)) {
      const response = await fetch(`/api/Referees/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Competidor excluído com sucesso!');
        fetchReferees();
      } else {
        toast.error('Erro ao excluir competidor');
      }
    }
  };

  const handleReactivateReferee = async (id: string) => {
    const response = await fetch(`/api/Referees/${id}`, {
      method: 'PATCH',
    });

    if (response.ok) {
      toast.success('Competidor reativado com sucesso!');
      fetchReferees();
    } else {
      const error = await response.json();
      toast.error(error.error || 'Erro ao reativar competidor');
    }
  };

  const openEditForm = (Referee: Referee) => {
    setEditingReferee(Referee);
    setFormOpen(true);
  };

  const handleExport = async () => {
    const response = await fetch('/api/Referees/export');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const filename = `arbitros_export_${year}${month}${day}_${hours}${minutes}${seconds}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-[#F8F9FA] overflow-hidden flex flex-col font-sans">
      <div className="container mx-auto p-6 space-y-6 flex flex-col h-full">


        <div className="flex items-center justify-between flex-shrink-0">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-bjj-black transition-colors group cursor-pointer">
              <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>


        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-bjj-black p-3 rounded-lg shadow-lg">
              <Users className="w-8 h-8 text-bjj-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-bjj-black tracking-tight uppercase">Arbitros</h1>
              <p className="text-gray-500 font-medium">Gestão de Arbitros</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={() => setImportOpen(true)}
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
              onClick={() => { setEditingReferee(null); setFormOpen(true); }}
              className="flex-1 md:flex-none bg-bjj-gold text-black hover:bg-black hover:text-bjj-gold transition-all font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Arbitro
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
                    placeholder="Nome do arbitro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-gray-50 border-gray-200 text-gray-500 focus:border-bjj-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Graduação</label>
                <Select value={filterBelt} onValueChange={setFilterBelt}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-500 focus:border-bjj-gold">
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
                        Sincronizando Arbitros...
                      </div>
                    </div>
                  ) : Referees.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      Nenhum competidor encontrado.
                    </div>
                  ) : (
                    Referees.map((Referee) => (
                      <div
                        key={Referee.id}
                        className={`grid grid-cols-12 gap-4 px-4 py-3 transition-colors ${!Referee.isActive ? 'bg-gray-50/50' : 'hover:bg-bjj-gold/5'
                          }`}
                      >

                        <div className="col-span-2 text-right px-6">
                          <div className="flex justify-end gap-2">
                            {Referee.isActive ? (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => openEditForm(Referee)}
                                  className="h-8 w-8 text-bjj-blue hover:bg-bjj-blue hover:text-white cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteReferee(Referee.id, Referee.name)}
                                  className="h-8 w-8 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleReactivateReferee(Referee.id)}
                                className="rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all cursor-pointer"
                              >
                                Reativar
                              </Button>
                            )}
                          </div>
                          {!Referee.isActive && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-400 border-gray-200 mt-2">INATIVO</Badge>
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

        <ImportRefereesModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onSuccess={() => {
            fetchReferees();
            toast.success('Importação concluída com sucesso!');
          }}
        />

        <RefereesForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={editingReferee ? handleUpdateReferee : handleCreateReferee}
          initialData={editingReferee ? {
            name: editingReferee.name,
            belt: editingReferee.belt,
          } : undefined}
          title={editingReferee ? 'Editar Atleta' : 'Novo Registro de Atleta'}
        />
      </div>
    </div>
  );
}