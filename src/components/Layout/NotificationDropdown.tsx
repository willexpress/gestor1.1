import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Clock, Users, CreditCard, Package, AlertTriangle, DollarSign, UserPlus, FileText, Volume2, VolumeX, Gift, Ticket, Download, Star, Smartphone } from 'lucide-react';
import { useNotifications, getNotificationIcon, getNotificationColor } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatters';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'promotions' | 'coupons' | 'app_updates' | 'customers' | 'payments' | 'system'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll,
    soundEnabled,
    toggleSound
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'Agora';
  };

  // Categorizar notificações baseado no tipo de usuário
  const categorizeNotifications = () => {
    if (user?.role === 'customer') {
      // Para clientes: Promoções, Cupons, Atualizações de Apps
      const promotionTypes = ['promotion', 'special_offer'];
      const couponTypes = ['coupon', 'loyalty_reward'];
      const appUpdateTypes = ['app_update', 'new_feature'];

      return {
        promotions: notifications.filter(n => promotionTypes.includes(n.type)),
        coupons: notifications.filter(n => couponTypes.includes(n.type)),
        app_updates: notifications.filter(n => appUpdateTypes.includes(n.type)),
        all: notifications
      };
    } else {
      // Para admin/revendedores: Clientes, Pagamentos, Sistema
      const customerTypes = ['customer_registered'];
      const paymentTypes = ['invoice_created', 'invoice_paid', 'invoice_overdue', 'payment_received', 'payment_failed'];
      const systemTypes = ['low_stock', 'system_alert'];

      return {
        customers: notifications.filter(n => customerTypes.includes(n.type)),
        payments: notifications.filter(n => paymentTypes.includes(n.type)),
        system: notifications.filter(n => systemTypes.includes(n.type)),
        all: notifications
      };
    }
  };

  const categorizedNotifications = categorizeNotifications();
  const currentNotifications = categorizedNotifications[activeTab as keyof typeof categorizedNotifications] || notifications;

  const getTabCount = (tab: string) => {
    const tabNotifications = categorizedNotifications[tab as keyof typeof categorizedNotifications] || [];
    return tabNotifications.filter(n => !n.isRead).length;
  };

  const getTabIcon = (tab: string) => {
    if (user?.role === 'customer') {
      switch (tab) {
        case 'promotions': return Gift;
        case 'coupons': return Ticket;
        case 'app_updates': return Download;
        default: return Bell;
      }
    } else {
      switch (tab) {
        case 'customers': return Users;
        case 'payments': return CreditCard;
        case 'system': return Package;
        default: return Bell;
      }
    }
  };

  const getTabColor = (tab: string) => {
    if (user?.role === 'customer') {
      switch (tab) {
        case 'promotions': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
        case 'coupons': return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400';
        case 'app_updates': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
        default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      }
    } else {
      switch (tab) {
        case 'customers': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
        case 'payments': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
        case 'system': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
        default: return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      }
    }
  };

  // Definir abas baseado no tipo de usuário
  const getTabs = () => {
    if (user?.role === 'customer') {
      return [
        { id: 'all', label: 'Todas' },
        { id: 'promotions', label: 'Promoções' },
        { id: 'coupons', label: 'Cupons' },
        { id: 'app_updates', label: 'Atualizações' }
      ];
    } else {
      return [
        { id: 'all', label: 'Todas' },
        { id: 'customers', label: 'Clientes' },
        { id: 'payments', label: 'Pagamentos' },
        { id: 'system', label: 'Sistema' }
      ];
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Notification Modal */}
          <div className={`
            fixed lg:absolute 
            inset-x-4 top-16 lg:inset-x-auto lg:top-auto
            lg:right-0 lg:mt-2 
            w-auto lg:w-96 
            bg-white dark:bg-gray-800 
            rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 
            z-50 max-h-[80vh] lg:max-h-96 
            overflow-hidden
            mx-auto lg:mx-0
            max-w-md lg:max-w-none
          `}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notificações
                  {unreadCount > 0 && (
                    <span className="ml-2 text-sm bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full">
                      {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Sound Toggle Button */}
                  <button
                    onClick={toggleSound}
                    className={`p-2 rounded-lg transition-colors ${
                      soundEnabled 
                        ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    title={soundEnabled ? 'Desativar sons' : 'Ativar sons'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      title="Marcar todas como lidas"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Limpar todas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sound Status Indicator */}
              {soundEnabled && (
                <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-700 dark:text-green-400">
                      {user?.role === 'customer' 
                        ? '🔊 Sons ativados: Promoções e ofertas especiais'
                        : '🔊 Sons ativados: Cash para vendas, Registro para novos clientes'
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Tabs - Responsivo */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto">
                {getTabs().map(tab => {
                  const Icon = getTabIcon(tab.id);
                  const count = getTabCount(tab.id);
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center space-x-1 px-2 sm:px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3 h-3 flex-shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.charAt(0)}</span>
                      {count > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${getTabColor(tab.id)}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {currentNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {activeTab === 'all' ? 'Nenhuma notificação' : `Nenhuma notificação de ${activeTab}`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type, notification.priority);
                    
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className={`text-sm font-medium pr-2 ${
                                !notification.isRead 
                                  ? 'text-gray-900 dark:text-white' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.title}
                                {/* Sound indicators */}
                                {(notification.type === 'promotion' || 
                                  notification.type === 'coupon' || 
                                  notification.type === 'special_offer' ||
                                  notification.type === 'loyalty_reward') && (
                                  <span className="ml-2 text-xs">🎁</span>
                                )}
                                {(notification.type === 'app_update' || 
                                  notification.type === 'new_feature') && (
                                  <span className="ml-2 text-xs">📱</span>
                                )}
                                {(notification.type === 'invoice_paid' || 
                                  notification.type === 'payment_received' || 
                                  notification.type === 'invoice_created') && (
                                  <span className="ml-2 text-xs">💰</span>
                                )}
                                {notification.type === 'customer_registered' && (
                                  <span className="ml-2 text-xs">📝</span>
                                )}
                              </p>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {getTimeAgo(notification.timestamp)}
                                </span>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 pr-2">
                              {notification.message}
                            </p>
                            {notification.priority === 'urgent' && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                  🚨 URGENTE
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Ver todas as notificações
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;