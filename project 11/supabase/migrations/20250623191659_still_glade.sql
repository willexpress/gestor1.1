/*
  # Create Initial Schema for Recharge System

  1. New Tables
    - `users` - User accounts with roles and authentication
    - `customers` - Customer information and loyalty data
    - `plans` - Recharge plans and app configurations
    - `recharge_codes` - Available and sold recharge codes
    - `purchases` - Purchase transactions and history
    - `resellers` - Reseller network management
    - `message_templates` - Customizable message templates
    - `system_config` - System-wide configuration settings

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure customer data access

  3. Indexes
    - Add performance indexes for common queries
    - Foreign key constraints for data integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  cpf text NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'master_reseller', 'reseller', 'customer')),
  parent_id uuid REFERENCES users(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  branding jsonb,
  whatsapp_config jsonb,
  payment_config jsonb,
  commission_rate decimal(5,2)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  cpf text NOT NULL,
  points integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  reseller_id uuid NOT NULL REFERENCES users(id),
  loyalty_level text DEFAULT 'bronze' CHECK (loyalty_level IN ('bronze', 'silver', 'gold', 'platinum')),
  total_spent decimal(10,2) DEFAULT 0
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  value decimal(10,2) NOT NULL,
  validity_days integer NOT NULL,
  category text DEFAULT 'recharge' CHECK (category IN ('recharge', 'master_qualification', 'data_package', 'app_plan')),
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  features jsonb,
  app_config jsonb NOT NULL
);

-- Recharge codes table
CREATE TABLE IF NOT EXISTS recharge_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  value decimal(10,2) NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'sold', 'expired')),
  created_at timestamptz DEFAULT now(),
  sold_at timestamptz,
  expires_at timestamptz NOT NULL,
  plan_id uuid NOT NULL REFERENCES plans(id),
  app_name text NOT NULL
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  plan_id uuid NOT NULL REFERENCES plans(id),
  recharge_code text DEFAULT '',
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'pending_code_delivery')),
  payment_method text NOT NULL CHECK (payment_method IN ('credit_card', 'pix')),
  payment_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  expires_at timestamptz NOT NULL,
  reseller_id uuid NOT NULL REFERENCES users(id),
  commission jsonb,
  code_delivery_failure_reason text,
  assigned_code_id uuid REFERENCES recharge_codes(id),
  customer_data jsonb,
  expiry_reminders jsonb
);

-- Resellers table
CREATE TABLE IF NOT EXISTS resellers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  cpf text NOT NULL,
  parent_id uuid REFERENCES resellers(id),
  role text DEFAULT 'reseller' CHECK (role IN ('reseller', 'master_reseller')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  commission_rate decimal(5,2) NOT NULL,
  total_sales decimal(10,2) DEFAULT 0,
  total_commission decimal(10,2) DEFAULT 0,
  branding jsonb NOT NULL,
  whatsapp_config jsonb
);

-- Message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('purchase_confirmation', 'expiry_reminder_3d', 'expiry_reminder_1d', 'expiry_reminder_0d')),
  title text NOT NULL,
  content text NOT NULL,
  variables text[] NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  is_active boolean DEFAULT true,
  channels text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- System config table
CREATE TABLE IF NOT EXISTS system_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_gateways jsonb NOT NULL,
  whatsapp_integration jsonb NOT NULL,
  email_config jsonb NOT NULL,
  master_reseller_requirements jsonb NOT NULL,
  loyalty_program jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_customers_reseller_id ON customers(reseller_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_plans_category ON plans(category);
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_recharge_codes_plan_id ON recharge_codes(plan_id);
CREATE INDEX IF NOT EXISTS idx_recharge_codes_status ON recharge_codes(status);
CREATE INDEX IF NOT EXISTS idx_purchases_customer_id ON purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_plan_id ON purchases(plan_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_reseller_id ON purchases(reseller_id);
CREATE INDEX IF NOT EXISTS idx_resellers_parent_id ON resellers(parent_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(type);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS Policies for customers table
CREATE POLICY "Resellers can manage their customers" ON customers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role IN ('admin', 'master_reseller', 'reseller'))
      AND (users.role = 'admin' OR customers.reseller_id = users.id)
    )
  );

CREATE POLICY "Customers can read own data" ON customers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'customer'
      AND customers.email = users.email
    )
  );

-- RLS Policies for plans table
CREATE POLICY "Everyone can read active plans" ON plans
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins and masters can manage plans" ON plans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'master_reseller')
    )
  );

-- RLS Policies for recharge_codes table
CREATE POLICY "Admins and resellers can manage codes" ON recharge_codes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'master_reseller', 'reseller')
    )
  );

-- RLS Policies for purchases table
CREATE POLICY "Users can read relevant purchases" ON purchases
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (
        users.role = 'admin' OR
        (users.role IN ('master_reseller', 'reseller') AND purchases.reseller_id = users.id) OR
        (users.role = 'customer' AND EXISTS (
          SELECT 1 FROM customers 
          WHERE customers.id = purchases.customer_id 
          AND customers.email = users.email
        ))
      )
    )
  );

CREATE POLICY "Resellers can create purchases" ON purchases
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'master_reseller', 'reseller')
    )
  );

CREATE POLICY "Resellers can update their purchases" ON purchases
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR purchases.reseller_id = users.id)
    )
  );

-- RLS Policies for resellers table
CREATE POLICY "Resellers can read network data" ON resellers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'master_reseller', 'reseller')
    )
  );

CREATE POLICY "Admins and masters can manage resellers" ON resellers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'master_reseller')
    )
  );

-- RLS Policies for message_templates table
CREATE POLICY "Users can manage own templates" ON message_templates
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for system_config table
CREATE POLICY "Admins can manage system config" ON system_config
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Insert default system configuration
INSERT INTO system_config (
  payment_gateways,
  whatsapp_integration,
  email_config,
  master_reseller_requirements,
  loyalty_program
) VALUES (
  '{"pagarme": {"apiKey": "", "secretKey": "", "isActive": false}, "appmax": {"apiKey": "", "secretKey": "", "isActive": false}, "pushinpay": {"apiKey": "", "secretKey": "", "isActive": false}, "shipay": {"apiKey": "", "secretKey": "", "isActive": false}, "activeGateway": "pagarme"}',
  '{"zapiApiKey": "", "defaultInstanceId": "", "isActive": false}',
  '{"smtpHost": "", "smtpPort": 587, "smtpUser": "", "smtpPassword": "", "fromEmail": "", "fromName": "Sistema de Recarga"}',
  '{"minimumPurchaseAmount": 1000, "requiredProductId": "", "commissionRate": 15}',
  '{"isActive": true, "pointsPerReal": 1, "redemptionRate": 100}'
) ON CONFLICT (id) DO NOTHING;

-- Insert default message templates
INSERT INTO message_templates (type, title, content, variables, user_id, channels) VALUES
(
  'purchase_confirmation',
  'Confirmação de Compra Padrão',
  'Olá {{customerName}}! 🎉

Sua compra foi aprovada com sucesso!

📱 Plano: {{planName}}
🔑 Código: {{rechargeCode}}

Obrigado por escolher a {{companyName}}!',
  ARRAY['customerName', 'planName', 'rechargeCode', 'companyName'],
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  ARRAY['email', 'whatsapp', 'dashboard']
),
(
  'expiry_reminder_3d',
  'Lembrete 3 Dias - Padrão',
  'Olá {{customerName}}! ⏰

Seu plano {{planName}} vence em 3 dias ({{expiryDate}}).

Renove agora e continue aproveitando nossos serviços!

{{companyName}}',
  ARRAY['customerName', 'planName', 'expiryDate', 'companyName'],
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  ARRAY['email', 'whatsapp']
) ON CONFLICT DO NOTHING;