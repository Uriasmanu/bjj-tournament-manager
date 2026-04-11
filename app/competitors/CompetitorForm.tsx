'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User, Building2, Weight, Calendar, Award, UserCircle, X, Save } from 'lucide-react';
import { beltLabels } from '@/types';

const competitorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  team: z.string().min(1, 'Equipe é obrigatória'),
  weight: z.number().min(0.1, 'Peso deve ser maior que 0').max(300, 'Peso deve ser menor que 300'),

  dateBirth: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Data inválida',
    })
    .refine((date) => {
      const birth = new Date(date);
      const today = new Date();

      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      return age >= 4 && age <= 100;
    }, {
      message: 'Idade deve estar entre 4 e 100 anos',
    }),

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
    dateBirth: '',
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
        dateBirth: '',
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
      const errorMessage = error?.errors?.[0]?.message || 'Campo inválido';
      setErrors(prev => ({ ...prev, [name]: errorMessage }));
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
        dateBirth: '',
        belt: 'WHITE',
        coach: '',
      });

      setErrors({});
      onOpenChange(false);
    } catch (error: any) {
      const newErrors: Record<string, string> = {};

      if (error?.errors) {
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
      } else {
        newErrors.general = error?.message || 'Erro ao validar formulário';
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

          {/* Nome */}
          <div className="group">
            <Label className="text-gray-900 font-semibold flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-bjj-gold" />
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`text-gray-900 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold ${
                errors.name ? 'border-red-500' : 'hover:border-bjj-gold/50'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">⚠️ {errors.name}</p>}
          </div>

          {/* Equipe */}
          <div className="group">
            <Label className="text-gray-900 font-semibold flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-bjj-gold" />
              Equipe <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.team}
              onChange={(e) => handleChange('team', e.target.value)}
              className={`text-gray-900 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold ${
                errors.team ? 'border-red-500' : 'hover:border-bjj-gold/50'
              }`}
            />
            {errors.team && <p className="text-red-500 text-sm mt-1">⚠️ {errors.team}</p>}
          </div>

          {/* Peso + Data */}
          <div className="grid grid-cols-2 gap-4">

            <div className="group">
              <Label className="text-gray-900 font-semibold flex items-center gap-2 mb-1">
                <Weight className="w-4 h-4 text-bjj-gold" />
                Peso (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={formData.weight || ''}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                className={`text-gray-900 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold ${
                  errors.weight ? 'border-red-500' : 'hover:border-bjj-gold/50'
                }`}
              />
              {errors.weight && <p className="text-red-500 text-sm mt-1">⚠️ {errors.weight}</p>}
            </div>

            <div className="group">
              <Label className="text-gray-900 font-semibold flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-bjj-gold" />
                Data de Nascimento <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.dateBirth}
                onChange={(e) => handleChange('dateBirth', e.target.value)}
                className={`text-gray-900 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold ${
                  errors.dateBirth ? 'border-red-500' : 'hover:border-bjj-gold/50'
                }`}
              />
              {errors.dateBirth && <p className="text-red-500 text-sm mt-1">⚠️ {errors.dateBirth}</p>}
            </div>

          </div>

          {/* Faixa */}
          <div className="group">
            <Label className="text-gray-900 font-semibold flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-bjj-gold" />
              Faixa <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.belt} onValueChange={(value) => handleChange('belt', value)}>
              <SelectTrigger className="bg-white/90 text-gray-900 border-gray-300">
                <SelectValue placeholder="Selecione a faixa" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(beltLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.belt && <p className="text-red-500 text-sm mt-1">⚠️ {errors.belt}</p>}
          </div>

          {/* Técnico */}
          <div className="group">
            <Label className="text-gray-900 font-semibold flex items-center gap-2 mb-1">
              <UserCircle className="w-4 h-4 text-bjj-gold" />
              Técnico
            </Label>
            <Input
              value={formData.coach || ''}
              onChange={(e) => handleChange('coach', e.target.value)}
              className="text-gray-900 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold"
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" /> Cancelar
            </Button>
            <Button className="bg-bjj-gold text-black hover:bg-bjj-gold-dark">
              <Save className="w-4 h-4" /> Salvar
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}