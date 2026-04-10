// src/components/competitors/CompetitorForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User, Building2, Weight, Calendar, Award, UserCircle, X, Save } from 'lucide-react';
import { Belt, beltLabels } from '@/types';

const competitorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  team: z.string().min(1, 'Equipe é obrigatória'),
  weight: z.number().min(0.1, 'Peso deve ser maior que 0').max(300, 'Peso deve ser menor que 300'),
  dateBirth: z.number().min(4, 'Idade mínima é 4 anos').max(100, 'Idade máxima é 100 anos'),
  belt: z.enum(['WHITE', 'GRAY', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'PURPLE', 'BROWN', 'BLACK']),
  coach: z.string().optional(),
});

type CompetitorFormValues = z.infer<typeof competitorSchema>;

interface CompetitorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CompetitorFormValues) => Promise<void>;
  initialData?: CompetitorFormValues;
  title: string;
}

export function CompetitorForm({ open, onOpenChange, onSubmit, initialData, title }: CompetitorFormProps) {
  const [formData, setFormData] = useState<CompetitorFormValues>({
    name: '',
    team: '',
    weight: 0,
    dateBirth: 0,
    belt: 'WHITE',
    coach: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        team: '',
        weight: 0,
        dateBirth: 0,
        belt: 'WHITE',
        coach: '',
      });
    }
  }, [initialData, open]);

  const validateField = (name: string, value: any) => {
    try {
      const schema = competitorSchema.shape[name as keyof typeof competitorSchema.shape];
      if (schema) {
        schema.parse(value);
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    } catch (error: any) {
      const errorMessdateBirth = error?.errors?.[0]?.messdateBirth || 'Campo inválido';
      setErrors(prev => ({ ...prev, [name]: errorMessdateBirth }));
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = competitorSchema.parse(formData);
      await onSubmit(validatedData);
      setFormData({
        name: '',
        team: '',
        weight: 0,
        dateBirth: 0,
        belt: 'WHITE',
        coach: '',
      });
      setErrors({});
      onOpenChange(false);
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      if (error?.errors) {
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.messdateBirth;
        });
      } else {
        newErrors.general = error?.messdateBirth || 'Erro ao validar formulário';
      }
      setErrors(newErrors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-white to-gray-50 border-2 border-bjj-gold/30 shadow-xl">
        
        <DialogHeader className="bg-gradient-to-r from-bjj-gold/10 to-transparent -mx-6 px-6 pb-4 pt-2 border-b-2 border-bjj-gold/30">
          <DialogTitle className="text-2xl font-bold text-bjj-gold flex items-center gap-2">
            <Award className="w-6 h-6 text-bjj-gold" />
            {title}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Preencha os dados do atleta para inscrição no torneio
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          
          <div className="group">
            <Label htmlFor="name" className="text-gray-700 font-semibold flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-bjj-gold" />
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`mt-1 text-gray-700 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold transition-all duration-200 ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'hover:border-bjj-gold/50'
              }`}
              placeholder="Digite o nome completo do atleta"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.name}
              </p>
            )}
          </div>

          
          <div className="group">
            <Label htmlFor="team" className="text-gray-700 font-semibold flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-bjj-gold" />
              Equipe/Academia <span className="text-red-500">*</span>
            </Label>
            <Input
              id="team"
              value={formData.team}
              onChange={(e) => handleChange('team', e.target.value)}
              className={`mt-1 text-gray-700 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold transition-all duration-200 ${
                errors.team ? 'border-red-500 focus:ring-red-500' : 'hover:border-bjj-gold/50'
              }`}
              placeholder="Ex: Alliance, Checkmat, Gracie Barra"
            />
            {errors.team && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.team}
              </p>
            )}
          </div>

          
          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <Label htmlFor="weight" className="text-gray-700 font-semibold flex items-center gap-2 mb-1">
                <Weight className="w-4 h-4 text-bjj-gold" />
                Peso (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  handleChange('weight', isNaN(value) ? 0 : value);
                }}
                className={`mt-1 text-gray-700 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold transition-all duration-200 ${
                  errors.weight ? 'border-red-500 focus:ring-red-500' : 'hover:border-bjj-gold/50'
                }`}
                placeholder="Ex: 75.5"
              />
              {errors.weight && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors.weight}
                </p>
              )}
            </div>

            <div className="group">
              <Label htmlFor="dateBirth" className="text-gray-700 font-semibold flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-bjj-gold" />
                Idade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateBirth"
                type="number"
                value={formData.dateBirth || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  handleChange('dateBirth', isNaN(value) ? 0 : value);
                }}
                className={`mt-1 text-gray-700 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold transition-all duration-200 ${
                  errors.dateBirth ? 'border-red-500 focus:ring-red-500' : 'hover:border-bjj-gold/50'
                }`}
                placeholder="Ex: 28"
              />
              {errors.dateBirth && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors.dateBirth}
                </p>
              )}
            </div>
          </div>

          
          <div className="group">
            <Label htmlFor="belt" className="text-gray-700 font-semibold flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-bjj-gold" />
              Faixa <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.belt} onValueChange={(value) => handleChange('belt', value)}>
              <SelectTrigger
                className={`mt-1 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold transition-all duration-200 ${
                  errors.belt ? 'border-red-500' : 'hover:border-bjj-gold/50'
                }`}
              >
                <SelectValue placeholder="Selecione a faixa do atleta" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {Object.entries(beltLabels).map(([value, label]) => (
                  <SelectItem 
                    key={value} 
                    value={value}
                    className="hover:bg-bjj-gold/10 focus:bg-bjj-gold/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        value === 'WHITE' ? 'bg-gray-200' :
                        value === 'GRAY' ? 'bg-gray-500' :
                        value === 'YELLOW' ? 'bg-yellow-400' :
                        value === 'ORANGE' ? 'bg-orange-500' :
                        value === 'GREEN' ? 'bg-green-600' :
                        value === 'BLUE' ? 'bg-blue-700' :
                        value === 'PURPLE' ? 'bg-purple-600' :
                        value === 'BROWN' ? 'bg-amber-800' :
                        'bg-gray-900'
                      }`} />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.belt && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.belt}
              </p>
            )}
          </div>

          
          <div className="group">
            <Label htmlFor="coach" className="text-gray-700 font-semibold flex items-center gap-2 mb-1">
              <UserCircle className="w-4 h-4 text-bjj-gold" />
              Técnico <span className="text-gray-400 text-sm">(opcional)</span>
            </Label>
            <Input
              id="coach"
              value={formData.coach || ''}
              onChange={(e) => handleChange('coach', e.target.value)}
              className="mt-1 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold transition-all duration-200 hover:border-bjj-gold/50"
              placeholder="Nome do técnico responsável"
            />
          </div>

          
          <div className="bg-blue-50 border-l-4 border-bjj-blue p-3 rounded-md">
            <p className="text-xs text-gray-700">
              <span className="font-semibold">📌 Informação:</span> Os campos marcados com <span className="text-red-500">*</span> são obrigatórios.
              O peso deve ser informado em quilogramas (kg).
            </p>
          </div>

          
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-bjj-gold to-bjj-gold-dark text-black hover:from-bjj-gold-dark hover:to-bjj-gold font-semibold shadow-md hover:shadow-lg transition-all duration-200 gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Competidor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}