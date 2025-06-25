import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Search, User, Menu, LogOut, Settings, UserCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ConfirmationModal from '../ConfirmationModal';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  onNavigate: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, onNavigate }) => {
  const { user, darkMode, toggleDarkMode, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowUserDropdown(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleProfileClick = () => {
    onNavigate('profile');
    setShowUserDropdown(false);
  };

  const handleSettingsClick = () => {
    onNavigate('settings');
    setShowUserDropdown(false);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-gradient-to-r from-purple-600 to-blue-600',
      master_reseller: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      reseller: 'bg-gradient-to-r from-green-500 to-teal-600',
      customer: 'bg-gradient-to-r from-gray-500 to-gray-600'
    };
    return colors[role as keyof typeof colors] || colors.customer;
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrador',
      master_reseller: 'Revendedor Master',
      reseller: 'Revendedor',
      customer: 'Cliente'
    };
    return labels[role as keyof typeof labels] || 'Usuário';
  };

  return (
    <>
      <header className={`${darkMode ? 'dark' : ''}`}>
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            {/* Left side - Mobile menu button and search */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search - Hidden on mobile, visible on tablet+ */}
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors w-48 lg:w-64"
                />
              </div>
            </div>

            {/* Right side - controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile search button */}
              <button className="sm:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <NotificationDropdown />

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-500" />
                )}
              </button>

              {/* User Menu Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors p-2"
                >
                  {/* User info - Hidden on mobile */}
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32 lg:max-w-none">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getRoleLabel(user?.role || 'customer')}
                    </p>
                  </div>
                  
                  {/* User avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getRoleColor(user?.role || 'customer')}`}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Dropdown arrow */}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getRoleColor(user?.role || 'customer')}`}>
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                            user?.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                            user?.role === 'master_reseller' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            user?.role === 'reseller' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {getRoleLabel(user?.role || 'customer')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <UserCircle className="w-4 h-4" />
                        <span>Meu Perfil</span>
                      </button>

                      <button
                        onClick={handleSettingsClick}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configurações</span>
                      </button>
                    </div>

                    {/* Logout Button - Highlighted */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                      >
                        <div className="p-1 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                          <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="font-semibold">Sair do Sistema</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

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

export default Header;