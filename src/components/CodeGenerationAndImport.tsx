import React, { useState } from 'react';
import { 
  Package, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Copy,
  Eye,
  Search,
  Filter,
  Smartphone,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Plan, RechargeCode } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface CodeGenerationAndImportProps {
  plans: Plan[];
  codes: RechargeCode[];
  onImportCodes: (planId: string, codes: string[]) => Promise<{ data: any[]; insertedCount: number; totalCount: number }>;
}

const CodeGenerationAndImport: React.FC<CodeGenerationAndImportProps> = ({
  plans,
  codes,
  onImportCodes
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'manage'>('import');
  const [selectedApp, setSelectedApp] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importedCodes, setImportedCodes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Function to format a single code string
  const formatCodeString = (codeString: string): string => {
    // Remove all non-alphanumeric characters
    const cleanCode = codeString.replace(/[^a-zA-Z0-9]/g, '');
    
    // Split into groups of 4 characters
    const groups = [];
    for (let i = 0; i < cleanCode.length; i += 4) {
      groups.push(cleanCode.slice(i, i + 4));
    }
    
    // Join with spaces and convert to uppercase
    return groups.join(' ').toUpperCase();
  };

  // Get unique apps from plans
  const getUniqueApps = () => {
    const apps = plans.map(plan => plan.appConfig?.appName || 'App Padrão');
    return [...new Set(apps)].sort();
  };

  // Get plans filtered by selected app
  const getFilteredPlans = () => {
    if (!selectedApp) return [];
    return plans.filter(plan => 
      (plan.appConfig?.appName === selectedApp || (!plan.appConfig?.appName && selectedApp === 'App Padrão')) && plan.isActive
    );
  };

  // Reset plan selection when app changes
  const handleAppChange = (appName: string) => {
    setSelectedApp(appName);
    setSelectedPlan(''); // Reset plan selection
  };

  // Handle import text change with automatic formatting
  const handleImportTextChange = (value: string) => {
    // Split by newlines to get individual code strings
    const lines = value.split('\n');
    
    // Format each line that contains content
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) {
        return ''; // Keep empty lines as is
      }
      
      // Only format if the line looks like a code (has alphanumeric characters)
      if (/[a-zA-Z0-9]/.test(trimmedLine)) {
        return formatCodeString(trimmedLine);
      }
      
      return trimmedLine; // Return as is if it doesn't look like a code
    });
    
    // Join back with newlines
    const formattedText = formattedLines.join('\n');
    setImportText(formattedText);
  };

  const handleImport = async () => {
    if (!selectedPlan || !importText.trim()) {
      toast.error('Selecione um plano e insira códigos para importar');
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Parse codes from text (one per line)
      const codes = importText
        .split('\n')
        .map(code => code.trim())
        .filter(code => code.length > 0)
        .map(code => formatCodeString(code)); // Ensure final formatting
      
      if (codes.length === 0) {
        toast.error('Nenhum código válido encontrado');
        setIsImporting(false);
        return;
      }
      
      // Call the import function
      const result = await onImportCodes(selectedPlan, codes);
      
      // Update UI state
      setImportedCodes(result.data.map(code => code.code));
      setImportText('');
      
      // Show success toast with info about duplicates
      const duplicatesCount = result.totalCount - result.insertedCount;
      if (duplicatesCount > 0) {
        toast.success(
          `${result.insertedCount} códigos importados com sucesso! (${duplicatesCount} códigos duplicados ignorados)`,
          { duration: 4000, icon: '✅' }
        );
      } else {
        toast.success(
          `${result.insertedCount} códigos importados com sucesso!`,
          { duration: 4000, icon: '✅' }
        );
      }
    } catch (error: any) {
      console.error('Error importing codes:', error);
      toast.error(error.message || 'Erro ao importar códigos. Tente novamente.');
    } finally {
      setIsImporting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Código copiado para a área de transferência!', {
        duration: 2000,
        icon: '📋',
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast.success('Código copiado para a área de transferência!', {
        duration: 2000,
        icon: '📋',
      });
    }
  };

  const viewCodeDetails = (code: RechargeCode) => {
    const plan = plans.find(p => p.id === code.planId);
    
    // Copy code to clipboard when viewing
    copyToClipboard(code.code);
    
    // Show detailed info in toast
    toast.success(
      <div className="text-sm">
        <div className="font-semibold mb-1">Código visualizado e copiado!</div>
        <div className="text-xs space-y-1">
          <div><strong>App:</strong> {plan?.appConfig?.appName || 'N/A'}</div>
          <div><strong>Plano:</strong> {plan?.name || 'N/A'}</div>
          <div><strong>Valor:</strong> {formatCurrency(code.value)}</div>
          <div><strong>Status:</strong> {
            code.status === 'available' ? 'Disponível' :
            code.status === 'sold' ? 'Vendido' : 'Expirado'
          }</div>
        </div>
      </div>,
      {
        duration: 4000,
        icon: '👁️',
      }
    );
  };

  const downloadCodes = (codes: string[], filename: string) => {
    const content = codes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${codes.length} códigos exportados com sucesso!`, {
      duration: 3000,
      icon: '💾',
    });
  };

  const filteredCodes = codes.filter(code => {
    const plan = plans.find(p => p.id === code.planId);
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (plan?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (plan?.appConfig?.appName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = !planFilter || code.planId === planFilter;
    const matchesStatus = !statusFilter || code.status === statusFilter;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getCodeStats = () => {
    const totalCodes = codes.length;
    const availableCodes = codes.filter(c => c.status === 'available').length;
    const soldCodes = codes.filter(c => c.status === 'sold').length;
    const expiredCodes = codes.filter(c => c.status === 'expired').length;

    return { totalCodes, availableCodes, soldCodes, expiredCodes };
  };

  const stats = getCodeStats();
  const uniqueApps = getUniqueApps();
  const filteredPlans = getFilteredPlans();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Gestão de Códigos</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Importe e gerencie códigos de recarga</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Códigos</p>
              <p className="text-3xl font-bold mt-1">{stats.totalCodes}</p>
            </div>
            <Package className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Códigos Disponíveis</p>
              <p className="text-3xl font-bold mt-1">{stats.availableCodes}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Códigos Vendidos</p>
              <p className="text-3xl font-bold mt-1">{stats.soldCodes}</p>
            </div>
            <Package className="w-10 h-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Códigos Expirados</p>
              <p className="text-3xl font-bold mt-1">{stats.expiredCodes}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'import', label: 'Importar Códigos', icon: Upload },
              { id: 'manage', label: 'Gerenciar Códigos', icon: Package }
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

        <div className="p-8">
          {activeTab === 'import' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Importar Códigos</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Primeiro selecione o aplicativo, depois o plano e cole a lista de códigos (um por linha)
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Step 1: Select App */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Smartphone className="w-4 h-4 inline mr-2" />
                      1. Selecionar Aplicativo
                    </label>
                    <select
                      value={selectedApp}
                      onChange={(e) => handleAppChange(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Escolha um aplicativo...</option>
                      {uniqueApps.map(appName => (
                        <option key={appName} value={appName}>
                          {appName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Select Plan (only shows if app is selected) */}
                  {selectedApp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Package className="w-4 h-4 inline mr-2" />
                        2. Selecionar Plano do {selectedApp}
                      </label>
                      <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Escolha um plano...</option>
                        {filteredPlans.map(plan => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - {formatCurrency(plan.value)} ({plan.validityDays} dias)
                          </option>
                        ))}
                      </select>
                      
                      {filteredPlans.length === 0 && (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                          ⚠️ Nenhum plano ativo encontrado para este aplicativo
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 3: Import Codes (only shows if plan is selected) */}
                  {selectedPlan && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FileText className="w-4 h-4 inline mr-2" />
                          3. Lista de Códigos (um por linha)
                        </label>
                        <textarea
                          value={importText}
                          onChange={(e) => handleImportTextChange(e.target.value)}
                          rows={12}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder={`1234567891909090
ABCD1234EFGH5678
wxyz9876ijkl5432
...

Os códigos serão formatados automaticamente como:
1234 5678 9190 9090
ABCD 1234 EFGH 5678
WXYZ 9876 IJKL 5432`}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {importText.split('\n').filter(line => line.trim()).length} códigos detectados
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            ✨ Formatação automática: 1234567890 → 1234 5678 90
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleImport}
                        disabled={!selectedPlan || !importText.trim() || isImporting}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                      >
                        {isImporting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Importando...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            <span>Importar Códigos para {selectedApp}</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Como Importar Códigos</h4>
                  <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-2">📱 Passo a Passo:</p>
                      <ol className="space-y-2 list-decimal list-inside">
                        <li>Primeiro escolha o <strong>aplicativo</strong></li>
                        <li>Depois selecione o <strong>plano específico</strong></li>
                        <li>Cole os códigos na área de texto</li>
                        <li>Clique em "Importar Códigos"</li>
                      </ol>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-2">📋 Formatação Automática:</p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                        <p className="text-blue-800 dark:text-blue-300 font-medium mb-2">✨ Os códigos são formatados automaticamente!</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600 dark:text-red-400">❌ 1234567891909090</span>
                            <span>→</span>
                            <span className="text-green-600 dark:text-green-400">✅ 1234 5678 9190 9090</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600 dark:text-red-400">❌ abcd-1234-efgh-5678</span>
                            <span>→</span>
                            <span className="text-green-600 dark:text-green-400">✅ ABCD 1234 EFGH 5678</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600 dark:text-red-400">❌ wxyz9876ijkl5432</span>
                            <span>→</span>
                            <span className="text-green-600 dark:text-green-400">✅ WXYZ 9876 IJKL 5432</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-2">💡 Dicas:</p>
                      <ul className="space-y-1">
                        <li>• Um código por linha</li>
                        <li>• Linhas vazias são ignoradas</li>
                        <li>• Códigos duplicados são detectados e ignorados</li>
                        <li>• Máximo de 1000 códigos por importação</li>
                        <li>• <strong>Formatação automática em tempo real!</strong></li>
                      </ul>
                    </div>

                    {/* Show selected plan info */}
                    {selectedPlan && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">✅ Plano Selecionado:</p>
                        {(() => {
                          const plan = plans.find(p => p.id === selectedPlan);
                          return plan ? (
                            <div className="text-blue-700 dark:text-blue-400 text-sm">
                              <p><strong>App:</strong> {plan.appConfig?.appName || 'App Padrão'}</p>
                              <p><strong>Plano:</strong> {plan.name}</p>
                              <p><strong>Valor:</strong> {formatCurrency(plan.value)}</p>
                              <p><strong>Validade:</strong> {plan.validityDays} dias</p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Imported Codes Display */}
              {importedCodes.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                      ✅ {importedCodes.length} códigos importados com sucesso para {selectedApp}!
                    </h4>
                    <button
                      onClick={() => setImportedCodes([])}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {importedCodes.slice(0, 20).map((code, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700"
                      >
                        <span className="font-mono text-sm text-gray-900 dark:text-white">{code}</span>
                      </div>
                    ))}
                    {importedCodes.length > 20 && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700 flex items-center justify-center">
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          +{importedCodes.length - 20} mais códigos
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Gerenciar Códigos</h3>
                <button
                  onClick={() => downloadCodes(
                    filteredCodes.map(c => c.code), 
                    `todos-codigos-${Date.now()}.txt`
                  )}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Todos</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por código, plano ou aplicativo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os planos</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.appConfig?.appName || 'App Padrão'}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os status</option>
                  <option value="available">Disponível</option>
                  <option value="sold">Vendido</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>

              {/* Codes Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Código</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Aplicativo</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Plano</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Valor</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Criado em</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCodes.slice(0, 50).map(code => {
                        const plan = plans.find(p => p.id === code.planId);
                        return (
                          <tr key={code.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-4 px-6">
                              <span className="font-mono text-sm text-gray-900 dark:text-white">{code.code}</span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Smartphone className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-900 dark:text-white font-medium">{plan?.appConfig?.appName || code.appName || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-gray-900 dark:text-white">{plan?.name || 'N/A'}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(code.value)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                code.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                code.status === 'sold' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {code.status === 'available' ? 'Disponível' :
                                 code.status === 'sold' ? 'Vendido' : 'Expirado'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {formatDate(code.createdAt)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => copyToClipboard(code.code)}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  title="Copiar código"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => viewCodeDetails(code)}
                                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                                  title="Ver detalhes e copiar"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredCodes.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhum código encontrado</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {searchTerm || planFilter || statusFilter 
                        ? 'Tente ajustar os filtros para encontrar códigos'
                        : 'Comece importando códigos'
                      }
                    </p>
                  </div>
                )}

                {filteredCodes.length > 50 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Mostrando 50 de {filteredCodes.length} códigos. Use os filtros para refinar a busca.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeGenerationAndImport;