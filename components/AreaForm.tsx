'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAreas } from '@/hooks/useAreas';
import { Area } from '@/types';

const areaFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  refereeId: z.string().nullable(),
  assistantRefereeId: z.string().nullable(),
});

type AreaFormData = z.infer<typeof areaFormSchema>;

interface AreaFormProps {
  area?: Area | null;
  onClose: () => void;
}

const mockReferees = [
  { id: 'ref1', name: 'João Silva', isActive: true },
  { id: 'ref2', name: 'Maria Santos', isActive: true },
  { id: 'ref3', name: 'Pedro Costa', isActive: false },
];

export function AreaForm({ area, onClose }: AreaFormProps) {
  const { createArea, updateArea } = useAreas();
  const [loading, setLoading] = useState(false);

  const form = useForm<AreaFormData>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      name: area?.name || '',
      refereeId: area?.refereeId || null,
      assistantRefereeId: area?.assistantRefereeId || null,
    },
  });

  const onSubmit = async (data: AreaFormData) => {
    setLoading(true);
    try {
      if (area) {
        await updateArea(area.id, data);
      } else {
        await createArea(data);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar área:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeReferees = mockReferees.filter(ref => ref.isActive);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 rounded-lg shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-bjj-black to-gray-800 text-white p-6 rounded-t-lg -mt-2 -mx-2">
          <DialogTitle className="text-white">
            {area ? 'Editar Área' : 'Nova Área'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Nome da Área</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Área 1" 
                      {...field} 
                      className="bg-gray-50 border-gray-300 text-gray-900 focus:ring-bjj-gold focus:border-bjj-gold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refereeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Árbitro Principal</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900 focus:ring-bjj-gold focus:border-bjj-gold">
                        <SelectValue placeholder="Selecione um árbitro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="none" className="text-gray-900 hover:bg-gray-100">Nenhum</SelectItem>
                      {activeReferees.map((referee) => (
                        <SelectItem key={referee.id} value={referee.id} className="text-gray-900 hover:bg-gray-100">
                          {referee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assistantRefereeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Árbitro Assistente (Opcional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900 focus:ring-bjj-gold focus:border-bjj-gold">
                        <SelectValue placeholder="Selecione um árbitro assistente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="none" className="text-gray-900 hover:bg-gray-100">Nenhum</SelectItem>
                      {activeReferees.map((referee) => (
                        <SelectItem key={referee.id} value={referee.id} className="text-gray-900 hover:bg-gray-100">
                          {referee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-bjj-gold text-bjj-black hover:bg-bjj-gold-dark hover:text-white font-bold"
              >
                {loading ? 'Salvando...' : area ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}