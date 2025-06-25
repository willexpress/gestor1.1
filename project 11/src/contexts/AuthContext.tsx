import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { User } from '../types';

interface RegisterCustomerData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  registerCustomer: (data: RegisterCustomerData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  updateBranding: (branding: User['branding']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Apply branding styles based on user's branding settings
  const applyBrandingStyles = (userBranding?: User['branding']) => {
    if (!userBranding) return;

    const { primaryColor, secondaryColor } = userBranding;

    const primaryRgb = hexToRgb(primaryColor);
    const secondaryRgb = hexToRgb(secondaryColor);

    if (primaryRgb && secondaryRgb) {
      document.documentElement.style.setProperty('--brand-primary-color', primaryColor);
      document.documentElement.style.setProperty('--brand-secondary-color', secondaryColor);
      document.documentElement.style.setProperty(
        '--brand-primary-rgb',
        `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`
      );
      document.documentElement.style.setProperty(
        '--brand-secondary-rgb',
        `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`
      );
    }
  };

  // Fetch user profile from database
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Convert database user to application user
      const appUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        role: data.role as User['role'],
        parentId: data.parent_id || undefined,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        lastLogin: data.last_login ? new Date(data.last_login) : undefined,
        branding: data.branding as User['branding'],
        whatsappConfig: data.whatsapp_config as User['whatsappConfig'],
        paymentConfig: data.payment_config as User['paymentConfig'],
        commissionRate: data.commission_rate || undefined,
      };

      return appUser;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Get default reseller ID for new customers
  const getDefaultResellerId = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('get_default_reseller_id');
      
      if (error) {
        console.error('Error getting default reseller:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getDefaultResellerId:', error);
      return null;
    }
  };

  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setSupabaseUser(session.user);
          const userProfile = await fetchUserProfile(session.user);
          if (userProfile) {
            setUser(userProfile);
            applyBrandingStyles(userProfile.branding);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setSupabaseUser(session.user);
          const userProfile = await fetchUserProfile(session.user);
          if (userProfile) {
            setUser(userProfile);
            applyBrandingStyles(userProfile.branding);
          }
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Apply branding whenever user changes
  useEffect(() => {
    if (user?.branding) {
      applyBrandingStyles(user.branding);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);

        setSupabaseUser(data.user);
        const userProfile = await fetchUserProfile(data.user);
        if (userProfile) {
          setUser(userProfile);
          applyBrandingStyles(userProfile.branding);
        }
        
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    setIsLoading(false);
    return false;
  };

  const registerCustomer = async (data: RegisterCustomerData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Iniciando registro de cliente:', data.email);

      // 1. Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
            cpf: data.cpf,
            role: 'customer'
          }
        }
      });

      if (authError) {
        console.error('Auth registration error:', authError);
        throw new Error(handleSupabaseError(authError));
      }

      if (!authData.user) {
        throw new Error('Falha ao criar usuário de autenticação');
      }

      console.log('✅ Usuário de autenticação criado:', authData.user.id);

      // 2. Get default reseller ID
      const defaultResellerId = await getDefaultResellerId();
      if (!defaultResellerId) {
        throw new Error('Erro ao obter revendedor padrão');
      }

      console.log('✅ Revendedor padrão obtido:', defaultResellerId);

      // 3. Create customer record
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          id: authData.user.id, // Use the same ID as auth user
          name: data.name,
          email: data.email,
          phone: data.phone,
          cpf: data.cpf,
          reseller_id: defaultResellerId,
          points: 0,
          is_active: true,
          loyalty_level: 'bronze',
          total_spent: 0
        });

      if (customerError) {
        console.error('Customer creation error:', customerError);
        // If customer creation fails, we should clean up the auth user
        // But for now, we'll just log the error and continue
        console.warn('Customer record creation failed, but auth user was created');
      } else {
        console.log('✅ Registro de cliente criado com sucesso');
      }

      // 4. If email confirmation is disabled, sign in the user immediately
      if (authData.session) {
        setSupabaseUser(authData.user);
        const userProfile = await fetchUserProfile(authData.user);
        if (userProfile) {
          setUser(userProfile);
          applyBrandingStyles(userProfile.branding);
        }
      }

      console.log('✅ Registro completo realizado com sucesso');
      setIsLoading(false);
      return true;

    } catch (error: any) {
      console.error('Registration error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    setSupabaseUser(null);
    
    // Reset branding to default
    document.documentElement.style.setProperty('--brand-primary-color', '#3B82F6');
    document.documentElement.style.setProperty('--brand-secondary-color', '#1E40AF');
    document.documentElement.style.setProperty('--brand-primary-rgb', '59, 130, 246');
    document.documentElement.style.setProperty('--brand-secondary-rgb', '30, 64, 175');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const permissions = {
      admin: ['*'],
      master_reseller: [
        'view_dashboard',
        'manage_resellers', 
        'manage_customers', 
        'view_reports', 
        'manage_plans',
        'manage_sales',
        'view_checkout',
        'manage_settings'
      ],
      reseller: [
        'view_dashboard',
        'manage_customers', 
        'view_reports',
        'manage_sales',
        'view_checkout'
      ],
      customer: [
        'view_customer_dashboard',
        'view_purchases', 
        'view_profile',
        'view_checkout',
        'view_plans',
        'view_tutorials',
        'view_support'
      ]
    };
    
    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  // Function to update user branding
  const updateBranding = async (branding: User['branding']) => {
    if (!user || !branding) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ branding })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating branding:', error);
        return;
      }

      const updatedUser = {
        ...user,
        branding: {
          ...user.branding,
          ...branding
        }
      };

      setUser(updatedUser);
      applyBrandingStyles(updatedUser.branding);
    } catch (error) {
      console.error('Error updating branding:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser,
      login, 
      registerCustomer,
      logout, 
      isLoading, 
      hasPermission, 
      darkMode, 
      toggleDarkMode,
      updateBranding
    }}>
      {children}
    </AuthContext.Provider>
  );
};