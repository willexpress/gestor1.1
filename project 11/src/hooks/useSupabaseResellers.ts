import { useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Reseller, Customer } from '../types';

export const useSupabaseResellers = () => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch resellers from Supabase
  const fetchResellers = async () => {
    try {
      setIsLoading(true);
      
      // First get resellers
      const { data: resellersData, error: resellersError } = await supabase
        .from('resellers')
        .select('*')
        .order('created_at', { ascending: false });

      if (resellersError) {
        console.error('Error fetching resellers:', resellersError);
        throw new Error(handleSupabaseError(resellersError));
      }

      // Then get customers for each reseller by matching with users table
      const resellersWithCustomers = await Promise.all(
        resellersData.map(async (reseller) => {
          // Find the corresponding user for this reseller
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', reseller.email)
            .single();

          let customers: Customer[] = [];
          
          if (!userError && userData) {
            // Get customers for this user
            const { data: customersData, error: customersError } = await supabase
              .from('customers')
              .select('*')
              .eq('reseller_id', userData.id);

            if (!customersError && customersData) {
              customers = customersData.map((customer: any) => ({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                cpf: customer.cpf,
                points: customer.points,
                isActive: customer.is_active,
                createdAt: new Date(customer.created_at),
                resellerId: customer.reseller_id,
                loyaltyLevel: customer.loyalty_level as Customer['loyaltyLevel'],
                totalSpent: customer.total_spent,
                purchases: [],
                invoices: []
              }));
            }
          }

          return {
            id: reseller.id,
            name: reseller.name,
            email: reseller.email,
            phone: reseller.phone,
            cpf: reseller.cpf,
            parentId: reseller.parent_id || undefined,
            role: reseller.role as Reseller['role'],
            isActive: reseller.is_active,
            createdAt: new Date(reseller.created_at),
            commissionRate: reseller.commission_rate,
            totalSales: reseller.total_sales,
            totalCommission: reseller.total_commission,
            branding: reseller.branding as Reseller['branding'],
            whatsappConfig: reseller.whatsapp_config as Reseller['whatsappConfig'],
            customers,
            subResellers: []
          };
        })
      );

      setResellers(resellersWithCustomers);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchResellers:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Add new reseller
  const addReseller = async (resellerData: Omit<Reseller, 'id' | 'createdAt' | 'customers' | 'subResellers'>) => {
    try {
      const { data, error } = await supabase
        .from('resellers')
        .insert({
          name: resellerData.name,
          email: resellerData.email,
          phone: resellerData.phone,
          cpf: resellerData.cpf,
          parent_id: resellerData.parentId || null,
          role: resellerData.role,
          is_active: resellerData.isActive,
          commission_rate: resellerData.commissionRate,
          total_sales: resellerData.totalSales || 0,
          total_commission: resellerData.totalCommission || 0,
          branding: resellerData.branding,
          whatsapp_config: resellerData.whatsappConfig || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding reseller:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Refresh resellers list
      await fetchResellers();
      return data;
    } catch (error) {
      console.error('Error in addReseller:', error);
      throw error;
    }
  };

  // Edit reseller
  const editReseller = async (id: string, resellerData: Partial<Reseller>) => {
    try {
      const updateData: any = {};
      
      if (resellerData.name !== undefined) updateData.name = resellerData.name;
      if (resellerData.email !== undefined) updateData.email = resellerData.email;
      if (resellerData.phone !== undefined) updateData.phone = resellerData.phone;
      if (resellerData.cpf !== undefined) updateData.cpf = resellerData.cpf;
      if (resellerData.parentId !== undefined) updateData.parent_id = resellerData.parentId;
      if (resellerData.role !== undefined) updateData.role = resellerData.role;
      if (resellerData.isActive !== undefined) updateData.is_active = resellerData.isActive;
      if (resellerData.commissionRate !== undefined) updateData.commission_rate = resellerData.commissionRate;
      if (resellerData.totalSales !== undefined) updateData.total_sales = resellerData.totalSales;
      if (resellerData.totalCommission !== undefined) updateData.total_commission = resellerData.totalCommission;
      if (resellerData.branding !== undefined) updateData.branding = resellerData.branding;
      if (resellerData.whatsappConfig !== undefined) updateData.whatsapp_config = resellerData.whatsappConfig;

      const { error } = await supabase
        .from('resellers')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error editing reseller:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Refresh resellers list
      await fetchResellers();
    } catch (error) {
      console.error('Error in editReseller:', error);
      throw error;
    }
  };

  // Promote reseller to master
  const promoteToMaster = async (resellerId: string) => {
    try {
      const { error } = await supabase
        .from('resellers')
        .update({
          role: 'master_reseller',
          commission_rate: 15
        })
        .eq('id', resellerId);

      if (error) {
        console.error('Error promoting reseller:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Refresh resellers list
      await fetchResellers();
    } catch (error) {
      console.error('Error in promoteToMaster:', error);
      throw error;
    }
  };

  // Delete reseller
  const deleteReseller = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resellers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting reseller:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Refresh resellers list
      await fetchResellers();
    } catch (error) {
      console.error('Error in deleteReseller:', error);
      throw error;
    }
  };

  return {
    resellers,
    isLoading,
    addReseller,
    editReseller,
    promoteToMaster,
    deleteReseller,
    fetchResellers
  };
};