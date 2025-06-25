import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  TestTube, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  MessageSquare,
  Mail,
  Crown,
  Star,
  Smartphone,
  Globe,
  Key,
  DollarSign,
  Users,
  Shield,
  Zap
} from 'lucide-react';
import { useSystemConfig } from '../../contexts/SystemConfigContext';
import { testWhatsAppConnection } from '../../utils/whatsappApi';
import toast from 'react-hot-toast';

const SystemSettings: React.FC = () => {
  const { config, updateConfig, isLoading } = useSystemConfig();
  const [activeTab, setActiveTab] = useState<'payment' | 'whatsapp' | 'email' | 'master' | 'loyalty'>('payment');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // The updateConfig function will handle saving to Supabase
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!config.whatsappIntegration.zapiApiKey || !config.whatsappIntegration.defaultInstanceId) {
      toast.error('Configure a API Key e Instance ID primeiro');
      return;
    }

    setIsTestingWhatsApp(true);
    try {
      const result = await testWhatsAppConnection(
        config.whatsappIntegration.zapiApiKey,
        config.whatsappIntegration.defaultInstanceId
      );

      if (result.success) {
        toast.success('Conexão WhatsApp testada com sucesso!');
      } else {
        toast.error(`Erro na conexão: ${result.error}`);
      }
    } catch (error) {
      console.error('WhatsApp test error:', error);
      toast.error('Erro ao testar conexão WhatsApp');
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'payment', label: 'Gateways de Pagamento', icon: CreditCard },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'email', label: 'E-mail', icon: Mail },
    { id: 'master', label: 'Revendedor Master', icon: Crown },
    { id: 'loyalty', label: 'Programa de Fidelidade', icon: Star }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Configurações do Sistema</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Gerencie integrações e configurações globais</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Salvar Configurações</span>
            </>
          )}
        </button>
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
          {activeTab === 'payment' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Gateways de Pagamento</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Configure os gateways de pagamento disponíveis</p>
              </div>

              {/* Active Gateway Selection */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">Gateway Ativo</h3>
                <select
                  value={config.paymentGateways.activeGateway}
                  onChange={(e) => updateConfig({
                    paymentGateways: {
                      ...config.paymentGateways,
                      activeGateway: e.target.value
                    }
                  })}
                  className="w-full border border-blue-300 dark:border-blue-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pagarme">Pagar.me</option>
                  <option value="appmax">AppMax</option>
                  <option value="pushinpay">PushInPay</option>
                  <option value="shipay">Shipay</option>
                </select>
              </div>

              {/* Gateway Configurations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(config.paymentGateways).map(([key, gateway]) => {
                  if (key === 'activeGateway') return null;
                  
                  const gatewayConfig = gateway as any;
                  const isActive = config.paymentGateways.activeGateway === key;
                  
                  return (
                    <div key={key} className={`border-2 rounded-xl p-6 ${
                      isActive 
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                          {key.replace('_', ' ')}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium">
                              Ativo
                            </span>
                          )}
                          <div className="flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={gatewayConfig.isActive}
                              onChange={(e) => updateConfig({
                                paymentGateways: {
                                  ...config.paymentGateways,
                                  [key]: {
                                    ...gatewayConfig,
                                    isActive: e.target.checked
                                  }
                                }
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Habilitado</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            API Key
                          </label>
                          <div className="relative">
                            <input
                              type={showSecrets[`${key}_api`] ? 'text' : 'password'}
                              value={gatewayConfig.apiKey}
                              onChange={(e) => updateConfig({
                                paymentGateways: {
                                  ...config.paymentGateways,
                                  [key]: {
                                    ...gatewayConfig,
                                    apiKey: e.target.value
                                  }
                                }
                              })}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Sua API Key"
                            />
                            <button
                              type="button"
                              onClick={() => toggleSecret(`${key}_api`)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showSecrets[`${key}_api`] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Secret Key
                          </label>
                          <div className="relative">
                            <input
                              type={showSecrets[`${key}_secret`] ? 'text' : 'password'}
                              value={gatewayConfig.secretKey}
                              onChange={(e) => updateConfig({
                                paymentGateways: {
                                  ...config.paymentGateways,
                                  [key]: {
                                    ...gatewayConfig,
                                    secretKey: e.target.value
                                  }
                                }
                              })}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Sua Secret Key"
                            />
                            <button
                              type="button"
                              onClick={() => toggleSecret(`${key}_secret`)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showSecrets[`${key}_secret`] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Integração WhatsApp</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Configure a integração com WhatsApp via Z-api</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="whatsapp-active"
                      checked={config.whatsappIntegration.isActive}
                      onChange={(e) => updateConfig({
                        whatsappIntegration: {
                          ...config.whatsappIntegration,
                          isActive: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="whatsapp-active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Habilitar integração WhatsApp
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Key className="w-4 h-4 inline mr-2" />
                      Z-api API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.whatsapp_api ? 'text' : 'password'}
                        value={config.whatsappIntegration.zapiApiKey}
                        onChange={(e) => updateConfig({
                          whatsappIntegration: {
                            ...config.whatsappIntegration,
                            zapiApiKey: e.target.value
                          }
                        })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Sua Z-api API Key"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('whatsapp_api')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showSecrets.whatsapp_api ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Smartphone className="w-4 h-4 inline mr-2" />
                      Instance ID
                    </label>
                    <input
                      type="text"
                      value={config.whatsappIntegration.defaultInstanceId}
                      onChange={(e) => updateConfig({
                        whatsappIntegration: {
                          ...config.whatsappIntegration,
                          defaultInstanceId: e.target.value
                        }
                      })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Seu Instance ID"
                    />
                  </div>

                  <button
                    onClick={handleTestWhatsApp}
                    disabled={isTestingWhatsApp || !config.whatsappIntegration.zapiApiKey || !config.whatsappIntegration.defaultInstanceId}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {isTestingWhatsApp ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Testando...</span>
                      </>
                    ) : (
                      <>
                        <TestTube className="w-5 h-5" />
                        <span>Testar Conexão</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-4">Como Configurar</h3>
                  <div className="space-y-3 text-sm text-green-800 dark:text-green-400">
                    <div className="flex items-start space-x-2">
                      <span className="font-bold">1.</span>
                      <span>Acesse <a href="https://z-api.io" target="_blank" rel="noopener noreferrer" className="underline">z-api.io</a> e crie uma conta</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold">2.</span>
                      <span>Crie uma nova instância do WhatsApp</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold">3.</span>
                      <span>Copie a API Key e Instance ID</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold">4.</span>
                      <span>Cole as informações nos campos acima</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold">5.</span>
                      <span>Teste a conexão e ative a integração</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Configuração de E-mail</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Configure o servidor SMTP para envio de e-mails</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Servidor SMTP
                    </label>
                    <input
                      type="text"
                      value={config.emailConfig.smtpHost}
                      onChange={(e) => updateConfig({
                        emailConfig: {
                          ...config.emailConfig,
                          smtpHost: e.target.value
                        }
                      })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Porta SMTP
                    </label>
                    <input
                      type="number"
                      value={config.emailConfig.smtpPort}
                      onChange={(e) => updateConfig({
                        emailConfig: {
                          ...config.emailConfig,
                          smtpPort: parseInt(e.target.value)
                        }
                      })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Usuário SMTP
                    </label>
                    <input
                      type="email"
                      value={config.emailConfig.smtpUser}
                      onChange={(e) => updateConfig({
                        emailConfig: {
                          ...config.emailConfig,
                          smtpUser: e.target.value
                        }
                      })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Key className="w-4 h-4 inline mr-2" />
                      Senha SMTP
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.smtp_password ? 'text' : 'password'}
                        value={config.emailConfig.smtpPassword}
                        onChange={(e) => updateConfig({
                          emailConfig: {
                            ...config.emailConfig,
                            smtpPassword: e.target.value
                          }
                        })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Sua senha ou app password"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('smtp_password')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showSecrets.smtp_password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      E-mail do Remetente
                    </label>
                    <input
                      type="email"
                      value={config.emailConfig.fromEmail}
                      onChange={(e) => updateConfig({
                        emailConfig: {
                          ...config.emailConfig,
                          fromEmail: e.target.value
                        }
                      })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="noreply@seudominio.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Remetente
                    </label>
                    <input
                      type="text"
                      value={config.emailConfig.fromName}
                      onChange={(e) => updateConfig({
                        emailConfig: {
                          ...config.emailConfig,
                          fromName: e.target.value
                        }
                      })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Sistema de Recarga"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">Configurações Comuns</h3>
                  <div className="space-y-4 text-sm text-blue-800 dark:text-blue-400">
                    <div>
                      <h4 className="font-semibold mb-2">Gmail:</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Servidor: smtp.gmail.com</li>
                        <li>• Porta: 587</li>
                        <li>• Use App Password, não sua senha normal</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Outlook/Hotmail:</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Servidor: smtp-mail.outlook.com</li>
                        <li>• Porta: 587</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Yahoo:</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Servidor: smtp.mail.yahoo.com</li>
                        <li>• Porta: 587</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'master' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Requisitos para Revendedor Master</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Configure os requisitos para se tornar um revendedor master</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Valor Mínimo de Compra
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={config.masterResellerRequirements.minimumPurchaseAmount}
                        onChange={(e) => updateConfig({
                          masterResellerRequirements: {
                            ...config.masterResellerRequirements,
                            minimumPurchaseAmount: parseFloat(e.target.value)
                          }
                        })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1000"
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Package className="w-4 h-4 inline mr-2" />
                      Produto Requerido (ID)
                    </label>
                    <input
                      type="text"
                      value={config.masterResellerRequirements.requiredProductId}
                      onChange={(e) => updateConfig({
                        masterResellerRequirements: {
                          ...config.masterResellerRequirements,
                          requiredProductId: e.target.value
                        }
                      })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ID do produto de qualificação"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Percent className="w-4 h-4 inline mr-2" />
                      Taxa de Comissão (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={config.masterResellerRequirements.commissionRate}
                        onChange={(e) => updateConfig({
                          masterResellerRequirements: {
                            ...config.masterResellerRequirements,
                            commissionRate: parseFloat(e.target.value)
                          }
                        })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="15"
                        min="0"
                        max="100"
                        step="0.5"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                  <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-4">Sobre Revendedores Master</h3>
                  <div className="space-y-4 text-sm text-yellow-800 dark:text-yellow-400">
                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Rede de Revendedores</h4>
                        <p className="text-xs">Revendedores Master podem criar e gerenciar sua própria rede de revendedores.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <DollarSign className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Comissões Diferenciadas</h4>
                        <p className="text-xs">Recebem comissões maiores e também sobre as vendas de seus revendedores.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Acesso Privilegiado</h4>
                        <p className="text-xs">Têm acesso a mais recursos e relatórios no sistema.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Qualificação</h4>
                        <p className="text-xs">Para se tornar Master, o revendedor precisa adquirir o produto de qualificação.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Programa de Fidelidade</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Configure o programa de pontos e fidelidade</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="loyalty-active"
                      checked={config.loyaltyProgram.isActive}
                      onChange={(e) => updateConfig({
                        loyaltyProgram: {
                          ...config.loyaltyProgram,
                          isActive: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="loyalty-active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Habilitar programa de fidelidade
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Star className="w-4 h-4 inline mr-2" />
                      Pontos por Real Gasto
                    </label>
                    <input
                      type="number"
                      value={config.loyaltyProgram.pointsPerReal}
                      onChange={(e) => updateConfig({
                        loyaltyProgram: {
                          ...config.loyaltyProgram,
                          pointsPerReal: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="1"
                      min="0.1"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Taxa de Resgate (pontos por R$1)
                    </label>
                    <input
                      type="number"
                      value={config.loyaltyProgram.redemptionRate}
                      onChange={(e) => updateConfig({
                        loyaltyProgram: {
                          ...config.loyaltyProgram,
                          redemptionRate: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="100"
                      min="1"
                      step="1"
                    />
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-4">Como Funciona</h3>
                  <div className="space-y-4 text-sm text-purple-800 dark:text-purple-400">
                    <div>
                      <h4 className="font-semibold mb-2">Acúmulo de Pontos:</h4>
                      <p className="text-xs">
                        Clientes ganham pontos com base no valor gasto. Com a configuração atual, 
                        cada R$ 1,00 gasto gera {config.loyaltyProgram.pointsPerReal} ponto(s).
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Resgate de Pontos:</h4>
                      <p className="text-xs">
                        Clientes podem trocar pontos por descontos. Com a configuração atual, 
                        cada R$ 1,00 de desconto custa {config.loyaltyProgram.redemptionRate} pontos.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Exemplo:</h4>
                      <p className="text-xs">
                        Um cliente que gasta R$ 100,00 ganha {100 * config.loyaltyProgram.pointsPerReal} pontos.
                        Com {100 * config.loyaltyProgram.pointsPerReal} pontos, ele pode obter 
                        R$ {((100 * config.loyaltyProgram.pointsPerReal) / config.loyaltyProgram.redemptionRate).toFixed(2)} de desconto.
                      </p>
                    </div>
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

export default SystemSettings;