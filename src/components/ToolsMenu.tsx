import React from 'react';
import {
  Mic,
  MessageSquare,
  Globe,
  Languages,
  Image as ImageIcon,
  MapPin,
  Calculator,
  History,
  Settings,
} from 'lucide-react';

interface ToolsMenuProps {
  isListening: boolean;
  isWebSearchActive: boolean;
  onToggleVoice: () => void;
  onFocusTextChat: () => void;
  onToggleWebSearch: () => void;
  onOpenTranslator: () => void;
  onOpenImageAnalysis: () => void;
  onOpenPlaces: () => void;
  onOpenCalculator: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export const ToolsMenu: React.FC<ToolsMenuProps> = ({
  isListening,
  isWebSearchActive,
  onToggleVoice,
  onFocusTextChat,
  onToggleWebSearch,
  onOpenTranslator,
  onOpenImageAnalysis,
  onOpenPlaces,
  onOpenCalculator,
  onOpenHistory,
  onOpenSettings,
}) => {
  const tools = [
    {
      id: 'voice',
      label: 'Voice Chat',
      icon: Mic,
      active: isListening,
      onClick: onToggleVoice,
    },
    {
      id: 'text',
      label: 'Text Chat',
      icon: MessageSquare,
      active: false,
      onClick: onFocusTextChat,
    },
    {
      id: 'search',
      label: 'Web Search',
      icon: Globe,
      active: isWebSearchActive,
      onClick: onToggleWebSearch,
    },
    {
      id: 'places',
      label: 'Nearby Places',
      icon: MapPin,
      active: false,
      onClick: onOpenPlaces,
    },
    {
      id: 'translator',
      label: 'Translator',
      icon: Languages,
      active: false,
      onClick: onOpenTranslator,
    },
    {
      id: 'image',
      label: 'Image Analysis',
      icon: ImageIcon,
      active: false,
      onClick: onOpenImageAnalysis,
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
      active: false,
      onClick: onOpenCalculator,
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      active: false,
      onClick: onOpenHistory,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      active: false,
      onClick: onOpenSettings,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-3 px-2">
      {/* Desktop & Mobile Responsive Toolbar - Always Visible */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 bg-[#212121] border border-[#2f2f2f] p-2 sm:p-2.5 rounded-2xl shadow-xl">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={tool.onClick}
              className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl transition-all duration-200 group focus:outline-none whitespace-nowrap active:scale-95 ${
                tool.active
                  ? 'bg-[#10A37F] text-white shadow-lg shadow-[#10A37F]/20'
                  : 'bg-[#2f2f2f] text-[#ECECF1] hover:bg-[#3e3e3e] border border-[#3e3e3e]'
              }`}
            >
              <Icon
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 mb-1 transition-transform group-hover:scale-110 ${
                  tool.active ? 'text-white' : 'text-[#10A37F]'
                }`}
              />
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight text-center">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

