import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Crown,
  Store,
  TrendingUp,
  DollarSign,
  Award,
  UserPlus,
  Settings,
  BarChart3,
  Phone,
  Mail,
  Calendar,
  Star,
  Save,
  X
} from 'lucide-react';
import { Reseller, Commission } from '../../types';
import { formatCurrency, formatDate, formatPhone, formatCPF } from '../../utils/formatters';

interface ResellerManagementProps {
  resellers: Reseller[];
  onAddReseller: (reseller: Omit<Reseller, 'id' | 'createdAt'>) => void;
  onEditReseller: (id: string, reseller: Partial<Reseller>) => void;
  onViewReseller: (reseller: Reseller) => void;
  onPromoteToMaster: (resellerId: string) => void;
}

const ResellerManagement: React.FC<ResellerManagementProps> = ({
  resellers,
  onAddReseller,
  onEditReseller,
  onViewReseller,
  onPromoteToMaster
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredResellers = resellers.filter(reseller => {
    const matchesSearch = reseller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reseller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reseller.phone.includes(searchTerm);
    const matchesRole = !roleFilter || reseller.role === roleFilter;
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && reseller.isActive) ||
                         (statusFilter === 'inactive' && !reseller.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredResellers.length / itemsPerPage);
  const paginatedResellers = filteredResellers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getResellerStats = () => {
    const totalResellers = resellers.length;
    const masterResellers = resellers.filter(r => r.role === 'master_reseller').length;
    const activeResellers = resellers.filter(r => r.isActive).length;
    const totalRevenue = resellers.reduce((sum, r) => sum + r.totalSales, 0);
    const totalCommissions = resellers.reduce((sum, r) => sum + r.totalCommission, 0);

    return { totalResellers, masterResellers, activeResellers, totalRevenue, totalCommissions };
  };

  const stats = getResellerStats();

  const handleEditClick = (reseller: Reseller) => {
    setEditingReseller(reseller);
    setShowEditModal(true);
  };

  const handleEditSave = (updatedData: Partial<Reseller>) => {
    if (editingReseller) {
      onEditReseller(editingReseller.id, updatedData);
      setShowEditModal(false);
      setEditingReseller(null);
    }
  };

  if (selectedReseller) {
    return <ResellerDetails reseller={selectedReseller} onBack={() => setSelectedReseller(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Gestão de Revendedores</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Gerencie sua rede de revendedores e performance</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Revendedor</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Revendedores</p>
              <p className="text-3xl font-bold mt-1">{stats.totalResellers}</p>
            </div>
            <Users className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Revendedores Master</p>
              <p className="text-3xl font-bold mt-1">{stats.masterResellers}</p>
            </div>
            <Crown className="w-10 h-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Ativos</p>
              <p className="text-3xl font-bold mt-1">{stats.activeResellers}</p>
            </div>
            <Store className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Receita Total</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Comissões Pagas</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalCommissions)}</p>
            </div>
            <Award className="w-10 h-10 text-pink-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="">Todos os tipos</option>
            <option value="reseller">Revendedor</option>
            <option value="master_reseller">Revendedor Master</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {/* Reseller Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Revendedor</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Contato</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Tipo</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Vendas</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Comissão</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResellers.map(reseller => (
                <tr key={reseller.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        reseller.role === 'master_reseller' 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}>
                        {reseller.role === 'master_reseller' ? (
                          <Crown className="w-5 h-5" />
                        ) : (
                          reseller.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{reseller.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatCPF(reseller.cpf)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">{reseller.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">{formatPhone(reseller.phone)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reseller.role === 'master_reseller'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {reseller.role === 'master_reseller' ? 'Master' : 'Revendedor'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(reseller.totalSales)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{reseller.customers.length} clientes</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(reseller.totalCommission)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{reseller.commissionRate}% taxa</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reseller.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {reseller.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedReseller(reseller)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(reseller)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {reseller.role === 'reseller' && (
                        <button
                          onClick={() => onPromoteToMaster(reseller.id)}
                          className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors p-1 rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                          title="Promover a Master"
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredResellers.length)} de {filteredResellers.length} revendedores
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Reseller Modal */}
      {showAddModal && (
        <AddResellerModal
          onClose={() => setShowAddModal(false)}
          onAdd={onAddReseller}
        />
      )}

      {/* Edit Reseller Modal */}
      {showEditModal && editingReseller && (
        <EditResellerModal
          reseller={editingReseller}
          onClose={() => {
            setShowEditModal(false);
            setEditingReseller(null);
          }}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

const EditResellerModal: React.FC<{
  reseller: Reseller;
  onClose: () => void;
  onSave: (data: Partial<Reseller>) => void;
}> = ({ reseller, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: reseller.name,
    email: reseller.email,
    phone: reseller.phone,
    cpf: reseller.cpf,
    role: reseller.role,
    commissionRate: reseller.commissionRate,
    isActive: reseller.isActive,
    branding: {
      companyName: reseller.branding.companyName,
      primaryColor: reseller.branding.primaryColor,
      secondaryColor: reseller.branding.secondaryColor
    },
    whatsappConfig: reseller.whatsappConfig || {
      apiKey: '',
      phoneNumber: '',
      isActive: false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Revendedor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CPF</label>
                <input
                  type="text"
                  required
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'reseller' | 'master_reseller' }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="reseller">Revendedor</option>
                  <option value="master_reseller">Revendedor Master</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taxa de Comissão (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={formData.branding.companyName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, companyName: e.target.value }
                  }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor Primária</label>
                <input
                  type="color"
                  value={formData.branding.primaryColor}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, primaryColor: e.target.value }
                  }))}
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor Secundária</label>
                <input
                  type="color"
                  value={formData.branding.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, secondaryColor: e.target.value }
                  }))}
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Config */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuração WhatsApp</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
                <input
                  type="text"
                  value={formData.whatsappConfig.apiKey}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    whatsappConfig: { ...prev.whatsappConfig, apiKey: e.target.value }
                  }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="API Key do WhatsApp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número WhatsApp</label>
                <input
                  type="tel"
                  value={formData.whatsappConfig.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    whatsappConfig: { ...prev.whatsappConfig, phoneNumber: e.target.value }
                  }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="whatsapp-active"
                  checked={formData.whatsappConfig.isActive}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    whatsappConfig: { ...prev.whatsappConfig, isActive: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="whatsapp-active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  WhatsApp Ativo
                </label>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reseller-active"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="reseller-active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Revendedor Ativo
            </label>
          </div>

          {/* Actions */}
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
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResellerDetails: React.FC<{ reseller: Reseller; onBack: () => void }> = ({ reseller, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'commissions' | 'settings'>('overview');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center space-x-2"
        >
          <span>← Voltar</span>
        </button>
      </div>

      {/* Reseller Header */}
      <div className={`rounded-2xl p-8 text-white ${
        reseller.role === 'master_reseller' 
          ? 'bg-gradient-to-r from-yellow-500 to-orange-600' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600'
      }`}>
        <div className="flex items-center space-x-6">
          <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold">
            {reseller.role === 'master_reseller' ? (
              <Crown className="w-12 h-12" />
            ) : (
              reseller.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{reseller.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-100">
              <div>
                <p className="text-sm opacity-80">Email</p>
                <p className="font-medium">{reseller.email}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Telefone</p>
                <p className="font-medium">{formatPhone(reseller.phone)}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">CPF</p>
                <p className="font-medium">{formatCPF(reseller.cpf)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total de Vendas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(reseller.totalSales)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Comissões</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(reseller.totalCommission)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Clientes</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{reseller.customers.length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Taxa de Comissão</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{reseller.commissionRate}%</p>
            </div>
            <Award className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Eye },
              { id: 'customers', label: 'Clientes', icon: Users },
              { id: 'commissions', label: 'Comissões', icon: DollarSign },
              { id: 'settings', label: 'Configurações', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Pessoais</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Nome Completo:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{reseller.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">CPF:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCPF(reseller.cpf)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Email:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{reseller.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Telefone:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatPhone(reseller.phone)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Tipo:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reseller.role === 'master_reseller' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {reseller.role === 'master_reseller' ? 'Revendedor Master' : 'Revendedor'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Membro desde:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDate(reseller.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total de Vendas:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(reseller.totalSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Comissões Ganhas:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(reseller.totalCommission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Taxa de Comissão:</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">{reseller.commissionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Clientes Ativos:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{reseller.customers.filter(c => c.isActive).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clientes do Revendedor</h3>
              <div className="space-y-3">
                {reseller.customers.map(customer => (
                  <div key={customer.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{customer.email} • {formatPhone(customer.phone)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(customer.totalSpent)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{customer.purchases.length} compras</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de Comissões</h3>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Histórico de comissões será implementado</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações do Revendedor</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Branding</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium text-gray-700 dark:text-gray-300">Empresa:</span> <span className="text-gray-900 dark:text-white">{reseller.branding.companyName}</span></p>
                    <p className="flex items-center"><span className="font-medium text-gray-700 dark:text-gray-300">Cor Primária:</span> 
                      <span className="ml-2 inline-block w-4 h-4 rounded" style={{ backgroundColor: reseller.branding.primaryColor }}></span>
                      <span className="ml-2 text-gray-900 dark:text-white">{reseller.branding.primaryColor}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">WhatsApp</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium text-gray-700 dark:text-gray-300">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        reseller.whatsappConfig?.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {reseller.whatsappConfig?.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </p>
                    {reseller.whatsappConfig?.phoneNumber && (
                      <p><span className="font-medium text-gray-700 dark:text-gray-300">Número:</span> <span className="text-gray-900 dark:text-white">{formatPhone(reseller.whatsappConfig.phoneNumber)}</span></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AddResellerModal: React.FC<{
  onClose: () => void;
  onAdd: (reseller: Omit<Reseller, 'id' | 'createdAt'>) => void;
}> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    role: 'reseller' as 'reseller' | 'master_reseller',
    commissionRate: 10,
    isActive: true,
    branding: {
      companyName: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF'
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      totalSales: 0,
      totalCommission: 0,
      customers: [],
      subResellers: []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Novo Revendedor</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome Completo</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CPF</label>
              <input
                type="text"
                required
                value={formData.cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'reseller' | 'master_reseller' }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="reseller">Revendedor</option>
                <option value="master_reseller">Revendedor Master</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taxa de Comissão (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionRate}
                onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome da Empresa</label>
            <input
              type="text"
              required
              value={formData.branding.companyName}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                branding: { ...prev.branding, companyName: e.target.value }
              }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              Revendedor Ativo
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResellerManagement;