import React from 'react';
import {
  TrendingUp,
  Sparkles,
  BarChart3,
  MousePointerClick,
  Target,
  Megaphone,
  Globe,
  Award,
} from 'lucide-react';

const COMPANY_LOGO_URL = 'https://i.postimg.cc/MHZXGDHF/596701082-122110771671083682-4894056021958296740-n.jpg';

interface MarketingBannerStripProps {
  onBannerClick?: () => void;
}

export const MarketingBannerStrip: React.FC<MarketingBannerStripProps> = ({ onBannerClick }) => {
  return (
    <div
      id="clickcraft-premium-marketing-banner"
      onClick={onBannerClick}
      className="relative overflow-hidden bg-gradient-to-r from-[#D35F20] via-[#BA4B1A] to-[#DC7230] border-y border-[#FF8C42]/40 shadow-inner cursor-pointer select-none group transition-all shrink-0"
      title="Click to view ClickCraft Official Services & Packages"
    >
      {/* Subtle Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/20 pointer-events-none" />

      {/* Grid Pattern & Marketing Matrix Background (Left Side) */}
      <div className="absolute left-0 top-0 bottom-0 w-1/3 opacity-30 flex flex-wrap gap-1.5 p-1.5 pointer-events-none">
        <TrendingUp className="w-3.5 h-3.5 text-[#FFE2B8]" />
        <BarChart3 className="w-3.5 h-3.5 text-[#FFE2B8]" />
        <Target className="w-3.5 h-3.5 text-[#FFE2B8]" />
        <MousePointerClick className="w-3.5 h-3.5 text-[#FFE2B8]" />
        <Sparkles className="w-3.5 h-3.5 text-[#FFE2B8]" />
        <Megaphone className="w-3.5 h-3.5 text-[#FFE2B8]" />
        <Globe className="w-3.5 h-3.5 text-[#FFE2B8]" />
        <Award className="w-3.5 h-3.5 text-[#FFE2B8]" />
      </div>

      <div className="relative px-3.5 py-2.5 flex items-center justify-between gap-3">
        {/* Left Side: Slogan & Micro-icons */}
        <div className="flex flex-col z-10">
          <div className="flex items-center gap-1 text-[11px] font-medium tracking-wide text-white/95 drop-shadow-sm">
            <span className="font-semibold text-[#FFF3DE]">Premium Marketing.</span>
            <span className="text-white/80">Redefined.</span>
          </div>
          <p className="text-[9.5px] text-[#FFE5C4] leading-tight mt-0.5 opacity-90">
            Targeted Ads • Websites • High-ROI Campaigns
          </p>
        </div>

        {/* Center: Tablet Mockup Graphic showing Live Performance Analytics */}
        <div className="relative z-10 hidden xs:flex sm:flex items-center justify-center shrink-0">
          <div className="w-24 h-14 bg-[#141C24] rounded-[6px] border-2 border-[#2A3441] shadow-2xl p-1 flex flex-col justify-between transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
            {/* Tablet Top bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-0.5">
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-rose-400" />
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[6px] text-emerald-400 font-mono font-bold">+340% ROI</span>
            </div>

            {/* Tablet Mini Chart Bars */}
            <div className="flex items-end justify-between gap-0.5 h-5 px-1 pt-1">
              <div className="w-1.5 bg-[#E8B923]/60 rounded-t h-2" />
              <div className="w-1.5 bg-[#E8B923]/75 rounded-t h-3" />
              <div className="w-1.5 bg-[#E8B923] rounded-t h-4" />
              <div className="w-1.5 bg-[#F5CE42] rounded-t h-3.5" />
              <div className="w-1.5 bg-[#34D399] rounded-t h-5 animate-pulse" />
            </div>

            {/* Tablet Bottom Micro Stats */}
            <div className="flex items-center justify-between text-[5.5px] text-[#94A3B8] pt-0.5 border-t border-white/5">
              <span>Leads: 1.2k</span>
              <span className="text-[#E8B923] font-bold">₹500 Ads</span>
            </div>
          </div>
        </div>

        {/* Right Side: Circular ClickCraft Official Medallion Badge */}
        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1C1635] via-[#2A1F4D] to-[#120D25] border-2 border-[#E8B923] p-0.5 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
            <img
              src={COMPANY_LOGO_URL}
              alt="ClickCraft Badge"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
