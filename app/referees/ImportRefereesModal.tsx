'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function ImportRefereesModal({ open, onClose, onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [step, setStep] = useState<'idle' | 'validating' | 'importing'>('idle');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAllErrors, setShowAllErrors] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    if (!open) return null;

    const handleClose = () => {
        setFile(null);
        setError(null);
        setStep('idle');
        setLoading(false);
        setShowAllErrors(false);

        if (inputRef.current) {
            inputRef.current.value = '';
        }

        onClose();
    };

    const handleSubmit = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            setStep('validating');

            const text = await file.text();
            const json = JSON.parse(text);

            setStep('importing');

            const response = await fetch('/api/referees/import', {
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
                handleClose();
            }, 1500);

        } catch {
            setError('Arquivo JSON inválido');
            setStep('idle');
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = () => {
        if (step === 'validating') return 'Validando arquivo...';
        if (step === 'importing') return 'Importando competidores...';
        return null;
    };

    // 🔥 transforma string em lista
    const errorList = error
        ? error.split('\n').filter(line => line.trim() !== '')
        : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Importar Competidores
                        </h2>
                        <p className="text-xs text-gray-500">
                            Envie um arquivo JSON válido
                        </p>
                    </div>

                    <button
                        onClick={handleClose}
                        className="p-2 rounded-md hover:bg-gray-200 transition"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">

                    <div
                        onClick={() => inputRef.current?.click()}
                        className={`
              relative flex flex-col items-center justify-center
              border-2 border-dashed rounded-xl p-6 cursor-pointer
              transition-all
              ${file
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                            }
            `}
                    >
                        {file ? (
                            <>
                                <FileText className="w-8 h-8 text-green-600 mb-2" />
                                <p className="text-sm font-medium text-green-700">
                                    {file.name}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    Clique para trocar o arquivo
                                </p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-700">
                                    Clique para selecionar
                                </p>
                                <p className="text-xs text-gray-500">
                                    ou arraste um arquivo JSON
                                </p>
                            </>
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />

                    {getStatusText() && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            {getStatusText()}
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 space-y-2 max-h-60 overflow-auto">

                            <p className="font-semibold">
                                Erros encontrados ({errorList.length})
                            </p>

                            <ul className="list-disc pl-4 space-y-1">
                                {(showAllErrors ? errorList : errorList.slice(0, 10)).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>

                            {errorList.length > 10 && (
                                <button
                                    onClick={() => setShowAllErrors(prev => !prev)}
                                    className="text-xs text-red-700 underline"
                                >
                                    {showAllErrors ? 'Mostrar menos' : 'Mostrar todos'}
                                </button>
                            )}
                        </div>
                    )}

                </div>

                <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="cursor-pointer"
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={!file || loading}
                        className="bg-bjj-blue hover:bg-bjj-blue/90 text-white cursor-pointer"
                    >
                        {loading ? 'Processando...' : 'Importar'}
                    </Button>
                </div>

            </div>
        </div>
    );
}