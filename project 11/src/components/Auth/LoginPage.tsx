import React, { useState } from 'react';
import { LogIn, Package, Eye, EyeOff, Crown, Store, User, Shield, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RegisterPage from './RegisterPage';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@sistema.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<'admin' | 'master' | 'reseller' | 'customer'>('admin');
  const [showRegisterPage, setShowRegisterPage] = useState(false);
  const { login, isLoading } = useAuth();

  const userTypes = [
    {
      id: 'admin',
      name: 'Administrador',
      email: 'admin@sistema.com',
      password: 'admin123',
      icon: Shield,
      color: 'from-purple-600 to-blue-600',
      description: 'Acesso total ao sistema'
    },
    {
      id: 'master',
      name: 'Revendedor Master',
      email: 'master@sistema.com',
      password: 'master123',
      icon: Crown,
      color: 'from-yellow-500 to-orange-600',
      description: 'Gerencia revendedores e clientes'
    },
    {
      id: 'reseller',
      name: 'Revendedor',
      email: 'reseller@sistema.com',
      password: 'reseller123',
      icon: Store,
      color: 'from-green-500 to-teal-600',
      description: 'Gerencia clientes e vendas'
    },
    {
      id: 'customer',
      name: 'Cliente Final',
      email: 'cliente@sistema.com',
      password: 'cliente123',
      icon: User,
      color: 'from-gray-500 to-gray-600',
      description: 'Visualiza compras e perfil'
    }
  ];

  const handleUserTypeSelect = (userType: typeof userTypes[0]) => {
    setSelectedUserType(userType.id as any);
    setEmail(userType.email);
    setPassword(userType.password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (!success) {
      setError('Email ou senha incorretos');
    }
  };

  // Show register page if requested
  if (showRegisterPage) {
    return <RegisterPage onBackToLogin={() => setShowRegisterPage(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-5xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4 rounded-2xl inline-block mb-4">
            <Package className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sistema Pro</h1>
          <p className="text-gray-600 text-sm sm:text-base">Gestão Avançada de Recarga</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Type Selection */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Selecione o Tipo de Usuário</h2>
            <div className="space-y-3">
              {userTypes.map(userType => {
                const Icon = userType.icon;
                const isSelected = selectedUserType === userType.id;
                
                return (
                  <button
                    key={userType.id}
                    onClick={() => handleUserTypeSelect(userType)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${userType.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{userType.name}</h3>
                        <p className="text-sm text-gray-600">{userType.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <p><strong>Email:</strong> {userType.email}</p>
                          <p><strong>Senha:</strong> {userType.password}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="text-blue-600">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fazer Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Entrar como {userTypes.find(u => u.id === selectedUserType)?.name}</span>
                  </>
                )}
              </button>
            </form>

            {/* Register Section */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Não tem uma conta?</p>
                <button
                  onClick={() => setShowRegisterPage(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Criar Conta de Cliente</span>
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">💡 Dica:</h3>
              <p className="text-xs sm:text-sm text-blue-800">
                Clique em qualquer tipo de usuário acima para preencher automaticamente as credenciais de demonstração, 
                ou crie uma nova conta de cliente.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500">
            Sistema de Gestão Hierárquica v2.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;