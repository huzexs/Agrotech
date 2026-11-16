import React from "react";
import { 
  Camera, 
  Mic, 
  TrendingUp, 
  Newspaper, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Sprout, 
  Clock, 
  ArrowUpRight,
  WifiOff,
  Zap,
  Leaf
} from "lucide-react";
import { CropDiagnosis, MarketPriceItem, AgriNewsItem, UserProfile } from "../types";

interface FarmerPortalProps {
  userProfile: UserProfile;
  diagnoses: CropDiagnosis[];
  prices: MarketPriceItem[];
  newsItems: AgriNewsItem[];
  onOpenScanner: () => void;
  onOpenVoiceAssistant: () => void;
  onNavigateTab: (tab: "farmer" | "ministry" | "prices" | "news" | "maps" | "transcribe") => void;
  lowBandwidthMode: boolean;
}

export const FarmerPortal: React.FC<FarmerPortalProps> = ({
  userProfile,
  diagnoses,
  prices,
  newsItems,
  onOpenScanner,
  onOpenVoiceAssistant,
  onNavigateTab,
  lowBandwidthMode
}) => {
  // Filter diagnoses for this farmer
  const farmerDiagnoses = diagnoses.slice(0, 4);

  // Top price tickers for farmer's state or key staples
  const localPrices = prices.slice(0, 3);

  // Latest critical news item
  const latestAlert = newsItems.find((n) => n.urgency === "Critical") || newsItems[0];

  return (
    <div className="space-y-6">
      {/* Farmer Welcome Banner with Agro-Climate Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/90 text-white shadow-2xl border border-emerald-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wide">
                Smallholder Field Portal
              </span>
              <span className="text-xs text-emerald-300/80 font-medium">
                Preferred Language: <strong className="text-emerald-300">{userProfile.preferredLanguage}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
              Sannu / E ku abo / Nnọọ, {userProfile.displayName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {userProfile.state} State ({userProfile.lga || "Agro Cluster"}) • Farm Size: {userProfile.farmSizeHectares || 3.5} Hectares
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/20 text-xs space-y-1 shrink-0">
            <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Target Impact Benchmark</div>
            <div className="font-extrabold text-emerald-300 text-base">
              +20% Profit • -28% Crop Loss
            </div>
            <div className="text-[11px] text-slate-400">Direct wholesale transparency</div>
          </div>
        </div>
      </div>

      {/* 6 PRIMARY TOUCH-OPTIMIZED TACTILE ACTION CARDS (Mobile-First) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: AI Vision Crop Diagnosis */}
        <button
          id="action-scan-crop-card"
          onClick={onOpenScanner}
          className="p-5 rounded-2xl bg-slate-900/80 border-2 border-emerald-500/50 hover:border-emerald-400 hover:bg-slate-800/80 shadow-lg transition text-left group flex flex-col justify-between h-44 cursor-pointer backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              AI Vision
            </span>
          </div>
          <div>
            <h3 className="font-black text-base text-slate-100 group-hover:text-emerald-400">
              Scan Crop Disease
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Snap a leaf photo for instant pathogen detection & remedies.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
            <span>Open Field Camera</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Card 2: Localized Voice Assistant */}
        <button
          id="action-voice-assistant-card"
          onClick={onOpenVoiceAssistant}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/80 shadow-lg transition text-left group flex flex-col justify-between h-44 cursor-pointer backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center group-hover:scale-105 transition">
              <Mic className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
              Voice AI
            </span>
          </div>
          <div>
            <h3 className="font-black text-base text-slate-100 group-hover:text-sky-400">
              Voice Assistant
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask in Hausa, Yoruba, Igbo, or Pidgin for instant farm advice.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-sky-400">
            <span>Speak to Extension AI</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Card 3: Real-Time Produce Prices */}
        <button
          id="action-market-prices-card"
          onClick={() => onNavigateTab("prices")}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 shadow-lg transition text-left group flex flex-col justify-between h-44 cursor-pointer backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Prices
            </span>
          </div>
          <div>
            <h3 className="font-black text-base text-slate-100 group-hover:text-amber-400">
              Market Price Board
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Check live wholesale grain & produce prices across Nigerian hubs.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
            <span>Compare Wholesale Hubs</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Card 4: Weather & Fertilizer Bulletins */}
        <button
          id="action-agri-news-card"
          onClick={() => onNavigateTab("news")}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 shadow-lg transition text-left group flex flex-col justify-between h-44 cursor-pointer backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
              <Newspaper className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
              Alerts
            </span>
          </div>
          <div>
            <h3 className="font-black text-base text-slate-100 group-hover:text-purple-400">
              Agro News Wire
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              NiMet weather forecasts and Presidential Fertilizer Initiative news.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-purple-400">
            <span>View Bulletins</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Card 5: Agro-Maps Grounding Locator */}
        <button
          id="action-maps-locator-card"
          onClick={() => onNavigateTab("maps")}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 shadow-lg transition text-left group flex flex-col justify-between h-44 cursor-pointer backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Google Maps
            </span>
          </div>
          <div>
            <h3 className="font-black text-base text-slate-100 group-hover:text-emerald-400">
              Agro-Hubs Locator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Find fertilizer depots, certified seed dealers & silos on Google Maps.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
            <span>Find Nearby Hubs</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Card 6: Audio Transcription Studio */}
        <button
          id="action-transcribe-studio-card"
          onClick={() => onNavigateTab("transcribe")}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 shadow-lg transition text-left group flex flex-col justify-between h-44 cursor-pointer backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
              <Mic className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Transcribe
            </span>
          </div>
          <div>
            <h3 className="font-black text-base text-slate-100 group-hover:text-blue-400">
              Audio Transcriber
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Record field notes & convert speech to text with gemini-3.5-transcribe.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-400">
            <span>Open Transcriber</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>
      </div>

      {/* Critical Broadcast Alert */}
      {latestAlert && (
        <div className="p-4 bg-amber-950/30 rounded-2xl border border-amber-500/30 flex items-start sm:items-center justify-between gap-3 text-xs backdrop-blur-md">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 border border-amber-500/30">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-amber-300 block">{latestAlert.title}</span>
              <span className="text-slate-300 line-clamp-1">{latestAlert.summary}</span>
            </div>
          </div>
          <button
            id="read-alert-btn"
            onClick={() => onNavigateTab("news")}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shrink-0 shadow-sm transition"
          >
            Read Notice
          </button>
        </div>
      )}

      {/* Recent Field Diagnoses History Section */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-black text-base text-slate-100">
              Recent Field Diagnosis Records
            </h3>
            <p className="text-xs text-slate-400">
              Verified plant health assessments with GPS geotags
            </p>
          </div>
          <button
            id="new-scan-top-btn"
            onClick={onOpenScanner}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.25)] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" /> New Scan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {farmerDiagnoses.map((diag) => (
            <div
              key={diag.id}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950/90 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={diag.imageUrl}
                  alt={diag.disease_name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                        diag.severity_level === "Critical"
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : diag.severity_level === "Medium"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {diag.severity_level}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      {diag.confidence_score.toFixed(1)}% Match
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-100 truncate">
                    {diag.disease_name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Crop: <strong className="text-slate-300">{diag.cropType}</strong> • {diag.coordinates.state}
                  </p>
                </div>
              </div>

              {/* Immediate treatment preview */}
              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/90 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-[11px] text-slate-200 block">Recommended Action:</span>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {diag.immediate_treatment_plan[0] || "Apply recommended biological or chemical controls early morning."}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>{new Date(diag.timestamp).toLocaleDateString()}</span>
                {diag.verifiedByOfficer ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Extension Officer Approved
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">Logged in Cloud Database</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
