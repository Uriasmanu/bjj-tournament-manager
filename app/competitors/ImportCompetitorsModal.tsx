'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function ImportCompetitorsModal({ open, onClose, onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [step, setStep] = useState<'idle' | 'validating' | 'importing'>('idle');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            setStep('validating');

            const text = await file.text();
            const json = JSON.parse(text);

            setStep('importing');

            const response = await fetch('/api/competitors/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error);
                setStep('idle');
                return;
            }

            setTimeout(() => {
                onSuccess();
                onClose();
                setFile(null);
                setStep('idle');
            }, 2000);

        } catch {
            setError('Arquivo JSON inválido');
            setStep('idle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">


                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Importar Competidores</h2>
                    <button onClick={onClose}>✕</button>
                </div>


                <div
                    className="border-2 border-dashed p-6 text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    <Upload className="mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                        {file ? file.name : 'Arraste ou clique para selecionar um JSON'}
                    </p>
                </div>

                <input
                    id="fileInput"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />


                {step === 'validating' && (
                    <p className="text-sm text-gray-500">Validando arquivo...</p>
                )}

                {step === 'importing' && (
                    <p className="text-sm text-gray-500">Importando competidores...</p>
                )}


                {error && (
                    <div className="text-red-500 text-sm whitespace-pre-wrap">
                        {error}
                    </div>
                )}


                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={!file || loading}
                    >
                        Importar
                    </Button>
                </div>
            </div>
        </div>
    );
}