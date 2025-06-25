# Sistema de Recarga Avançado

Um sistema completo de gestão de códigos de recarga com integração Supabase para persistência de dados.

## 🚀 Configuração Inicial

### 1. Configurar Supabase

1. **Criar Projeto no Supabase**:
   - Acesse [supabase.com](https://supabase.com)
   - Clique em "Start your project"
   - Crie uma nova organização ou use uma existente
   - Crie um novo projeto
   - Anote a URL do projeto e a chave anônima

2. **Configurar Variáveis de Ambiente**:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis com os dados do seu projeto Supabase:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

3. **Executar Migrações**:
   - No painel do Supabase, vá para "SQL Editor"
   - Execute o conteúdo do arquivo `supabase/migrations/create_initial_schema.sql`
   - Isso criará todas as tabelas necessárias com suas políticas de segurança

### 2. Instalar Dependências

```bash
npm install
```

### 3. Executar o Projeto

```bash
npm run dev
```

## 📊 Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

- **users**: Usuários do sistema (admin, revendedores, clientes)
- **customers**: Dados dos clientes finais
- **plans**: Planos de recarga disponíveis
- **recharge_codes**: Códigos de recarga importados
- **purchases**: Histórico de compras e transações
- **resellers**: Rede de revendedores
- **message_templates**: Templates de mensagens personalizáveis
- **system_config**: Configurações globais do sistema

## 🔐 Autenticação e Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso baseadas em roles
- Dados sensíveis protegidos por criptografia

## 🎯 Funcionalidades Principais

### Para Administradores
- Dashboard completo com métricas
- Gestão de planos e códigos
- Gerenciamento de revendedores
- Relatórios avançados
- Configurações do sistema

### Para Revendedores
- Painel de vendas
- Gestão de clientes
- Comissões e relatórios
- Personalização de marca

### Para Clientes
- Compra de planos
- Histórico de códigos
- Programa de fidelidade
- Suporte integrado

## 🔧 Configurações Avançadas

### WhatsApp Integration
Configure a integração com WhatsApp para envio automático de códigos:
1. Obtenha uma API key da Z-api
2. Configure no painel de administração
3. Ative o envio automático de mensagens

### Payment Gateways
Suporte para múltiplos gateways de pagamento:
- Pagar.me
- AppMax
- PushInPay
- Shipay

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- Desktop
- Tablet
- Mobile

## 🎨 Personalização

- Temas claro e escuro
- Cores personalizáveis por revendedor
- Logo e branding customizável
- Templates de mensagem editáveis

## 🚀 Deploy

Para fazer deploy do sistema:

1. **Build do projeto**:
   ```bash
   npm run build
   ```

2. **Deploy no Netlify/Vercel**:
   - Conecte seu repositório
   - Configure as variáveis de ambiente
   - Deploy automático

## 📞 Suporte

Para suporte técnico ou dúvidas sobre implementação, consulte a documentação ou entre em contato.

---

**Versão**: 2.0.0  
**Tecnologias**: React, TypeScript, Tailwind CSS, Supabase  
**Licença**: Proprietária