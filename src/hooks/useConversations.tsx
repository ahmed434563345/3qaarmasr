import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/supabase/auth';

export interface Conversation {
  id: string;
  property_id: string;
  buyer_id: string;
  agent_id: string;
  updated_at: string;
  property?: {
    title: string;
    images: string[];
  };
  other_user?: {
    name: string;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
  unread_count?: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Get last message and unread count for each conversation
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv) => {
          // Get property details
          const { data: property } = await supabase
            .from('properties')
            .select('title, images')
            .eq('id', conv.property_id)
            .single();

          // Get other user profile
          const otherUserId = conv.buyer_id === user.id ? conv.agent_id : conv.buyer_id;
          const { data: otherUser } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Get last message
          const { data: messages } = await supabase
            .from('messages')
            .select('content, created_at, sender_id, read')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', user.id);

          return {
            ...conv,
            property,
            other_user: otherUser,
            last_message: messages?.[0],
            unread_count: count || 0,
          };
        })
      );

      setConversations(conversationsWithMessages);
      setLoading(false);
    };

    fetchConversations();

    // Subscribe to conversation changes
    const channel = supabase
      .channel('conversations-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { conversations, loading };
};
