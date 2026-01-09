/**
 * OnlineStatus - Shows user's online status indicator
 * 
 * Status types:
 * - online: Green dot (active in last 5 minutes)
 * - recently: Yellow clock icon (active in last 30 minutes)
 * - inactive: Yellow warning icon (not seen for 3+ days)
 */

import { useState } from 'react';

interface OnlineStatusProps {
  status: 'online' | 'recently' | 'inactive';
  lastSeenDisplay?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export default function OnlineStatus({
  status,
  lastSeenDisplay,
  size = 'md',
  showTooltip = true,
  className = ''
}: OnlineStatusProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Size configurations
  const sizes = {
    sm: {
      dot: 'w-2 h-2',
      icon: 'w-3 h-3',
      container: 'w-3 h-3'
    },
    md: {
      dot: 'w-3 h-3',
      icon: 'w-4 h-4',
      container: 'w-4 h-4'
    },
    lg: {
      dot: 'w-4 h-4',
      icon: 'w-5 h-5',
      container: 'w-5 h-5'
    }
  };

  const sizeConfig = sizes[size];

  // Get tooltip text
  const getTooltipText = () => {
    switch (status) {
      case 'online':
        return 'Online now';
      case 'recently':
        return lastSeenDisplay ? `Active ${lastSeenDisplay}` : 'Recently active';
      case 'inactive':
        return lastSeenDisplay ? `Last seen ${lastSeenDisplay}` : 'Inactive';
      default:
        return '';
    }
  };

  // Render the status indicator
  const renderIndicator = () => {
    switch (status) {
      case 'online':
        // Green dot
        return (
          <span 
            className={`${sizeConfig.dot} bg-green-500 rounded-full inline-block shadow-sm`}
            style={{ boxShadow: '0 0 0 2px white' }}
          />
        );
      
      case 'recently':
        // Yellow clock icon
        return (
          <svg 
            className={`${sizeConfig.icon} text-yellow-500`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
              clipRule="evenodd" 
            />
          </svg>
        );
      
      case 'inactive':
        // Yellow/Orange warning icon
        return (
          <svg 
            className={`${sizeConfig.icon} text-amber-500`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${sizeConfig.container} ${className}`}
      onMouseEnter={() => showTooltip && setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      {renderIndicator()}
      
      {/* Tooltip */}
      {showTooltip && tooltipVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg whitespace-nowrap z-50">
          {getTooltipText()}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

/**
 * OnlineStatusBadge - Status indicator positioned on an avatar
 * Use this as an overlay on avatar components
 */
export function OnlineStatusBadge({
  status,
  lastSeenDisplay,
  size = 'md',
  position = 'bottom-right'
}: OnlineStatusProps & { position?: 'bottom-right' | 'top-right' }) {
  const positionClasses = {
    'bottom-right': 'bottom-0 right-0',
    'top-right': 'top-0 right-0'
  };

  return (
    <div className={`absolute ${positionClasses[position]}`}>
      <OnlineStatus 
        status={status} 
        lastSeenDisplay={lastSeenDisplay}
        size={size}
      />
    </div>
  );
}
