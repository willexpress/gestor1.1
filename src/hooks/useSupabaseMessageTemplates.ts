import { useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { MessageTemplate } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useSupabaseMessageTemplates = () => {
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch message templates from Supabase
  const fetchMessageTemplates = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching message templates:', error);
        throw new Error(handleSupabaseError(error));
      }

      const formattedTemplates: MessageTemplate[] = data.map(template => ({
        id: template.id,
        type: template.type as MessageTemplate['type'],
        title: template.title,
        content: template.content,
        variables: template.variables,
        userId: template.user_id,
        isActive: template.is_active,
        channels: template.channels as MessageTemplate['channels']
      }));

      setMessageTemplates(formattedTemplates);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchMessageTemplates:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Add new message template
  const addTemplate = async (templateData: Omit<MessageTemplate, 'id'>) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          type: templateData.type,
          title: templateData.title,
          content: templateData.content,
          variables: templateData.variables,
          user_id: user.id,
          is_active: templateData.isActive,
          channels: templateData.channels
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding message template:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Refresh templates list
      await fetchMessageTemplates();
      return data;
    } catch (error) {
      console.error('Error in addTemplate:', error);
      throw error;
    }
  };

  // Edit message template
  const editTemplate = async (id: string, templateData: Partial<MessageTemplate>) => {
    try {
      const updateData: any = {};
      
      if (templateData.type !== undefined) updateData.type = templateData.type;
      if (templateData.title !== undefined) updateData.title = templateData.title;
      if (templateData.content !== undefined) updateData.content = templateData.content;
      if (templateData.variables !== undefined) updateData.variables = templateData.variables;
      if (templateData.isActive !== undefined) updateData.is_active = templateData.isActive;
      if (templateData.channels !== undefined) updateData.channels = templateData.channels;

      const { error } = await supabase
        .from('message_templates')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error editing message template:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Refresh templates list
      await fetchMessageTemplates();
    } catch (error) {
      console.error('Error in editTemplate:', error);
      throw error;
    }
  };

  // Delete message template
  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting message template:', error);
        throw new Error(handleSupabaseError(error));
      }

      // Refresh templates list
      await fetchMessageTemplates();
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      throw error;
    }
  };

  // Test message template (mock implementation)
  const testTemplate = async (template: MessageTemplate) => {
    try {
      console.log('Testing template:', template);
      // Here you would implement the actual testing logic
      // For now, we'll just simulate a successful test
      return { success: true, message: `Template "${template.title}" testado com sucesso!` };
    } catch (error) {
      console.error('Error in testTemplate:', error);
      throw error;
    }
  };

  return {
    messageTemplates,
    isLoading,
    addTemplate,
    editTemplate,
    deleteTemplate,
    testTemplate,
    fetchMessageTemplates
  };
};