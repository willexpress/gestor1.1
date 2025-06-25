export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: 'admin' | 'master_reseller' | 'reseller' | 'customer';
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  branding?: UserBranding;
  whatsappConfig?: WhatsAppConfig;
  paymentConfig?: PaymentConfig;
  commissionRate?: number;
  masterResellerRequirement?: {
    productId: string;
    quantityRequired: number;
    hasPurchased: boolean;
  };
}

export interface UserBranding {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  customDomain?: string;
}

export interface WhatsAppConfig {
  apiKey: string;
  phoneNumber: string;
  isActive: boolean;
  zapiInstanceId?: string;
}

export interface PaymentConfig {
  pagarme?: PaymentGatewayConfig;
  appmax?: PaymentGatewayConfig;
  pushinpay?: PaymentGatewayConfig;
  shipay?: PaymentGatewayConfig;
  activeGateway: string;
}

export interface PaymentGatewayConfig {
  apiKey: string;
  secretKey: string;
  isActive: boolean;
  webhookUrl?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  value: number;
  validityDays: number;
  category: 'recharge' | 'master_qualification' | 'data_package' | 'app_plan';
  isActive: boolean;
  createdBy: string;
  features?: string[];
  // Configuração do aplicativo - agora opcional para evitar erros
  appConfig?: {
    appName: string;
    hasApp: boolean;
    appDescription?: string;
    appFeatures?: string[];
    downloadUrl?: string;
    appVersion?: string;
    supportedPlatforms?: ('android' | 'ios' | 'web')[];
  };
  rechargeDuration?: {
    type: 'days' | 'hours' | 'minutes' | 'unlimited';
    value?: number;
    autoRenewal?: boolean;
    gracePeriod?: number; // dias de carência
    expiryWarning?: number; // dias antes do vencimento para avisar
  };
  pricing?: {
    originalPrice?: number;
    discountPercentage?: number;
    promotionalPrice?: number;
    isPromotional?: boolean;
    promotionStartDate?: Date;
    promotionEndDate?: Date;
  };
  limits?: {
    maxPurchasesPerCustomer?: number;
    maxPurchasesPerDay?: number;
    minAge?: number;
    restrictedRegions?: string[];
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  points: number;
  isActive: boolean;
  createdAt: Date;
  resellerId: string;
  purchases: Purchase[];
  invoices: Invoice[];
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
}

export interface Purchase {
  id: string;
  customerId: string;
  planId: string;
  rechargeCode: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'pending_code_delivery';
  paymentMethod: 'credit_card' | 'pix';
  paymentId: string;
  createdAt: Date;
  approvedAt?: Date;
  expiresAt: Date;
  notificationsSent: NotificationLog[];
  resellerId: string;
  commission?: {
    resellerAmount: number;
    masterResellerAmount?: number;
    adminAmount: number;
  };
  codeDeliveryFailureReason?: string;
  assignedCodeId?: string;
  customerData?: CheckoutData['customerData'];
  // Novos campos para controle de lembretes
  expiryReminders?: {
    reminder3Days?: {
      sent: boolean;
      sentAt?: Date;
      messageId?: string;
    };
    reminder1Day?: {
      sent: boolean;
      sentAt?: Date;
      messageId?: string;
    };
    reminderToday?: {
      sent: boolean;
      sentAt?: Date;
      messageId?: string;
    };
  };
}

export interface Invoice {
  id: string;
  customerId: string;
  purchaseId: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}

export interface NotificationLog {
  id: string;
  type: 'purchase_confirmation' | 'expiry_reminder_3d' | 'expiry_reminder_1d' | 'expiry_reminder_0d';
  channel: 'email' | 'whatsapp' | 'dashboard';
  status: 'sent' | 'failed' | 'pending';
  sentAt?: Date;
  error?: string;
  templateId: string;
}

export interface MessageTemplate {
  id: string;
  type: 'purchase_confirmation' | 'expiry_reminder_3d' | 'expiry_reminder_1d' | 'expiry_reminder_0d';
  title: string;
  content: string;
  variables: string[];
  userId: string;
  isActive: boolean;
  channels: ('email' | 'whatsapp' | 'dashboard')[];
}

export interface DashboardStats {
  totalCustomers: number;
  totalRevenue: number;
  todayRevenue: number;
  activePlans: number;
  pendingPayments: number;
  expiringToday: number;
  conversionRate: number;
  averageTicket: number;
  totalResellers?: number;
  totalMasterResellers?: number;
  networkRevenue?: number;
  pendingCodeDeliveries?: number;
}

export interface ResellerStats extends DashboardStats {
  totalSubResellers?: number;
  networkRevenue?: number;
  commissionEarned: number;
  monthlyGrowth: number;
}

export interface CheckoutData {
  planId: string;
  customerData: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  paymentMethod: 'credit_card' | 'pix';
  cardData?: {
    number: string;
    holderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  };
  resellerId?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  status: string;
  pixCode?: string;
  pixQrCode?: string;
  message?: string;
  error?: string;
  rechargeCode?: string;
  purchaseId?: string;
}

export interface Reseller {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  parentId?: string;
  role: 'reseller' | 'master_reseller';
  isActive: boolean;
  createdAt: Date;
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  customers: Customer[];
  subResellers?: Reseller[];
  branding: UserBranding;
  whatsappConfig?: WhatsAppConfig;
}

export interface Commission {
  id: string;
  purchaseId: string;
  resellerId: string;
  amount: number;
  type: 'direct_sale' | 'network_sale';
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: Date;
  paidAt?: Date;
}

export interface SystemConfig {
  id: string;
  paymentGateways: PaymentConfig;
  whatsappIntegration: {
    zapiApiKey: string;
    defaultInstanceId: string;
    isActive: boolean;
  };
  emailConfig: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  masterResellerRequirements: {
    minimumPurchaseAmount: number;
    requiredProductId: string;
    commissionRate: number;
  };
  loyaltyProgram: {
    isActive: boolean;
    pointsPerReal: number;
    redemptionRate: number;
  };
}

// Updated RechargeCode interface - now linked to plans instead of operators
export interface RechargeCode {
  id: string;
  code: string;
  value: number;
  status: 'available' | 'sold' | 'expired';
  createdAt: Date;
  soldAt?: Date;
  expiresAt: Date;
  planId: string; // Links to Plan.id instead of operator
  appName: string; // Derived from Plan.appConfig.appName for display
}

export interface Sale {
  id: string;
  codes: RechargeCode[];
  total: number;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}