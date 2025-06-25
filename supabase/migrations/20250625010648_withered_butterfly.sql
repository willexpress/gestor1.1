/*
  # Fix system_config RLS policies

  1. Security Changes
    - Drop the existing overly restrictive policy
    - Add separate policies for different operations
    - Allow INSERT for authenticated users (for initial setup)
    - Restrict SELECT/UPDATE/DELETE to admins only
    
  2. Notes
    - This allows any authenticated user to create initial system config
    - Only admins can read, update, or delete system config
    - This resolves the initialization error while maintaining security
*/

-- Drop the existing policy that's too restrictive
DROP POLICY IF EXISTS "Admins can manage system config" ON system_config;

-- Allow authenticated users to insert initial system config
CREATE POLICY "Allow initial system config creation"
  ON system_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admins can read system config
CREATE POLICY "Admins can read system config"
  ON system_config
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Only admins can update system config
CREATE POLICY "Admins can update system config"
  ON system_config
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Only admins can delete system config
CREATE POLICY "Admins can delete system config"
  ON system_config
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));