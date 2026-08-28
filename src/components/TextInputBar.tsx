import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, X, Image as ImageIcon, Camera } from 'lucide-react';

interface TextInputBarProps {
  isListening: boolean;
  isWebSearchActive: boolean;
  onSubmitText: (text: string, attachedImage?: string) => void;
  onToggleVoice: () => void;
  onAttachImageClick: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const TextInputBar: React.FC<TextInputBarProps> = ({
  isListening,
  isWebSearchActive,
  onSubmitText,
  onToggleVoice,
  onAttachImageClick,
  inputRef,
}) => {
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && !attachedImage) return;

    onSubmitText(text.trim(), attachedImage || undefined);
    setText('');
    setAttachedImage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAttachedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Support clipboard paste (Ctrl+V) of images directly into chat
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setAttachedImage(event.target?.result as string);
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0c0c12]/90 border-t border-purple-500/30 backdrop-blur-xl px-3 sm:px-6 py-3 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-2xl">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Attached Image Thumbnail Preview */}
        {attachedImage && (
          <div className="flex items-center space-x-3 p-2 rounded-2xl bg-purple-950/70 border border-purple-500/50 w-max max-w-full text-xs text-purple-200 shadow-lg animate-fadeIn">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-purple-400/40 shrink-0 bg-black">
              <img src={attachedImage} alt="Attachment thumbnail" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 pr-2">
              <div className="flex items-center space-x-1 font-bold text-white">
                <ImageIcon className="w-3.5 h-3.5 text-purple-300" />
                <span>Image Attached</span>
              </div>
              <p className="text-[10px] text-purple-300">Ready for AI Vision analysis</p>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Remove Attached Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Quick Attach Image File Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach Image"
            className="p-2.5 sm:p-3 rounded-full bg-zinc-900/90 border border-purple-500/30 text-zinc-200 hover:text-purple-300 hover:border-purple-400 transition-all shrink-0 active:scale-95 shadow-md"
            title="Attach Image from Device"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          </button>

          {/* Dedicated Camera / Vision Studio Modal Button */}
          <button
            type="button"
            onClick={onAttachImageClick}
            aria-label="Camera & Vision Studio"
            className="p-2.5 sm:p-3 rounded-full bg-zinc-900/90 border border-purple-500/30 text-zinc-200 hover:text-purple-300 hover:border-purple-400 transition-all shrink-0 active:scale-95 shadow-md hidden xs:flex"
            title="Open Vision Studio & Camera Snapshot"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          </button>

          {/* Main Text Input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={handlePaste}
              placeholder="Ask AetherVoice in Hindi or English (बोलें या लिखें)..."
              className="w-full px-4 py-2.5 sm:py-3 rounded-full bg-zinc-900/90 border border-purple-500/30 text-xs sm:text-sm font-medium text-white placeholder-zinc-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all shadow-inner"
            />
            {isWebSearchActive && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[9px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Web Search ON
              </span>
            )}
          </div>

          {/* Microphone Toggle Button */}
          <button
            type="button"
            onClick={onToggleVoice}
            aria-label="Toggle Voice"
            className={`p-2.5 sm:p-3 rounded-full border transition-all shrink-0 active:scale-95 shadow-md ${
              isListening
                ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/40 animate-pulse'
                : 'bg-zinc-900/90 border-purple-500/30 text-zinc-200 hover:text-purple-300 hover:border-purple-400'
            }`}
            title="Toggle Voice Microphone"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() && !attachedImage}
            aria-label="Send Message"
            className="p-2.5 sm:p-3 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all shrink-0 shadow-lg shadow-purple-600/30 active:scale-95"
            title="Send Message"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

