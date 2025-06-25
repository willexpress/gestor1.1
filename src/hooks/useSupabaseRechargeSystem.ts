import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { RechargeCode, Sale, DashboardStats, Plan, Purchase, MessageTemplate } from '../types';
import { generateRechargeCode, formatDate } from '../utils/formatters';
import { useSystemConfig } from '../contexts/SystemConfigContext';
import { sendWhatsAppMessage, formatExpiryReminderMessage } from '../utils/whatsappApi';

export const useSupabaseRechargeSystem = () => {
  const [codes, setCodes] = useState<RechargeCode[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<Purchase[]>([]);
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { config } = useSystemConfig();

  // Fetch plans from Supabase
  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching plans:', error);
        return;
      }

      const formattedPlans: Plan[] = data.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        value: plan.value,
        validityDays: plan.validity_days,
        category: plan.category as Plan['category'],
        isActive: plan.is_active,
        createdBy: plan.created_by,
        features: plan.features as string[] || [],
        appConfig: plan.app_config ? plan.app_config as Plan['appConfig'] : {
          appName: 'App Padrão',
          hasApp: false
        }
      }));

      setPlans(formattedPlans);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchPlans:', error);
      setIsLoading(false);
    }
  };

  // Fetch only pending deliveries - optimized for dashboard
  const fetchPendingDeliveries = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('status', 'pending_code_delivery')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending deliveries:', error);
        setIsLoading(false);
        return;
      }

      const formattedPurchases: Purchase[] = data.map(purchase => ({
        id: purchase.id,
        customerId: purchase.customer_id,
        planId: purchase.plan_id,
        rechargeCode: purchase.recharge_code,
        amount: purchase.amount,
        status: purchase.status as Purchase['status'],
        paymentMethod: purchase.payment_method as Purchase['paymentMethod'],
        paymentId: purchase.payment_id,
        createdAt: new Date(purchase.created_at),
        approvedAt: purchase.approved_at ? new Date(purchase.approved_at) : undefined,
        expiresAt: new Date(purchase.expires_at),
        notificationsSent: [],
        resellerId: purchase.reseller_id,
        commission: purchase.commission as Purchase['commission'],
        codeDeliveryFailureReason: purchase.code_delivery_failure_reason || undefined,
        assignedCodeId: purchase.assigned_code_id || undefined,
        customerData: purchase.customer_data as Purchase['customerData'],
        expiryReminders: purchase.expiry_reminders as Purchase['expiryReminders']
      }));

      setPendingDeliveries(formattedPurchases);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchPendingDeliveries:', error);
      setIsLoading(false);
    }
  };

  // Add new plan
  const addPlan = async (planData: Omit<Plan, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .insert({
          name: planData.name,
          description: planData.description,
          value: planData.value,
          validity_days: planData.validityDays,
          category: planData.category,
          is_active: planData.isActive,
          created_by: planData.createdBy,
          features: planData.features || [],
          app_config: planData.appConfig || {
            appName: 'App Padrão',
            hasApp: false
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding plan:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Update local state
      const newPlan: Plan = {
        id: data.id,
        name: data.name,
        description: data.description,
        value: data.value,
        validityDays: data.validity_days,
        category: data.category as Plan['category'],
        isActive: data.is_active,
        createdBy: data.created_by,
        features: data.features as string[] || [],
        appConfig: data.app_config as Plan['appConfig']
      };
      
      setPlans(prev => [newPlan, ...prev]);
      
      return data;
    } catch (error) {
      console.error('Error in addPlan:', error);
      throw error;
    }
  };

  // Edit plan
  const editPlan = async (id: string, planData: Partial<Plan>) => {
    try {
      const updateData: any = {};
      
      if (planData.name !== undefined) updateData.name = planData.name;
      if (planData.description !== undefined) updateData.description = planData.description;
      if (planData.value !== undefined) updateData.value = planData.value;
      if (planData.validityDays !== undefined) updateData.validity_days = planData.validityDays;
      if (planData.category !== undefined) updateData.category = planData.category;
      if (planData.isActive !== undefined) updateData.is_active = planData.isActive;
      if (planData.features !== undefined) updateData.features = planData.features;
      if (planData.appConfig !== undefined) updateData.app_config = planData.appConfig;

      const { data, error } = await supabase
        .from('plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error editing plan:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Update in state
      setPlans(prev => prev.map(plan => 
        plan.id === id 
          ? {
              ...plan,
              ...planData,
              isActive: planData.isActive !== undefined ? planData.isActive : plan.isActive,
              category: planData.category as Plan['category'] || plan.category,
              appConfig: planData.appConfig || plan.appConfig
            } 
          : plan
      ));
      
      return data;
    } catch (error) {
      console.error('Error in editPlan:', error);
      throw error;
    }
  };

  // Delete plan
  const deletePlan = async (id: string) => {
    try {
      // First check if there are any codes associated with this plan
      const { data: codesData, error: codesError } = await supabase
        .from('recharge_codes')
        .select('id')
        .eq('plan_id', id)
        .limit(1);

      if (codesError) {
        console.error('Error checking codes:', codesError);
        throw new Error(handleSupabaseError(codesError));
      }

      if (codesData && codesData.length > 0) {
        throw new Error('Não é possível excluir um plano que possui códigos associados');
      }

      // Check if there are any purchases associated with this plan
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('id')
        .eq('plan_id', id)
        .limit(1);

      if (purchasesError) {
        console.error('Error checking purchases:', purchasesError);
        throw new Error(handleSupabaseError(purchasesError));
      }

      if (purchasesData && purchasesData.length > 0) {
        throw new Error('Não é possível excluir um plano que possui compras associadas');
      }

      // If no dependencies, delete the plan
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting plan:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Remove from state
      setPlans(prev => prev.filter(plan => plan.id !== id));
    } catch (error) {
      console.error('Error in deletePlan:', error);
      throw error;
    }
  };

  // Fetch recharge codes from Supabase with pagination
  const fetchCodes = async (page = 1, pageSize = 20, filters = {}) => {
    try {
      setIsLoading(true);
      
      let query = supabase.from('recharge_codes').select('*', { count: 'exact' });
      
      // Apply filters if provided
      if (filters.planId) {
        query = query.eq('plan_id', filters.planId);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.search) {
        query = query.ilike('code', `%${filters.search}%`);
      }
      
      // Get count first for pagination
      const countQuery = query.select('id', { head: true });
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Error counting codes:', countError);
        setIsLoading(false);
        return { codes: [], totalCount: 0 };
      }
      
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Get actual data with pagination
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching codes:', error);
        setIsLoading(false);
        return { codes: [], totalCount: 0 };
      }

      const formattedCodes: RechargeCode[] = data.map(code => ({
        id: code.id,
        code: code.code,
        value: code.value,
        status: code.status as RechargeCode['status'],
        createdAt: new Date(code.created_at),
        soldAt: code.sold_at ? new Date(code.sold_at) : undefined,
        expiresAt: new Date(code.expires_at),
        planId: code.plan_id,
        appName: code.app_name
      }));

      setCodes(formattedCodes);
      setIsLoading(false);
      
      return {
        codes: formattedCodes,
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error in fetchCodes:', error);
      setIsLoading(false);
      return { codes: [], totalCount: 0 };
    }
  };

  // Fetch purchases from Supabase with pagination
  const fetchPurchases = async (page = 1, pageSize = 20, filters = {}) => {
    try {
      setIsLoading(true);
      
      let query = supabase.from('purchases').select('*', { count: 'exact' });
      
      // Apply filters if provided
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      
      if (filters.planId) {
        query = query.eq('plan_id', filters.planId);
      }
      
      if (filters.resellerId) {
        query = query.eq('reseller_id', filters.resellerId);
      }
      
      // Get count first for pagination
      const countQuery = query.select('id', { head: true });
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Error counting purchases:', countError);
        setIsLoading(false);
        return { purchases: [], totalCount: 0 };
      }
      
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Get actual data with pagination
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching purchases:', error);
        setIsLoading(false);
        return { purchases: [], totalCount: 0 };
      }

      const formattedPurchases: Purchase[] = data.map(purchase => ({
        id: purchase.id,
        customerId: purchase.customer_id,
        planId: purchase.plan_id,
        rechargeCode: purchase.recharge_code,
        amount: purchase.amount,
        status: purchase.status as Purchase['status'],
        paymentMethod: purchase.payment_method as Purchase['paymentMethod'],
        paymentId: purchase.payment_id,
        createdAt: new Date(purchase.created_at),
        approvedAt: purchase.approved_at ? new Date(purchase.approved_at) : undefined,
        expiresAt: new Date(purchase.expires_at),
        notificationsSent: [],
        resellerId: purchase.reseller_id,
        commission: purchase.commission as Purchase['commission'],
        codeDeliveryFailureReason: purchase.code_delivery_failure_reason || undefined,
        assignedCodeId: purchase.assigned_code_id || undefined,
        customerData: purchase.customer_data as Purchase['customerData'],
        expiryReminders: purchase.expiry_reminders as Purchase['expiryReminders']
      }));

      // Update different state variables based on status
      setAllPurchases(formattedPurchases);
      setPendingDeliveries(formattedPurchases.filter(p => p.status === 'pending_code_delivery'));
      setIsLoading(false);
      
      return {
        purchases: formattedPurchases,
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error in fetchPurchases:', error);
      setIsLoading(false);
      return { purchases: [], totalCount: 0 };
    }
  };

  // Import codes to Supabase
  const importCodes = async (planId: string, codeStrings: string[]) => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plano não encontrado');
      }

      // Verificar se o plano tem appConfig e appName
      const appName = plan.appConfig?.appName || 'App Padrão';

      const newCodes = codeStrings.map(codeString => ({
        code: codeString.toUpperCase(),
        value: plan.value,
        status: 'available' as const,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan_id: plan.id,
        app_name: appName,
      }));

      const { data, error } = await supabase
        .from('recharge_codes')
        .insert(newCodes)
        .onConflict('code')  // Especificar a coluna que deve ser usada para detectar conflitos
        .doNothing()         // Não fazer nada em caso de conflito (ignore)
        .select();

      if (error) {
        console.error('Error importing codes:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Only update local state with newly added codes
      if (data && data.length > 0) {
        const formattedNewCodes: RechargeCode[] = data.map(code => ({
          id: code.id,
          code: code.code,
          value: code.value,
          status: code.status as RechargeCode['status'],
          createdAt: new Date(code.created_at),
          soldAt: code.sold_at ? new Date(code.sold_at) : undefined,
          expiresAt: new Date(code.expires_at),
          planId: code.plan_id,
          appName: code.app_name
        }));
        
        setCodes(prev => [...formattedNewCodes, ...prev]);
      }
      
      // Retornar os dados e informações sobre a importação
      return {
        data: data || [],
        insertedCount: data?.length || 0,
        totalCount: codeStrings.length
      };
    } catch (error) {
      console.error('Error in importCodes:', error);
      throw error;
    }
  };

  // Sell codes (assign to customer)
  const sellCodes = async (planId: string, customerInfo: Sale['customerInfo']) => {
    try {
      // Find an available code for the specified plan
      const availableCode = codes.find(c => c.planId === planId && c.status === 'available');
      
      if (!availableCode) {
        return {
          success: false,
          reason: 'code_unavailable',
          message: 'Nenhum código disponível para este plano'
        };
      }

      // Update code status to sold
      const { error: updateError } = await supabase
        .from('recharge_codes')
        .update({ 
          status: 'sold',
          sold_at: new Date().toISOString()
        })
        .eq('id', availableCode.id);

      if (updateError) {
        console.error('Error updating code status:', updateError);
        throw new Error(handleSupabaseError(updateError));
      }

      // Create purchase record
      const newPurchase = {
        customer_id: `customer-${Date.now()}`, // This should be a real customer ID
        plan_id: planId,
        recharge_code: availableCode.code,
        amount: availableCode.value,
        status: 'approved' as const,
        payment_method: 'credit_card' as const,
        payment_id: `pay-${Date.now()}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        reseller_id: 'system', // This should be the actual reseller ID
        customer_data: {
          name: customerInfo.name,
          email: customerInfo.email || '',
          phone: customerInfo.phone,
          cpf: ''
        },
        expiry_reminders: {
          reminder3Days: { sent: false },
          reminder1Day: { sent: false },
          reminderToday: { sent: false }
        }
      };

      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert(newPurchase)
        .select()
        .single();

      if (purchaseError) {
        console.error('Error creating purchase:', purchaseError);
        throw new Error(handleSupabaseError(purchaseError));
      }

      // Update local state
      setCodes(prev => prev.map(c => 
        c.id === availableCode.id 
          ? { ...c, status: 'sold', soldAt: new Date() }
          : c
      ));
      
      const formattedPurchase: Purchase = {
        id: purchaseData.id,
        customerId: purchaseData.customer_id,
        planId: purchaseData.plan_id,
        rechargeCode: purchaseData.recharge_code,
        amount: purchaseData.amount,
        status: purchaseData.status as Purchase['status'],
        paymentMethod: purchaseData.payment_method as Purchase['paymentMethod'],
        paymentId: purchaseData.payment_id,
        createdAt: new Date(purchaseData.created_at),
        approvedAt: purchaseData.approved_at ? new Date(purchaseData.approved_at) : new Date(),
        expiresAt: new Date(purchaseData.expires_at),
        notificationsSent: [],
        resellerId: purchaseData.reseller_id,
        commission: purchaseData.commission as Purchase['commission'],
        customerData: purchaseData.customer_data as Purchase['customerData'],
        expiryReminders: purchaseData.expiry_reminders as Purchase['expiryReminders']
      };
      
      setAllPurchases(prev => [formattedPurchase, ...prev]);

      return {
        success: true,
        code: availableCode,
        purchase: formattedPurchase
      };
    } catch (error) {
      console.error('Error in sellCodes:', error);
      throw error;
    }
  };

  // Assign code to pending purchase
  const assignCodeToPurchase = async (purchaseId: string, codeId: string) => {
    try {
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
      const { error: purchaseError } = await supabase
        .from('purchases')
        .update({
          status: 'approved',
          recharge_code: code.code,
          assigned_code_id: code.id,
          approved_at: new Date().toISOString(),
          expiry_reminders: {
            reminder3Days: { sent: false },
            reminder1Day: { sent: false },
            reminderToday: { sent: false }
          }
        })
        .eq('id', purchaseId);

      if (purchaseError) {
        console.error('Error updating purchase:', purchaseError);
        throw new Error(handleSupabaseError(purchaseError));
      }

      // Update the code
      const { error: codeError } = await supabase
        .from('recharge_codes')
        .update({ 
          status: 'sold',
          sold_at: new Date().toISOString()
        })
        .eq('id', codeId);

      if (codeError) {
        console.error('Error updating code:', codeError);
        throw new Error(handleSupabaseError(codeError));
      }

      // Update local state
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
      
      setCodes(prev => prev.map(c => 
        c.id === codeId 
          ? { ...c, status: 'sold' as const, soldAt: new Date() }
          : c
      ));
      
      setPendingDeliveries(prev => prev.filter(p => p.id !== purchaseId));
      setAllPurchases(prev => [
        updatedPurchase,
        ...prev.filter(p => p.id !== purchaseId)
      ]);

      return {
        success: true,
        purchase: updatedPurchase,
        code
      };
    } catch (error) {
      console.error('Error in assignCodeToPurchase:', error);
      throw error;
    }
  };

  // Add pending code delivery
  const addPendingCodeDelivery = async (purchase: Omit<Purchase, 'id' | 'createdAt' | 'expiresAt'>) => {
    try {
      const newPurchase = {
        customer_id: purchase.customerId,
        plan_id: purchase.planId,
        recharge_code: purchase.rechargeCode || '',
        amount: purchase.amount,
        status: 'pending_code_delivery' as const,
        payment_method: purchase.paymentMethod,
        payment_id: purchase.paymentId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        reseller_id: purchase.resellerId,
        code_delivery_failure_reason: purchase.codeDeliveryFailureReason,
        customer_data: purchase.customerData,
        expiry_reminders: {
          reminder3Days: { sent: false },
          reminder1Day: { sent: false },
          reminderToday: { sent: false }
        }
      };

      const { data, error } = await supabase
        .from('purchases')
        .insert(newPurchase)
        .select()
        .single();

      if (error) {
        console.error('Error creating pending delivery:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Format the new purchase
      const formattedPurchase: Purchase = {
        id: data.id,
        customerId: data.customer_id,
        planId: data.plan_id,
        rechargeCode: data.recharge_code,
        amount: data.amount,
        status: data.status as Purchase['status'],
        paymentMethod: data.payment_method as Purchase['paymentMethod'],
        paymentId: data.payment_id,
        createdAt: new Date(data.created_at),
        approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
        expiresAt: new Date(data.expires_at),
        notificationsSent: [],
        resellerId: data.reseller_id,
        commission: data.commission as Purchase['commission'],
        codeDeliveryFailureReason: data.code_delivery_failure_reason || undefined,
        assignedCodeId: data.assigned_code_id || undefined,
        customerData: data.customer_data as Purchase['customerData'],
        expiryReminders: data.expiry_reminders as Purchase['expiryReminders']
      };
      
      // Update local state
      setPendingDeliveries(prev => [formattedPurchase, ...prev]);
      setAllPurchases(prev => [formattedPurchase, ...prev]);
      
      return formattedPurchase;
    } catch (error) {
      console.error('Error in addPendingCodeDelivery:', error);
      throw error;
    }
  };

  // Check and send expiry reminders
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

      // Determine which reminder to send
      if (daysUntilExpiry === 3 && !purchase.expiryReminders?.reminder3Days?.sent) {
        reminderType = 'reminder3Days';
      } else if (daysUntilExpiry === 1 && !purchase.expiryReminders?.reminder1Day?.sent) {
        reminderType = 'reminder1Day';
      } else if (daysUntilExpiry === 0 && !purchase.expiryReminders?.reminderToday?.sent) {
        reminderType = 'reminderToday';
      }

      if (!reminderType || !purchase.customerData) continue;

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
          const updatedReminders = {
            ...purchase.expiryReminders,
            [reminderType]: {
              sent: true,
              sentAt: new Date().toISOString(),
              messageId: whatsappResult.messageId
            }
          };

          await supabase
            .from('purchases')
            .update({ expiry_reminders: updatedReminders })
            .eq('id', purchase.id);

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
      activePlans: plans.length,
      pendingPayments: 0,
      expiringToday,
      conversionRate: 0,
      averageTicket: 0,
      pendingCodeDeliveries: pendingDeliveries.length
    };
  };

  return {
    codes,
    sales,
    pendingDeliveries,
    allPurchases,
    plans,
    isLoading,
    importCodes,
    sellCodes,
    getStats,
    assignCodeToPurchase,
    addPendingCodeDelivery,
    checkAndSendExpiryReminders,
    fetchPlans,
    fetchCodes,
    fetchPurchases,
    fetchPendingDeliveries,
    addPlan,
    editPlan,
    deletePlan
  };
};