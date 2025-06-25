import { useState, useEffect } from 'react';
import { useSupabaseRechargeSystem } from './useSupabaseRechargeSystem';
import { useSupabaseCustomers } from './useSupabaseCustomers';
import { useSupabaseResellers } from './useSupabaseResellers';
import { useSupabaseMessageTemplates } from './useSupabaseMessageTemplates';
import { useAuth } from '../contexts/AuthContext';

export const useAppInitialization = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { user } = useAuth();

  // Initialize all data hooks but don't trigger their auto-loading
  const rechargeSystem = useSupabaseRechargeSystem();
  const customersSystem = useSupabaseCustomers();
  const resellersSystem = useSupabaseResellers();
  const templatesSystem = useSupabaseMessageTemplates();

  // Centralized initialization function - only load essential data initially
  useEffect(() => {
    const initializeApp = async () => {
      // If no user is logged in, set isInitializing to false immediately
      // This is the key fix to prevent the loading screen from getting stuck
      if (!user) {
        setIsInitializing(false);
        return;
      }

      setIsInitializing(true);
      console.log('🚀 Iniciando carregamento centralizado de dados essenciais...');
      
      try {
        // Only load essential data for the dashboard
        await rechargeSystem.fetchPlans();
        
        // Only load minimal stats data if admin or reseller
        if (user.role !== 'customer') {
          // Just load pending deliveries count for notifications
          await rechargeSystem.fetchPendingDeliveries();
        }
        
        console.log('✅ Carregamento de dados essenciais concluído com sucesso');
      } catch (error) {
        console.error('❌ Erro ao carregar dados essenciais:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [user]);

  return {
    isLoading: isInitializing,
    
    // RechargeSystem data and functions
    codes: rechargeSystem.codes,
    plans: rechargeSystem.plans,
    pendingDeliveries: rechargeSystem.pendingDeliveries,
    allPurchases: rechargeSystem.allPurchases,
    importCodes: rechargeSystem.importCodes,
    assignCodeToPurchase: rechargeSystem.assignCodeToPurchase,
    checkAndSendExpiryReminders: rechargeSystem.checkAndSendExpiryReminders,
    addPendingCodeDelivery: rechargeSystem.addPendingCodeDelivery,
    getStats: rechargeSystem.getStats,
    addPlan: rechargeSystem.addPlan,
    editPlan: rechargeSystem.editPlan,
    deletePlan: rechargeSystem.deletePlan,
    
    // Expose fetch methods for on-demand loading
    fetchCodes: rechargeSystem.fetchCodes,
    fetchPurchases: rechargeSystem.fetchPurchases,
    fetchPendingDeliveries: rechargeSystem.fetchPendingDeliveries,
    
    // Customers data and functions
    customers: customersSystem.customers,
    addCustomer: customersSystem.addCustomer,
    editCustomer: customersSystem.editCustomer,
    deleteCustomer: customersSystem.deleteCustomer,
    fetchCustomers: customersSystem.fetchCustomers,
    
    // Resellers data and functions
    resellers: resellersSystem.resellers,
    addReseller: resellersSystem.addReseller,
    editReseller: resellersSystem.editReseller,
    promoteToMaster: resellersSystem.promoteToMaster,
    deleteReseller: resellersSystem.deleteReseller,
    fetchResellers: resellersSystem.fetchResellers,
    
    // Message templates data and functions
    messageTemplates: templatesSystem.messageTemplates,
    addTemplate: templatesSystem.addTemplate,
    editTemplate: templatesSystem.editTemplate,
    deleteTemplate: templatesSystem.deleteTemplate,
    testTemplate: templatesSystem.testTemplate,
    fetchMessageTemplates: templatesSystem.fetchMessageTemplates
  };
};