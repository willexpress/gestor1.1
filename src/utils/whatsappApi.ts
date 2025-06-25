import axios from 'axios';

export interface WhatsAppMessage {
  phone: string;
  message: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

/**
 * Envia uma mensagem via WhatsApp usando a API da Z-api
 */
export const sendWhatsAppMessage = async (
  phoneNumber: string,
  message: string,
  apiKey: string,
  instanceId: string
): Promise<WhatsAppResponse> => {
  try {
    // Limpar o número de telefone (remover caracteres especiais)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Adicionar código do país se não estiver presente
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    // URL da API Z-api
    const apiUrl = `https://api.z-api.io/instances/${instanceId}/token/${apiKey}/send-text`;
    
    console.log('📱 Enviando WhatsApp:', {
      phone: formattedPhone,
      message: message.substring(0, 100) + '...',
      instanceId,
      apiKey: apiKey.substring(0, 10) + '...'
    });

    const payload = {
      phone: formattedPhone,
      message: message
    };

    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': apiKey
      },
      timeout: 10000 // 10 segundos de timeout
    });

    console.log('✅ WhatsApp enviado com sucesso:', response.data);

    return {
      success: true,
      messageId: response.data?.messageId || response.data?.id,
      details: response.data
    };

  } catch (error: any) {
    console.error('❌ Erro ao enviar WhatsApp:', error);

    let errorMessage = 'Erro desconhecido ao enviar WhatsApp';
    
    if (error.response) {
      // Erro da API
      errorMessage = `Erro da API Z-api: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      console.error('Resposta da API:', error.response.data);
    } else if (error.request) {
      // Erro de rede
      errorMessage = 'Erro de conexão com a API Z-api';
    } else {
      // Erro de configuração
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      details: error.response?.data
    };
  }
};

/**
 * Testa a conexão com a API Z-api
 */
export const testWhatsAppConnection = async (
  apiKey: string,
  instanceId: string
): Promise<WhatsAppResponse> => {
  try {
    const apiUrl = `https://api.z-api.io/instances/${instanceId}/token/${apiKey}/status`;
    
    console.log('🔍 Testando conexão Z-api:', { instanceId, apiKey: apiKey.substring(0, 10) + '...' });

    const response = await axios.get(apiUrl, {
      headers: {
        'Client-Token': apiKey
      },
      timeout: 10000
    });

    console.log('✅ Teste de conexão bem-sucedido:', response.data);

    return {
      success: true,
      details: response.data
    };

  } catch (error: any) {
    console.error('❌ Erro no teste de conexão:', error);

    let errorMessage = 'Erro ao testar conexão';
    
    if (error.response) {
      errorMessage = `Erro ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'Erro de conexão com a API';
    } else {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      details: error.response?.data
    };
  }
};

/**
 * Formata uma mensagem de confirmação de compra
 */
export const formatPurchaseConfirmationMessage = (
  customerName: string,
  planName: string,
  rechargeCode: string,
  companyName: string = 'Sistema de Recarga'
): string => {
  return `🎉 *Compra Aprovada!*

Olá *${customerName}*!

Sua compra foi processada com sucesso:

📱 *Plano:* ${planName}
🔑 *Código:* \`${rechargeCode}\`

Para usar seu código:
1️⃣ Disque *321# no seu celular
2️⃣ Digite o código quando solicitado
3️⃣ Confirme a recarga

✅ Obrigado por escolher a *${companyName}*!

_Mensagem automática - Não responda_`;
};

/**
 * Formata uma mensagem de lembrete de vencimento
 */
export const formatExpiryReminderMessage = (
  customerName: string,
  planName: string,
  daysUntilExpiry: number,
  expiryDate: string,
  companyName: string = 'Sistema de Recarga'
): string => {
  const urgencyEmoji = daysUntilExpiry <= 1 ? '🚨' : daysUntilExpiry <= 3 ? '⚠️' : '⏰';
  const urgencyText = daysUntilExpiry <= 1 ? 'URGENTE' : daysUntilExpiry <= 3 ? 'ATENÇÃO' : 'LEMBRETE';
  
  return `${urgencyEmoji} *${urgencyText}*

Olá *${customerName}*!

Seu plano *${planName}* ${daysUntilExpiry === 0 ? 'vence HOJE' : `vence em ${daysUntilExpiry} dia${daysUntilExpiry > 1 ? 's' : ''}`} (${expiryDate}).

${daysUntilExpiry === 0 ? '🔥 Renove AGORA para não ficar sem serviço!' : '💡 Renove antecipadamente e continue aproveitando nossos benefícios!'}

📞 Entre em contato conosco para renovar.

*${companyName}*

_Mensagem automática - Não responda_`;
};

/**
 * Formata uma mensagem de código pendente
 */
export const formatPendingCodeMessage = (
  customerName: string,
  planName: string,
  companyName: string = 'Sistema de Recarga'
): string => {
  return `⏳ *Processando seu Pedido*

Olá *${customerName}*!

Seu pagamento para o plano *${planName}* foi aprovado com sucesso! 

🔄 Estamos preparando seu código de recarga e você receberá em breve.

⏱️ Tempo estimado: até 30 minutos

Obrigado pela paciência!

*${companyName}*

_Mensagem automática - Não responda_`;
};