import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Zap,
  Globe,
  TrendingUp,
  CreditCard,
  Building,
  User,
  Phone,
} from 'lucide-react';
import { db } from '../services/firebaseTrainingService';
import { doc, setDoc } from 'firebase/firestore';

export interface ServicePackage {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  priceFormatted: string;
  originalPrice?: string;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
  icon: 'ad' | 'website' | 'combo';
  features: string[];
  whatsAppText: string;
}

export const CLICKCRAFT_SERVICES: ServicePackage[] = [
  {
    id: 'advertisement',
    title: 'Advertisement Campaign',
    subtitle: 'Targeted High-ROI Ad Campaign for Instant Leads',
    price: 500,
    priceFormatted: '₹500',
    originalPrice: '₹1,500',
    badge: 'Starter Deal',
    badgeColor: 'bg-[#181C22] text-[#B0B0B0] border-[#242A32]',
    highlight: false,
    icon: 'ad',
    features: [
      '1 Targeted Ad Campaign (Meta / Instagram / Facebook)',
      'Custom High-Converting Graphic Creative & Ad Copy',
      'Pinpoint Local Audience & Radius Geo-Targeting',
      'Direct WhatsApp & Call Leads Delivery',
      'Fast Launch within 24–48 Hours',
      'Zero Budget Wastage Guarantee',
    ],
    whatsAppText: 'Hi ClickCraft! I want to buy the Advertisement Campaign for ₹500. Please assist me to launch my ad.',
  },
  {
    id: 'website',
    title: 'Professional Website',
    subtitle: 'High-Converting Responsive Business Website',
    price: 5000,
    priceFormatted: '₹5,000',
    originalPrice: '₹12,000',
    badge: 'Popular Choice',
    badgeColor: 'bg-[#181C22] text-[#B0B0B0] border-[#242A32]',
    highlight: false,
    icon: 'website',
    features: [
      'Custom Modern Responsive Website (Mobile & Desktop)',
      'High-Speed Loading & Clean User Experience',
      'Direct WhatsApp Chat & Instant Lead Capture Forms',
      'Google Maps & Business Location Integration',
      'SEO-Friendly Architecture & Meta Tags Setup',
      'Free Domain Setup & SSL Security Included',
    ],
    whatsAppText: 'Hi ClickCraft! I want to buy the Professional Website service for ₹5,000. Please share the details.',
  },
  {
    id: 'premium_combo',
    title: 'Premium Offer (Website + 1 Week Ads)',
    subtitle: 'Complete Digital Launch: Website + 1 Full Week of Ads',
    price: 10000,
    priceFormatted: '₹10,000',
    originalPrice: '₹22,000',
    badge: 'Best Value',
    badgeColor: 'bg-[#181C22] text-[#D4A017] border-[#D4A017]',
    highlight: true,
    icon: 'combo',
    features: [
      'Complete Professional Website (Worth ₹5,000)',
      'Full 1 Week (7 Days) High-ROI Targeted Ad Campaign',
      'Custom Video Reels & Motion Ad Creatives Included',
      'Daily Budget Optimization & A/B Audience Testing',
      'Real-Time Transparent ROI & Analytics Reporting',
      'Dedicated Campaign Manager & Priority WhatsApp Support',
    ],
    whatsAppText: 'Hi ClickCraft! I want to buy the Premium Offer (Website + 1 Week Advertisement) for ₹10,000. Please start my project.',
  },
];

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService?: (service: ServicePackage) => void;
}

