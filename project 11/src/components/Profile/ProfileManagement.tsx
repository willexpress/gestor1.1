import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Calendar, 
  Shield, 
  Save, 
  ArrowLeft,
  Edit,
  Camera,
  Key,
  Bell,
  Globe,
  Palette
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatPhone, formatCPF } from '../../utils/formatters';

interface ProfileManagementProps {
  onBack: () => void;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ onBack }) => {
  const { user, darkMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'branding'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: user?.cpf || '',
    branding: {
      companyName: user?.branding?.companyName || '',
      primaryColor: user?.branding?.primaryColor || '#3B82F6',
      secondaryColor: user?.branding?.secondaryColor || '#1E40AF'
    }
  });

  const handleSave = () => {
    // In a real application, this would make an API call to update the user
    console.log('Saving profile data:', formData);
    alert('Perfil atualizado com sucesso!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      cpf: user?.cpf || '',
      branding: {
        companyName: user?.branding?.companyName || '',
        primaryColor: user?.branding?.primaryColor || '#3B82F6',
        secondaryColor: user?.branding?.secondaryColor || '#1E40AF'
      }
    });
    setIsEditing(false);
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

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-gradient-to-r from-purple-600 to-blue-600',
      master_reseller: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      reseller: 'bg-gradient-to-r from-green-500 to-teal-600',
      customer: 'bg-gradient-to-r from-gray-500 to-gray-600'
    };
    return colors[role as keyof typeof colors] || colors.customer;
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'preferences', label: 'Preferências', icon: Bell },
    { id: 'branding', label: 'Marca', icon: Palette }
  ];

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">Usuário não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Dashboard</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className={`rounded-2xl p-8 text-white ${getRoleColor(user.role)}`}>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-100">
              <div>
                <p className="text-sm opacity-80">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Telefone</p>
                <p className="font-medium">{formatPhone(user.phone)}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Função</p>
                <p className="font-medium">{getRoleLabel(user.role)}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Membro desde</p>
            <p className="font-medium">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
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

        <div className="p-8">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Informações Pessoais</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nome Completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      E-mail
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                        {user.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                        {formatPhone(user.phone)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      CPF
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.cpf}
                        onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                        {formatCPF(user.cpf)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Função
                    </label>
                    <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Membro desde
                    </label>
                    <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>

                  {user.lastLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Último acesso
                      </label>
                      <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                        {formatDate(user.lastLogin)}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Status da Conta</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-blue-800 dark:text-blue-300 text-sm">
                        {user.isActive ? 'Conta Ativa' : 'Conta Inativa'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações de Segurança</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Key className="w-5 h-5" />
                      <span>Alterar Senha</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha Atual</label>
                        <input
                          type="password"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Digite sua senha atual"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova Senha</label>
                        <input
                          type="password"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Digite sua nova senha"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Nova Senha</label>
                        <input
                          type="password"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirme sua nova senha"
                        />
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Alterar Senha
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sessões Ativas</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Sessão Atual</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Chrome • São Paulo, SP</p>
                        </div>
                        <span className="text-green-600 dark:text-green-400 text-sm font-medium">Ativo</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-700">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Dicas de Segurança</h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                      <li>• Use uma senha forte com pelo menos 8 caracteres</li>
                      <li>• Inclua letras maiúsculas, minúsculas, números e símbolos</li>
                      <li>• Não compartilhe suas credenciais com terceiros</li>
                      <li>• Faça logout ao usar computadores públicos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preferências do Sistema</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notificações</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Notificações por E-mail</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Receber notificações importantes por e-mail</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Notificações Push</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Receber notificações no navegador</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Sons de Notificação</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Reproduzir sons para notificações</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interface</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Modo Escuro</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Usar tema escuro na interface</p>
                        </div>
                        <input type="checkbox" checked={darkMode} readOnly className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Sidebar Compacta</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Usar sidebar em modo compacto</p>
                        </div>
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma</label>
                        <select className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="pt-BR">Português (Brasil)</option>
                          <option value="en-US">English (US)</option>
                          <option value="es-ES">Español</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações de Marca</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome da Empresa</label>
                    <input
                      type="text"
                      value={formData.branding.companyName}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, companyName: e.target.value }
                      }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome da sua empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor Primária</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.branding.primaryColor}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))}
                        className="w-16 h-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={formData.branding.primaryColor}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))}
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor Secundária</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.branding.secondaryColor}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, secondaryColor: e.target.value }
                        }))}
                        className="w-16 h-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={formData.branding.secondaryColor}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, secondaryColor: e.target.value }
                        }))}
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#1E40AF"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      console.log('Saving branding:', formData.branding);
                      alert('Configurações de marca salvas com sucesso!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Configurações</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
                    <div className="space-y-4">
                      <div 
                        className="p-4 rounded-lg text-white"
                        style={{ background: `linear-gradient(to right, ${formData.branding.primaryColor}, ${formData.branding.secondaryColor})` }}
                      >
                        <h4 className="font-bold text-lg">{formData.branding.companyName || 'Nome da Empresa'}</h4>
                        <p className="text-sm opacity-90">Preview das cores da marca</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className="p-3 rounded-lg text-white text-center"
                          style={{ backgroundColor: formData.branding.primaryColor }}
                        >
                          <p className="text-sm font-medium">Primária</p>
                          <p className="text-xs opacity-80">{formData.branding.primaryColor}</p>
                        </div>
                        <div 
                          className="p-3 rounded-lg text-white text-center"
                          style={{ backgroundColor: formData.branding.secondaryColor }}
                        >
                          <p className="text-sm font-medium">Secundária</p>
                          <p className="text-xs opacity-80">{formData.branding.secondaryColor}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Dicas de Branding</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                      <li>• Use cores que representem sua marca</li>
                      <li>• Mantenha consistência visual</li>
                      <li>• Teste o contraste para acessibilidade</li>
                      <li>• Considere o impacto psicológico das cores</li>
                    </ul>
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

export default ProfileManagement;