import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { SystemConfig } from '../types';

interface SystemConfigContextType {
  config: SystemConfig;
  updateConfig: (updates: Partial<SystemConfig>) => Promise<void>;
  isLoading: boolean;
}

const SystemConfigContext = createContext<SystemConfigContextType | undefined>(undefined);

export const useSystemConfig = () => {
  const context = useContext(SystemConfigContext);
  if (!context) {
    throw new Error('useSystemConfig must be used within a SystemConfigProvider');
  }
  return context;
};

// Mock initial configuration - used as fallback if Supabase fails
const mockInitialConfig: SystemConfig = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  paymentGateways: {
    pagarme: {
      apiKey: '',
      secretKey: '',
      isActive: false
    },
    appmax: {
      apiKey: '',
      secretKey: '',
      isActive: false
    },
    pushinpay: {
      apiKey: '',
      secretKey: '',
      isActive: false
    },
    shipay: {
      apiKey: '',
      secretKey: '',
      isActive: false
    },
    activeGateway: 'pagarme'
  },
  whatsappIntegration: {
    zapiApiKey: '',
    defaultInstanceId: '',
    isActive: false
  },
  emailConfig: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Sistema de Recarga'
  },
  masterResellerRequirements: {
    minimumPurchaseAmount: 1000,
    requiredProductId: 'plan-4',
    commissionRate: 15
  },
  loyaltyProgram: {
    isActive: true,
    pointsPerReal: 1,
    redemptionRate: 100
  }
};

export const SystemConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SystemConfig>(mockInitialConfig);
  const [isLoading, setIsLoading] = useState(true);

  // Load configuration from Supabase
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        
        // Try to get config from Supabase
        const { data, error } = await supabase
          .from('system_config')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading system config from Supabase:', error);
          
          // If Supabase fails, try to get from localStorage as fallback
          const savedConfig = localStorage.getItem('systemConfig');
          if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            setConfig(parsedConfig);
          } else {
            // Use mock config as fallback
            setConfig(mockInitialConfig);
            // Save to localStorage as backup
            localStorage.setItem('systemConfig', JSON.stringify(mockInitialConfig));
          }
        } else if (data && data.length > 0) {
          // Format the data from Supabase to match our SystemConfig type
          const configData = data[0];
          const formattedConfig: SystemConfig = {
            id: configData.id,
            paymentGateways: configData.payment_gateways as SystemConfig['paymentGateways'],
            whatsappIntegration: configData.whatsapp_integration as SystemConfig['whatsappIntegration'],
            emailConfig: configData.email_config as SystemConfig['emailConfig'],
            masterResellerRequirements: configData.master_reseller_requirements as SystemConfig['masterResellerRequirements'],
            loyaltyProgram: configData.loyalty_program as SystemConfig['loyaltyProgram']
          };
          
          setConfig(formattedConfig);
          
          // Also save to localStorage as a backup
          localStorage.setItem('systemConfig', JSON.stringify(formattedConfig));
        } else {
          // No configuration exists, use mock config
          console.log('No system config found, using default configuration');
          setConfig(mockInitialConfig);
          localStorage.setItem('systemConfig', JSON.stringify(mockInitialConfig));
        }
      } catch (error) {
        console.error('Error loading system config:', error);
        
        // Try to get from localStorage as final fallback
        const savedConfig = localStorage.getItem('systemConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          setConfig(parsedConfig);
        } else {
          // Use mock config as final fallback
          setConfig(mockInitialConfig);
          localStorage.setItem('systemConfig', JSON.stringify(mockInitialConfig));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Update configuration in Supabase and local state
  const updateConfig = async (updates: Partial<SystemConfig>) => {
    try {
      const updatedConfig = { ...config, ...updates };
      setConfig(updatedConfig);
      
      // Save to localStorage as backup
      localStorage.setItem('systemConfig', JSON.stringify(updatedConfig));
      
      // Prepare data for Supabase
      const supabaseData = {
        payment_gateways: updatedConfig.paymentGateways,
        whatsapp_integration: updatedConfig.whatsappIntegration,
        email_config: updatedConfig.emailConfig,
        master_reseller_requirements: updatedConfig.masterResellerRequirements,
        loyalty_program: updatedConfig.loyaltyProgram,
        updated_at: new Date().toISOString()
      };
      
      // Update in Supabase
      const { error } = await supabase
        .from('system_config')
        .update(supabaseData)
        .eq('id', config.id);
      
      if (error) {
        console.error('Error updating system config in Supabase:', error);
        throw new Error(handleSupabaseError(error));
      }
    } catch (error) {
      console.error('Error updating system config:', error);
      throw error;
    }
  };

  return (
    <SystemConfigContext.Provider value={{ config, updateConfig, isLoading }}>
      {children}
    </SystemConfigContext.Provider>
  );
};