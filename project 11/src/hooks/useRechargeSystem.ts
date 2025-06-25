import { useState, useEffect } from 'react';
import { RechargeCode, Sale, DashboardStats, Plan, Purchase, MessageTemplate } from '../types';
import { generateRechargeCode, formatDate } from '../utils/formatters';
import { useSystemConfig } from '../contexts/SystemConfigContext';
import { sendWhatsAppMessage, formatExpiryReminderMessage } from '../utils/whatsappApi';

export const useRechargeSystem = (plans: Plan[]) => {
  const [codes, setCodes] = useState<RechargeCode[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<Purchase[]>([]);
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const { config } = useSystemConfig();

  // Initialize with sample data
  useEffect(() => {
    if (plans.length === 0) return;
    
    const sampleCodes: RechargeCode[] = [];
    
    for (let i = 0; i < 50; i++) {
      const randomPlan = plans[Math.floor(Math.random() * plans.length)];
      const code: RechargeCode = {
        id: `code-${i + 1}`,
        code: generateRechargeCode(),
        value: randomPlan.value,
        status: Math.random() > 0.3 ? 'available' : 'sold',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        planId: randomPlan.id,
        appName: randomPlan.appConfig.appName,
        ...(Math.random() < 0.3 && { soldAt: new Date() })
      };
      sampleCodes.push(code);
    }
    
    setCodes(sampleCodes);

    // Create some sample pending deliveries
    const samplePendingDeliveries: Purchase[] = [];
    for (let i = 0; i < 3; i++) {
      const randomPlan = plans[Math.floor(Math.random() * plans.length)];
      const purchase: Purchase = {
        id: `pending-delivery-${i + 1}`,
        customerId: `customer-${i + 1}`,
        planId: randomPlan.id,
        rechargeCode: '',
        amount: randomPlan.value,
        status: 'pending_code_delivery',
        paymentMethod: Math.random() > 0.5 ? 'credit_card' : 'pix',
        paymentId: `pay_${Date.now() + i}`,
        createdAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notificationsSent: [],
        resellerId: 'reseller-1',
        codeDeliveryFailureReason: 'no_available_codes',
        customerData: {
          name: `Cliente Teste ${i + 1}`,
          email: `cliente${i + 1}@teste.com`,
          phone: `1199999${i + 1}${i + 1}${i + 1}${i + 1}`,
          cpf: `123.456.789-0${i + 1}`
        },
        expiryReminders: {
          reminder3Days: { sent: false },
          reminder1Day: { sent: false },
          reminderToday: { sent: false }
        }
      };
      samplePendingDeliveries.push(purchase);
    }
    setPendingDeliveries(samplePendingDeliveries);

    // Create some sample approved purchases for testing expiry reminders
    const sampleApprovedPurchases: Purchase[] = [];
    for (let i = 0; i < 5; i++) {
      const randomPlan = plans[Math.floor(Math.random() * plans.length)];
      const daysUntilExpiry = [0, 1, 3, 7, 15][i]; // Different expiry dates for testing
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);
      
      const purchase: Purchase = {
        id: `approved-purchase-${i + 1}`,
        customerId: `customer-approved-${i + 1}`,
        planId: randomPlan.id,
        rechargeCode: generateRechargeCode(),
        amount: randomPlan.value,
        status: 'approved',
        paymentMethod: Math.random() > 0.5 ? 'credit_card' : 'pix',
        paymentId: `pay_approved_${Date.now() + i}`,
        createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - Math.random() * 9 * 24 * 60 * 60 * 1000),
        expiresAt: expiryDate,
        notificationsSent: [],
        resellerId: 'reseller-1',
        customerData: {
          name: `Cliente Aprovado ${i + 1}`,
          email: `aprovado${i + 1}@teste.com`,
          phone: `11988888${i + 1}${i + 1}${i + 1}`,
          cpf: `987.654.321-0${i + 1}`
        },
        expiryReminders: {
          reminder3Days: { sent: false },
          reminder1Day: { sent: false },
          reminderToday: { sent: false }
        }
      };
      sampleApprovedPurchases.push(purchase);
    }
    setAllPurchases(sampleApprovedPurchases);
  }, [plans]);

  const importCodes = (planId: string, codeStrings: string[]) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return [];
    
    const newCodes: RechargeCode[] = [];
    
    codeStrings.forEach((codeString, i) => {
      const code: RechargeCode = {
        id: `imported-${Date.now()}-${i}`,
        code: codeString.toUpperCase(),
        value: plan.value,
        status: 'available',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        planId: plan.id,
        appName: plan.appConfig.appName,
      };
      newCodes.push(code);
    });
    
    setCodes(prev => [...prev, ...newCodes]);
    return newCodes;
  };

  const sellCodes = async (planId: string, customerInfo: Sale['customerInfo']) => {
    // Find an available code for the specified plan
    const availableCode = codes.find(c => c.planId === planId && c.status === 'available');
    
    if (!availableCode) {
      return {
        success: false,
        reason: 'code_unavailable',
        message: 'Nenhum código disponível para este plano'
      };
    }

    const sale: Sale = {
      id: `sale-${Date.now()}`,
      codes: [availableCode],
      total: availableCode.value,
      customerInfo,
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date(),
    };

    // Create a new approved purchase
    const newPurchase: Purchase = {
      id: `purchase-${Date.now()}`,
      customerId: `customer-${Date.now()}`,
      planId: planId,
      rechargeCode: availableCode.code,
      amount: availableCode.value,
      status: 'approved',
      paymentMethod: 'credit_card', // Default, should be passed from payment
      paymentId: `pay-${Date.now()}`,
      createdAt: new Date(),
      approvedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notificationsSent: [],
      resellerId: 'system',
      customerData: {
        name: customerInfo.name,
        email: customerInfo.email || '',
        phone: customerInfo.phone,
        cpf: ''
      },
      expiryReminders: {
        reminder3Days: { sent: false },
        reminder1Day: { sent: false },
        reminderToday: { sent: false }
      }
    };

    // Update code status
    setCodes(prev => prev.map(code => 
      code.id === availableCode.id 
        ? { ...code, status: 'sold' as const, soldAt: new Date() }
        : code
    ));

    // Add to all purchases
    setAllPurchases(prev => [...prev, newPurchase]);

    setSales(prev => [...prev, sale]);
    return {
      success: true,
      code: availableCode,
      sale,
      purchase: newPurchase
    };
  };

  const getPendingCodeDeliveries = (): Purchase[] => {
    return pendingDeliveries;
  };

  const assignCodeToPurchase = (purchaseId: string, codeId: string) => {
    // Find the pending purchase
    const purchase = pendingDeliveries.find(p => p.id === purchaseId);
    if (!purchase) {
      return {
        success: false,
        message: 'Compra não encontrada'
      };
    }

    // Find the code
    const code = codes.find(c => c.id === codeId);
    if (!code) {
      return {
        success: false,
        message: 'Código não encontrado'
      };
    }

    // Check if code is available
    if (code.status !== 'available') {
      return {
        success: false,
        message: 'Código não está disponível'
      };
    }

    // Update the purchase
    const updatedPurchase = {
      ...purchase,
      status: 'approved' as const,
      rechargeCode: code.code,
      assignedCodeId: code.id,
      approvedAt: new Date(),
      expiryReminders: {
        reminder3Days: { sent: false },
        reminder1Day: { sent: false },
        reminderToday: { sent: false }
      }
    };

    // Update the code
    setCodes(prev => prev.map(c => 
      c.id === codeId 
        ? { ...c, status: 'sold' as const, soldAt: new Date() }
        : c
    ));

    // Remove from pending deliveries and add to all purchases
    setPendingDeliveries(prev => prev.filter(p => p.id !== purchaseId));
    setAllPurchases(prev => [...prev, updatedPurchase]);

    return {
      success: true,
      purchase: updatedPurchase,
      code
    };
  };

  // Function to check and send expiry reminders
  const checkAndSendExpiryReminders = async (messageTemplates: MessageTemplate[]) => {
    console.log('🔍 Verificando lembretes de vencimento...');
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Only check approved purchases that haven't expired yet
    const activePurchases = allPurchases.filter(p => 
      p.status === 'approved' && 
      p.rechargeCode && 
      p.expiresAt > now
    );

    console.log(`📊 Verificando ${activePurchases.length} compras ativas`);

    for (const purchase of activePurchases) {
      const expiryDate = new Date(purchase.expiresAt);
      const expiryDateOnly = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
      
      // Calculate days until expiry
      const timeDiff = expiryDateOnly.getTime() - today.getTime();
      const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      console.log(`📅 Compra ${purchase.id}: ${daysUntilExpiry} dias até vencer`);

      // Get plan information
      const plan = plans.find(p => p.id === purchase.planId);
      if (!plan) continue;

      let reminderType: 'reminder3Days' | 'reminder1Day' | 'reminderToday' | null = null;
      let templateType: MessageTemplate['type'] | null = null;

      // Determine which reminder to send
      if (daysUntilExpiry === 3 && !purchase.expiryReminders?.reminder3Days?.sent) {
        reminderType = 'reminder3Days';
        templateType = 'expiry_reminder_3d';
      } else if (daysUntilExpiry === 1 && !purchase.expiryReminders?.reminder1Day?.sent) {
        reminderType = 'reminder1Day';
        templateType = 'expiry_reminder_1d';
      } else if (daysUntilExpiry === 0 && !purchase.expiryReminders?.reminderToday?.sent) {
        reminderType = 'reminderToday';
        templateType = 'expiry_reminder_0d';
      }

      if (!reminderType || !templateType || !purchase.customerData) continue;

      console.log(`📨 Enviando lembrete ${reminderType} para ${purchase.customerData.name}`);

      // Check if WhatsApp is configured and active
      if (config.whatsappIntegration.isActive && 
          config.whatsappIntegration.zapiApiKey && 
          config.whatsappIntegration.defaultInstanceId) {
        
        try {
          // Format the expiry reminder message
          const message = formatExpiryReminderMessage(
            purchase.customerData.name,
            plan.name,
            daysUntilExpiry,
            formatDate(expiryDate).split(' ')[0], // Only date part
            'Sistema de Recarga Pro'
          );

          // Send WhatsApp message
          const whatsappResult = await sendWhatsAppMessage(
            purchase.customerData.phone,
            message,
            config.whatsappIntegration.zapiApiKey,
            config.whatsappIntegration.defaultInstanceId
          );

          // Update the purchase to mark reminder as sent
          setAllPurchases(prev => prev.map(p => {
            if (p.id === purchase.id) {
              return {
                ...p,
                expiryReminders: {
                  ...p.expiryReminders,
                  [reminderType!]: {
                    sent: true,
                    sentAt: new Date(),
                    messageId: whatsappResult.messageId
                  }
                }
              };
            }
            return p;
          }));

          if (whatsappResult.success) {
            console.log(`✅ Lembrete ${reminderType} enviado com sucesso para ${purchase.customerData.name}`);
          } else {
            console.error(`❌ Erro ao enviar lembrete ${reminderType}:`, whatsappResult.error);
          }

        } catch (error) {
          console.error(`❌ Erro ao processar lembrete ${reminderType}:`, error);
        }
      } else {
        console.log('⚠️ WhatsApp não configurado - lembrete não enviado');
      }
    }

    console.log('✅ Verificação de lembretes concluída');
  };

  const getStats = (): DashboardStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const soldCodes = codes.filter(c => c.status === 'sold');
    const todaySoldCodes = soldCodes.filter(c => c.soldAt && c.soldAt >= today);

    // Count purchases expiring today
    const expiringToday = allPurchases.filter(p => {
      const expiryDate = new Date(p.expiresAt);
      const expiryDateOnly = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
      return expiryDateOnly.getTime() === today.getTime() && p.status === 'approved';
    }).length;

    return {
      totalCustomers: 0,
      totalRevenue: soldCodes.reduce((sum, code) => sum + code.value, 0),
      todayRevenue: todaySoldCodes.reduce((sum, code) => sum + code.value, 0),
      activePlans: 0,
      pendingPayments: 0,
      expiringToday,
      conversionRate: 0,
      averageTicket: 0,
      pendingCodeDeliveries: pendingDeliveries.length
    };
  };

  // Add a new purchase with pending code delivery status
  const addPendingCodeDelivery = (purchase: Omit<Purchase, 'id' | 'createdAt' | 'expiresAt'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: `pending-delivery-${Date.now()}`,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pending_code_delivery',
      expiryReminders: {
        reminder3Days: { sent: false },
        reminder1Day: { sent: false },
        reminderToday: { sent: false }
      }
    };

    setPendingDeliveries(prev => [...prev, newPurchase]);
    return newPurchase;
  };

  // Initialize purchases from mock data
  const initializePurchasesFromMockData = (mockCustomers: any[]) => {
    const allMockPurchases: Purchase[] = [];
    
    mockCustomers.forEach(customer => {
      customer.purchases.forEach((purchase: any) => {
        const enhancedPurchase: Purchase = {
          ...purchase,
          expiryReminders: {
            reminder3Days: { sent: false },
            reminder1Day: { sent: false },
            reminderToday: { sent: false }
          }
        };
        allMockPurchases.push(enhancedPurchase);
      });
    });

    setAllPurchases(prev => [...prev, ...allMockPurchases]);
  };

  return {
    codes,
    sales,
    pendingDeliveries,
    allPurchases,
    importCodes,
    sellCodes,
    getStats,
    getPendingCodeDeliveries,
    assignCodeToPurchase,
    addPendingCodeDelivery,
    checkAndSendExpiryReminders,
    initializePurchasesFromMockData
  };
};