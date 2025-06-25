import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, Smartphone, User, Mail, Phone, FileText, Check, AlertCircle, Star, ShoppingCart, Copy, ArrowLeft, QrCode, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Plan, CheckoutData, PaymentResponse } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { usePayment } from '../../hooks/usePayment';

interface CheckoutPageProps {
  plans: Plan[];
  onNavigate?: (tab: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ plans, onNavigate }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<Plan | null>(null);
  const [step, setStep] = useState<'plan' | 'customer' | 'payment' | 'success'>('plan');
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({});
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { processPayment } = usePayment();

  const handlePlanClick = (plan: Plan) => {
    setSelectedPlanForPurchase(plan);
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setCheckoutData(prev => ({ ...prev, planId: plan.id }));
    setStep('customer');
  };

  const handleCustomerData = (data: CheckoutData['customerData']) => {
    setCheckoutData(prev => ({ ...prev, customerData: data }));
    setStep('payment');
  };

  const handlePayment = async (paymentData: any) => {
    if (!selectedPlan || !checkoutData.customerData) return;

    setIsProcessing(true);
    try {
      const fullCheckoutData: CheckoutData = {
        planId: selectedPlan.id,
        customerData: checkoutData.customerData,
        paymentMethod: paymentData.method,
        ...(paymentData.method === 'credit_card' && { cardData: paymentData.cardData })
      };

      const response = await processPayment(fullCheckoutData);
      setPaymentResponse(response);
      
      if (response.success) {
        setStep('success');
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Back navigation function
  const handleBack = () => {
    if (step === 'customer') {
      setStep('plan');
      setSelectedPlan(null);
      setCheckoutData({});
    } else if (step === 'payment') {
      setStep('customer');
      setPaymentResponse(null);
    }
  };

  // Back to dashboard function
  const handleBackToDashboard = () => {
    if (onNavigate) {
      onNavigate('overview');
    }
  };

  if (step === 'success' && paymentResponse?.success) {
    return <SuccessPage plan={selectedPlan!} paymentResponse={paymentResponse} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
      <div className="w-full px-4">
        {/* Back to Dashboard Button - Only on plan selection step */}
        {step === 'plan' && onNavigate && (
          <div className="max-w-6xl mx-auto mb-6">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar para Visão Geral</span>
            </button>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Checkout Seguro</h1>
          <p className="text-gray-600 dark:text-gray-300">Complete sua compra em poucos passos</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {['plan', 'customer', 'payment'].map((stepName, index) => {
              const isActive = step === stepName;
              const isCompleted = ['plan', 'customer', 'payment'].indexOf(step) > index;
              
              return (
                <div key={stepName} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-1 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {step === 'plan' && <PlanSelection 
          plans={plans} 
          selectedPlanForPurchase={selectedPlanForPurchase}
          onPlanClick={handlePlanClick}
          onSelect={handlePlanSelect} 
        />}
        {step === 'customer' && <CustomerForm onSubmit={handleCustomerData} onBack={handleBack} />}
        {step === 'payment' && (
          <PaymentForm 
            plan={selectedPlan!} 
            onSubmit={handlePayment} 
            onBack={handleBack}
            isProcessing={isProcessing}
            paymentResponse={paymentResponse}
          />
        )}
      </div>
    </div>
  );
};

const PlanSelection: React.FC<{ 
  plans: Plan[]; 
  selectedPlanForPurchase: Plan | null;
  onPlanClick: (plan: Plan) => void;
  onSelect: (plan: Plan) => void;
}> = ({ plans, selectedPlanForPurchase, onPlanClick, onSelect }) => {
  const [planCarouselPage, setPlanCarouselPage] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Funções para navegação do carrossel
  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const cardWidth = container.scrollWidth / plans.length;
    const scrollPosition = cardWidth * index;
    
    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  };

  const nextPlan = () => {
    const nextIndex = (planCarouselPage + 1) % plans.length;
    setPlanCarouselPage(nextIndex);
    scrollToIndex(nextIndex);
  };

  const prevPlan = () => {
    const prevIndex = (planCarouselPage - 1 + plans.length) % plans.length;
    setPlanCarouselPage(prevIndex);
    scrollToIndex(prevIndex);
  };

  // Funções para arrastar/swipe - SEM SNAP
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    carouselRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Reduzido para movimento mais suave
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Reduzido para movimento mais suave
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Detectar mudança de posição do scroll para atualizar o indicador
  const handleScroll = () => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const cardWidth = container.scrollWidth / plans.length;
    const currentIndex = Math.round(container.scrollLeft / cardWidth);
    
    if (currentIndex !== planCarouselPage && currentIndex >= 0 && currentIndex < plans.length) {
      setPlanCarouselPage(currentIndex);
    }
  };

  // Debounce para o scroll
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 150);
    };

    container.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      container.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [planCarouselPage, plans.length]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Escolha seu Plano</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevPlan}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex space-x-1">
            {plans.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setPlanCarouselPage(index);
                  scrollToIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === planCarouselPage 
                    ? 'bg-blue-600 dark:bg-blue-400' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextPlan}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carrossel com scroll horizontal - SEM SNAP */}
      <div className="relative">
        <div
          ref={carouselRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' },
            cursor: 'grab',
            scrollBehavior: 'auto' // Remove smooth scrolling automático
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {plans.map((plan, index) => {
            const isSelected = selectedPlanForPurchase?.id === plan.id;
            
            return (
              <div
                key={plan.id}
                className="flex-none w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] select-none"
              >
                <div
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 group h-full ${
                    isSelected 
                      ? 'border-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform ${
                      isSelected 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-110' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-110'
                    }`}>
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{plan.description}</p>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {formatCurrency(plan.value)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Válido por {plan.validityDays} dias</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.appConfig.appName}</p>
                    
                    {/* Plan Features */}
                    {plan.features && plan.features.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          Recursos Inclusos
                        </h4>
                        <div className="space-y-2">
                          {plan.features.slice(0, 3).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-left">{feature}</span>
                            </div>
                          ))}
                          {plan.features.length > 3 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              +{plan.features.length - 3} recursos adicionais
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* App Features if available */}
                    {plan.appConfig.hasApp && plan.appConfig.appFeatures && plan.appConfig.appFeatures.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-center">
                          <Smartphone className="w-4 h-4 mr-1 text-blue-500" />
                          Recursos do App
                        </h4>
                        <div className="space-y-2">
                          {plan.appConfig.appFeatures.slice(0, 2).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                              <span className="text-left">{feature}</span>
                            </div>
                          ))}
                          {plan.appConfig.appFeatures.length > 2 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              +{plan.appConfig.appFeatures.length - 2} recursos do app
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* App Download Info */}
                    {plan.appConfig.hasApp && plan.appConfig.supportedPlatforms && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Disponível para:</h4>
                        <div className="flex justify-center space-x-2">
                          {plan.appConfig.supportedPlatforms.slice(0, 3).map((platform, platformIndex) => (
                            <span 
                              key={platformIndex}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full text-xs font-medium"
                            >
                              {platform === 'android' ? '📱 Android' : 
                               platform === 'ios' ? '🍎 iOS' : 
                               platform === 'web' ? '🌐 Web' : platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Click to select button */}
                  {!isSelected ? (
                    <button
                      onClick={() => onPlanClick(plan)}
                      className="w-full mt-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Ver Detalhes
                    </button>
                  ) : (
                    <div className="mt-6 space-y-3">
                      <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                        <p className="text-blue-800 dark:text-blue-300 text-sm font-medium text-center">
                          ✅ Plano selecionado! Clique em "Comprar Agora" para continuar.
                        </p>
                      </div>
                      <button
                        onClick={() => onSelect(plan)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-4 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-lg"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Comprar Agora</span>
                      </button>
                      <button
                        onClick={() => onPlanClick(null as any)}
                        className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                      >
                        Escolher Outro Plano
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS para esconder scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

const CustomerForm: React.FC<{ 
  onSubmit: (data: CheckoutData['customerData']) => void;
  onBack: () => void;
}> = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seus Dados</h2>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Seu nome completo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              E-mail *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="(11) 99999-9999"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              CPF *
            </label>
            <input
              type="text"
              required
              value={formData.cpf}
              onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="000.000.000-00"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Continuar para Pagamento
        </button>
      </form>
    </div>
  );
};

const PaymentForm: React.FC<{ 
  plan: Plan; 
  onSubmit: (data: any) => void; 
  onBack: () => void;
  isProcessing: boolean;
  paymentResponse: PaymentResponse | null;
}> = ({ plan, onSubmit, onBack, isProcessing, paymentResponse }) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
  const [pixGenerated, setPixGenerated] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    holderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  // Reset PIX state when payment method changes
  useEffect(() => {
    if (paymentMethod !== 'pix') {
      setPixGenerated(false);
    }
  }, [paymentMethod]);

  // Set PIX as generated when we have a successful PIX response
  useEffect(() => {
    if (paymentResponse?.success && paymentResponse.pixCode && paymentMethod === 'pix') {
      setPixGenerated(true);
    } else if (paymentResponse && !paymentResponse.success) {
      setPixGenerated(false);
    }
  }, [paymentResponse, paymentMethod]);

  const handleGeneratePix = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ method: 'pix' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      method: paymentMethod,
      ...(paymentMethod === 'credit_card' && { cardData })
    });
  };

  const copyPixCode = async () => {
    if (!paymentResponse?.pixCode) return;
    
    try {
      await navigator.clipboard.writeText(paymentResponse.pixCode);
      
      // Show mini modal notification
      toast.success(
        <div className="flex items-center space-x-2">
          <Copy className="w-5 h-5 text-green-600" />
          <span className="font-medium">Código PIX copiado!</span>
        </div>,
        {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#ffffff',
            fontWeight: 'bold',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#10B981',
          },
        }
      );
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = paymentResponse.pixCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast.success('Código PIX copiado!', {
        duration: 3000,
        icon: '📋',
      });
    }
  };

  if (paymentResponse && !paymentResponse.success) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Pagamento Rejeitado</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{paymentResponse.message || 'Erro no processamento do pagamento'}</p>
          <div className="flex space-x-4">
            <button
              onClick={onBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pagamento</h2>
        {!pixGenerated && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        )}
      </div>
      
      {/* Plan Summary with Features */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resumo do Pedido</h3>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">{plan.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{plan.appConfig.appName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
          </div>
          <span className="font-bold text-2xl text-green-600 dark:text-green-400">{formatCurrency(plan.value)}</span>
        </div>
        
        {/* Show plan features in summary */}
        {plan.features && plan.features.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recursos inclusos:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {plan.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                  <Check className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            {plan.features.length > 4 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                +{plan.features.length - 4} recursos adicionais
              </p>
            )}
          </div>
        )}
      </div>

      {/* Payment Method Selection */}
      {!pixGenerated && (
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Método de Pagamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('credit_card')}
              className={`p-4 border-2 rounded-xl transition-colors ${
                paymentMethod === 'credit_card' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">Cartão de Crédito</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('pix')}
              className={`p-4 border-2 rounded-xl transition-colors ${
                paymentMethod === 'pix' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 bg-green-600 rounded text-white flex items-center justify-center font-bold text-sm">
                PIX
              </div>
              <span className="font-medium text-gray-900 dark:text-white">PIX</span>
            </button>
          </div>
        </div>
      )}

      {/* Credit Card Form */}
      {paymentMethod === 'credit_card' && !pixGenerated && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número do Cartão</label>
              <input
                type="text"
                required
                value={cardData.number}
                onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0000 0000 0000 0000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome no Cartão</label>
              <input
                type="text"
                required
                value={cardData.holderName}
                onChange={(e) => setCardData(prev => ({ ...prev, holderName: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome como está no cartão"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mês</label>
                <select
                  required
                  value={cardData.expiryMonth}
                  onChange={(e) => setCardData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Mês</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ano</label>
                <select
                  required
                  value={cardData.expiryYear}
                  onChange={(e) => setCardData(prev => ({ ...prev, expiryYear: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Ano</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={String(new Date().getFullYear() + i)}>
                      {new Date().getFullYear() + i}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVV</label>
                <input
                  type="text"
                  required
                  value={cardData.cvv}
                  onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>Finalizar Pagamento - {formatCurrency(plan.value)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* PIX Form */}
      {paymentMethod === 'pix' && !pixGenerated && (
        <form onSubmit={handleGeneratePix}>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-8 border border-green-200 dark:border-green-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-600 p-2 rounded-full">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-300">Pagamento via PIX</h4>
                <p className="text-sm text-green-700 dark:text-green-400">Aprovação instantânea</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-green-700 dark:text-green-400">
              <p>• Pagamento aprovado na hora</p>
              <p>• Sem taxas adicionais</p>
              <p>• Código válido por 30 minutos</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Gerando PIX...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5" />
                  <span>Gerar PIX - {formatCurrency(plan.value)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* PIX Generated - Show QR Code and Copy Button */}
      {paymentMethod === 'pix' && pixGenerated && paymentResponse?.success && paymentResponse.pixCode && (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
            <div className="text-center mb-6">
              <div className="bg-green-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                <QrCode className="w-10 h-10 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">PIX Gerado com Sucesso!</h3>
              <p className="text-green-700 dark:text-green-400">Escaneie o QR Code ou copie o código abaixo</p>
            </div>

            {/* Mock QR Code */}
            <div className="bg-white p-6 rounded-xl border-2 border-dashed border-green-300 dark:border-green-600 mb-6">
              <div className="w-48 h-48 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">QR Code PIX</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatCurrency(plan.value)}</p>
                </div>
              </div>
            </div>

            {/* PIX Code */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-600 mb-4">
              <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">Código PIX (Copia e Cola)</label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border">
                <code className="text-xs break-all text-gray-800 dark:text-gray-200 font-mono">
                  {paymentResponse.pixCode}
                </code>
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={copyPixCode}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 mb-4"
            >
              <Copy className="w-5 h-5" />
              <span>Copiar Código PIX</span>
            </button>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Como pagar:</h4>
              <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                <li>Abra o app do seu banco</li>
                <li>Escolha a opção PIX</li>
                <li>Escaneie o QR Code ou cole o código</li>
                <li>Confirme o pagamento</li>
                <li>Pronto! Aprovação instantânea</li>
              </ol>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => {
              setPixGenerated(false);
              setPaymentMethod('credit_card');
            }}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar aos Métodos de Pagamento</span>
          </button>
        </div>
      )}
    </div>
  );
};

const SuccessPage: React.FC<{ plan: Plan; paymentResponse: PaymentResponse }> = ({ plan, paymentResponse }) => {
  const copyPixCode = async () => {
    if (!paymentResponse.pixCode) return;
    
    try {
      await navigator.clipboard.writeText(paymentResponse.pixCode);
      toast.success('Código PIX copiado!', {
        duration: 2000,
        icon: '📋',
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = paymentResponse.pixCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast.success('Código PIX copiado!', {
        duration: 2000,
        icon: '📋',
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
      <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-full w-24 h-24 mx-auto mb-6">
        <Check className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto" />
      </div>
      
      <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">Pagamento Aprovado!</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Seu código de recarga será enviado em instantes</p>
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Detalhes da Compra</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Plano:</span>
            <span className="font-medium text-gray-900 dark:text-white">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Aplicativo:</span>
            <span className="font-medium text-gray-900 dark:text-white">{plan.appConfig.appName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Valor:</span>
            <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(plan.value)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">ID do Pagamento:</span>
            <span className="font-mono text-sm text-gray-900 dark:text-white">{paymentResponse.paymentId}</span>
          </div>
        </div>
        
        {/* Show plan features in success page */}
        {plan.features && plan.features.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recursos do seu plano:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {plan.features.map((feature,  index) => (
                <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {paymentResponse.pixCode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4">Código PIX</h3>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 mb-4">
            <code className="text-sm break-all text-gray-900 dark:text-white">{paymentResponse.pixCode}</code>
          </div>
          <button
            onClick={copyPixCode}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
          >
            <Copy className="w-4 h-4" />
            <span>Copiar Código PIX</span>
          </button>
        </div>
      )}

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <p>✅ Código enviado por e-mail</p>
        <p>✅ Código enviado por WhatsApp</p>
        <p>✅ Código disponível no seu painel</p>
      </div>

      <button
        onClick={() => window.location.href = '/dashboard'}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium transition-colors"
      >
        Ir para o Painel
      </button>
    </div>
  );
};

export default CheckoutPage;