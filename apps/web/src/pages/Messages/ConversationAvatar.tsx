import { useState, useEffect } from 'react';
import { getImageUrl } from '@marketplace/shared';

interface ConversationAvatarProps {
  participant: any;
  size?: string;
}

export default function ConversationAvatar({ participant, size = 'w-14 h-14' }: ConversationAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = participant?.avatar_url;
  const initial = participant?.username?.charAt(0).toUpperCase() || '?';
  const onlineStatus = participant?.online_status as 'online' | 'recently' | 'inactive' | undefined;

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const dotColor =
    onlineStatus === 'online'
      ? 'bg-green-500'
      : onlineStatus === 'recently'
        ? 'bg-yellow-400'
        : null;

  return (
    <div className="relative flex-shrink-0">
      {avatarUrl && !imgError ? (
        <img
          src={getImageUrl(avatarUrl)}
          alt=""
          className={`${size} rounded-full object-cover`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`${size} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg`}
        >
          {initial}
        </div>
      )}
      {dotColor && (
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${dotColor} rounded-full border-2 border-white dark:border-gray-900`}
        />
      )}
    </div>
  );
}
