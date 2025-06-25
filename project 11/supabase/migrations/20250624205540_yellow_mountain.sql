/*
  # Atualizar políticas RLS para permitir registro de clientes

  1. Políticas de Inserção
    - Permitir que usuários autenticados insiram seus próprios dados na tabela users
    - Permitir inserção de clientes com revendedor padrão

  2. Função para registro automático
    - Trigger para criar entrada na tabela users quando um usuário se registra
    - Função para determinar revendedor padrão
*/

-- Política para permitir inserção de usuários (auto-registro)
CREATE POLICY "Users can register themselves" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- Política para permitir inserção de clientes durante registro
CREATE POLICY "Allow customer registration" ON customers
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Função para obter revendedor padrão do sistema
CREATE OR REPLACE FUNCTION get_default_reseller_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_reseller_id uuid;
BEGIN
  -- Buscar o primeiro admin ou master_reseller como revendedor padrão
  SELECT id INTO default_reseller_id
  FROM users 
  WHERE role IN ('admin', 'master_reseller') 
  AND is_active = true
  ORDER BY 
    CASE 
      WHEN role = 'admin' THEN 1
      WHEN role = 'master_reseller' THEN 2
      ELSE 3
    END,
    created_at ASC
  LIMIT 1;
  
  -- Se não encontrar nenhum, criar um usuário sistema padrão
  IF default_reseller_id IS NULL THEN
    INSERT INTO users (
      id,
      email,
      name,
      phone,
      cpf,
      role,
      is_active,
      branding
    ) VALUES (
      uuid_generate_v4(),
      'sistema@recargas.com',
      'Sistema Padrão',
      '11999999999',
      '00000000000',
      'admin',
      true,
      '{"companyName": "Sistema de Recarga", "primaryColor": "#3B82F6", "secondaryColor": "#1E40AF"}'::jsonb
    )
    RETURNING id INTO default_reseller_id;
  END IF;
  
  RETURN default_reseller_id;
END;
$$;

-- Função para criar perfil de usuário automaticamente após registro
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir na tabela users se não existir
  INSERT INTO public.users (
    id,
    email,
    name,
    phone,
    cpf,
    role,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
    'customer',
    true
  ) ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger para executar a função após inserção na auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Atualizar política de customers para permitir leitura dos próprios dados
DROP POLICY IF EXISTS "Customers can read own data" ON customers;
CREATE POLICY "Customers can read own data" ON customers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (
        users.role = 'customer' AND customers.email = users.email
        OR users.role IN ('admin', 'master_reseller', 'reseller')
      )
    )
  );