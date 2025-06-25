import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, 
  CreditCard, 
  ShoppingCart, 
  Play, 
  MessageCircle,
  Crown,
  Star,
  TrendingUp,
  Eye,
  Download,
  DollarSign,
  Calendar,
  Award,
  Gift,
  Users,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plan } from '../../types';
import CodeDetailsModal from './CodeDetailsModal';
import ResellerOnboardingModal from './ResellerOnboardingModal';

interface CustomerDashboardProps {
  onNavigate?: (tab: string) => void;
  activeTab?: string;
  plans?: Plan[];
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate, activeTab = 'overview', plans = [] }) => {
  const [planCarouselPage, setPlanCarouselPage] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Estados para o modal de detalhes do código
  const [showCodeDetailsModal, setShowCodeDetailsModal] = useState(false);
  const [selectedCodeForDetails, setSelectedCodeForDetails] = useState<any>(null);
  
  // Estado para o modal de revendedor
  const [showResellerModal, setShowResellerModal] = useState(false);

  // Mock data do cliente
  const customerData = {
    name: 'João Silva Santos',
    email: 'cliente@sistema.com',
    phone: '(11) 95432-1098',
    points: 1250,
    loyaltyLevel: 'silver' as const,
    totalSpent: 850,
    codesOwned: [
      {
        id: 'code-1',
        code: 'ABCD-1234-EFGH-5678',
        planName: 'Recarga 30',
        appName: 'MeuApp Recarga',
        value: 30,
        purchaseDate: new Date('2024-01-15'),
        expiryDate: new Date('2024-02-15'),
        status: 'active' as const,
        createdAt: new Date('2024-01-15'),
        expiresAt: new Date('2024-02-15'),
        planId: 'plan-1'
      },
      {
        id: 'code-2',
        code: 'WXYZ-9876-IJKL-5432',
        planName: 'Recarga 50',
        appName: 'SuperRecarga',
        value: 50,
        purchaseDate: new Date('2024-01-20'),
        expiryDate: new Date('2024-02-20'),
        status: 'active' as const,
        createdAt: new Date('2024-01-20'),
        expiresAt: new Date('2024-02-20'),
        planId: 'plan-2'
      },
      {
        id: 'code-3',
        code: 'QWER-5678-TYUI-9012',
        planName: 'Recarga 20',
        appName: 'RecargaMax',
        value: 20,
        purchaseDate: new Date('2023-12-10'),
        expiryDate: new Date('2024-01-10'),
        status: 'expired' as const,
        createdAt: new Date('2023-12-10'),
        expiresAt: new Date('2024-01-10'),
        planId: 'plan-3'
      }
    ]
  };

  // Use plans from props or fallback to mock data
  const availablePlans = plans.length > 0 ? plans : [
    {
      id: 'plan-1',
      name: 'Recarga 15',
      description: 'Recarga básica com internet',
      value: 15,
      appConfig: {
        appName: 'BasicApp',
        hasApp: true
      },
      features: ['Ligações ilimitadas', '1GB de internet', 'WhatsApp grátis'],
      validityDays: 30
    },
    {
      id: 'plan-2',
      name: 'Recarga 25',
      description: 'Recarga intermediária',
      value: 25,
      appConfig: {
        appName: 'MidApp',
        hasApp: true
      },
      features: ['Ligações ilimitadas', '3GB de internet', 'SMS ilimitado'],
      validityDays: 30
    },
    {
      id: 'plan-3',
      name: 'Recarga 40',
      description: 'Recarga completa',
      value: 40,
      appConfig: {
        appName: 'ProApp',
        hasApp: true
      },
      features: ['Ligações ilimitadas', '6GB de internet', 'Redes sociais grátis'],
      validityDays: 30
    },
    {
      id: 'plan-4',
      name: 'Recarga 60',
      description: 'Recarga premium',
      value: 60,
      appConfig: {
        appName: 'PremiumApp',
        hasApp: true
      },
      features: ['Ligações ilimitadas', '10GB de internet', 'Streaming grátis'],
      validityDays: 30
    },
    {
      id: 'plan-5',
      name: 'Recarga 100',
      description: 'Recarga ultra',
      value: 100,
      appConfig: {
        appName: 'UltraApp',
        hasApp: true
      },
      features: ['Ligações ilimitadas', '20GB de internet', 'Todos os apps grátis'],
      validityDays: 30
    }
  ];

  const tutorials = [
    {
      id: 'tutorial-1',
      title: 'Como usar seu código de recarga',
      description: 'Aprenda a ativar seu código de recarga no celular',
      duration: '3:45',
      thumbnail: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    },
    {
      id: 'tutorial-2',
      title: 'Programa de pontos e benefícios',
      description: 'Entenda como funciona nosso sistema de fidelidade',
      duration: '5:20',
      thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    },
    {
      id: 'tutorial-3',
      title: 'Como se tornar um revendedor',
      description: 'Descubra as vantagens de ser um revendedor',
      duration: '7:15',
      thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    }
  ];

  const getLoyaltyBadge = (level: string) => {
    const badges = {
      bronze: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', icon: '🥉', name: 'Bronze' },
      silver: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-200 dark:text-gray-900', icon: '🥈', name: 'Prata' },
      gold: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: '🥇', name: 'Ouro' },
      platinum: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', icon: '💎', name: 'Platina' }
    };
    return badges[level as keyof typeof badges] || badges.bronze;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      used: 'bg-gray-100 text-gray-800 dark:bg-gray-200 dark:text-gray-900'
    };
    const labels = {
      active: 'Ativo',
      expired: 'Expirado',
      used: 'Usado'
    };
    return { color: badges[status as keyof typeof badges], label: labels[status as keyof typeof labels] };
  };

  const loyaltyBadge = getLoyaltyBadge(customerData.loyaltyLevel);

  const handleTabChange = (tabId: string) => {
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  // Função para abrir o modal de detalhes do código
  const handleViewCodeDetails = (code: any) => {
    setSelectedCodeForDetails(code);
    setShowCodeDetailsModal(true);
  };

  // Função para fechar o modal
  const handleCloseCodeDetailsModal = () => {
    setShowCodeDetailsModal(false);
    setSelectedCodeForDetails(null);
  };

  // Funções para navegação do carrossel
  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const cardWidth = container.scrollWidth / availablePlans.length;
    const scrollPosition = cardWidth * index;
    
    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  };

  const nextPlan = () => {
    const nextIndex = (planCarouselPage + 1) % availablePlans.length;
    setPlanCarouselPage(nextIndex);
    scrollToIndex(nextIndex);
  };

  const prevPlan = () => {
    const prevIndex = (planCarouselPage - 1 + availablePlans.length) % availablePlans.length;
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
    const cardWidth = container.scrollWidth / availablePlans.length;
    const currentIndex = Math.round(container.scrollLeft / cardWidth);
    
    if (currentIndex !== planCarouselPage && currentIndex >= 0 && currentIndex < availablePlans.length) {
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
  }, [planCarouselPage, availablePlans.length]);

  // Componente do carrossel reutilizável
  const PlansCarousel = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Planos Disponíveis</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevPlan}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex space-x-1">
            {availablePlans.map((_, index) => (
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
          {availablePlans.map((plan, index) => (
            <div
              key={plan.id}
              className="flex-none w-[calc(50%-8px)] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] select-none"
              style={{
                // Mobile: 2 planos (um inteiro + metade do próximo)
                // Desktop: 3 planos
                minWidth: window.innerWidth < 640 ? 'calc(60% - 8px)' : 
                         window.innerWidth < 1024 ? 'calc(50% - 8px)' : 
                         'calc(33.333% - 11px)'
              }}
            >
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 h-full hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{plan.description}</p>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {formatCurrency(plan.value)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Válido por {plan.validityDays} dias</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.appConfig.appName}</p>
                </div>
                
                <div className="space-y-2 mb-6">
                  {plan.features?.slice(0, 3).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => handleTabChange('plans')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Comprar Agora
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header do Cliente - APENAS na aba "overview" */}
      {activeTab === 'overview' && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-bold mb-2">Olá, {customerData.name}! 👋</h1>
              <p className="text-blue-100 mb-4">Bem-vindo ao seu painel pessoal</p>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${loyaltyBadge.color}`}>
                  {loyaltyBadge.icon} {loyaltyBadge.name}
                </span>
                <span className="text-blue-100">
                  <Star className="w-4 h-4 inline mr-1" />
                  {customerData.points} pontos
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <p className="text-2xl font-bold">{customerData.codesOwned.filter(c => c.status === 'active').length}</p>
                <p className="text-blue-100 text-sm">Códigos Ativos</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <p className="text-2xl font-bold">{formatCurrency(customerData.totalSpent)}</p>
                <p className="text-blue-100 text-sm">Total Gasto</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Package },
              { id: 'plans', label: 'Comprar Planos', icon: ShoppingCart },
              { id: 'codes', label: 'Meus Códigos', icon: CreditCard },
              { id: 'tutorials', label: 'Tutoriais', icon: Play },
              { id: 'support', label: 'Suporte', icon: MessageCircle },
              { id: 'reseller', label: 'Ser Revendedor', icon: Crown }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Códigos Recentes</h3>
                  <div className="space-y-3">
                    {customerData.codesOwned.slice(0, 3).map(code => {
                      const status = getStatusBadge(code.status);
                      return (
                        <div key={code.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm text-gray-600 dark:text-gray-300">{code.code}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-300">{code.planName} - {code.appName}</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(code.value)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Compra: {formatDate(code.createdAt).split(' ')[0]}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span className={code.status === 'expired' ? 'text-red-500 dark:text-red-400' : ''}>
                                Vence: {formatDate(code.expiresAt).split(' ')[0]}
                              </span>
                            </div>
                          </div>
                          {/* Botão Ver Detalhes */}
                          <button
                            onClick={() => handleViewCodeDetails(code)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver Detalhes</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Programa de Fidelidade</h3>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${loyaltyBadge.color}`}>
                        {loyaltyBadge.icon} Nível {loyaltyBadge.name}
                      </span>
                      <span className="text-yellow-700 dark:text-yellow-300 font-bold">{customerData.points} pontos</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-700 dark:text-yellow-300">Próximo nível: Ouro</span>
                        <span className="text-yellow-700 dark:text-yellow-300">Faltam 750 pontos</span>
                      </div>
                      <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full transition-all duration-500" style={{ width: '62%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <PlansCarousel />
          )}

          {activeTab === 'codes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Códigos de Recarga</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customerData.codesOwned.map(code => {
                  const status = getStatusBadge(code.status);
                  return (
                    <div key={code.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{code.planName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Código de Recarga</p>
                          <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{code.code}</p>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Aplicativo:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{code.appName}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Valor:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(code.value)}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Comprado em:</span>
                          <span className="text-gray-900 dark:text-white">{formatDate(code.createdAt)}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Expira em:</span>
                          <span className={`font-medium ${code.status === 'expired' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            {formatDate(code.expiresAt)}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleViewCodeDetails(code)}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver Detalhes</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'tutorials' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vídeos Tutoriais</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map(tutorial => (
                  <div key={tutorial.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={tutorial.thumbnail} 
                        alt={tutorial.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button className="bg-white bg-opacity-90 p-3 rounded-full">
                          <Play className="w-6 h-6 text-gray-900" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        {tutorial.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tutorial.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{tutorial.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Central de Suporte</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                    <div className="flex items-center space-x-4 mb-4">
                      <MessageCircle className="w-8 h-8" />
                      <div>
                        <h3 className="text-xl font-bold">Chat ao Vivo</h3>
                        <p className="text-green-100">Fale conosco agora</p>
                      </div>
                    </div>
                    <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                      Iniciar Chat
                    </button>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Perguntas Frequentes</h3>
                    <div className="space-y-3">
                      <details className="group">
                        <summary className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                          Como ativar meu código de recarga?
                        </summary>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 pl-4">
                          Digite *321# no seu celular e siga as instruções, ou acesse o site da sua operadora.
                        </p>
                      </details>
                      <details className="group">
                        <summary className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                          Meu código expirou, posso recuperar?
                        </summary>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 pl-4">
                          Códigos expirados não podem ser recuperados. Entre em contato conosco para mais informações.
                        </p>
                      </details>
                      <details className="group">
                        <summary className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                          Como funciona o programa de pontos?
                        </summary>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 pl-4">
                          A cada R$ 1,00 gasto, você ganha 1 ponto. Acumule pontos e troque por descontos.
                        </p>
                      </details>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contatos</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                          <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">WhatsApp</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">(11) 99999-9999</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                          <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">E-mail</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">suporte@sistema.com</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">Horário de Atendimento</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-400">Segunda a Sexta:</span>
                        <span className="text-blue-900 dark:text-blue-300">8h às 18h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-400">Sábado:</span>
                        <span className="text-blue-900 dark:text-blue-300">8h às 14h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-400">Domingo:</span>
                        <span className="text-blue-900 dark:text-blue-300">Fechado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reseller' && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Torne-se um Revendedor</h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Ganhe dinheiro vendendo códigos de recarga! Junte-se à nossa rede de revendedores e 
                  tenha uma fonte de renda extra com comissões atrativas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Comissões Atrativas</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Ganhe até 15% de comissão em cada venda realizada</p>
                </div>

                <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Suporte Completo</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Treinamento e suporte para você vender mais</p>
                </div>

                <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="bg-purple-100 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Crescimento</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Possibilidade de se tornar Revendedor Master</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-8 border border-yellow-200 dark:border-yellow-700">
                <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-4">Como Funciona?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Cadastre-se</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">Preencha o formulário de interesse</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Treinamento</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">Receba capacitação gratuita</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Comece a Vender</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">Acesse seu painel e venda</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setShowResellerModal(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Quero Ser Revendedor
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Sem taxa de adesão • Comece hoje mesmo
                </p>
              </div>
            </div>
          )}
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

      {/* Modal de Detalhes do Código */}
      {showCodeDetailsModal && selectedCodeForDetails && (
        <CodeDetailsModal
          code={selectedCodeForDetails}
          onClose={handleCloseCodeDetailsModal}
        />
      )}

      {/* Modal de Onboarding para Revendedores */}
      <ResellerOnboardingModal
        isOpen={showResellerModal}
        onClose={() => setShowResellerModal(false)}
      />
    </div>
  );
};

export default CustomerDashboard;