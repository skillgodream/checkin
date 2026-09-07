import React, { useState } from "react";
import {
  Package,
  Layers,
  ThermometerSnowflake,
  ScanLine,
  Truck,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

interface StoreZone {
  id: string;
  name: string;
  nameHindi: string;
  subtitle: string;
  subtitleHindi: string;
  icon: React.ReactNode;
  activeColor?: string;
  statusBadge?: string;
}

interface StoreZonesGridProps {
  onSelectZone?: (zoneId: string, zoneName: string) => void;
  onAisleSelect?: (zoneId?: string) => void;
  isHindi?: boolean;
  activeZoneId?: string;
  currentPickRate?: number;
  targetPickRate?: number;
}

export const StoreZonesGrid: React.FC<StoreZonesGridProps> = ({
  onSelectZone,
  onAisleSelect,
  isHindi = false,
  activeZoneId = "aisles_4_8",
}) => {
  const [selectedId, setSelectedId] = useState<string>(activeZoneId);

  const zones: StoreZone[] = [
    {
      id: "aisles_1_3",
      name: "Aisles 1–3",
      nameHindi: "आइसल 1 से 3",
      subtitle: "Snacks & Instant Food",
      subtitleHindi: "चिप्स, बिस्कुट और मैगी",
      icon: <Package className="w-7 h-7" />,
    },
    {
      id: "aisles_4_8",
      name: "Aisles 4–8",
      nameHindi: "आइसल 4 से 8",
      subtitle: "Atta, Rice & Racks",
      subtitleHindi: "आटा, दाल और भारी रैक",
      icon: <Layers className="w-7 h-7" />,
      statusBadge: isHindi ? "वर्तमान फोकस" : "Current Focus",
    },
    {
      id: "cold_room",
      name: "Cold Room",
      nameHindi: "कोल्ड रूम",
      subtitle: "Dairy & Chilled Milk",
      subtitleHindi: "दूध, दही और पनीर (Aisle 8)",
      icon: <ThermometerSnowflake className="w-7 h-7" />,
    },
    {
      id: "scanner_dock",
      name: "Scanner Bay",
      nameHindi: "स्कैनर डेस्क",
      subtitle: "Zebra Terminal Hub",
      subtitleHindi: "स्कैनर चार्जिंग और बैटरी",
      icon: <ScanLine className="w-7 h-7" />,
    },
    {
      id: "dispatch_table",
      name: "Dispatch Bay",
      nameHindi: "डिस्पैच टेबल",
      subtitle: "Tote Sorting & Bags",
      subtitleHindi: "टोट चेकिंग और पॉलीबैग",
      icon: <Truck className="w-7 h-7" />,
    },
    {
      id: "buddy_desk",
      name: "Floor Buddy",
      nameHindi: "विक्रम भैया",
      subtitle: "Senior Floor Guide",
      subtitleHindi: "फ्लोर गाइडेंस स्टेशन",
      icon: <UserCheck className="w-7 h-7" />,
    },
  ];

  const handleCardClick = (zone: StoreZone) => {
    setSelectedId(zone.id);
    if (onSelectZone) {
      onSelectZone(zone.id, isHindi ? zone.nameHindi : zone.name);
    }
    if (onAisleSelect) {
      onAisleSelect(zone.id);
    }
  };

  return (
    <div className="space-y-2.5 select-none">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isHindi ? "डार्क स्टोर फ्लोर ज़ोन" : "Dark Store Zones"}
        </span>
        <span className="text-[11px] text-purple-600 font-bold">
          {isHindi ? "टैप करके दिशा देखें" : "Tap for guidance"}
        </span>
      </div>

      {/* 2x3 Squircle Grid Matching the Smart Home Reference */}
      <div className="grid grid-cols-2 gap-3">
        {zones.map((zone) => {
          const isActive = selectedId === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => handleCardClick(zone)}
              className={`flex flex-col items-center justify-center p-4 rounded-[26px] transition-all duration-200 cursor-pointer text-center relative active:scale-96 ${
                isActive
                  ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/40"
                  : "bg-white text-slate-800 border border-purple-100/90 hover:border-purple-300 hover:bg-purple-50/30 shadow-xs"
              }`}
            >
              {/* Active Badge if applicable */}
              {zone.statusBadge && !isActive && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}

              {/* Icon */}
              <div
                className={`mb-2.5 transition-transform ${
                  isActive ? "text-white scale-105" : "text-violet-600"
                }`}
              >
                {zone.icon}
              </div>

              {/* Zone Name */}
              <span
                className={`text-sm font-black tracking-tight leading-tight block ${
                  isActive ? "text-white" : "text-slate-900"
                }`}
              >
                {isHindi ? zone.nameHindi : zone.name}
              </span>

              {/* Subtitle */}
              <span
                className={`text-[10px] mt-1 font-medium block truncate max-w-[130px] ${
                  isActive ? "text-purple-100 font-bold" : "text-slate-500"
                }`}
              >
                {isHindi ? zone.subtitleHindi : zone.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
