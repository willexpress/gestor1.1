import React from 'react';
import { X, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface CodeDetailsModalProps {
  code: {
    id: string;
    code: string;
    planName: string;
    appName: string;
    value: number;
    purchaseDate: Date;
    expiryDate: Date;
    status: 'active' | 'expired' | 'used';
    createdAt: Date;
    expiresAt: Date;
    planId: string;
  };
  onClose: () => void;
}

const CodeDetailsModal: React.FC<CodeDetailsModalProps> = ({ code, onClose }) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(
        <div className="flex items-center space-x-2">
          <Copy className="w-5 h-5 text-green-600" />
          <span className="font-medium">Código copiado!</span>
        </div>,
        {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#ffffff',
            fontWeight: 'bold',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#10B981',
          },
        }
      );
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast.success('Código copiado!', {
        duration: 3000,
        icon: '📋',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detalhes do Código</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Código de Recarga</p>
            <p className="font-mono text-xl font-bold text-gray-900 dark:text-white break-all">{code.code}</p>
          </div>

          <button
            onClick={() => copyToClipboard(code.code)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Copy className="w-5 h-5" />
            <span>Copiar Código</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeDetailsModal;