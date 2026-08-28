import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  CreditCard,
  Globe,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { CLICKCRAFT_SERVICES, ServicePackage } from './ServicesModal';

interface ServicesShowcaseCardProps {
  onBuyService: (service: ServicePackage) => void;
  onOpenAllServices?: () => void;
}

export const ServicesShowcaseCard: React.FC<ServicesShowcaseCardProps> = ({
  onBuyService,
  onOpenAllServices,
}) => {
  const handleWhatsAppRedirect = (service: ServicePackage, e: React.MouseEvent) => {
    e.stopPropagation();
    const encoded = encodeURIComponent(service.whatsAppText);
    const url = `https://wa.me/919376124893?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="clickcraft-services-showcase"
      className="bg-[#141C2E] border border-[#1E293B] hover:border-[#E8B923]/40 rounded-2xl p-4 space-y-3.5 shadow-xl transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E8B923]/20 text-[#E8B923] flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>ClickCraft Services & Pricing</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Official
              </span>
            </h4>
            <p className="text-[11px] text-[#8A93A6]">
              Choose a package to scale your business
            </p>
          </div>
        </div>

        {onOpenAllServices && (
          <button
            onClick={onOpenAllServices}
            className="text-[11px] font-semibold text-[#E8B923] hover:underline flex items-center gap-1"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 3 Interactive Service Rows */}
      <div className="space-y-2.5">
        {CLICKCRAFT_SERVICES.map((service) => (
          <div
            key={service.id}
            className={`p-3 rounded-xl bg-[#0B1220] border transition-all ${
              service.highlight
                ? 'border-[#E8B923]/70 bg-gradient-to-r from-[#0B1220] to-[#1E2215] shadow-md shadow-[#E8B923]/5 ring-1 ring-[#E8B923]/30'
                : 'border-[#1E293B] hover:border-[#334155]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">{service.title}</span>
                  {service.badge && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${service.badgeColor}`}
                    >
                      {service.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#8A93A6] leading-snug">
                  {service.subtitle}
                </p>
              </div>

              {/* Price Tag */}
              <div className="text-right shrink-0">
                <span className="text-base font-extrabold text-[#E8B923]">
                  {service.priceFormatted}
                </span>
                {service.originalPrice && (
                  <p className="text-[10px] text-[#64748B] line-through">
                    {service.originalPrice}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-2.5 pt-2 border-t border-[#1E293B]/60 flex items-center justify-between gap-2">
              <button
                onClick={(e) => handleWhatsAppRedirect(service, e)}
                className="text-[11px] font-medium text-[#8A93A6] hover:text-[#25D366] flex items-center gap-1.5 transition-colors"
                title="Quick chat on WhatsApp"
              >
                <MessageSquare className="w-3 h-3 text-[#25D366]" />
                <span>WhatsApp inquiry</span>
              </button>

              <button
                onClick={() => onBuyService(service)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                  service.highlight
                    ? 'bg-gradient-to-r from-[#E8B923] to-[#F5CE42] text-[#0B1220] hover:brightness-105 shadow-[#E8B923]/20'
                    : 'bg-white text-[#0B1220] hover:bg-white/90'
                }`}
              >
                <CreditCard className="w-3 h-3" />
                <span>Buy {service.priceFormatted}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer support notice */}
      <div className="flex items-center justify-between text-[11px] text-[#8A93A6] pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          500+ Happy Clients
        </span>
        <span className="text-[#E8B923]">Call/WA: +91 9376124893</span>
      </div>
    </div>
  );
};
