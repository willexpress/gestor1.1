/*
  # Fix system config initialization

  1. Changes
    - Add policy to allow creating initial system config when none exists
    - Insert default system configuration if table is empty
    - Ensure proper RLS policies for system initialization

  2. Security
    - Maintain admin-only access for existing configs
    - Allow initial config creation only when table is empty
*/

-- Add policy to allow creating initial system config when none exists
CREATE POLICY "Allow initial system config creation"
  ON system_config
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM system_config)
  );

-- Insert default system configuration if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM system_config) THEN
    INSERT INTO system_config (
      payment_gateways,
      whatsapp_integration,
      email_config,
      master_reseller_requirements,
      loyalty_program
    ) VALUES (
      '{
        "mercadopago": {
          "enabled": false,
          "access_token": "",
          "public_key": ""
        },
        "stripe": {
          "enabled": false,
          "secret_key": "",
          "public_key": ""
        }
      }'::jsonb,
      '{
        "enabled": false,
        "api_url": "",
        "token": "",
        "webhook_url": ""
      }'::jsonb,
      '{
        "smtp_host": "",
        "smtp_port": 587,
        "smtp_user": "",
        "smtp_password": "",
        "from_email": "",
        "from_name": ""
      }'::jsonb,
      '{
        "minimum_sales": 10000,
        "minimum_customers": 50,
        "qualification_period_days": 30
      }'::jsonb,
      '{
        "enabled": true,
        "levels": {
          "bronze": {
            "min_spent": 0,
            "discount_percentage": 0,
            "points_multiplier": 1
          },
          "silver": {
            "min_spent": 500,
            "discount_percentage": 5,
            "points_multiplier": 1.2
          },
          "gold": {
            "min_spent": 1500,
            "discount_percentage": 10,
            "points_multiplier": 1.5
          },
          "platinum": {
            "min_spent": 5000,
            "discount_percentage": 15,
            "points_multiplier": 2
          }
        }
      }'::jsonb
    );
  END IF;
END $$;