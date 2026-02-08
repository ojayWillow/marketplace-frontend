import { useIsMobile } from '../../hooks/useIsMobile';
import { useConversationPage } from './hooks';
import {
  ChatHeader,
  MessageList,
  MessageInput,
  LoadingSpinner,
  NotFoundState,
} from './components';

export default function Conversation() {
  const isMobile = useIsMobile();
  const {
    conversation,
    sortedMessages,
    newMessage,
    setNewMessage,
    messagesEndRef,
    loading,
    user,
    otherUser,
    onlineStatus,
    sendMutation,
    handleSend,
  } = useConversationPage();

  if (loading) return <LoadingSpinner isMobile={isMobile} />;
  if (!conversation) return <NotFoundState isMobile={isMobile} />;

  // Mobile: fullscreen fixed chat
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[10000] flex flex-col bg-white">
        <ChatHeader otherUser={otherUser} onlineStatus={onlineStatus} isMobile />
        <MessageList
          messages={sortedMessages}
          currentUserId={user?.id}
          messagesEndRef={messagesEndRef}
          maxBubbleWidth="max-w-[80%]"
        />
        <MessageInput
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSend}
          isPending={sendMutation.isPending}
          isMobile
        />
      </div>
    );
  }

  // Desktop: card-style chat
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
        style={{ height: 'calc(100vh - 200px)', minHeight: '500px', maxHeight: '700px' }}
      >
        <ChatHeader otherUser={otherUser} onlineStatus={onlineStatus} />
        <MessageList
          messages={sortedMessages}
          currentUserId={user?.id}
          messagesEndRef={messagesEndRef}
          maxBubbleWidth="max-w-[75%]"
        />
        <MessageInput
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSend}
          isPending={sendMutation.isPending}
        />
      </div>
    </div>
  );
}
