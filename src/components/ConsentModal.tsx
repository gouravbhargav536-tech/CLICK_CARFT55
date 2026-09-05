import React from 'react';
import { Shield, Check, X, Info, Lock } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="clickcraft-consent-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clickcraft-consent-title"
    >
      <div
        id="clickcraft-consent-dialog"
        className="w-full max-w-md bg-[#111418] border border-[#242A32] shadow-2xl rounded-2xl overflow-hidden p-5 sm:p-6 text-white flex flex-col space-y-4 relative"
      >
        {/* Header with Shield Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div
            id="clickcraft-consent-icon-badge"
            className="w-10 h-10 rounded-xl bg-[#181C22] border border-[#D4A017]/40 flex items-center justify-center shrink-0 text-[#D4A017] shadow-inner"
          >
            <Shield className="w-5 h-5 text-[#D4A017]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#D4A017] uppercase tracking-wider">
                ClickCraft Privacy
              </span>
            </div>
            <h2
              id="clickcraft-consent-title"
              className="text-lg sm:text-xl font-bold text-white mt-0.5"
            >
              आपकी जानकारी के लिए
            </h2>
          </div>
        </div>

        {/* Honest & Transparent Explanation Body */}
        <div
          id="clickcraft-consent-body-card"
          className="bg-[#181C22] border border-[#242A32] rounded-xl p-4 text-sm text-[#E0E0E0] leading-relaxed space-y-2.5"
        >
          <p id="clickcraft-consent-body-text" className="font-medium text-[13.5px] leading-relaxed">
            आपकी बातचीत हमारी सेवा को बेहतर बनाने के लिए सुरक्षित रखी जाती है। इससे हमें आपके जैसे ग्राहकों की ज़रूरतें समझने और जवाब सुधारने में मदद मिलती है। क्या आप सहमत हैं?
          </p>

          <div className="pt-2 border-t border-[#242A32] flex items-center gap-2 text-[11px] text-[#A0A0A0]">
            <Lock className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
            <span>डेटा पूर्णतः सुरक्षित है और आप इसे सेटिंग्स से कभी भी बदल सकते हैं।</span>
          </div>
        </div>

        {/* Action Buttons: Accept & Decline */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          {/* Decline Button */}
          <button
            id="clickcraft-consent-decline-btn"
            type="button"
            onClick={onDecline}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#181C22] hover:bg-[#202630] border border-[#242A32] hover:border-neutral-600 text-neutral-300 hover:text-white text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 order-2 sm:order-1"
          >
            <X className="w-3.5 h-3.5 text-neutral-400" />
            <span>अस्वीकार करें (Decline)</span>
          </button>

          {/* Accept Button */}
          <button
            id="clickcraft-consent-accept-btn"
            type="button"
            onClick={onAccept}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#D4A017] hover:bg-[#c39112] text-black font-bold text-xs transition-all shadow-md shadow-[#D4A017]/20 active:scale-95 flex items-center justify-center gap-1.5 order-1 sm:order-2"
          >
            <Check className="w-4 h-4 text-black stroke-[2.5]" />
            <span>स्वीकार करें (Accept)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
