
import { useState } from 'react';
import { useAuth } from '@/lib/supabase/auth';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { ConversationsList } from '@/components/messages/ConversationsList';
import { ChatArea } from '@/components/messages/ChatArea';

const MessagesPage = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { conversations, loading: conversationsLoading } = useConversations();
  const { messages, loading: messagesLoading, sendMessage } = useMessages(selectedConversationId);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-muted-foreground">You need to be logged in to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <ConversationsList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
            loading={conversationsLoading}
          />
          <ChatArea
            conversation={selectedConversation}
            messages={messages}
            onSendMessage={sendMessage}
            loading={messagesLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
