import React from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign,
  Package,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  Crown,
  Store,
  CreditCard,
  Upload,
  AlertCircle
} from 'lucide-react';
import { DashboardStats } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface AdminDashboardProps {
  stats: DashboardStats;
  onNavigate?: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, onNavigate }) => {
  const cards = [
    {
      title: 'Receita Total',
      value: formatCurrency(stats.totalRevenue),
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      textColor: 'text-white'
    },
    {
      title: 'Clientes Ativos',
      value: stats.totalCustomers.toString(),
      change: '+8.2%',
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      textColor: 'text-white'
    },
    {
      title: 'Receita Hoje',
      value: formatCurrency(stats.todayRevenue),
      change: '+15.3%',
      icon: Calendar,
      color: 'bg-gradient-to-r from-purple-500 to-violet-600',
      textColor: 'text-white'
    },
    {
      title: 'Planos Ativos',
      value: stats.activePlans.toString(),
      change: '+5.1%',
      icon: Package,
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      textColor: 'text-white'
    }
  ];

  const alertCards = [
    {
      title: 'Pagamentos Pendentes',
      value: stats.pendingPayments,
      icon: CreditCard,
      color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-800 dark:text-yellow-300'
    },
    {
      title: 'Expirando Hoje',
      value: stats.expiringToday,
      icon: AlertTriangle,
      color: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-800 dark:text-red-300'
    },
    {
      title: 'Faturas em Aberto',
      value: stats.pendingCodeDeliveries || 0,
      icon: AlertCircle,
      color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700',
      iconColor: 'text-orange-600 dark:text-orange-400',
      textColor: 'text-orange-800 dark:text-orange-300',
      onClick: () => onNavigate && onNavigate('open-invoices')
    }
  ];

  const handleQuickAction = (action: string) => {
    if (onNavigate) {
      onNavigate(action);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Dashboard Administrativo</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Visão geral completa do sistema</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
          <Calendar className="w-4 h-4" />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.color} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className={card.textColor}>
                  <p className="text-sm opacity-90 font-medium">{card.title}</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">{card.value}</p>
                </div>
                <div className={`${card.textColor} opacity-80`}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                </div>
              </div>
              <div className="flex items-center mt-3 sm:mt-4">
                <ArrowUpRight className={`w-3 h-3 sm:w-4 sm:h-4 ${card.textColor} opacity-80`} />
                <span className={`text-xs sm:text-sm ${card.textColor} opacity-90 ml-1`}>
                  {card.change} vs. mês anterior
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {alertCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index} 
              className={`${card.color} border-2 rounded-xl p-4 sm:p-6 dark:bg-opacity-20 ${card.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
              onClick={card.onClick}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{card.title}</p>
                  <p className={`text-xl sm:text-2xl font-bold mt-1 ${card.textColor}`}>{card.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg bg-white dark:bg-gray-800 ${card.iconColor}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              {card.onClick && (
                <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                  Clique para gerenciar
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Stats and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Métricas Avançadas</h3>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
              <span className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">Taxa de Conversão</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-base sm:text-lg">{stats.conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <span className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">Ticket Médio</span>
              <span className="font-bold text-green-600 dark:text-green-400 text-base sm:text-lg">{formatCurrency(stats.averageTicket)}</span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
              <span className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">Crescimento Mensal</span>
              <span className="font-bold text-purple-600 dark:text-purple-400 text-base sm:text-lg">+18.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Ações Rápidas</h3>
          <div className="space-y-3 sm:space-y-4">
            <button 
              onClick={() => handleQuickAction('customers')}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Gerenciar Clientes</span>
            </button>
            <button 
              onClick={() => handleQuickAction('master-resellers')}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Revendedores Master</span>
            </button>
            <button 
              onClick={() => handleQuickAction('resellers')}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Revendedores</span>
            </button>
            <button 
              onClick={() => handleQuickAction('open-invoices')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Faturas em Aberto</span>
            </button>
            <button 
              onClick={() => handleQuickAction('codes')}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Abastecer Códigos</span>
            </button>
            <button 
              onClick={() => handleQuickAction('reports')}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Relatórios Avançados</span>
            </button>
          </div>
        </div>
      </div>

      {/* Network Overview */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Visão da Rede</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-xl p-3 sm:p-4 mb-3 inline-block">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{stats.totalMasterResellers || 12}</p>
            <p className="text-indigo-100 text-sm sm:text-base">Revendedores Master</p>
          </div>
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-xl p-3 sm:p-4 mb-3 inline-block">
              <Store className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{stats.totalResellers || 156}</p>
            <p className="text-indigo-100 text-sm sm:text-base">Revendedores Ativos</p>
          </div>
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-xl p-3 sm:p-4 mb-3 inline-block">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
            <p className="text-indigo-100 text-sm sm:text-base">Clientes Finais</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;