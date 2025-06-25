import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SystemConfigProvider } from './contexts/SystemConfigContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import CustomerSidebar from './components/Layout/CustomerSidebar';
import Header from './components/Layout/Header';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import CustomerDashboard from './components/Customer/CustomerDashboard';
import CheckoutPage from './components/Checkout/CheckoutPage';
import CustomerManagement from './components/Customers/CustomerManagement';
import ResellerManagement from './components/Resellers/ResellerManagement';
import PlanManagement from './components/Plans/PlanManagement';
import CodeGenerationAndImport from './components/CodeGenerationAndImport';
import AdvancedReports from './components/Reports/AdvancedReports';
import MessageTemplates from './components/Messages/MessageTemplates';
import SystemSettings from './components/Settings/SystemSettings';
import ProfileManagement from './components/Profile/ProfileManagement';
import LoginPage from './components/Auth/LoginPage';
import OpenInvoicesManagement from './components/Sales/OpenInvoicesManagement';
import { useAppInitialization } from './hooks/useAppInitialization';
import { DashboardStats } from './types';
import toast from 'react-hot-toast';

// Mock stats - these could also be migrated to Supabase in the future
const mockStats: DashboardStats = {
  totalCustomers: 2847,
  totalRevenue: 125430.50,
  todayRevenue: 3250.00,
  activePlans: 156,
  pendingPayments: 23,
  expiringToday: 12,
  conversionRate: 68.5,
  averageTicket: 35.80,
  totalResellers: 45,
  totalMasterResellers: 8,
  networkRevenue: 89650.30,
  pendingCodeDeliveries: 5
};

