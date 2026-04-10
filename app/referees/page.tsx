'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Upload, Download, Trash2, Edit,
  Eye, EyeOff, Shield, ChevronLeft, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { beltLabels, Referee, BeltReferee } from '@/types';
import { ImportRefereesModal } from './ImportRefereesModal';
import { RefereesForm } from './RefereesForm';

const beltColors: Record<BeltReferee, string> = {
  PURPLE: 'bg-purple-100 text-purple-800 border-purple-300',
  BROWN: 'bg-amber-100 text-amber-800 border-amber-300',
  BLACK: 'bg-gray-900 text-white border-gray-800',
};

export default function RefereesPage() {
  const [referees, setReferees] = useState<Referee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBelt, setFilterBelt] = useState<string>('all');
  const [filterCity, setFilterCity] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingReferee, setEditingReferee] = useState<Referee | null>(null);
  const [cities, setCities] = useState<string[]>([]);

  const fetchReferees = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('name', searchTerm);
    if (filterBelt !== 'all') params.append('belt', filterBelt);
    if (filterCity && filterCity !== 'all') params.append('city', filterCity);
    if (showInactive) params.append('showInactive', 'true');

    try {
      const response = await fetch(`/api/referees?${params.toString()}`);
      const data = await response.json();
      setReferees(data);

      const uniqueCities = [...new Set(data.map((r: Referee) => r.city).filter(Boolean))];
      setCities(uniqueCities as string[]);
    } catch (error) {
      toast.error('Erro ao carregar árbitros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferees();
  }, [searchTerm, filterBelt, filterCity, showInactive]);

  const handleCreateReferee = async (data: any) => {
    try {
      const response = await fetch('/api/referees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Árbitro cadastrado com sucesso!');
        setFormOpen(false);
        fetchReferees();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao cadastrar árbitro');
      }
    } catch (error) {
      toast.error('Erro ao cadastrar árbitro');
    }
  };

  const handleUpdateReferee = async (data: any) => {
    if (!editingReferee) return;

    try {
      const response = await fetch(`/api/referees/${editingReferee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Árbitro atualizado com sucesso!');
        setFormOpen(false);
        setEditingReferee(null);
        fetchReferees();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao atualizar árbitro');
      }
    } catch (error) {
      toast.error('Erro ao atualizar árbitro');
    }
  };

  const handleDeleteReferee = async (id: string, name: string) => {
    if (confirm(`Deseja excluir ${name}? O registro será mantido no histórico.`)) {
      try {
        const response = await fetch(`/api/referees/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Árbitro excluído com sucesso!');
          fetchReferees();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erro ao excluir árbitro');
        }
      } catch (error) {
        toast.error('Erro ao excluir árbitro');
      }
    }
  };

  const handleReactivateReferee = async (id: string) => {
    try {
      const response = await fetch(`/api/referees/${id}/reactivate`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast.success('Árbitro reativado com sucesso!');
        fetchReferees();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao reativar árbitro');
      }
    } catch (error) {
      toast.error('Erro ao reativar árbitro');
    }
  };

  const openEditForm = (referee: Referee) => {
    setEditingReferee(referee);
    setFormOpen(true);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/referees/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arbitros_export_${new Date().getTime()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Exportação concluída!');
    } catch (error) {
      toast.error('Erro ao exportar árbitros');
    }
  };

  const activeRefereesCount = referees.filter(r => r.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-bjj-black transition-all group cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-bjj-black to-gray-800 px-6 py-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-bjj-gold/20 p-3 rounded-xl backdrop-blur-sm">
                  <Shield className="w-8 h-8 text-bjj-gold" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Árbitros</h1>
                  <p className="text-gray-300 text-sm">Gestão da equipe de arbitragem</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setImportOpen(true)}
                  variant="outline"
                  className="border-gray-600 text-gray-200 hover:bg-bjj-gold hover:text-black hover:border-bjj-gold transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" /> Importar
                </Button>

                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="border-gray-600 text-gray-200 hover:bg-bjj-gold hover:text-black hover:border-bjj-gold transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2" /> Exportar
                </Button>

                <Button
                  onClick={() => { setEditingReferee(null); setFormOpen(true); }}
                  className="bg-bjj-gold text-black hover:bg-bjj-gold-dark hover:scale-105 transition-all font-bold shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" /> Novo Árbitro
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-bjj-gray bg-gray-50 border-gray-200 focus:border-bjj-gold focus:ring-bjj-gold/20"
                  />
                </div>
              </div>

              <div className="w-[180px]">
                <Select value={filterBelt} onValueChange={setFilterBelt}>
                  <SelectTrigger className="bg-gray-50 text-bjj-gray border-gray-200">
                    <SelectValue placeholder="Todas faixas" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900">
                      Todas faixas
                    </SelectItem>
                    {Object.entries(beltLabels).map(([value, label]) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[180px]">
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger className="bg-gray-50 text-bjj-gray border-gray-200">
                    <SelectValue placeholder="Todas cidades" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900">
                      Todas cidades
                    </SelectItem>
                    {cities.map(city => (
                      <SelectItem
                        key={city}
                        value={city}
                        className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900"
                      >
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant={showInactive ? "default" : "outline"}
                onClick={() => setShowInactive(!showInactive)}
                className={`gap-2 ${showInactive
                  ? 'bg-bjj-blue text-white hover:bg-bjj-blue/90'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showInactive ? "Ocultar Inativos" : "Mostrar Inativos"}
              </Button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-bjj-gold border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Carregando árbitros...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {referees.map((referee) => (
                  <div
                    key={referee.id}
                    className={`group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden ${!referee.isActive
                      ? 'border-gray-200 opacity-70 bg-gray-50'
                      : 'border-gray-200 hover:shadow-lg hover:border-bjj-gold/30 hover:-translate-y-0.5'
                      }`}
                  >
                    {!referee.isActive && (
                      <div className="absolute top-0 right-0">
                        <Badge variant="secondary" className="rounded-bl-lg rounded-tr-lg bg-gray-400 text-white text-xs px-3 py-1">
                          INATIVO
                        </Badge>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${beltColors[referee.beltReferee]?.split(' ')[0] || 'bg-gray-100'}`}>
                            <Shield className={`w-6 h-6 ${referee.beltReferee === 'BLACK' ? 'text-white' : 'text-gray-700'}`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{referee.name}</h3>
                            <Badge className={`mt-1 text-xs ${beltColors[referee.beltReferee]}`}>
                              {beltLabels[referee.beltReferee]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{referee.city || 'Cidade não informada'}</span>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        {referee.isActive ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => openEditForm(referee)} className="flex-1 gap-1 border-bjj-blue text-bjj-blue hover:bg-bjj-blue hover:text-white transition-all cursor-pointer">
                              <Edit className="w-3.5 h-3.5" /> Editar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteReferee(referee.id, referee.name)} className="flex-1 gap-1 border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => handleReactivateReferee(referee.id)} className="w-full gap-1 bg-green-600 text-white hover:bg-green-700 transition-all cursor-pointer">
                            <Eye className="w-3.5 h-3.5" /> Reativar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && referees.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Total: <strong className="text-gray-900">{referees.length}</strong> árbitros</span>
                  <span>Ativos: <strong className="text-green-600">{activeRefereesCount}</strong></span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ImportRefereesModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          toast.success('Importação concluída com sucesso!');
          fetchReferees();
        }}
      />

      <RefereesForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingReferee(null);
        }}
        onSubmit={editingReferee ? handleUpdateReferee : handleCreateReferee}
        initialData={editingReferee ? {
          name: editingReferee.name,
          city: editingReferee.city,
          beltReferee: editingReferee.beltReferee,
        } : undefined}
        title={editingReferee ? 'Editar Árbitro' : 'Novo Árbitro'}
      />
    </div>
  );
}