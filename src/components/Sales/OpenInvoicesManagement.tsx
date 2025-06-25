import React, { useState } from 'react';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  CheckCircle, 
  X, 
  Package, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  Clock,
  ArrowRight,
  Send,
  Copy
} from 'lucide-react';
import { Purchase, Plan, RechargeCode } from '../../types';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface OpenInvoicesManagementProps {
  pendingDeliveries: Purchase[];
  plans: Plan[];
  codes: RechargeCode[];
  onAssignCode: (purchaseId: string, codeId: string) => any;
}

const OpenInvoicesManagement: React.FC<OpenInvoicesManagementProps> = ({
  pendingDeliveries,
  plans,
  codes,
  onAssignCode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCode, setSelectedCode] = useState<RechargeCode | null>(null);

  // Filter pending deliveries based on search and plan filter
  const filteredDeliveries = pendingDeliveries.filter(purchase => {
    const plan = plans.find(p => p.id === purchase.planId);
    const matchesSearch = 
      (purchase.customerData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (purchase.customerData?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (purchase.customerData?.phone?.includes(searchTerm) || '') ||
      (plan?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesPlan = !planFilter || purchase.planId === planFilter;
    
    return matchesSearch && matchesPlan;
  });

  // Get available codes for a specific plan
  const getAvailableCodesForPlan = (planId: string) => {
    return codes.filter(code => code.planId === planId && code.status === 'available');
  };

  // Handle assigning a code to a purchase
  const handleAssignCode = async () => {
    if (!selectedPurchase || !selectedCode) return;
    
    setIsProcessing(true);
    
    try {
      // Call the assign code function
      const result = await onAssignCode(selectedPurchase.id, selectedCode.id);
      
      if (result.success) {
        toast.success(
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">Código atribuído com sucesso!</p>
              <p className="text-sm">O cliente será notificado automaticamente.</p>
            </div>
          </div>,
          { duration: 5000 }
        );
        
        // Close the modal
        setShowAssignModal(false);
        setSelectedPurchase(null);
        setSelectedCode(null);
      } else {
        toast.error(
          <div className="flex items-center space-x-2">
            <X className="w-5 h-5 text-red-600" />
            <span className="font-medium">{result.message || 'Erro ao atribuir código'}</span>
          </div>
        );
      }
    } catch (error) {
      toast.error('Erro ao processar a solicitação');
      console.error('Error assigning code:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy code to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Código copiado para a área de transferência!');
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Código copiado para a área de transferência!');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Faturas em Aberto</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Gerencie faturas que precisam de atribuição manual de códigos
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-300">
              Atenção: Faturas Pendentes de Código
            </h3>
            <div className="mt-2 text-sm text-orange-700 dark:text-orange-400">
              <p>
                Estas faturas foram pagas com sucesso, mas não foi possível entregar um código automaticamente.
                Você precisa atribuir manualmente um código para cada fatura.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por cliente, email ou plano..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos os planos</option>
          {plans.map(plan => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - {plan.appConfig.appName}
            </option>
          ))}
        </select>
      </div>

      {/* Pending Deliveries List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Faturas Pendentes de Código
            {filteredDeliveries.length > 0 && (
              <span className="ml-2 text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 px-2 py-1 rounded-full">
                {filteredDeliveries.length}
              </span>
            )}
          </h2>
        </div>

        {filteredDeliveries.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhuma fatura pendente</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Todas as faturas estão com códigos atribuídos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Cliente</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Plano</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Valor</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Data</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Motivo</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map(purchase => {
                  const plan = plans.find(p => p.id === purchase.planId);
                  const availableCodes = getAvailableCodesForPlan(purchase.planId);
                  
                  return (
                    <tr key={purchase.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">{purchase.customerData?.name}</span>
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <Mail className="w-3 h-3" />
                            <span>{purchase.customerData?.email}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <Phone className="w-3 h-3" />
                            <span>{formatPhone(purchase.customerData?.phone || '')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{plan?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{plan?.appConfig.appName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(purchase.amount || plan?.value || 0)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1 text-xs">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">{formatDate(purchase.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs mt-1">
                            <CreditCard className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {purchase.paymentMethod === 'credit_card' ? 'Cartão' : 'PIX'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded-full text-xs font-medium">
                          {purchase.codeDeliveryFailureReason === 'no_available_codes' 
                            ? 'Sem códigos disponíveis' 
                            : purchase.codeDeliveryFailureReason || 'Erro do sistema'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => {
                            setSelectedPurchase(purchase);
                            setShowAssignModal(true);
                          }}
                          disabled={availableCodes.length === 0}
                          className={`px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center space-x-2 ${
                            availableCodes.length > 0
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          <span>Atribuir Código</span>
                        </button>
                        {availableCodes.length === 0 && (
                          <p className="text-xs text-red-500 mt-1">Sem códigos disponíveis</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Code Modal */}
      {showAssignModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Atribuir Código</h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPurchase(null);
                  setSelectedCode(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Purchase Details */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Detalhes da Compra</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 dark:text-blue-400">
                      <strong>Cliente:</strong> {selectedPurchase.customerData?.name}
                    </p>
                    <p className="text-blue-700 dark:text-blue-400">
                      <strong>Email:</strong> {selectedPurchase.customerData?.email}
                    </p>
                    <p className="text-blue-700 dark:text-blue-400">
                      <strong>Telefone:</strong> {formatPhone(selectedPurchase.customerData?.phone || '')}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700 dark:text-blue-400">
                      <strong>Plano:</strong> {plans.find(p => p.id === selectedPurchase.planId)?.name}
                    </p>
                    <p className="text-blue-700 dark:text-blue-400">
                      <strong>Valor:</strong> {formatCurrency(selectedPurchase.amount || plans.find(p => p.id === selectedPurchase.planId)?.value || 0)}
                    </p>
                    <p className="text-blue-700 dark:text-blue-400">
                      <strong>Data:</strong> {formatDate(selectedPurchase.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Codes */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Códigos Disponíveis</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {getAvailableCodesForPlan(selectedPurchase.planId).length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-300 font-medium">Nenhum código disponível para este plano</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Importe novos códigos antes de continuar
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {getAvailableCodesForPlan(selectedPurchase.planId).map(code => (
                        <div 
                          key={code.id}
                          onClick={() => setSelectedCode(code)}
                          className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                            selectedCode?.id === code.id 
                              ? 'bg-blue-50 dark:bg-blue-900/20' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              selectedCode?.id === code.id 
                                ? 'bg-blue-600 text-white' 
                                : 'border border-gray-300 dark:border-gray-600'
                            }`}>
                              {selectedCode?.id === code.id && <CheckCircle className="w-3 h-3" />}
                            </div>
                            <div>
                              <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{code.code}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Criado em: {formatDate(code.createdAt).split(' ')[0]}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(code.code);
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedPurchase(null);
                    setSelectedCode(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAssignCode}
                  disabled={!selectedCode || isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      <span>Atribuir Código e Notificar Cliente</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenInvoicesManagement;