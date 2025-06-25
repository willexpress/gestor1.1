export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string
          cpf: string
          role: 'admin' | 'master_reseller' | 'reseller' | 'customer'
          parent_id: string | null
          is_active: boolean
          created_at: string
          last_login: string | null
          branding: Json | null
          whatsapp_config: Json | null
          payment_config: Json | null
          commission_rate: number | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone: string
          cpf: string
          role?: 'admin' | 'master_reseller' | 'reseller' | 'customer'
          parent_id?: string | null
          is_active?: boolean
          created_at?: string
          last_login?: string | null
          branding?: Json | null
          whatsapp_config?: Json | null
          payment_config?: Json | null
          commission_rate?: number | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          cpf?: string
          role?: 'admin' | 'master_reseller' | 'reseller' | 'customer'
          parent_id?: string | null
          is_active?: boolean
          created_at?: string
          last_login?: string | null
          branding?: Json | null
          whatsapp_config?: Json | null
          payment_config?: Json | null
          commission_rate?: number | null
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          cpf: string
          points: number
          is_active: boolean
          created_at: string
          reseller_id: string
          loyalty_level: 'bronze' | 'silver' | 'gold' | 'platinum'
          total_spent: number
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          cpf: string
          points?: number
          is_active?: boolean
          created_at?: string
          reseller_id: string
          loyalty_level?: 'bronze' | 'silver' | 'gold' | 'platinum'
          total_spent?: number
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          cpf?: string
          points?: number
          is_active?: boolean
          created_at?: string
          reseller_id?: string
          loyalty_level?: 'bronze' | 'silver' | 'gold' | 'platinum'
          total_spent?: number
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          description: string
          value: number
          validity_days: number
          category: 'recharge' | 'master_qualification' | 'data_package' | 'app_plan'
          is_active: boolean
          created_by: string
          created_at: string
          features: Json | null
          app_config: Json
        }
        Insert: {
          id?: string
          name: string
          description: string
          value: number
          validity_days: number
          category?: 'recharge' | 'master_qualification' | 'data_package' | 'app_plan'
          is_active?: boolean
          created_by: string
          created_at?: string
          features?: Json | null
          app_config: Json
        }
        Update: {
          id?: string
          name?: string
          description?: string
          value?: number
          validity_days?: number
          category?: 'recharge' | 'master_qualification' | 'data_package' | 'app_plan'
          is_active?: boolean
          created_by?: string
          created_at?: string
          features?: Json | null
          app_config?: Json
        }
      }
      recharge_codes: {
        Row: {
          id: string
          code: string
          value: number
          status: 'available' | 'sold' | 'expired'
          created_at: string
          sold_at: string | null
          expires_at: string
          plan_id: string
          app_name: string
        }
        Insert: {
          id?: string
          code: string
          value: number
          status?: 'available' | 'sold' | 'expired'
          created_at?: string
          sold_at?: string | null
          expires_at: string
          plan_id: string
          app_name: string
        }
        Update: {
          id?: string
          code?: string
          value?: number
          status?: 'available' | 'sold' | 'expired'
          created_at?: string
          sold_at?: string | null
          expires_at?: string
          plan_id?: string
          app_name?: string
        }
      }
      purchases: {
        Row: {
          id: string
          customer_id: string
          plan_id: string
          recharge_code: string
          amount: number
          status: 'pending' | 'approved' | 'rejected' | 'expired' | 'pending_code_delivery'
          payment_method: 'credit_card' | 'pix'
          payment_id: string
          created_at: string
          approved_at: string | null
          expires_at: string
          reseller_id: string
          commission: Json | null
          code_delivery_failure_reason: string | null
          assigned_code_id: string | null
          customer_data: Json | null
          expiry_reminders: Json | null
        }
        Insert: {
          id?: string
          customer_id: string
          plan_id: string
          recharge_code?: string
          amount: number
          status?: 'pending' | 'approved' | 'rejected' | 'expired' | 'pending_code_delivery'
          payment_method: 'credit_card' | 'pix'
          payment_id: string
          created_at?: string
          approved_at?: string | null
          expires_at: string
          reseller_id: string
          commission?: Json | null
          code_delivery_failure_reason?: string | null
          assigned_code_id?: string | null
          customer_data?: Json | null
          expiry_reminders?: Json | null
        }
        Update: {
          id?: string
          customer_id?: string
          plan_id?: string
          recharge_code?: string
          amount?: number
          status?: 'pending' | 'approved' | 'rejected' | 'expired' | 'pending_code_delivery'
          payment_method?: 'credit_card' | 'pix'
          payment_id?: string
          created_at?: string
          approved_at?: string | null
          expires_at?: string
          reseller_id?: string
          commission?: Json | null
          code_delivery_failure_reason?: string | null
          assigned_code_id?: string | null
          customer_data?: Json | null
          expiry_reminders?: Json | null
        }
      }
      resellers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          cpf: string
          parent_id: string | null
          role: 'reseller' | 'master_reseller'
          is_active: boolean
          created_at: string
          commission_rate: number
          total_sales: number
          total_commission: number
          branding: Json
          whatsapp_config: Json | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          cpf: string
          parent_id?: string | null
          role?: 'reseller' | 'master_reseller'
          is_active?: boolean
          created_at?: string
          commission_rate: number
          total_sales?: number
          total_commission?: number
          branding: Json
          whatsapp_config?: Json | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          cpf?: string
          parent_id?: string | null
          role?: 'reseller' | 'master_reseller'
          is_active?: boolean
          created_at?: string
          commission_rate?: number
          total_sales?: number
          total_commission?: number
          branding?: Json
          whatsapp_config?: Json | null
        }
      }
      message_templates: {
        Row: {
          id: string
          type: 'purchase_confirmation' | 'expiry_reminder_3d' | 'expiry_reminder_1d' | 'expiry_reminder_0d'
          title: string
          content: string
          variables: string[]
          user_id: string
          is_active: boolean
          channels: string[]
          created_at: string
        }
        Insert: {
          id?: string
          type: 'purchase_confirmation' | 'expiry_reminder_3d' | 'expiry_reminder_1d' | 'expiry_reminder_0d'
          title: string
          content: string
          variables: string[]
          user_id: string
          is_active?: boolean
          channels: string[]
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'purchase_confirmation' | 'expiry_reminder_3d' | 'expiry_reminder_1d' | 'expiry_reminder_0d'
          title?: string
          content?: string
          variables?: string[]
          user_id?: string
          is_active?: boolean
          channels?: string[]
          created_at?: string
        }
      }
      system_config: {
        Row: {
          id: string
          payment_gateways: Json
          whatsapp_integration: Json
          email_config: Json
          master_reseller_requirements: Json
          loyalty_program: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          payment_gateways: Json
          whatsapp_integration: Json
          email_config: Json
          master_reseller_requirements: Json
          loyalty_program: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          payment_gateways?: Json
          whatsapp_integration?: Json
          email_config?: Json
          master_reseller_requirements?: Json
          loyalty_program?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}