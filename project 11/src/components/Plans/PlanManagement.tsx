import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Upload, 
  CheckCircle, 
  X, 
  Save,
  Smartphone,
  Calendar,
  DollarSign,
  ListChecks,
  Globe
} from 'lucide-react';
import { Plan, RechargeCode } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import ReplenishCodesModal from './ReplenishCodesModal';
import toast from 'react-hot-toast';

interface PlanManagementProps {
  plans: Plan[];
  codes: RechargeCode[];
  onAddPlan: (plan: Omit<Plan, 'id'>) => void;
  onEditPlan: (id: string, plan: Partial<Plan>) => void;
  onDeletePlan: (id: string) => void;
  onViewPlan: (plan: Plan) => void;
  onImportCodes: (planId: string, codes: string[]) => void;
}

const PlanManagement: React.FC<PlanManagementProps> = ({
  plans,
  codes,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
  onViewPlan,
  onImportCodes
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showReplenishModal, setShowReplenishModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.appConfig?.appName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || plan.category === categoryFilter;
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && plan.isActive) ||
                         (statusFilter === 'inactive' && !plan.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEditClick = (plan: Plan) => {
    setEditingPlan(plan);
    setShowEditModal(true);
  };

  const handleReplenishClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowReplenishModal(true);
  };

  const handleImportCodes = (codes: string[]) => {
    if (!selectedPlan) return;
    
    try {
      onImportCodes(selectedPlan.id, codes);
      toast.success(`${codes.length} códigos importados com sucesso!`);
    } catch (error: any) {
      console.error('Error importing codes:', error);
      toast.error(error.message || 'Erro ao importar códigos');
    }
  };

  const getAvailableCodesCount = (planId: string) => {
    return codes.filter(code => code.planId === planId && code.status === 'available').length;
  };

  const getSoldCodesCount = (planId: string) => {
    return codes.filter(code => code.planId === planId && code.status === 'sold').length;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Gestão de Planos</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Gerencie planos de recarga e aplicativos</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Plano</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, descrição ou aplicativo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas as categorias</option>
          <option value="recharge">Recarga</option>
          <option value="master_qualification">Qualificação Master</option>
          <option value="data_package">Pacote de Dados</option>
          <option value="app_plan">Plano de App</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map(plan => {
          const availableCodes = getAvailableCodesCount(plan.id);
          const soldCodes = getSoldCodesCount(plan.id);
          
          return (
            <div key={plan.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg text-white">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{plan.appConfig?.appName || 'App Padrão'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    plan.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {plan.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{plan.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Valor</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(plan.value)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Validade</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{plan.validityDays} dias</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">{availableCodes} códigos disponíveis</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-300">{soldCodes} vendidos</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleReplenishClick(plan)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Abastecer</span>
                  </button>
                  <button
                    onClick={() => handleEditClick(plan)}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDeletePlan(plan.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhum plano encontrado</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {searchTerm || categoryFilter || statusFilter 
              ? 'Tente ajustar os filtros para encontrar planos'
              : 'Comece criando seu primeiro plano'
            }
          </p>
          {!searchTerm && !categoryFilter && !statusFilter && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Criar Plano</span>
            </button>
          )}
        </div>
      )}

      {/* Add Plan Modal */}
      {showAddModal && (
        <PlanFormModal
          onClose={() => setShowAddModal(false)}
          onSave={(planData) => {
            onAddPlan(planData);
            setShowAddModal(false);
          }}
          title="Novo Plano"
        />
      )}

      {/* Edit Plan Modal */}
      {showEditModal && editingPlan && (
        <PlanFormModal
          plan={editingPlan}
          onClose={() => {
            setShowEditModal(false);
            setEditingPlan(null);
          }}
          onSave={(planData) => {
            onEditPlan(editingPlan.id, planData);
            setShowEditModal(false);
            setEditingPlan(null);
          }}
          title="Editar Plano"
        />
      )}

      {/* Replenish Codes Modal */}
      {showReplenishModal && selectedPlan && (
        <ReplenishCodesModal
          plan={selectedPlan}
          onClose={() => {
            setShowReplenishModal(false);
            setSelectedPlan(null);
          }}
          onImportCodes={handleImportCodes}
        />
      )}
    </div>
  );
};

interface PlanFormModalProps {
  plan?: Plan;
  onClose: () => void;
  onSave: (plan: Omit<Plan, 'id'>) => void;
  title: string;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({
  plan,
  onClose,
  onSave,
  title
}) => {
  const [formData, setFormData] = useState<Omit<Plan, 'id'>>({
    name: plan?.name || '',
    description: plan?.description || '',
    value: plan?.value || 0,
    validityDays: plan?.validityDays || 30,
    category: plan?.category || 'recharge',
    isActive: plan?.isActive ?? true,
    createdBy: plan?.createdBy || 'current-user',
    features: plan?.features || [],
    appConfig: plan?.appConfig || {
      appName: '',
      hasApp: false
    }
  });

  const [newFeature, setNewFeature] = useState('');

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast.error('Nome do plano é obrigatório');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Descrição do plano é obrigatória');
      return;
    }
    
    if (formData.value <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }
    
    if (formData.validityDays <= 0) {
      toast.error('Validade deve ser maior que zero');
      return;
    }
    
    if (!formData.appConfig?.appName?.trim()) {
      toast.error('Nome do aplicativo é obrigatório');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Plano
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Recarga 30 Dias"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Plan['category'] }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recharge">Recarga</option>
                <option value="master_qualification">Qualificação Master</option>
                <option value="data_package">Pacote de Dados</option>
                <option value="app_plan">Plano de App</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Valor (R$)
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 29.90"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Validade (dias)
              </label>
              <input
                type="number"
                value={formData.validityDays}
                onChange={(e) => setFormData(prev => ({ ...prev, validityDays: parseInt(e.target.value) }))}
                min="1"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 30"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva o plano..."
            />
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <Smartphone className="w-5 h-5 inline mr-2" />
              Configuração do Aplicativo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Aplicativo
                </label>
                <input
                  type="text"
                  value={formData.appConfig?.appName || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    appConfig: { 
                      ...prev.appConfig || {}, 
                      appName: e.target.value 
                    } 
                  }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: MeuApp Recarga"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasApp"
                  checked={formData.appConfig?.hasApp || false}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    appConfig: { 
                      ...prev.appConfig || {}, 
                      hasApp: e.target.checked 
                    } 
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="hasApp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Possui aplicativo próprio
                </label>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <ListChecks className="w-5 h-5 inline mr-2" />
              Recursos do Plano
            </h3>
            
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Ligações ilimitadas"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.features?.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {(!formData.features || formData.features.length === 0) && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Nenhum recurso adicionado
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Plano Ativo
            </label>
          </div>
          
          <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Salvar Plano</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanManagement;