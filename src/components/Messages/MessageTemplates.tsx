import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Eye, 
  Save, 
  X,
  Copy,
  Send,
  Settings,
  Smartphone,
  Mail,
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { MessageTemplate } from '../../types';
import { formatDate } from '../../utils/formatters';

interface MessageTemplatesProps {
  templates: MessageTemplate[];
  onAddTemplate: (template: Omit<MessageTemplate, 'id'>) => void;
  onEditTemplate: (id: string, template: Partial<MessageTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onTestTemplate: (template: MessageTemplate) => void;
}

const MessageTemplates: React.FC<MessageTemplatesProps> = ({
  templates,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onTestTemplate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<MessageTemplate> | null>(null);
  const [previewData, setPreviewData] = useState({
    customerName: 'João Silva',
    rechargeCode: 'ABCD-1234-EFGH-5678',
    planName: 'Recarga 30',
    expiryDate: '15/04/2024',
    companyName: 'Sistema Pro'
  });

  const templateTypes = [
    {
      id: 'purchase_confirmation',
      name: 'Confirmação de Compra',
      description: 'Enviado após aprovação do pagamento',
      icon: CheckCircle,
      color: 'bg-green-500',
      variables: ['customerName', 'rechargeCode', 'planName', 'companyName']
    },
    {
      id: 'expiry_reminder_3d',
      name: 'Lembrete 3 Dias',
      description: 'Enviado 3 dias antes do vencimento',
      icon: Clock,
      color: 'bg-yellow-500',
      variables: ['customerName', 'planName', 'expiryDate', 'companyName']
    },
    {
      id: 'expiry_reminder_1d',
      name: 'Lembrete 1 Dia',
      description: 'Enviado 1 dia antes do vencimento',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      variables: ['customerName', 'planName', 'expiryDate', 'companyName']
    },
    {
      id: 'expiry_reminder_0d',
      name: 'Vencimento Hoje',
      description: 'Enviado no dia do vencimento',
      icon: Bell,
      color: 'bg-red-500',
      variables: ['customerName', 'planName', 'companyName']
    }
  ];

  const getTemplatesByType = (type: string) => {
    return templates.filter(t => t.type === type);
  };

  const handleCreateTemplate = (type: string) => {
    const templateType = templateTypes.find(t => t.id === type);
    if (!templateType) return;

    const newTemplate: Partial<MessageTemplate> = {
      type: type as any,
      title: templateType.name,
      content: getDefaultContent(type),
      variables: templateType.variables,
      userId: 'current-user',
      isActive: true
    };

    setEditingTemplate(newTemplate);
    setShowEditor(true);
  };

  const getDefaultContent = (type: string): string => {
    const defaults = {
      purchase_confirmation: `Olá {{customerName}}! 🎉

Sua compra foi aprovada com sucesso!

📱 Plano: {{planName}}
🔑 Código: {{rechargeCode}}

Obrigado por escolher a {{companyName}}!`,

      expiry_reminder_3d: `Olá {{customerName}}! ⏰

Seu plano {{planName}} vence em 3 dias ({{expiryDate}}).

Renove agora e continue aproveitando nossos serviços!

{{companyName}}`,

      expiry_reminder_1d: `Atenção {{customerName}}! ⚠️

Seu plano {{planName}} vence AMANHÃ ({{expiryDate}}).

Não perca tempo, renove agora!

{{companyName}}`,

      expiry_reminder_0d: `URGENTE {{customerName}}! 🚨

Seu plano {{planName}} vence HOJE!

Renove agora para não ficar sem serviço.

{{companyName}}`
    };

    return defaults[type as keyof typeof defaults] || '';
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    if (editingTemplate.id) {
      onEditTemplate(editingTemplate.id, editingTemplate);
    } else {
      onAddTemplate(editingTemplate as Omit<MessageTemplate, 'id'>);
    }

    setEditingTemplate(null);
    setShowEditor(false);
  };

  const replaceVariables = (content: string, data: any): string => {
    let result = content;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key]);
    });
    return result;
  };

  const getChannelIcon = (channel: 'email' | 'whatsapp' | 'dashboard') => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'whatsapp': return <Smartphone className="w-4 h-4" />;
      case 'dashboard': return <Bell className="w-4 h-4" />;
    }
  };

  if (showEditor) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setEditingTemplate(null);
          setShowEditor(false);
        }}
        onChange={setEditingTemplate}
        previewData={previewData}
        onPreviewDataChange={setPreviewData}
      />
    );
  }

  if (selectedTemplate) {
    return (
      <TemplateDetails
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
        onEdit={() => {
          setEditingTemplate(selectedTemplate);
          setShowEditor(true);
        }}
        onTest={() => onTestTemplate(selectedTemplate)}
        onDelete={() => {
          onDeleteTemplate(selectedTemplate.id);
          setSelectedTemplate(null);
        }}
        previewData={previewData}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Templates de Mensagens</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Personalize todas as mensagens automáticas do sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </div>
      </div>

      {/* Template Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templateTypes.map(type => {
          const Icon = type.icon;
          const typeTemplates = getTemplatesByType(type.id);
          const activeTemplates = typeTemplates.filter(t => t.isActive).length;

          return (
            <div key={type.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className={`${type.color} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <Icon className="w-8 h-8" />
                  <span className="text-sm font-medium bg-white bg-opacity-20 px-2 py-1 rounded-full">
                    {typeTemplates.length}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-4">{type.name}</h3>
                <p className="text-sm opacity-90 mt-1">{type.description}</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {typeTemplates.slice(0, 2).map(template => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{template.title}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          template.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}></span>
                      </div>
                    </div>
                  ))}
                  
                  {typeTemplates.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                      Nenhum template criado
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleCreateTemplate(type.id)}
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Template</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* All Templates List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Todos os Templates</h2>
        </div>
        
        <div className="p-6">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhum template criado</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Comece criando seu primeiro template de mensagem</p>
              <button
                onClick={() => handleCreateTemplate('purchase_confirmation')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Criar Primeiro Template
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map(template => {
                const templateType = templateTypes.find(t => t.id === template.type);
                const Icon = templateType?.icon || MessageSquare;

                return (
                  <div
                    key={template.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`${templateType?.color || 'bg-gray-500'} p-2 rounded-lg text-white`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{template.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{templateType?.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          template.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {template.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTemplate(template);
                              setShowEditor(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTestTemplate(template);
                            }}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TemplateEditor: React.FC<{
  template: Partial<MessageTemplate> | null;
  onSave: () => void;
  onCancel: () => void;
  onChange: (template: Partial<MessageTemplate>) => void;
  previewData: any;
  onPreviewDataChange: (data: any) => void;
}> = ({ template, onSave, onCancel, onChange, previewData, onPreviewDataChange }) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  if (!template) return null;

  const replaceVariables = (content: string, data: any): string => {
    let result = content;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key]);
    });
    return result;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {template.id ? 'Editar Template' : 'Novo Template'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Configure o conteúdo da mensagem</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('edit')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'edit'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Editar
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Visualizar
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'edit' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título do Template
                  </label>
                  <input
                    type="text"
                    value={template.title || ''}
                    onChange={(e) => onChange({ ...template, title: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Confirmação de Compra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conteúdo da Mensagem
                  </label>
                  <textarea
                    value={template.content || ''}
                    onChange={(e) => onChange({ ...template, content: e.target.value })}
                    rows={12}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Digite o conteúdo da mensagem..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={template.isActive || false}
                    onChange={(e) => onChange({ ...template, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Template Ativo
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Preview da Mensagem</h3>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans">
                      {replaceVariables(template.content || '', previewData)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Variables & Preview Data */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Variáveis Disponíveis</h3>
            <div className="space-y-3">
              {(template.variables || []).map(variable => (
                <div
                  key={variable}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(`{{${variable}}}`);
                  }}
                >
                  <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{`{{${variable}}}`}</span>
                  <Copy className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dados para Preview</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  value={previewData.customerName}
                  onChange={(e) => onPreviewDataChange({ ...previewData, customerName: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código de Recarga</label>
                <input
                  type="text"
                  value={previewData.rechargeCode}
                  onChange={(e) => onPreviewDataChange({ ...previewData, rechargeCode: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Plano</label>
                <input
                  type="text"
                  value={previewData.planName}
                  onChange={(e) => onPreviewDataChange({ ...previewData, planName: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Vencimento</label>
                <input
                  type="text"
                  value={previewData.expiryDate}
                  onChange={(e) => onPreviewDataChange({ ...previewData, expiryDate: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  value={previewData.companyName}
                  onChange={(e) => onPreviewDataChange({ ...previewData, companyName: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TemplateDetails: React.FC<{
  template: MessageTemplate;
  onBack: () => void;
  onEdit: () => void;
  onTest: () => void;
  onDelete: () => void;
  previewData: any;
}> = ({ template, onBack, onEdit, onTest, onDelete, previewData }) => {
  const replaceVariables = (content: string, data: any): string => {
    let result = content;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key]);
    });
    return result;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center space-x-2"
        >
          <span>← Voltar</span>
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={onTest}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Testar</span>
          </button>
          <button
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{template.title}</h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              template.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {template.isActive ? 'Ativo' : 'Inativo'}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Tipo: {template.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conteúdo Original</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                {template.content}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview com Dados</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans">
                {replaceVariables(template.content, previewData)}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Variáveis Utilizadas</h3>
          <div className="flex flex-wrap gap-2">
            {template.variables.map(variable => (
              <span
                key={variable}
                className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm font-mono"
              >
                {`{{${variable}}}`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageTemplates;