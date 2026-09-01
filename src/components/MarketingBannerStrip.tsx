import React from 'react';

interface MarketingBannerStripProps {
  onBannerClick?: () => void;
}

export const MarketingBannerStrip: React.FC<MarketingBannerStripProps> = ({ onBannerClick }) => {
  return (
    <div
      id="clickcraft-premium-marketing-banner"
      onClick={onBannerClick}
      className="py-1.5 px-4 bg-[#111418] border-b border-[#242A32] text-center cursor-pointer select-none transition-colors hover:bg-[#161B22] shrink-0"
      title="Click to view ClickCraft Official Services & Packages"
    >
      <div className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-wide">
        <span className="text-white font-script-bold text-[14px] text-luminous-white">Premium Marketing. Redefined.</span>
        <span className="text-[#D4A017]">•</span>
        <span className="text-[#D0D0D0]">Targeted Ads & Professional Websites</span>
      </div>
    </div>
  );
};

