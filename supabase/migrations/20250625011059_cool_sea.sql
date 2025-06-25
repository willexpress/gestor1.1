-- Drop the existing policy that's too restrictive
DROP POLICY IF EXISTS "Admins can manage system config" ON system_config;
DROP POLICY IF EXISTS "Admins can read system config" ON system_config;
DROP POLICY IF EXISTS "Allow initial system config creation" ON system_config;

-- Allow all authenticated users to read system config
CREATE POLICY "Authenticated users can read system config"
  ON system_config
  FOR SELECT
  TO authenticated
  USING (true);

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

-- Allow initial system config creation only if none exists
CREATE POLICY "Allow initial system config creation"
  ON system_config
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT EXISTS (SELECT 1 FROM system_config));

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