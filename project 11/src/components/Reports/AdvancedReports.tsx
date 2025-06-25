import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  Users,
  DollarSign,
  Package,
  Target,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useSupabaseRechargeSystem } from '../../hooks/useSupabaseRechargeSystem';
import { useSupabaseCustomers } from '../../hooks/useSupabaseCustomers';
import { useSupabaseResellers } from '../../hooks/useSupabaseResellers';
import { Plan, Purchase, RechargeCode, Customer, Reseller } from '../../types';

interface ReportData {
  // Vendas por mês
  salesByMonth: Array<{ month: string; sales: number; revenue: number }>;
  // Vendas por operadora/app
  salesByOperator: Array<{ operator: string; sales: number; revenue: number; percentage?: number }>;
  // Crescimento de clientes
  customerGrowth: Array<{ month: string; customers: number; active: number }>;
  // Receita por revendedor
  revenueByReseller: Array<{ reseller: string; revenue: number; customers: number }>;
  // Top planos
  topPlans: Array<{ plan: string; sales: number; revenue: number }>;
  // Funil de conversão
  conversionFunnel: Array<{ stage: string; count: number; percentage: number }>;
}

const AdvancedReports: React.FC = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [reportType, setReportType] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    totalSales: 0,
    avgTicket: 0,
    conversionRate: 0
  });

  // Fetch data from Supabase
  const { 
    codes, 
    plans, 
    allPurchases, 
    isLoading: isRechargeLoading 
  } = useSupabaseRechargeSystem();
  
  const { 
    customers, 
    isLoading: isCustomersLoading 
  } = useSupabaseCustomers();
  
  const { 
    resellers, 
    isLoading: isResellersLoading 
  } = useSupabaseResellers();

  const isLoading = isRechargeLoading || isCustomersLoading || isResellersLoading;

  // Process data for reports when Supabase data changes
  useEffect(() => {
    if (isLoading) return;
    
    setIsProcessing(true);
    
    try {
      // Process data for reports
      const processedData = processReportData(allPurchases, codes, plans, customers, resellers, dateRange);
      setReportData(processedData);
      
      // Calculate KPIs
      const calculatedKpis = calculateKPIs(processedData);
      setKpis(calculatedKpis);
    } catch (error) {
      console.error('Error processing report data:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [allPurchases, codes, plans, customers, resellers, dateRange, isLoading]);

  // Process data for reports
  const processReportData = (
    purchases: Purchase[], 
    codes: RechargeCode[], 
    plans: Plan[], 
    customers: Customer[],
    resellers: Reseller[],
    dateRange: string
  ): ReportData => {
    // Filter data based on date range
    const filteredPurchases = filterByDateRange(purchases, dateRange);
    
    // Process sales by month
    const salesByMonth = processSalesByMonth(filteredPurchases, plans);
    
    // Process sales by operator/app
    const salesByOperator = processSalesByOperator(filteredPurchases, plans);
    
    // Process customer growth
    const customerGrowth = processCustomerGrowth(customers, dateRange);
    
    // Process revenue by reseller
    const revenueByReseller = processRevenueByReseller(filteredPurchases, resellers);
    
    // Process top plans
    const topPlans = processTopPlans(filteredPurchases, plans);
    
    // Process conversion funnel
    const conversionFunnel = processConversionFunnel(filteredPurchases, customers);
    
    return {
      salesByMonth,
      salesByOperator,
      customerGrowth,
      revenueByReseller,
      topPlans,
      conversionFunnel
    };
  };

  // Filter data by date range
  const filterByDateRange = (purchases: Purchase[], dateRange: string): Purchase[] => {
    const now = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case 'last7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'last90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'last12months':
        startDate.setMonth(now.getMonth() - 12);
        break;
      default:
        startDate.setDate(now.getDate() - 30); // Default to last 30 days
    }
    
    return purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.createdAt);
      return purchaseDate >= startDate && purchaseDate <= now;
    });
  };

  // Process sales by month
  const processSalesByMonth = (purchases: Purchase[], plans: Plan[]): ReportData['salesByMonth'] => {
    const monthsMap: Record<string, { sales: number; revenue: number }> = {};
    
    // Get last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const monthKey = date.toLocaleString('pt-BR', { month: 'short' });
      monthsMap[monthKey] = { sales: 0, revenue: 0 };
    }
    
    // Count sales and revenue by month
    purchases.forEach(purchase => {
      const purchaseDate = new Date(purchase.createdAt);
      const monthKey = purchaseDate.toLocaleString('pt-BR', { month: 'short' });
      
      if (monthsMap[monthKey]) {
        monthsMap[monthKey].sales += 1;
        monthsMap[monthKey].revenue += purchase.amount;
      }
    });
    
    // Convert to array format for charts
    return Object.entries(monthsMap).map(([month, data]) => ({
      month,
      sales: data.sales,
      revenue: data.revenue
    }));
  };

  // Process sales by operator/app
  const processSalesByOperator = (purchases: Purchase[], plans: Plan[]): ReportData['salesByOperator'] => {
    const operatorsMap: Record<string, { sales: number; revenue: number }> = {};
    
    // Count sales and revenue by app
    purchases.forEach(purchase => {
      const plan = plans.find(p => p.id === purchase.planId);
      if (!plan) return;
      
      const appName = plan.appConfig.appName;
      
      if (!operatorsMap[appName]) {
        operatorsMap[appName] = { sales: 0, revenue: 0 };
      }
      
      operatorsMap[appName].sales += 1;
      operatorsMap[appName].revenue += purchase.amount;
    });
    
    // Calculate percentages
    const totalSales = Object.values(operatorsMap).reduce((sum, data) => sum + data.sales, 0);
    
    // Convert to array format for charts
    return Object.entries(operatorsMap)
      .map(([operator, data]) => ({
        operator,
        sales: data.sales,
        revenue: data.revenue,
        percentage: totalSales > 0 ? (data.sales / totalSales) * 100 : 0
      }))
      .sort((a, b) => b.sales - a.sales);
  };

  // Process customer growth
  const processCustomerGrowth = (customers: Customer[], dateRange: string): ReportData['customerGrowth'] => {
    const monthsMap: Record<string, { customers: number; active: number }> = {};
    
    // Get last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const monthKey = date.toLocaleString('pt-BR', { month: 'short' });
      monthsMap[monthKey] = { customers: 0, active: 0 };
    }
    
    // Sort customers by creation date
    const sortedCustomers = [...customers].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Calculate cumulative customers by month
    let cumulativeCustomers = 0;
    
    Object.keys(monthsMap).forEach(monthKey => {
      const monthDate = new Date();
      const currentMonthIndex = Object.keys(monthsMap).indexOf(monthKey);
      monthDate.setMonth(now.getMonth() - (5 - currentMonthIndex));
      
      // Count customers created up to this month
      const customersUpToMonth = sortedCustomers.filter(customer => 
        new Date(customer.createdAt) <= monthDate
      );
      
      cumulativeCustomers = customersUpToMonth.length;
      monthsMap[monthKey].customers = cumulativeCustomers;
      
      // Count active customers (with purchases in the last 30 days)
      const activeCustomers = customersUpToMonth.filter(customer => {
        const hasRecentPurchase = customer.purchases.some(purchase => {
          const purchaseDate = new Date(purchase.createdAt);
          const thirtyDaysAgo = new Date(monthDate);
          thirtyDaysAgo.setDate(monthDate.getDate() - 30);
          return purchaseDate >= thirtyDaysAgo && purchaseDate <= monthDate;
        });
        return hasRecentPurchase;
      });
      
      monthsMap[monthKey].active = activeCustomers.length;
    });
    
    // Convert to array format for charts
    return Object.entries(monthsMap).map(([month, data]) => ({
      month,
      customers: data.customers,
      active: data.active
    }));
  };

  // Process revenue by reseller
  const processRevenueByReseller = (purchases: Purchase[], resellers: Reseller[]): ReportData['revenueByReseller'] => {
    const resellersMap: Record<string, { revenue: number; customers: number }> = {};
    
    // Count revenue and customers by reseller
    purchases.forEach(purchase => {
      const resellerId = purchase.resellerId;
      const reseller = resellers.find(r => r.id === resellerId);
      if (!reseller) return;
      
      if (!resellersMap[reseller.name]) {
        resellersMap[reseller.name] = { revenue: 0, customers: 0 };
      }
      
      resellersMap[reseller.name].revenue += purchase.amount;
      
      // Count unique customers
      const customerId = purchase.customerId;
      const existingCustomers = new Set();
      if (!existingCustomers.has(customerId)) {
        resellersMap[reseller.name].customers += 1;
        existingCustomers.add(customerId);
      }
    });
    
    // Convert to array format for charts
    return Object.entries(resellersMap)
      .map(([reseller, data]) => ({
        reseller,
        revenue: data.revenue,
        customers: data.customers
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 resellers
  };

  // Process top plans
  const processTopPlans = (purchases: Purchase[], plans: Plan[]): ReportData['topPlans'] => {
    const plansMap: Record<string, { sales: number; revenue: number }> = {};
    
    // Count sales and revenue by plan
    purchases.forEach(purchase => {
      const planId = purchase.planId;
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;
      
      if (!plansMap[plan.name]) {
        plansMap[plan.name] = { sales: 0, revenue: 0 };
      }
      
      plansMap[plan.name].sales += 1;
      plansMap[plan.name].revenue += purchase.amount;
    });
    
    // Convert to array format for charts
    return Object.entries(plansMap)
      .map(([plan, data]) => ({
        plan,
        sales: data.sales,
        revenue: data.revenue
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Top 5 plans
  };

  // Process conversion funnel
  const processConversionFunnel = (purchases: Purchase[], customers: Customer[]): ReportData['conversionFunnel'] => {
    // This is a simplified mock implementation
    // In a real app, you would track these stages in your analytics
    const visitorsCount = Math.max(customers.length * 5, 1000); // Estimate
    const viewedPlansCount = Math.round(visitorsCount * 0.65);
    const startedCheckoutCount = Math.round(viewedPlansCount * 0.5);
    const filledDataCount = Math.round(startedCheckoutCount * 0.7);
    const completedPurchaseCount = purchases.length;
    
    return [
      { stage: 'Visitantes', count: visitorsCount, percentage: 100 },
      { stage: 'Visualizaram Planos', count: viewedPlansCount, percentage: (viewedPlansCount / visitorsCount) * 100 },
      { stage: 'Iniciaram Checkout', count: startedCheckoutCount, percentage: (startedCheckoutCount / visitorsCount) * 100 },
      { stage: 'Preencheram Dados', count: filledDataCount, percentage: (filledDataCount / visitorsCount) * 100 },
      { stage: 'Finalizaram Compra', count: completedPurchaseCount, percentage: (completedPurchaseCount / visitorsCount) * 100 }
    ];
  };

  // Calculate KPIs
  const calculateKPIs = (data: ReportData | null) => {
    if (!data) {
      return {
        totalRevenue: 0,
        totalSales: 0,
        avgTicket: 0,
        conversionRate: 0
      };
    }
    
    const totalRevenue = data.salesByMonth.reduce((sum, item) => sum + item.revenue, 0);
    const totalSales = data.salesByMonth.reduce((sum, item) => sum + item.sales, 0);
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const conversionRate = data.conversionFunnel[4]?.percentage || 0;
    
    return { totalRevenue, totalSales, avgTicket, conversionRate };
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const exportReport = (format: 'pdf' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting report as ${format}`);
    alert(`Relatório exportado como ${format.toUpperCase()}`);
  };

  if (isLoading || isProcessing) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {isLoading ? 'Carregando dados...' : 'Processando relatórios...'}
          </p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum dado disponível</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Não há dados suficientes para gerar os relatórios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Relatórios Avançados</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Análises detalhadas e insights de negócio</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="last7days">Últimos 7 dias</option>
            <option value="last30days">Últimos 30 dias</option>
            <option value="last90days">Últimos 90 dias</option>
            <option value="last12months">Últimos 12 meses</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('pdf')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Receita Total</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(kpis.totalRevenue)}</p>
              <p className="text-blue-200 text-sm mt-1">+12.5% vs período anterior</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total de Vendas</p>
              <p className="text-3xl font-bold mt-1">{kpis.totalSales.toLocaleString()}</p>
              <p className="text-green-200 text-sm mt-1">+8.3% vs período anterior</p>
            </div>
            <Package className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Ticket Médio</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(kpis.avgTicket)}</p>
              <p className="text-purple-200 text-sm mt-1">+3.7% vs período anterior</p>
            </div>
            <Target className="w-10 h-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Taxa de Conversão</p>
              <p className="text-3xl font-bold mt-1">{kpis.conversionRate.toFixed(1)}%</p>
              <p className="text-orange-200 text-sm mt-1">+2.1% vs período anterior</p>
            </div>
            <Activity className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'sales', label: 'Vendas', icon: TrendingUp },
            { id: 'customers', label: 'Clientes', icon: Users },
            { id: 'resellers', label: 'Revendedores', icon: Users },
            { id: 'conversion', label: 'Conversão', icon: Target }
          ].map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  reportType === type.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {reportType === 'overview' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vendas por Mês</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.salesByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'sales' ? value : formatCurrency(value as number),
                          name === 'sales' ? 'Vendas' : 'Receita'
                        ]}
                      />
                      <Bar dataKey="sales" fill="#3B82F6" name="sales" />
                      <Bar dataKey="revenue" fill="#10B981" name="revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vendas por Aplicativo</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={reportData.salesByOperator}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ operator, percentage }) => `${operator} ${(percentage || 0).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                      >
                        {reportData.salesByOperator.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Vendas']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {reportType === 'sales' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Evolução de Vendas e Receita</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={reportData.salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'sales' ? value : formatCurrency(value as number),
                        name === 'sales' ? 'Vendas' : 'Receita'
                      ]}
                    />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="sales" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 Planos Mais Vendidos</h3>
                <div className="space-y-4">
                  {reportData.topPlans.map((plan, index) => (
                    <div key={plan.plan} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{plan.plan}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{plan.sales} vendas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(plan.revenue)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">receita total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {reportType === 'customers' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Crescimento de Clientes</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={reportData.customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="customers" stroke="#3B82F6" strokeWidth={3} name="Total de Clientes" />
                  <Line type="monotone" dataKey="active" stroke="#10B981" strokeWidth={3} name="Clientes Ativos" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          )}

          {reportType === 'resellers' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance dos Revendedores</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reportData.revenueByReseller} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="reseller" type="category" width={100} />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Receita']} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {reportType === 'conversion' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Funil de Conversão</h3>
              <div className="space-y-4">
                {reportData.conversionFunnel.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{stage.stage}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{stage.count.toLocaleString()} usuários</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 dark:text-blue-400">{stage.percentage.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">do total</p>
                      </div>
                    </div>
                    <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">Insights Inteligentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-6 h-6" />
              <h4 className="font-semibold">Crescimento</h4>
            </div>
            <p className="text-indigo-100">
              {reportData.salesByMonth[5].sales > reportData.salesByMonth[4].sales 
                ? `Suas vendas cresceram ${((reportData.salesByMonth[5].sales / reportData.salesByMonth[4].sales - 1) * 100).toFixed(0)}% no último mês.`
                : 'Suas vendas diminuíram no último mês. Considere novas estratégias de marketing.'}
            </p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="w-6 h-6" />
              <h4 className="font-semibold">Oportunidade</h4>
            </div>
            <p className="text-indigo-100">
              {reportData.salesByOperator.length > 0 
                ? `O app ${reportData.salesByOperator[0].operator} tem a maior margem. Considere criar promoções específicas.`
                : 'Crie promoções específicas para aumentar as vendas.'}
            </p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="w-6 h-6" />
              <h4 className="font-semibold">Retenção</h4>
            </div>
            <p className="text-indigo-100">
              {reportData.customerGrowth.length > 0 && reportData.customerGrowth[5].customers > 0
                ? `${((reportData.customerGrowth[5].active / reportData.customerGrowth[5].customers) * 100).toFixed(0)}% dos seus clientes são ativos. ${
                    (reportData.customerGrowth[5].active / reportData.customerGrowth[5].customers) > 0.8 
                      ? 'Excelente trabalho de retenção!' 
                      : 'Implemente um programa de fidelidade para melhorar a retenção.'
                  }`
                : 'Implemente um programa de fidelidade para melhorar a retenção de clientes.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReports;