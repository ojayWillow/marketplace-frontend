import { divIcon } from 'leaflet';
import { getCategoryIcon } from '../../../constants/categories';

// User Location Icon - Red pin marker (distinct from price markers)
export const createUserLocationIcon = () => divIcon({
  className: 'user-location-icon',
  html: `
    <div class="user-location-pin">
      <div class="user-location-inner"></div>
    </div>
  `,
  iconSize: [30, 36],
  iconAnchor: [15, 36],
});

// Job Price Label Icon - Shows actual price with color coding
// Budget thresholds: ≤25€ (green), ≤75€ (blue), >75€ (purple/gold with glow)
// Urgent jobs get a red border + pulsing ring animation
export const getJobPriceIcon = (budget: number = 0, isUrgent: boolean = false) => {
  let bgColor = '#22c55e'; // green-500 for quick tasks
  let textColor = 'white';
  let extraClass = '';
  let shadow = '0 2px 4px rgba(0,0,0,0.2)';
  let border = '2px solid white';
  
  if (budget <= 25) {
    bgColor = '#22c55e'; // green - quick easy money
  } else if (budget <= 75) {
    bgColor = '#3b82f6'; // blue - medium jobs
  } else {
    bgColor = 'linear-gradient(135deg, #8b5cf6 0%, #d97706 100%)'; // purple to gold - premium
    extraClass = ' job-price--premium';
    shadow = '0 2px 8px rgba(139, 92, 246, 0.5), 0 0 12px rgba(217, 119, 6, 0.3)';
  }
  
  // Urgent jobs get red border + pulsing ring
  if (isUrgent) {
    border = '3px solid #ef4444';
    shadow = '0 0 0 2px rgba(239, 68, 68, 0.3), ' + shadow;
    extraClass += ' job-price--urgent';
  }
  
  // Format price display
  const priceText = budget >= 1000 ? `€${(budget/1000).toFixed(1)}k` : `€${budget}`;
  const isLongPrice = priceText.length > 4;
  const fontSize = isLongPrice ? '11px' : '12px';
  const padding = isLongPrice ? '2px 6px' : '2px 8px';
  
  const bgStyle = bgColor.includes('gradient') 
    ? `background: ${bgColor};` 
    : `background-color: ${bgColor};`;

  // Urgent pulsing ring behind the marker
  const urgentRing = isUrgent
    ? `<div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        border-radius: 12px;
        animation: urgentPulseDesktop 1.5s ease-out infinite;
        border: 2px solid #ef4444;
        pointer-events: none;
      "></div>`
    : '';

  return divIcon({
    className: `job-price-icon${extraClass}`,
    html: `
      <div style="position: relative; display: inline-flex; align-items: center; justify-content: center;">
        ${urgentRing}
        <div class="job-price-marker" style="
          ${bgStyle}
          color: ${textColor};
          font-size: ${fontSize};
          font-weight: 700;
          padding: ${padding};
          border-radius: 12px;
          white-space: nowrap;
          box-shadow: ${shadow};
          border: ${border};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 24px;
          cursor: pointer;
          transition: transform 0.15s ease;
          position: relative;
          z-index: 1;
        ">
          ${priceText}
        </div>
      </div>
      <style>
        @keyframes urgentPulseDesktop {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          70% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }
      </style>
    `,
    iconSize: [50, 28],
    iconAnchor: [25, 14],
  });
};

// Boosted Offering Icon - Shows category emoji in orange bubble
export const getBoostedOfferingIcon = (category: string = 'other') => {
  // Get the category icon emoji
  const categoryEmoji = getCategoryIcon(category);

  return divIcon({
    className: 'offering-category-icon',
    html: `
      <div class="offering-category-marker" style="
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        font-size: 16px;
        padding: 6px;
        border-radius: 50%;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
        border: 2px solid white;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        cursor: pointer;
        transition: transform 0.15s ease;
      ">
        ${categoryEmoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};
