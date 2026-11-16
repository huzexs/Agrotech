import React from "react";
import { 
  Sprout, 
  Wifi, 
  WifiOff, 
  Globe, 
  User, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  Building2, 
  Wheat, 
  UserCheck, 
  Layers, 
  TrendingUp, 
  Newspaper,
  Languages,
  MapPin,
  Mic
} from "lucide-react";
import { UserProfile, SupportedLanguage } from "../types";

interface HeaderProps {
  currentTab: "farmer" | "ministry" | "prices" | "news" | "maps" | "transcribe";
  onChangeTab: (tab: "farmer" | "ministry" | "prices" | "news" | "maps" | "transcribe") => void;
  userProfile: UserProfile;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  selectedLanguage: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  lowBandwidthMode: boolean;
  onToggleLowBandwidth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onChangeTab,
  userProfile,
  onOpenAuthModal,
  onLogout,
  selectedLanguage,
  onChangeLanguage,
  lowBandwidthMode,
  onToggleLowBandwidth
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#020617]/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              id="agrotech-brand-logo"
              onClick={() => onChangeTab("farmer")}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition">
                <Sprout className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-slate-100">
                    AGROTECH
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    NG
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  National Agricultural AI Platform
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links / Ecosystem Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 p-1 rounded-2xl text-xs font-bold">
            <button
              id="nav-farmer-portal"
              onClick={() => onChangeTab("farmer")}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === "farmer"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <Wheat className="w-3.5 h-3.5 text-emerald-400" />
              <span>Farmer Portal</span>
            </button>

            <button
              id="nav-ministry-dashboard"
              onClick={() => onChangeTab("ministry")}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === "ministry"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ministry Dashboard</span>
              <span className="text-[9px] bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                Executive
              </span>
            </button>

            <button
              id="nav-market-prices"
              onClick={() => onChangeTab("prices")}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === "prices"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Market Prices</span>
            </button>

            <button
              id="nav-news-feed"
              onClick={() => onChangeTab("news")}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === "news"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
              <span>News Wire</span>
            </button>

            <button
              id="nav-maps-locator"
              onClick={() => onChangeTab("maps")}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === "maps"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Agro-Maps</span>
            </button>

            <button
              id="nav-transcribe-studio"
              onClick={() => onChangeTab("transcribe")}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === "transcribe"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transcribe</span>
            </button>
          </nav>

          {/* Right Controls: Low-Bandwidth Toggle, Language, User Persona */}
          <div className="flex items-center gap-2">
            {/* Low Bandwidth Mode Toggle */}
            <button
              id="toggle-low-bandwidth-btn"
              onClick={onToggleLowBandwidth}
              title={lowBandwidthMode ? "Low-Bandwidth Mode Active (Saving Data)" : "High Fidelity Mode"}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                lowBandwidthMode
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {lowBandwidthMode ? (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="text-[11px] font-bold">
                {lowBandwidthMode ? "Lite Mode (ON)" : "Lite Mode"}
              </span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <select
                id="header-language-select"
                value={selectedLanguage}
                onChange={(e) => onChangeLanguage(e.target.value as SupportedLanguage)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="Hausa" className="bg-slate-900 text-slate-200">Hausa</option>
                <option value="Yoruba" className="bg-slate-900 text-slate-200">Yorùbá</option>
                <option value="Igbo" className="bg-slate-900 text-slate-200">Asụsụ Igbo</option>
                <option value="Nigerian Pidgin" className="bg-slate-900 text-slate-200">Pidgin</option>
                <option value="English" className="bg-slate-900 text-slate-200">English</option>
              </select>
            </div>

            {/* Stakeholder Profile / Switch Persona Button */}
            <div className="flex items-center gap-1">
              <button
                id="persona-switch-btn"
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 hover:border-slate-700 transition shadow-sm"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    userProfile.role === "Ministry Admin"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : userProfile.role === "Agricultural Officer"
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {userProfile.displayName.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-slate-200 leading-tight">
                    {userProfile.displayName}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {userProfile.role} • {userProfile.state}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs font-bold overflow-x-auto">
          <button
            id="mobile-nav-farmer"
            onClick={() => onChangeTab("farmer")}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              currentTab === "farmer" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400"
            }`}
          >
            Farmer
          </button>
          <button
            id="mobile-nav-ministry"
            onClick={() => onChangeTab("ministry")}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              currentTab === "ministry" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400"
            }`}
          >
            Ministry
          </button>
          <button
            id="mobile-nav-prices"
            onClick={() => onChangeTab("prices")}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              currentTab === "prices" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400"
            }`}
          >
            Prices
          </button>
          <button
            id="mobile-nav-news"
            onClick={() => onChangeTab("news")}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              currentTab === "news" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400"
            }`}
          >
            News
          </button>
          <button
            id="mobile-nav-maps"
            onClick={() => onChangeTab("maps")}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              currentTab === "maps" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400"
            }`}
          >
            Maps
          </button>
          <button
            id="mobile-nav-transcribe"
            onClick={() => onChangeTab("transcribe")}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              currentTab === "transcribe" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400"
            }`}
          >
            Voice
          </button>
        </div>
      </div>
    </header>
  );
};
