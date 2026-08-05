"use client";

import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabSliderProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabSlider({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: TabSliderProps) {
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <div
      // "relative" ajouté : c'était la pièce manquante. Sans elle, le
      // motion.div "absolute" juste en dessous se positionnait par rapport
      // au premier ancêtre positionné trouvé plus haut dans la page (souvent
      // très grand), au lieu de rester contenu dans ce pill. C'est ce qui
      // produisait l'énorme forme arrondie qui débordait sur la page.
      className={`relative inline-flex items-center gap-1 bg-slate-100 rounded-full p-1 ${className}`}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-y-1 bg-white rounded-full shadow-sm"
        layoutId="tab-slider-bg"
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        style={{
          width: `calc(${100 / tabs.length}% - 4px)`,
          left: `calc(${(activeIndex / tabs.length) * 100}% + 4px)`,
        }}
      />

      {/* Tab buttons */}
      <div className="relative flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative z-10 px-4 py-2 rounded-full font-medium transition-colors text-sm flex items-center gap-2 ${
              activeTab === tab.id
                ? "text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.icon && <span className="text-lg">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}