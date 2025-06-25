import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Gift, 
  Ticket, 
  Download, 
  Star, 
  CheckCircle, 
  XCircle,
  Clock,
  DollarSign,
  UserPlus,
  FileText,
  Percent,
  Smartphone,
  TrendingUp
} from 'lucide-react';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'promotion' | 'coupon' | 'app_update' | 'loyalty_reward' | 'special_offer' | 'new_feature' | 'customer_registered' | 'invoice_created' | 'invoice_paid' | 'invoice_overdue' | 'low_stock' | 'payment_received' | 'payment_failed' | 'system_alert';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { user } = useAuth();
  
  // Referências para os elementos de áudio
  const cashSoundRef = useRef<HTMLAudioElement | null>(null);
  const registerSoundRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar elementos de áudio
  useEffect(() => {
    // Criar elementos de áudio
    cashSoundRef.current = new Audio('/sounds/cash.mp3');
    registerSoundRef.current = new Audio('/sounds/register.mp3');

    // Configurar propriedades dos áudios
    if (cashSoundRef.current) {
      cashSoundRef.current.preload = 'auto';
      cashSoundRef.current.volume = 0.7;
    }
    
    if (registerSoundRef.current) {
      registerSoundRef.current.preload = 'auto';
      registerSoundRef.current.volume = 0.7;
    }

    // Carregar preferência de som do localStorage
    const savedSoundPreference = localStorage.getItem('notificationSoundEnabled');
    if (savedSoundPreference !== null) {
      setSoundEnabled(JSON.parse(savedSoundPreference));
    }

    // Carregar notificações salvas do localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Converter timestamps de volta para Date objects
        const restored = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(restored);
      } catch (e) {
        console.error('Erro ao carregar notificações salvas:', e);
      }
    }

    // Cleanup
    return () => {
      if (cashSoundRef.current) {
        cashSoundRef.current.pause();
        cashSoundRef.current = null;
      }
      if (registerSoundRef.current) {
        registerSoundRef.current.pause();
        registerSoundRef.current = null;
      }
    };
  }, []);

  // Salvar notificações no localStorage quando mudam
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Função para reproduzir som
  const playSound = async (soundType: 'cash' | 'register') => {
    if (!soundEnabled) return;

    try {
      let audioElement: HTMLAudioElement | null = null;
      
      if (soundType === 'cash' && cashSoundRef.current) {
        audioElement = cashSoundRef.current;
      } else if (soundType === 'register' && registerSoundRef.current) {
        audioElement = registerSoundRef.current;
      }

      if (audioElement) {
        // Reset audio to beginning
        audioElement.currentTime = 0;
        
        // Play the sound
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error) {
      console.warn('Erro ao reproduzir som de notificação:', error);
      // Se falhar, tenta criar um novo elemento de áudio
      try {
        const fallbackAudio = new Audio(soundType === 'cash' ? '/sounds/cash.mp3' : '/sounds/register.mp3');
        fallbackAudio.volume = 0.7;
        await fallbackAudio.play();
      } catch (fallbackError) {
        console.warn('Erro no fallback de áudio:', fallbackError);
      }
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Manter apenas 100 notificações

    // 🔊 REPRODUZIR SOM BASEADO NO TIPO DE NOTIFICAÇÃO
    if (soundEnabled) {
      // Som de cash para promoções e cupons (coisas boas para o cliente)
      if (notification.type === 'promotion' || 
          notification.type === 'coupon' || 
          notification.type === 'special_offer' ||
          notification.type === 'loyalty_reward' ||
          notification.type === 'invoice_paid' || 
          notification.type === 'payment_received') {
        playSound('cash');
      }
      // Som de registro para atualizações e novos recursos
      else if (notification.type === 'app_update' || 
               notification.type === 'new_feature' ||
               notification.type === 'customer_registered') {
        playSound('register');
      }
    }

    // Mostrar notificação do navegador se permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: newNotification.id,
          requireInteraction: newNotification.priority === 'urgent',
          silent: !soundEnabled // Se som está desabilitado, notificação será silenciosa
        });
      } catch (error) {
        console.warn('Erro ao mostrar notificação do navegador:', error);
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('notificationSoundEnabled', JSON.stringify(newSoundEnabled));
    
    // Tocar som de teste quando ativar
    if (newSoundEnabled) {
      playSound('cash');
    }
  };

  // Solicitar permissão para notificações do navegador
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Permissão para notificações concedida');
        }
      });
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      soundEnabled,
      toggleSound
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'promotion':
    case 'special_offer':
      return Gift;
    case 'coupon':
      return Ticket;
    case 'app_update':
      return Download;
    case 'loyalty_reward':
      return Star;
    case 'new_feature':
      return Smartphone;
    case 'customer_registered':
      return UserPlus;
    case 'invoice_created':
      return FileText;
    case 'invoice_paid':
      return CheckCircle;
    case 'invoice_overdue':
      return Clock;
    case 'low_stock':
      return TrendingUp;
    case 'payment_received':
      return DollarSign;
    case 'payment_failed':
      return XCircle;
    case 'system_alert':
      return Clock;
    default:
      return Clock;
  }
};

export const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
  if (priority === 'urgent') return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
  if (priority === 'high') return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
  
  switch (type) {
    case 'promotion':
    case 'special_offer':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
    case 'coupon':
      return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400';
    case 'app_update':
    case 'new_feature':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    case 'loyalty_reward':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'customer_registered':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    case 'invoice_created':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
    case 'invoice_paid':
    case 'payment_received':
      return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    case 'invoice_overdue':
    case 'payment_failed':
      return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
    case 'low_stock':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'system_alert':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
  }
};