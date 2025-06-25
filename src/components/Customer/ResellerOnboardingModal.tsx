import React, { useState, useEffect } from 'react';
import { X, Crown, TrendingUp, DollarSign, Users, Star, CheckCircle, Play } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface ResellerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResellerOnboardingModal: React.FC<ResellerOnboardingModalProps> = ({ isOpen, onClose }) => {
  const [showPurchaseButton, setShowPurchaseButton] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setShowPurchaseButton(false);
      setTimeRemaining(10);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setShowPurchaseButton(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePurchase = () => {
    // Aqui você pode implementar a lógica de compra
    // Por exemplo, redirecionar para o checkout com o plano de qualificação master
    console.log('Iniciando processo de compra para se tornar revendedor');
    // Fechar o modal e navegar para checkout
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-3 rounded-xl">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Torne-se um Revendedor</h2>
              <p className="text-gray-600 dark:text-gray-300">Descubra como ganhar dinheiro com nossa rede</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Video Section */}
          <div className="relative">
            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
              {/* Placeholder para vídeo - substitua pela URL do seu vídeo */}
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                title="Como se tornar um revendedor"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              
              {/* Overlay com timer quando o botão ainda não apareceu */}
              {!showPurchaseButton && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-semibold">Assista ao vídeo completo</p>
                    <p className="text-sm opacity-80">Oferta especial em {timeRemaining}s</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chamada para Ação Inicial */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              💰 Transforme sua Vida Financeira
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Junte-se a mais de <span className="font-bold text-blue-600">2.000 revendedores</span> que já estão 
              <span className="font-bold text-green-600"> faturando até R$ 15.000/mês</span>
            </p>
          </div>

          {/* Benefícios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Comissões de até 15%</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Ganhe em cada venda realizada com margens exclusivas</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Rede de Contatos</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Acesso a uma rede exclusiva de revendedores de sucesso</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Suporte Completo</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Treinamento, materiais e suporte técnico inclusos</p>
            </div>
          </div>

          {/* Seção que aparece após 10 segundos */}
          {showPurchaseButton && (
            <div className="space-y-8 animate-fade-in">
              {/* Oferta Especial */}
              <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-8 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-4">🔥 OFERTA LIMITADA 🔥</h3>
                  <p className="text-xl mb-6">
                    <span className="line-through opacity-75">De R$ 1.997</span> por apenas
                  </p>
                  <div className="text-5xl font-bold mb-4">{formatCurrency(997)}</div>
                  <p className="text-lg mb-6">
                    ⚡ Últimas <span className="font-bold">24 horas</span> com este preço!
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Acesso Vitalício</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Suporte Incluído</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Garantia 30 dias</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* O que você recebe */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  🎁 O que você recebe HOJE:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Acesso ao painel de revendedor',
                    'Treinamento completo em vídeo',
                    'Kit de materiais de divulgação',
                    'Suporte técnico prioritário',
                    'Grupo VIP no WhatsApp',
                    'Certificado de revendedor oficial',
                    'Comissões de até 15% por venda',
                    'Bônus: E-book "Vendas Digitais"'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Depoimentos rápidos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">M</div>
                    <span className="font-semibold text-gray-900 dark:text-white">Maria S.</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">"Em 2 meses já recuperei o investimento. Agora faturando R$ 8k/mês!"</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">J</div>
                    <span className="font-semibold text-gray-900 dark:text-white">João P.</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">"Melhor investimento que fiz! Suporte incrível e resultados rápidos."</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
                    <span className="font-semibold text-gray-900 dark:text-white">Ana L.</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">"Saí do zero e hoje tenho uma renda extra de R$ 5k mensais!"</p>
                </div>
              </div>

              {/* Urgência */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
                <h4 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
                  ⚠️ ATENÇÃO: Apenas 7 vagas restantes!
                </h4>
                <p className="text-red-700 dark:text-red-400 text-sm">
                  Para manter a qualidade do suporte, limitamos a entrada de novos revendedores.
                </p>
              </div>

              {/* Botão de Compra */}
              <div className="text-center space-y-4">
                <button
                  onClick={handlePurchase}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl font-bold py-6 px-12 rounded-2xl transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 animate-pulse"
                >
                  🚀 QUERO SER REVENDEDOR AGORA
                </button>
                
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Pagamento Seguro</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Acesso Imediato</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Garantia 30 dias</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ao clicar no botão, você será direcionado para o checkout seguro
                </p>
              </div>

              {/* Garantia */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 text-center">
                <h4 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">
                  🛡️ Garantia Incondicional de 30 Dias
                </h4>
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  Se não ficar satisfeito, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
                </p>
              </div>
            </div>
          )}

          {/* Timer quando o botão ainda não apareceu */}
          {!showPurchaseButton && (
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
                <h4 className="text-xl font-bold mb-2">🎬 Continue assistindo...</h4>
                <p className="text-lg">
                  Oferta especial será revelada em <span className="font-bold text-yellow-300">{timeRemaining}s</span>
                </p>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-4">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((10 - timeRemaining) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ResellerOnboardingModal;