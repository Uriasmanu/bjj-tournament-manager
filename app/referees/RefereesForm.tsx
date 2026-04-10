'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User, Award, UserCircle, X, Save } from 'lucide-react';
import { beltLabels, BeltReferee } from '@/types';

const refereesSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  beltReferee: z.enum(['PURPLE', 'BROWN', 'BLACK']),
  city: z.string().optional(),
});

type refereesFormValues = z.infer<typeof refereesSchema>;

interface refereesFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: refereesFormValues) => Promise<void>;
  initialData?: refereesFormValues;
  title: string;
}

export function RefereesForm({ open, onOpenChange, onSubmit, initialData, title }: refereesFormProps) {
  const [formData, setFormData] = useState<refereesFormValues>({
    name: '',
    beltReferee: 'PURPLE',
    city: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        beltReferee: 'PURPLE',
        city: '',
      });
    }
  }, [initialData, open]);

  const validateField = (name: string, value: any) => {
    try {
      const schema = refereesSchema.shape[name as keyof typeof refereesSchema.shape];
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
      const validatedData = refereesSchema.parse(formData);
      await onSubmit(validatedData);
      setFormData({
        name: '',
        beltReferee: 'PURPLE',
        city: '',
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
            <Label htmlFor="belt" className="text-gray-700 font-semibold flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-bjj-gold" />
              Faixa <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.beltReferee} onValueChange={(value) => handleChange('belt', value)}>
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
            <Label htmlFor="city" className="text-gray-700 font-semibold flex items-center gap-2 mb-1">
              <UserCircle className="w-4 h-4 text-bjj-gold" />
              Cidade 
            </Label>
            <Input
              id="city"
              value={formData.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              className="mt-1 text-gray-900 bg-white/90 border-gray-300 focus:border-bjj-gold focus:ring-bjj-gold transition-all duration-200 hover:border-bjj-gold/50"
              placeholder="Nome do Cidade responsável"
            />
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
              Salvar Árbitro
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}