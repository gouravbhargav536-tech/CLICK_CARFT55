import React from 'react';
import {
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  CreditCard,
  Zap,
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
      className="bg-[#181C22] border border-[#242A32] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#242A32] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#111418] text-[#D4A017] border border-[#D4A017]/30 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>ClickCraft Services & Pricing</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#111418] text-[#D4A017] border border-[#D4A017]/40 font-semibold">
                Official
              </span>
            </h4>
            <p className="text-[11px] text-[#B0B0B0]">
              Choose a package to scale your business
            </p>
          </div>
        </div>

        {onOpenAllServices && (
          <button
            onClick={onOpenAllServices}
            className="text-[11px] font-semibold text-[#D4A017] hover:underline flex items-center gap-1"
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
            className={`p-3.5 rounded-xl bg-[#111418] border transition-all ${
              service.highlight
                ? 'border-[#D4A017] shadow-[0_0_12px_rgba(212,160,23,0.18)]'
                : 'border-[#242A32] hover:border-[#D4A017]/40'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">{service.title}</span>
                  {service.badge && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        service.highlight
                          ? 'bg-[#181C22] text-[#D4A017] border-[#D4A017]'
                          : 'bg-[#181C22] text-[#B0B0B0] border-[#242A32]'
                      }`}
                    >
                      {service.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#B0B0B0] leading-relaxed">
                  {service.subtitle}
                </p>
              </div>

              {/* Price Tag */}
              <div className="text-right shrink-0">
                <span className="text-base font-extrabold text-[#D4A017]">
                  {service.priceFormatted}
                </span>
                {service.originalPrice && (
                  <p className="text-[10px] text-[#707070] line-through">
                    {service.originalPrice}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons: Uniform Shape & Style */}
            <div className="mt-2.5 pt-2 border-t border-[#242A32] flex items-center justify-between gap-2">
              <button
                onClick={(e) => handleWhatsAppRedirect(service, e)}
                className="text-[11px] font-medium text-[#B0B0B0] hover:text-[#D4A017] flex items-center gap-1.5 transition-colors"
                title="Quick chat on WhatsApp"
              >
                <MessageSquare className="w-3 h-3 text-[#D4A017]" />
                <span>WhatsApp inquiry</span>
              </button>

              <button
                onClick={() => onBuyService(service)}
                className={`py-2 px-3 rounded-xl bg-[#181C22] hover:bg-[#202630] border text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                  service.highlight
                    ? 'border-[#D4A017] shadow-[0_0_10px_rgba(212,160,23,0.22)]'
                    : 'border-[#D4A017]/50 hover:border-[#D4A017]'
                }`}
              >
                {service.highlight ? (
                  <Zap className="w-3.5 h-3.5 text-[#D4A017]" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5 text-[#D4A017]" />
                )}
                <span>Buy {service.priceFormatted}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer support notice */}
      <div className="flex items-center justify-between text-[11px] text-[#B0B0B0] pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4A017]" />
          500+ Happy Clients
        </span>
        <span className="text-[#D4A017]">Call/WA: +91 9376124893</span>
      </div>
    </div>
  );
};