function AppContent() {
  const { user, isLoading: authLoading, darkMode } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use centralized data initialization hook
  const {
    isLoading: dataLoading,
    
    // RechargeSystem data and functions
    codes,
    plans,
    pendingDeliveries,
    allPurchases,
    importCodes,
    assignCodeToPurchase,
    checkAndSendExpiryReminders,
    addPendingCodeDelivery,
    getStats,
    addPlan,
    editPlan,
    deletePlan,
    fetchCodes,
    fetchPurchases,
    fetchPendingDeliveries,
    
    // Customers data and functions
    customers,
    addCustomer,
    editCustomer,
    deleteCustomer,
    fetchCustomers,
    
    // Resellers data and functions
    resellers,
    addReseller,
    editReseller,
    promoteToMaster,
    deleteReseller,
    fetchResellers,
    
    // Message templates data and functions
    messageTemplates,
    addTemplate,
    editTemplate,
    deleteTemplate,
    testTemplate,
    fetchMessageTemplates
  } = useAppInitialization();

  // Combined loading state
  const isLoading = authLoading || dataLoading;

  // Set up automatic expiry reminder checking when data is loaded
  useEffect(() => {
    if (!isLoading && plans.length > 0 && allPurchases.length > 0) {
      console.log('🚀 Iniciando sistema de lembretes automáticos...');
      
      // Check immediately on startup
      setTimeout(() => {
        checkAndSendExpiryReminders(messageTemplates);
      }, 5000); // Wait 5 seconds after startup

      // Set up periodic checking every 24 hours (86400000 ms)
      // For demo purposes, we'll check every 30 seconds
      const reminderInterval = setInterval(() => {
        checkAndSendExpiryReminders(messageTemplates);
      }, 30000); // 30 seconds for demo - change to 86400000 for production (24 hours)

      console.log('✅ Sistema de lembretes configurado - verificação a cada 30 segundos');

      // Cleanup interval on unmount
      return () => {
        clearInterval(reminderInterval);
        console.log('🛑 Sistema de lembretes parado');
      };
    }
  }, [isLoading, plans, allPurchases, messageTemplates, checkAndSendExpiryReminders]);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {authLoading ? 'Carregando...' : 'Inicializando sistema...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleAddCustomer = async (customerData: Omit<any, 'id' | 'createdAt'>) => {
    try {
      await addCustomer(customerData);
      toast.success('Cliente adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Erro ao adicionar cliente');
    }
  };

  const handleEditCustomer = async (id: string, customerData: Partial<any>) => {
    try {
      await editCustomer(id, customerData);
      toast.success('Cliente editado com sucesso!');
    } catch (error) {
      console.error('Error editing customer:', error);
      toast.error('Erro ao editar cliente');
    }
  };

  const handleViewCustomer = (customer: any) => {
    console.log('Viewing customer:', customer);
  };

  const handleAddReseller = async (resellerData: Omit<any, 'id' | 'createdAt'>) => {
    try {
      await addReseller(resellerData);
      toast.success('Revendedor adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding reseller:', error);
      toast.error('Erro ao adicionar revendedor');
    }
  };

  const handleEditReseller = async (id: string, resellerData: Partial<any>) => {
    try {
      await editReseller(id, resellerData);
      toast.success('Revendedor editado com sucesso!');
    } catch (error) {
      console.error('Error editing reseller:', error);
      toast.error('Erro ao editar revendedor');
    }
  };

  const handleViewReseller = (reseller: any) => {
    console.log('Viewing reseller:', reseller);
  };

  const handlePromoteToMaster = async (resellerId: string) => {
    try {
      await promoteToMaster(resellerId);
      toast.success('Revendedor promovido a Master com sucesso!');
    } catch (error) {
      console.error('Error promoting reseller:', error);
      toast.error('Erro ao promover revendedor');
    }
  };

  // Plan management handlers - now using Supabase
  const handleAddPlan = async (planData: any) => {
    try {
      await addPlan({
        ...planData,
        createdBy: user.id
      });
      toast.success('Plano adicionado com sucesso!');
    } catch (error: any) {
      console.error('Error adding plan:', error);
      toast.error(error.message || 'Erro ao adicionar plano');
    }
  };

  const handleEditPlan = async (id: string, planData: any) => {
    try {
      await editPlan(id, planData);
      toast.success('Plano editado com sucesso!');
    } catch (error: any) {
      console.error('Error editing plan:', error);
      toast.error(error.message || 'Erro ao editar plano');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await deletePlan(id);
        toast.success('Plano excluído com sucesso!');
      } catch (error: any) {
        console.error('Error deleting plan:', error);
        toast.error(error.message || 'Erro ao deletar plano');
      }
    }
  };

  const handleViewPlan = (plan: any) => {
    console.log('Viewing plan:', plan);
  };

  const handleImportCodes = async (planId: string, codeStrings: string[]) => {
    try {
      await importCodes(planId, codeStrings);
      toast.success(`${codeStrings.length} códigos importados com sucesso!`);
    } catch (error: any) {
      console.error('Error importing codes:', error);
      toast.error(error.message || 'Erro ao importar códigos');
    }
  };

  const handleAddTemplate = async (templateData: any) => {
    try {
      await addTemplate(templateData);
      toast.success('Template adicionado com sucesso!');
    } catch (error: any) {
      console.error('Error adding template:', error);
      toast.error(error.message || 'Erro ao adicionar template');
    }
  };

  const handleEditTemplate = async (id: string, templateData: any) => {
    try {
      await editTemplate(id, templateData);
      toast.success('Template editado com sucesso!');
    } catch (error: any) {
      console.error('Error editing template:', error);
      toast.error(error.message || 'Erro ao editar template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
      toast.success('Template excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'Erro ao deletar template');
    }
  };

  const handleTestTemplate = async (template: any) => {
    try {
      const result = await testTemplate(template);
      toast.success(result.message);
    } catch (error: any) {
      console.error('Error testing template:', error);
      toast.error(error.message || 'Erro ao testar template');
    }
  };

  // Função para navegar entre as abas
  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  // Customer-specific handlers
  // Render different interfaces based on user role
  if (user.role === 'customer') {
    return (
      <div className={`${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex transition-colors duration-300">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          <CustomerSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          
          <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
            <Header setSidebarOpen={setSidebarOpen} onNavigate={handleNavigate} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
              <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeTab === 'plans' ? (
                  <CheckoutPage plans={plans} onNavigate={handleNavigate} />
                ) : (
                  <CustomerDashboard 
                    onNavigate={handleNavigate} 
                    activeTab={activeTab}
                    plans={plans}
                  />
                )}
              </div>
            </main>
          </div>
        </div>

        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: darkMode ? '#374151' : '#ffffff',
              color: darkMode ? '#ffffff' : '#000000',
              border: darkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    );
  }

  // Admin/Reseller interface
  const renderContent = () => {
    // Load section data on demand when tab is activated
    useEffect(() => {
      const loadSectionData = async () => {
        try {
          switch (activeTab) {
            case 'customers':
              if (customers.length === 0) {
                console.log('🔄 Carregando dados de clientes...');
                await fetchCustomers();
              }
              break;
            case 'resellers':
            case 'master-resellers':
              if (resellers.length === 0) {
                console.log('🔄 Carregando dados de revendedores...');
                await fetchResellers();
              }
              break;
            case 'codes':
              if (codes.length === 0) {
                console.log('🔄 Carregando dados de códigos...');
                await fetchCodes();
              }
              break;
            case 'open-invoices':
              if (pendingDeliveries.length === 0) {
                console.log('🔄 Carregando faturas em aberto...');
                await fetchPendingDeliveries();
              }
              break;
            case 'messages':
              if (messageTemplates.length === 0) {
                console.log('🔄 Carregando templates de mensagens...');
                await fetchMessageTemplates();
              }
              break;
            default:
              break;
          }
        } catch (error) {
          console.error(`Erro ao carregar dados para ${activeTab}:`, error);
        }
      };
      
      loadSectionData();
    }, [activeTab]);

    // Update stats to use Supabase data
    const currentStats = {
      ...mockStats,
      activePlans: plans.length,
      pendingCodeDeliveries: pendingDeliveries.length,
      totalCustomers: customers.length,
      totalResellers: resellers.length,
      totalMasterResellers: resellers.filter(r => r.role === 'master_reseller').length,
      ...getStats()
    };

    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard stats={currentStats} onNavigate={handleNavigate} />;
      case 'checkout':
        return <CheckoutPage plans={plans} onNavigate={handleNavigate} />;
      case 'customers':
        return (
          <CustomerManagement 
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
            onViewCustomer={handleViewCustomer}
            fetchCustomers={fetchCustomers}
          />
        );
      case 'resellers':
        return (
          <ResellerManagement
            resellers={resellers.filter(r => r.role === 'reseller')}
            onAddReseller={handleAddReseller}
            onEditReseller={handleEditReseller}
            onViewReseller={handleViewReseller}
            onPromoteToMaster={handlePromoteToMaster}
          />
        );
      case 'master-resellers':
        return (
          <ResellerManagement
            resellers={resellers.filter(r => r.role === 'master_reseller')}
            onAddReseller={handleAddReseller}
            onEditReseller={handleEditReseller}
            onViewReseller={handleViewReseller}
            onPromoteToMaster={handlePromoteToMaster}
          />
        );
      case 'plans':
        return (
          <PlanManagement
            plans={plans}
            codes={codes}
            onAddPlan={handleAddPlan}
            onEditPlan={handleEditPlan}
            onDeletePlan={handleDeletePlan}
            onViewPlan={handleViewPlan}
            onImportCodes={handleImportCodes}
          />
        );
      case 'codes':
        return (
          <CodeGenerationAndImport
            plans={plans}
            codes={codes}
            onImportCodes={handleImportCodes}
          />
        );
      case 'open-invoices':
        return (
          <OpenInvoicesManagement
            pendingDeliveries={pendingDeliveries}
            plans={plans}
            codes={codes.filter(c => c.status === 'available')}
            onAssignCode={assignCodeToPurchase}
          />
        );
      case 'reports':
        return <AdvancedReports />;
      case 'messages':
        return (
          <MessageTemplates
            templates={messageTemplates}
            onAddTemplate={handleAddTemplate}
            onEditTemplate={handleEditTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onTestTemplate={handleTestTemplate}
          />
        );
      case 'branding':
        return (
          <div className="text-center py-12">
            <div className={`${darkMode ? 'bg-orange-900/20' : 'bg-orange-50'} p-8 rounded-2xl inline-block`}>
              <div className="text-6xl mb-4">🎨</div>
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Personalização de Marca</h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-md`}>
                Configure cores, logo e identidade visual 
                do seu sistema.
              </p>
            </div>
          </div>
        );
      case 'settings':
        return <SystemSettings />;
      case 'profile':
        return (
          <ProfileManagement
            onBack={() => setActiveTab('dashboard')}
          />
        );
      default:
        return <AdminDashboard stats={currentStats} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex transition-colors duration-300">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
          <Header setSidebarOpen={setSidebarOpen} onNavigate={handleNavigate} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? '#374151' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000',
            border: darkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SystemConfigProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </SystemConfigProvider>
    </AuthProvider>
  );
}

export default App;