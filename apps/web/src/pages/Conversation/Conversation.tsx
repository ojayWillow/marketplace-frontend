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
    isOtherTyping,
    sendMutation,
    handleSend,
    handleImageSend,
  } = useConversationPage();

  if (loading) return <LoadingSpinner isMobile={isMobile} />;
  if (!conversation) return <NotFoundState isMobile={isMobile} />;

  // Mobile: fullscreen fixed chat (overlays bottom nav — intentional for chat UX)
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col bg-white dark:bg-gray-950">
        <ChatHeader otherUser={otherUser} onlineStatus={onlineStatus} isOtherTyping={isOtherTyping} isMobile />
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
          onImageSend={handleImageSend}
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
        className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden flex flex-col"
        style={{ height: 'calc(100vh - 200px)', minHeight: '500px', maxHeight: '700px' }}
      >
        <ChatHeader otherUser={otherUser} onlineStatus={onlineStatus} isOtherTyping={isOtherTyping} />
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
          onImageSend={handleImageSend}
          isPending={sendMutation.isPending}
        />
      </div>
    </div>
  );
}
