import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Plan } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface ReplenishCodesModalProps {
  plan: Plan;
  onClose: () => void;
  onImportCodes: (codes: string[]) => Promise<{ data: any[]; insertedCount: number; totalCount: number }>;
}

const ReplenishCodesModal: React.FC<ReplenishCodesModalProps> = ({ plan, onClose, onImportCodes }) => {
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Function to format a single code string
  const formatCodeString = (codeString: string): string => {
    // Remove all non-alphanumeric characters
    const cleanCode = codeString.replace(/[^a-zA-Z0-9]/g, '');
    
    // Split into groups of 4 characters
    const groups = [];
    for (let i = 0; i < cleanCode.length; i += 4) {
      groups.push(cleanCode.slice(i, i + 4));
    }
    
    // Join with spaces and convert to uppercase
    return groups.join(' ').toUpperCase();
  };

  // Handle import text change with automatic formatting
  const handleImportTextChange = (value: string) => {
    // Split by newlines to get individual code strings
    const lines = value.split('\n');
    
    // Format each line that contains content
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) {
        return ''; // Keep empty lines as is
      }
      
      // Only format if the line looks like a code (has alphanumeric characters)
      if (/[a-zA-Z0-9]/.test(trimmedLine)) {
        return formatCodeString(trimmedLine);
      }
      
      return trimmedLine; // Return as is if it doesn't look like a code
    });
    
    // Join back with newlines
    const formattedText = formattedLines.join('\n');
    setImportText(formattedText);
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      toast.error('Nenhum código para importar');
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Parse codes from text (one per line)
      const codes = importText
        .split('\n')
        .map(code => code.trim())
        .filter(code => code.length > 0)
        .map(code => formatCodeString(code)); // Ensure final formatting
      
      if (codes.length === 0) {
        toast.error('Nenhum código válido encontrado');
        setIsImporting(false);
        return;
      }
      
      // Call the import function
      const result = await onImportCodes(codes);
      
      // Calculate duplicates
      const duplicatesCount = result.totalCount - result.insertedCount;
      
      // Show success toast with info about duplicates
      if (duplicatesCount > 0) {
        toast.success(
          `${result.insertedCount} códigos importados com sucesso! (${duplicatesCount} códigos duplicados ignorados)`,
          { duration: 4000, icon: '✅' }
        );
      } else {
        toast.success(
          `${result.insertedCount} códigos importados com sucesso!`,
          { duration: 4000, icon: '✅' }
        );
      }
      
      // Close modal after successful import
      onClose();
    } catch (error: any) {
      console.error('Error importing codes:', error);
      toast.error(error.message || 'Erro ao importar códigos. Tente novamente.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Abastecer Códigos</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Plan Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Informações do Plano</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-blue-700 dark:text-blue-400"><strong>Plano:</strong> {plan.name}</p>
                <p className="text-blue-700 dark:text-blue-400"><strong>Aplicativo:</strong> {plan.appConfig?.appName || 'App Padrão'}</p>
              </div>
              <div>
                <p className="text-blue-700 dark:text-blue-400"><strong>Valor:</strong> {formatCurrency(plan.value)}</p>
                <p className="text-blue-700 dark:text-blue-400"><strong>Validade:</strong> {plan.validityDays} dias</p>
              </div>
            </div>
          </div>

          {/* Import Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cole os códigos abaixo (um por linha)
            </label>
            <textarea
              value={importText}
              onChange={(e) => handleImportTextChange(e.target.value)}
              rows={10}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder={`1234567891909090
ABCD1234EFGH5678
wxyz9876ijkl5432
...

Os códigos serão formatados automaticamente como:
1234 5678 9190 9090
ABCD 1234 EFGH 5678
WXYZ 9876 IJKL 5432`}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {importText.split('\n').filter(line => line.trim()).length} códigos detectados
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                ✨ Formatação automática ativada
              </p>
            </div>
          </div>

          {/* Alert */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Importante</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Os códigos importados serão associados ao plano <strong>{plan.name}</strong> com valor de <strong>{formatCurrency(plan.value)}</strong>. 
                  Certifique-se de que os códigos correspondem a este plano.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                  <strong>Nota:</strong> Códigos duplicados serão ignorados automaticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!importText.trim() || isImporting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Abastecer Códigos</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplenishCodesModal;