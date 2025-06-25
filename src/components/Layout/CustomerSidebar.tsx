import React, { useState } from 'react';
import { 
  Package, 
  CreditCard, 
  ShoppingCart, 
  Play, 
  MessageCircle,
  Crown,
  Star,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmationModal from '../ConfirmationModal';

interface CustomerSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const { user, logout, darkMode } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: Package },
    { id: 'plans', label: 'Comprar Planos', icon: ShoppingCart },
    { id: 'codes', label: 'Meus Códigos', icon: CreditCard },
    { id: 'tutorials', label: 'Tutoriais', icon: Play },
    { id: 'support', label: 'Suporte', icon: MessageCircle },
    { id: 'reseller', label: 'Ser Revendedor', icon: Crown }
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setSidebarOpen(false); // Close mobile sidebar when item is selected
  };

  return (
    <>
      <div className={`${darkMode ? 'dark' : ''}`}>
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex lg:flex-col bg-white dark:bg-gray-900 shadow-xl h-screen fixed left-0 top-0 z-10 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}>
          {/* Header - Fixed */}
          <div className={`flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'p-4' : ''}`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className={`p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 ${isCollapsed ? 'p-2' : ''}`}>
                  <Package className={`text-white ${isCollapsed ? 'w-5 h-5' : 'w-6 h-6'}`} />
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      Minha Conta
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
            
            {!isCollapsed && user && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">1.250 pontos</span>
                  <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    Prata
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation with Scroll - Flexible */}
          <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'} scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500`}>
            <ul className="space-y-2 min-h-full">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} rounded-xl transition-all duration-200 group relative ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'} transition-colors`} />
                      {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                          {item.label}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer Controls - Fixed */}
          <div className={`flex-shrink-0 border-t border-gray-200 dark:border-gray-700 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            {/* Logout Button */}
            <button 
              onClick={handleLogoutClick}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 group relative`}
              title={isCollapsed ? 'Sair do Sistema' : undefined}
            >
              <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Sair</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  Sair do Sistema
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Mobile Header - Fixed */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Minha Conta
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
                </div>
              </div>
              
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            {user && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">1.250 pontos</span>
                  <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    Prata
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation with Scroll - Flexible */}
          <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
            <ul className="space-y-2 min-h-full">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} transition-colors`} />
                      <span className="font-medium truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Footer - Fixed */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <button 
              onClick={handleLogoutClick}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Sair do Sistema"
        message="Tem certeza que deseja sair do sistema? Você precisará fazer login novamente para acessar sua conta."
        confirmText="Sair"
        cancelText="Cancelar"
        type="danger"
        icon={<LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />}
      />
    </>
  );
};

export default CustomerSidebar;