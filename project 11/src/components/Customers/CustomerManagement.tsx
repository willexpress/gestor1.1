import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Mail,
  Phone,
  Clock,
  Star,
  Filter,
  ChevronUp,
  ChevronDown,
  X,
  Save,
  User,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Customer } from '../../types';
import { formatDate, formatPhone, formatCPF } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface CustomerManagementProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'purchases' | 'invoices'>) => void;
  onEditCustomer: (id: string, customer: Partial<Customer>) => void;
  onViewCustomer: (customer: Customer) => void;
  fetchCustomers?: (page?: number, pageSize?: number, filters?: any) => Promise<any>;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers: initialCustomers,
  onAddCustomer,
  onEditCustomer,
  onViewCustomer,
  fetchCustomers
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loyaltyFilter, setLoyaltyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Load customers when component mounts or when filters/sorting/pagination changes
  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      
      try {
        if (fetchCustomers) {
          // Build filters object
          const filters = {
            search: searchTerm,
            loyaltyLevel: loyaltyFilter || undefined,
            isActive: statusFilter ? statusFilter === 'active' : undefined
          };
          
          // Get customers with pagination and filters
          const result = await fetchCustomers(currentPage, pageSize, filters);
          
          setCustomers(result.customers);
          setTotalPages(result.totalPages);
          setTotalCustomers(result.totalCount);
        } else {
          // Fallback to client-side filtering if fetchCustomers not available
          let filteredCustomers = [...initialCustomers];
          
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredCustomers = filteredCustomers.filter(
              customer => 
                customer.name.toLowerCase().includes(searchLower) ||
                customer.email.toLowerCase().includes(searchLower) ||
                customer.phone.includes(searchTerm)
            );
          }
          
          if (loyaltyFilter) {
            filteredCustomers = filteredCustomers.filter(
              customer => customer.loyaltyLevel === loyaltyFilter
            );
          }
          
          if (statusFilter) {
            filteredCustomers = filteredCustomers.filter(
              customer => statusFilter === 'active' ? customer.isActive : !customer.isActive
            );
          }
          
          // Sort customers
          filteredCustomers.sort((a, b) => {
            let aValue = a[sortField as keyof Customer];
            let bValue = b[sortField as keyof Customer];
            
            // Handle date fields
            if (sortField === 'createdAt') {
              aValue = (aValue as Date).getTime();
              bValue = (bValue as Date).getTime();
            }
            
            if (sortDirection === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
          
          // Manual pagination
          const totalCount = filteredCustomers.length;
          const startIndex = (currentPage - 1) * pageSize;
          const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize);
          
          setCustomers(paginatedCustomers);
          setTotalPages(Math.ceil(totalCount / pageSize));
          setTotalCustomers(totalCount);
        }
      } catch (error) {
        console.error('Error loading customers:', error);
        toast.error('Erro ao carregar clientes');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCustomers();
  }, [initialCustomers, fetchCustomers, currentPage, pageSize, searchTerm, loyaltyFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'purchases' | 'invoices'>) => {
    try {
      await onAddCustomer(customerData);
      setShowAddModal(false);
      toast.success('Cliente adicionado com sucesso!');
      
      // Reload first page to show new customer
      setCurrentPage(1);
      if (fetchCustomers) {
        await fetchCustomers(1, pageSize);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Erro ao adicionar cliente');
    }
  };

  const handleEditCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      await onEditCustomer(id, customerData);
      setShowEditModal(false);
      setEditingCustomer(null);
      toast.success('Cliente editado com sucesso!');
      
      // Reload current page to show updated customer
      if (fetchCustomers) {
        await fetchCustomers(currentPage, pageSize);
      }
    } catch (error) {
      console.error('Error editing customer:', error);
      toast.error('Erro ao editar cliente');
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onViewCustomer(customer);
  };

  // Calculate stats for customer overview
  const getCustomerStats = () => {
    const totalActiveCustomers = customers.filter(c => c.isActive).length;
    const totalInactiveCustomers = customers.length - totalActiveCustomers;
    const totalSpentAllCustomers = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageSpentPerCustomer = customers.length > 0 ? totalSpentAllCustomers / customers.length : 0;
    
    // Loyalty distribution
    const loyaltyDistribution = {
      bronze: customers.filter(c => c.loyaltyLevel === 'bronze').length,
      silver: customers.filter(c => c.loyaltyLevel === 'silver').length,
      gold: customers.filter(c => c.loyaltyLevel === 'gold').length,
      platinum: customers.filter(c => c.loyaltyLevel === 'platinum').length
    };
    
    return {
      totalActiveCustomers,
      totalInactiveCustomers,
      totalSpentAllCustomers,
      averageSpentPerCustomer,
      loyaltyDistribution
    };
  };

  const stats = getCustomerStats();

  const getLoyaltyBadge = (level: string) => {
    switch (level) {
      case 'bronze':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded-full text-xs font-medium">Bronze</span>;
      case 'silver':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">Prata</span>;
      case 'gold':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-medium">Ouro</span>;
      case 'platinum':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-xs font-medium">Platina</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Gerencie seus clientes e suas preferências</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Clientes</p>
              <p className="text-3xl font-bold mt-1">{totalCustomers}</p>
            </div>
            <Users className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Clientes Ativos</p>
              <p className="text-3xl font-bold mt-1">{stats.totalActiveCustomers}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Ticket Médio</p>
              <p className="text-3xl font-bold mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.averageSpentPerCustomer)}
              </p>
            </div>
            <Star className="w-10 h-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Gasto</p>
              <p className="text-3xl font-bold mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalSpentAllCustomers)}
              </p>
            </div>
            <Clock className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={loyaltyFilter}
          onChange={(e) => {
            setLoyaltyFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos os níveis</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Prata</option>
          <option value="gold">Ouro</option>
          <option value="platinum">Platina</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Loading state */}
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhum cliente encontrado</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchTerm || loyaltyFilter || statusFilter 
                    ? 'Tente ajustar os filtros para encontrar clientes'
                    : 'Comece adicionando seu primeiro cliente'
                  }
                </p>
                {!searchTerm && !loyaltyFilter && !statusFilter && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Adicionar Cliente</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white cursor-pointer" onClick={() => handleSort('name')}>
                          <div className="flex items-center space-x-1">
                            <span>Cliente</span>
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Contato</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white cursor-pointer" onClick={() => handleSort('loyaltyLevel')}>
                          <div className="flex items-center space-x-1">
                            <span>Nível</span>
                            {sortField === 'loyaltyLevel' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white cursor-pointer" onClick={() => handleSort('totalSpent')}>
                          <div className="flex items-center space-x-1">
                            <span>Total Gasto</span>
                            {sortField === 'totalSpent' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(customer => (
                        <tr key={customer.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold">
                                {customer.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{customer.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatCPF(customer.cpf)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">{customer.email}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">{formatPhone(customer.phone)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <div className="mb-2">
                                {getLoyaltyBadge(customer.loyaltyLevel)}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {customer.points} pontos
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(customer.totalSpent)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {customer.purchases.length} compras
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              customer.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {customer.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleViewCustomer(customer)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                title="Visualizar"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCustomer(customer);
                                  setShowEditModal(true);
                                }}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Tem certeza que deseja excluir este cliente?')) {
                                    handleEditCustomer(customer.id, { isActive: false });
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Desativar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalCustomers)} de {totalCustomers} clientes
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
              </>
            )}
          </>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCustomer}
        />
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => {
            setShowEditModal(false);
            setEditingCustomer(null);
          }}
          onSave={(data) => handleEditCustomer(editingCustomer.id, data)}
        />
      )}
    </div>
  );
};

interface AddCustomerModalProps {
  onClose: () => void;
  onAdd: (customer: Omit<Customer, 'id' | 'createdAt' | 'purchases' | 'invoices'>) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    points: 0,
    isActive: true,
    resellerId: '',
    loyaltyLevel: 'bronze' as Customer['loyaltyLevel'],
    totalSpent: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Novo Cliente</h2>
        
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nível de Fidelidade</label>
              <select
                value={formData.loyaltyLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, loyaltyLevel: e.target.value as Customer['loyaltyLevel'] }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Prata</option>
                <option value="gold">Ouro</option>
                <option value="platinum">Platina</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pontos</label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
              Cliente Ativo
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

interface EditCustomerModalProps {
  customer: Customer;
  onClose: () => void;
  onSave: (data: Partial<Customer>) => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ customer, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    cpf: customer.cpf,
    points: customer.points,
    isActive: customer.isActive,
    loyaltyLevel: customer.loyaltyLevel,
    totalSpent: customer.totalSpent
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                CPF
              </label>
              <input
                type="text"
                required
                value={formData.cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Star className="w-4 h-4 inline mr-2" />
                Nível de Fidelidade
              </label>
              <select
                value={formData.loyaltyLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, loyaltyLevel: e.target.value as Customer['loyaltyLevel'] }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Prata</option>
                <option value="gold">Ouro</option>
                <option value="platinum">Platina</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Star className="w-4 h-4 inline mr-2" />
                Pontos
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
              Cliente Ativo
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
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerManagement;