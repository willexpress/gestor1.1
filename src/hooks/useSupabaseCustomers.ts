import { useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Customer, Purchase } from '../types';

export const useSupabaseCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch customers from Supabase with pagination
  const fetchCustomers = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      setIsLoading(true);
      
      let query = supabase.from('customers');
      
      // Apply filters if provided
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }
      
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      
      if (filters.resellerId) {
        query = query.eq('reseller_id', filters.resellerId);
      }
      
      // Get total count for pagination
      const countQuery = query.select('id', { count: 'exact', head: true });
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Error counting customers:', countError);
        throw new Error(handleSupabaseError(countError));
      }
      
      setTotalCount(count || 0);
      
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await query
        .select(`
          *,
          purchases:purchases(*)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching customers:', error);
        throw new Error(handleSupabaseError(error));
      }

      const formattedCustomers: Customer[] = data.map(customer => ({
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
        purchases: customer.purchases?.map((purchase: any) => ({
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
        })) || [],
        invoices: [] // No invoices table in current schema
      }));

      setCustomers(formattedCustomers);
      setIsLoading(false);
      
      return {
        customers: formattedCustomers,
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error in fetchCustomers:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Add new customer
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'purchases' | 'invoices'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          cpf: customerData.cpf,
          points: customerData.points || 0,
          is_active: customerData.isActive,
          reseller_id: customerData.resellerId,
          loyalty_level: customerData.loyaltyLevel,
          total_spent: customerData.totalSpent || 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding customer:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Add the new customer to state without fetching all customers again
      const newCustomer: Customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        points: data.points,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        resellerId: data.reseller_id,
        loyaltyLevel: data.loyalty_level as Customer['loyaltyLevel'],
        totalSpent: data.total_spent,
        purchases: [],
        invoices: []
      };
      
      setCustomers(prev => [newCustomer, ...prev]);
      setTotalCount(prev => prev + 1);
      
      return data;
    } catch (error) {
      console.error('Error in addCustomer:', error);
      throw error;
    }
  };

  // Edit customer
  const editCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const updateData: any = {};
      
      if (customerData.name !== undefined) updateData.name = customerData.name;
      if (customerData.email !== undefined) updateData.email = customerData.email;
      if (customerData.phone !== undefined) updateData.phone = customerData.phone;
      if (customerData.cpf !== undefined) updateData.cpf = customerData.cpf;
      if (customerData.points !== undefined) updateData.points = customerData.points;
      if (customerData.isActive !== undefined) updateData.is_active = customerData.isActive;
      if (customerData.resellerId !== undefined) updateData.reseller_id = customerData.resellerId;
      if (customerData.loyaltyLevel !== undefined) updateData.loyalty_level = customerData.loyaltyLevel;
      if (customerData.totalSpent !== undefined) updateData.total_spent = customerData.totalSpent;

      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error editing customer:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Update the customer in state without fetching all customers again
      setCustomers(prev => prev.map(customer => 
        customer.id === id 
          ? { 
              ...customer, 
              ...customerData,
              isActive: customerData.isActive !== undefined ? customerData.isActive : customer.isActive,
              loyaltyLevel: customerData.loyaltyLevel as Customer['loyaltyLevel'] || customer.loyaltyLevel
            } 
          : customer
      ));
      
      return data;
    } catch (error) {
      console.error('Error in editCustomer:', error);
      throw error;
    }
  };

  // Delete customer
  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting customer:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Remove the customer from state without fetching all customers again
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error('Error in deleteCustomer:', error);
      throw error;
    }
  };

  return {
    customers,
    isLoading,
    totalCount,
    addCustomer,
    editCustomer,
    deleteCustomer,
    fetchCustomers
  };
};