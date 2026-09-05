import React from 'react';

interface MarketingBannerStripProps {
  onBannerClick?: () => void;
}

export const MarketingBannerStrip: React.FC<MarketingBannerStripProps> = ({ onBannerClick }) => {
  return (
    <div
      id="clickcraft-premium-marketing-banner"
      onClick={onBannerClick}
      className="py-1 px-3 sm:px-4 bg-[#111418] border-b border-[#242A32] text-center cursor-pointer select-none transition-colors hover:bg-[#161B22] shrink-0 overflow-hidden"
      title="Click to view ClickCraft Official Services & Packages"
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-medium tracking-wide flex-wrap">
        <span className="text-white font-script-bold text-[12.5px] sm:text-[14px] text-luminous-white whitespace-nowrap">Premium Marketing. Redefined.</span>
        <span className="text-[#D4A017] hidden min-[360px]:inline">•</span>
        <span className="text-[#D0D0D0] text-[10.5px] sm:text-[11.5px] whitespace-nowrap">Targeted Ads & Professional Websites</span>
      </div>
    </div>
  );
};