export const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen,
  onClose,
  onSelectService,
}) => {
  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderBusiness, setOrderBusiness] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleBuyClick = (service: ServicePackage) => {
    setSelectedService(service);
    setIsOrdering(true);
    setOrderSubmitted(false);
  };

  const handleWhatsAppRedirect = (service: ServicePackage) => {
    const encoded = encodeURIComponent(service.whatsAppText);
    const url = `https://wa.me/919376124893?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !orderName.trim() || !orderPhone.trim()) return;

    setIsSubmitting(true);
    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const orderRef = doc(db, 'service_orders', orderId);

      await setDoc(orderRef, {
        orderId,
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        price: selectedService.price,
        clientName: orderName.trim(),
        clientPhone: orderPhone.trim(),
        businessName: orderBusiness.trim() || 'Not specified',
        status: 'pending_contact',
        createdAt: new Date().toISOString(),
      });

      setOrderSubmitted(true);
    } catch (err) {
      console.warn('Could not record to Firebase, proceeding with WhatsApp:', err);
      setOrderSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="services-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="services-modal-dialog"
        className="bg-[#111418] border border-[#242A32] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#111418] border-b border-[#242A32] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#181C22] border border-[#D4A017]/40 flex items-center justify-center text-[#D4A017]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[18px] sm:text-[20px] font-bold font-script-headline text-white text-luminous-white leading-tight">
                ClickCraft Official Services & Pricing
              </h2>
              <p className="text-xs text-[#B0B0B0]">
                Transparent packages engineered to scale your business
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#B0B0B0] hover:text-white hover:bg-[#181C22] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-[#111418]">
          {!isOrdering ? (
            <>
              {/* Trust banner */}
              <div className="bg-[#181C22] rounded-xl p-3.5 border border-[#242A32] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#B0B0B0]">
                  <ShieldCheck className="w-4 h-4 text-[#D4A017] shrink-0" />
                  <span>
                    <strong className="text-white">Quality Digital Solutions</strong> • 5-Star Rated Digital Agency
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#B0B0B0]">
                  <Zap className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span>Direct WhatsApp: <strong className="text-white">+91 9376124893</strong></span>
                </div>
              </div>

              {/* 3 Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                {CLICKCRAFT_SERVICES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl bg-[#181C22] border flex flex-col justify-between transition-all duration-200 ${
                      pkg.highlight
                        ? 'border-[#D4A017] shadow-xl shadow-[#D4A017]/10 ring-1 ring-[#D4A017]/40'
                        : 'border-[#242A32] hover:border-[#D4A017]/40'
                    }`}
                  >
                    {/* Top Highlight Badge */}
                    {pkg.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full border shadow-sm ${pkg.badgeColor}`}
                        >
                          {pkg.badge}
                        </span>
                      </div>
                    )}

                    <div className="p-5 space-y-4">
                      {/* Service Icon & Title */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl bg-[#111418] border border-[#D4A017]/30 flex items-center justify-center text-[#D4A017]">
                            {pkg.icon === 'combo' ? (
                              <Sparkles className="w-5 h-5" />
                            ) : pkg.icon === 'website' ? (
                              <Globe className="w-5 h-5" />
                            ) : (
                              <TrendingUp className="w-5 h-5" />
                            )}
                          </div>
                          {pkg.originalPrice && (
                            <span className="text-xs text-[#707070] line-through">
                              {pkg.originalPrice}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-white">{pkg.title}</h3>
                        <p className="text-xs text-[#B0B0B0] mt-0.5 leading-relaxed">
                          {pkg.subtitle}
                        </p>
                      </div>

                      {/* Pricing block */}
                      <div className="pt-2 pb-3 border-y border-[#242A32] flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                          {pkg.priceFormatted}
                        </span>
                        <span className="text-xs font-medium text-[#B0B0B0]">
                          / one-time investment
                        </span>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-2 text-xs">
                        {pkg.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-[#B0B0B0]">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#D4A017]" />
                            <span className="leading-relaxed">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom Action / Buy Button */}
                    <div className="p-5 pt-0 space-y-2">
                      <button
                        id={`buy-service-${pkg.id}-btn`}
                        onClick={() => handleBuyClick(pkg)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 bg-[#111418] hover:bg-[#181C22] border text-white ${
                          pkg.highlight
                            ? 'border-[#D4A017] shadow-[0_0_12px_rgba(212,160,23,0.25)]'
                            : 'border-[#D4A017]/50 hover:border-[#D4A017]'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#D4A017]" />
                        <span>Buy {pkg.priceFormatted} Package</span>
                      </button>

                      <button
                        onClick={() => handleWhatsAppRedirect(pkg)}
                        className="w-full py-2 px-3 rounded-lg text-[11px] font-medium text-[#B0B0B0] hover:text-[#D4A017] hover:bg-[#111418] border border-transparent hover:border-[#D4A017]/30 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 text-[#D4A017]" />
                        <span>Order instantly via WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Direct Order / Checkout Form */
            <div className="max-w-xl mx-auto space-y-5 animate-fadeIn">
              <button
                onClick={() => setIsOrdering(false)}
                className="text-xs text-[#B0B0B0] hover:text-[#D4A017] flex items-center gap-1 transition-colors"
              >
                ← Back to all packages
              </button>

              {/* Selected package summary banner */}
              {selectedService && (
                <div className="bg-[#181C22] border border-[#D4A017]/40 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#D4A017] tracking-wider">
                      Selected Service
                    </span>
                    <h3 className="text-base font-bold text-white">{selectedService.title}</h3>
                    <p className="text-xs text-[#B0B0B0]">{selectedService.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#D4A017]">
                      {selectedService.priceFormatted}
                    </span>
                    <p className="text-[10px] text-[#707070]">All inclusive</p>
                  </div>
                </div>
              )}

              {orderSubmitted ? (
                /* Success Confirmation State */
                <div className="bg-[#181C22] border border-[#D4A017]/40 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#111418] text-[#D4A017] border border-[#D4A017]/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Order Request Received!</h3>
                    <p className="text-xs text-[#B0B0B0] mt-1 max-w-sm mx-auto">
                      Thank you <strong className="text-white">{orderName}</strong>. Our ClickCraft marketing team has received your order request for <strong className="text-[#D4A017]">{selectedService?.title} ({selectedService?.priceFormatted})</strong>.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                    {selectedService && (
                      <button
                        onClick={() => handleWhatsAppRedirect(selectedService)}
                        className="py-2.5 px-4 rounded-xl bg-[#111418] text-[#D4A017] border border-[#D4A017] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#D4A017] hover:text-[#111418] transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat on WhatsApp (+91 9376124893)</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsOrdering(false);
                        onClose();
                      }}
                      className="py-2.5 px-4 rounded-xl bg-[#111418] text-white font-semibold text-xs hover:border-[#D4A017]/40 border border-[#242A32] transition-colors"
                    >
                      Back to Assistant
                    </button>
                  </div>
                </div>
              ) : (
                /* Order Input Form */
                <form
                  onSubmit={handleSubmitOrder}
                  className="bg-[#181C22] border border-[#242A32] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl"
                >
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-[#D4A017]" />
                    <span>Your Contact & Business Details</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[#B0B0B0] mb-1">
                        Your Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#707070] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={orderName}
                          onChange={(e) => setOrderName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-[#111418] text-white text-xs rounded-xl pl-9 pr-3.5 py-2.5 border border-[#242A32] focus:border-[#D4A017] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#B0B0B0] mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#707070] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={orderPhone}
                          onChange={(e) => setOrderPhone(e.target.value)}
                          placeholder="e.g. +91 9876543210"
                          className="w-full bg-[#111418] text-white text-xs rounded-xl pl-9 pr-3.5 py-2.5 border border-[#242A32] focus:border-[#D4A017] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#B0B0B0] mb-1">
                        Business / Brand Name (Optional)
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-[#707070] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={orderBusiness}
                          onChange={(e) => setOrderBusiness(e.target.value)}
                          placeholder="e.g. Royal Motors / Fashion Boutique"
                          className="w-full bg-[#111418] text-white text-xs rounded-xl pl-9 pr-3.5 py-2.5 border border-[#242A32] focus:border-[#D4A017] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-[#D4A017] hover:bg-[#c29214] text-[#111418] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Processing Order...</span>
                      ) : (
                        <>
                          <span>Confirm & Request {selectedService?.priceFormatted} Order</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    {selectedService && (
                      <button
                        type="button"
                        onClick={() => handleWhatsAppRedirect(selectedService)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#111418] text-[#D4A017] hover:bg-[#D4A017] hover:text-[#111418] font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-[#D4A017]/40"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Or Order Directly on WhatsApp (+91 9376124893)</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#111418] border-t border-[#242A32] flex items-center justify-between text-xs text-[#B0B0B0]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4A017]" />
            <span>ClickCraft Verified Agency Pricing</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-[#181C22] hover:bg-[#202630] text-white border border-[#242A32] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
