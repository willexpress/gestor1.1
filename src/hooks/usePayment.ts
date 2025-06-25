import { useState } from 'react';
import { CheckoutData, PaymentResponse, Purchase } from '../types';
import { useSupabaseRechargeSystem } from './useSupabaseRechargeSystem';
import { useSystemConfig } from '../contexts/SystemConfigContext';
import { 
  sendWhatsAppMessage, 
  formatPurchaseConfirmationMessage, 
  formatPendingCodeMessage 
} from '../utils/whatsappApi';

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { sellCodes, addPendingCodeDelivery } = useSupabaseRechargeSystem();
  const { config } = useSystemConfig();

  const processPayment = async (checkoutData: CheckoutData): Promise<PaymentResponse> => {
    setIsProcessing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock payment processing
      const isSuccess = Math.random() > 0.1; // 90% success rate for demo
      
      if (isSuccess) {
        const paymentId = `pay_${Date.now()}`;
        
        // Try to assign a code
        const codeResult = await sellCodes(checkoutData.planId, {
          name: checkoutData.customerData.name,
          phone: checkoutData.customerData.phone,
          email: checkoutData.customerData.email
        });

        // If code is available, create a successful response
        if (codeResult.success) {
          const response: PaymentResponse = {
            success: true,
            paymentId,
            status: 'approved',
            message: 'Pagamento aprovado com sucesso!',
            rechargeCode: codeResult.code.code,
            purchaseId: `purchase_${Date.now()}`
          };

          // Add PIX specific data if PIX payment
          if (checkoutData.paymentMethod === 'pix') {
            response.pixCode = `00020126580014BR.GOV.BCB.PIX0136${Date.now()}520400005303986540${checkoutData.planId}5802BR5925Sistema de Recarga Pro6009SAO PAULO62070503***6304${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
            response.pixQrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
          }

          // Send notifications including WhatsApp
          await sendNotifications(checkoutData, response, codeResult.code.code);
          
          return response;
        } 
        // If no code is available, create a pending code delivery purchase
        else {
          // Create a purchase with pending_code_delivery status
          const purchase = await addPendingCodeDelivery({
            customerId: `customer-${Date.now()}`,
            planId: checkoutData.planId,
            rechargeCode: '',
            amount: 0, // This will be filled from the plan
            status: 'pending_code_delivery',
            paymentMethod: checkoutData.paymentMethod,
            paymentId,
            notificationsSent: [],
            resellerId: checkoutData.resellerId || 'system',
            codeDeliveryFailureReason: 'no_available_codes',
            customerData: checkoutData.customerData
          });

          // Return a success response but indicate code is pending
          const response: PaymentResponse = {
            success: true,
            paymentId,
            status: 'pending_code_delivery',
            message: 'Pagamento aprovado! Seu código será enviado em breve.',
            purchaseId: purchase.id
          };

          // Add PIX specific data if PIX payment
          if (checkoutData.paymentMethod === 'pix') {
            response.pixCode = `00020126580014BR.GOV.BCB.PIX0136${Date.now()}520400005303986540${checkoutData.planId}5802BR5925Sistema de Recarga Pro6009SAO PAULO62070503***6304${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
            response.pixQrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
          }

          // Send notifications for pending code
          await sendNotifications(checkoutData, response);
          
          return response;
        }
      } else {
        return {
          success: false,
          paymentId: '',
          status: 'rejected',
          message: 'Pagamento rejeitado. Verifique os dados do cartão.',
          error: 'CARD_DECLINED'
        };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        paymentId: '',
        status: 'error',
        message: 'Erro interno. Tente novamente.',
        error: 'INTERNAL_ERROR'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const sendNotifications = async (
    checkoutData: CheckoutData, 
    paymentResponse: PaymentResponse, 
    rechargeCode?: string
  ) => {
    const { customerData } = checkoutData;
    const { whatsappIntegration } = config;

    console.log('📧 Iniciando envio de notificações...');

    try {
      // 1. Send Email (simulated)
      console.log('📧 Enviando email para:', customerData.email);
      // TODO: Implement actual email sending using emailConfig
      
      // 2. Send WhatsApp if configured and active
      if (whatsappIntegration.isActive && whatsappIntegration.zapiApiKey && whatsappIntegration.defaultInstanceId) {
        console.log('📱 Enviando WhatsApp...');
        
        let message: string;
        
        if (rechargeCode) {
          // Message with recharge code
          message = formatPurchaseConfirmationMessage(
            customerData.name,
            'Plano Selecionado', // TODO: Get actual plan name
            rechargeCode,
            'Sistema de Recarga Pro'
          );
        } else {
          // Message for pending code
          message = formatPendingCodeMessage(
            customerData.name,
            'Plano Selecionado', // TODO: Get actual plan name
            'Sistema de Recarga Pro'
          );
        }

        const whatsappResult = await sendWhatsAppMessage(
          customerData.phone,
          message,
          whatsappIntegration.zapiApiKey,
          whatsappIntegration.defaultInstanceId
        );

        if (whatsappResult.success) {
          console.log('✅ WhatsApp enviado com sucesso!', whatsappResult.messageId);
        } else {
          console.error('❌ Erro ao enviar WhatsApp:', whatsappResult.error);
        }
      } else {
        console.log('⚠️ WhatsApp não configurado ou inativo');
      }

      // 3. Create customer record (simulated)
      console.log('👤 Criando registro do cliente:', customerData);
      
      console.log('✅ Todas as notificações processadas');
      
    } catch (error) {
      console.error('❌ Erro ao enviar notificações:', error);
    }
  };

  return {
    processPayment,
    isProcessing
  };
};