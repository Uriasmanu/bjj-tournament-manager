import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface FighterData {
  id: string;
  name: string;
}

interface FinishMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (winnerId: string, reason: 'points' | 'submission') => void;
  fighters: [FighterData | null, FighterData | null];
}

export function FinishMatchModal({ isOpen, onClose, onFinish, fighters }: FinishMatchModalProps) {
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [reason, setReason] = useState<'points' | 'submission'>('points');

  const handleFinish = () => {
    if (selectedWinner) {
      onFinish(selectedWinner, reason);
      onClose();
      setSelectedWinner('');
      setReason('points');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-bjj-gold">Finalizar Luta</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-white mb-3 block">Vencedor:</Label>
            <RadioGroup value={selectedWinner} onValueChange={setSelectedWinner}>
              {fighters[0] && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={fighters[0].id} id="fighter1" />
                  <Label htmlFor="fighter1" className="text-white">
                    {fighters[0].name}
                  </Label>
                </div>
              )}
              {fighters[1] && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={fighters[1].id} id="fighter2" />
                  <Label htmlFor="fighter2" className="text-white">
                    {fighters[1].name}
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white mb-3 block">Motivo da vitória:</Label>
            <RadioGroup value={reason} onValueChange={(value) => setReason(value as 'points' | 'submission')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="points" id="points" />
                <Label htmlFor="points" className="text-white">
                  Pontos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="submission" id="submission" />
                <Label htmlFor="submission" className="text-white">
                  Finalização
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleFinish}
            disabled={!selectedWinner}
            className="bg-bjj-gold hover:bg-bjj-gold-dark text-black"
          >
            Finalizar Luta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}