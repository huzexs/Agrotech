import React, { useState } from "react";
import { 
  CloudSun, 
  Sprout, 
  Building2, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  Radio, 
  Share2, 
  Check, 
  Globe2, 
  Sparkles, 
  MapPin, 
  Clock,
  Landmark,
  ShieldCheck,
  Filter
} from "lucide-react";
import { AgriNewsItem } from "../types";
import { useAgriNews, SupportedNewsFilterCategory } from "../hooks/useAgriNews";

interface AgriNewsFeedProps {
  newsItems?: AgriNewsItem[];
  userState?: string;
  onRefreshNews?: (state?: string) => Promise<void>;
  isLoadingLive?: boolean;
  isLiveGrounded?: boolean;
  lastUpdatedTime?: string;
  groundingSources?: { title: string; url: string }[];
  searchQueries?: string[];
}

export const AgriNewsFeed: React.FC<AgriNewsFeedProps> = ({
  userState = "Kano"
}) => {
  // Dynamic asynchronous hook managing categorized state
  const {
    articles,
    categorized,
    filteredArticles,
    activeCategory,
    selectedState,
    searchQuery,
    isLoading,
    error,
    lastUpdated,
    isLiveGrounded,
    groundingSources,
    searchQueries,
    setActiveCategory,
    setSelectedState,
    setSearchQuery,
    refreshNews
  } = useAgriNews(userState);

  const [selectedArticle, setSelectedArticle] = useState<AgriNewsItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [groundedSearchInput, setGroundedSearchInput] = useState<string>("");
  const [isSearchingGrounded, setIsSearchingGrounded] = useState<boolean>(false);
  const [groundedSearchResponse, setGroundedSearchResponse] = useState<{
    answer: string;
    groundingSources: { title: string; url: string }[];
    searchQueries: string[];
  } | null>(null);

  const executeGroundedSearch = async (queryText?: string) => {
    const q = queryText || groundedSearchInput;
    if (!q.trim()) return;
    setIsSearchingGrounded(true);

    try {
      const res = await fetch("/api/search-grounded-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          state: selectedState === "All States" ? userState : selectedState
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGroundedSearchResponse(data);
      }
    } catch (e) {
      console.warn("Search grounded query error:", e);
    } finally {
      setIsSearchingGrounded(false);
    }
  };

  const categories: { label: SupportedNewsFilterCategory; count: number; icon: React.ReactNode }[] = [
    { label: "All", count: articles.length, icon: <Sparkles className="w-3.5 h-3.5" /> },
    { 
      label: "Government Policies", 
      count: categorized["Government Policies"].length, 
      icon: <Landmark className="w-3.5 h-3.5 text-purple-400" /> 
    },
    { 
      label: "Weather Alerts", 
      count: categorized["Weather Alerts"].length, 
      icon: <CloudSun className="w-3.5 h-3.5 text-sky-400" /> 
    },
    { 
      label: "Fertilizer Availability", 
      count: categorized["Fertilizer Availability"].length, 
      icon: <Sprout className="w-3.5 h-3.5 text-emerald-400" /> 
    }
  ];

  const stateFilters = [
    "National",
    "Kano",
    "Kaduna",
    "Benue",
    "Oyo",
    "Plateau",
    "Kebbi",
    "Niger",
    "Lagos",
    "Enugu",
    "Anambra",
    "Sokoto",
    "Taraba"
  ];

  const handleCopyAlert = (item: AgriNewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `📢 [Agrotech Agro Wire Alert]\n*${item.title}*\n${item.summary}\nIssued by: ${item.source} (${item.publishedAt})\nRead more on Agrotech Platform.`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const criticalBulletins = articles.filter((item) => item.urgency === "Critical");
  const marqueeAlert = criticalBulletins.length > 0 ? criticalBulletins[0] : articles[0];

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("weather")) {
      return <CloudSun className="w-4 h-4 text-sky-400" />;
    }
    if (c.includes("fertiliz")) {
      return <Sprout className="w-4 h-4 text-emerald-400" />;
    }
    return <Landmark className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Wire Live Header & Status Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE REAL-TIME AGRO WIRE
              </span>

              {isLiveGrounded && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-semibold">
                  <Globe2 className="w-3 h-3" />
                  Google Search Grounded
                </span>
              )}

              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Updated: <strong className="text-slate-300">{lastUpdated}</strong>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              National Agricultural News & Surveillance Bulletins
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Live intelligence aggregated across Government Policies, NiMet Weather Alerts, and Presidential Fertilizer Availability across Nigeria.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <select
              id="news-state-filter"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {stateFilters.map((st) => (
                <option key={st} value={st}>
                  {st === "National" ? "National Overview" : `${st} Agro Zone`}
                </option>
              ))}
            </select>

            <button
              id="refresh-live-news-btn"
              onClick={() => refreshNews()}
              disabled={isLoading}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                isLoading 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isLoading ? "Syncing..." : "Sync Live Wire"}</span>
            </button>
          </div>
        </div>

        {/* Live Flash Alert Ticker */}
        {marqueeAlert && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 font-extrabold text-[10px] uppercase shrink-0">
              <Radio className="w-3 h-3 animate-pulse" />
              BREAKING
            </span>
            <div 
              onClick={() => setSelectedArticle(marqueeAlert)}
              className="truncate hover:text-emerald-400 transition cursor-pointer font-medium"
            >
              <span className="text-slate-200 font-semibold">{marqueeAlert.title}</span>
              <span className="text-slate-500 mx-2">•</span>
              <span className="text-slate-400">{marqueeAlert.source} ({marqueeAlert.publishedAt})</span>
            </div>
          </div>
        )}
      </div>

      {/* 3 Explicit Categorized Overview Cards (Government Policies, Weather Alerts, Fertilizer Availability) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Category Card 1: Government Policies */}
        <div 
          onClick={() => setActiveCategory("Government Policies")}
          className={`p-4 rounded-2xl border transition cursor-pointer backdrop-blur-md ${
            activeCategory === "Government Policies"
              ? "bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-950/30"
              : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              {categorized["Government Policies"].length} Bulletins
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-slate-100">Government Policies</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            FMAFS minimum floor prices, AfCFTA export protocols, and national grain reserves.
          </p>
        </div>

        {/* Category Card 2: Weather Alerts */}
        <div 
          onClick={() => setActiveCategory("Weather Alerts")}
          className={`p-4 rounded-2xl border transition cursor-pointer backdrop-blur-md ${
            activeCategory === "Weather Alerts"
              ? "bg-sky-950/40 border-sky-500/50 shadow-lg shadow-sky-950/30"
              : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <CloudSun className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
              {categorized["Weather Alerts"].length} Alerts
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-slate-100">Weather Alerts</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            NiMet rainfall predictions, riverine flash flood warnings, and soil moisture advisories.
          </p>
        </div>

        {/* Category Card 3: Fertilizer Availability */}
        <div 
          onClick={() => setActiveCategory("Fertilizer Availability")}
          className={`p-4 rounded-2xl border transition cursor-pointer backdrop-blur-md ${
            activeCategory === "Fertilizer Availability"
              ? "bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30"
              : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {categorized["Fertilizer Availability"].length} Updates
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-slate-100">Fertilizer Availability</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Presidential Fertilizer Initiative NPK 20:10:10 depots, subsidized urea and ADP quotas.
          </p>
        </div>
      </div>

      {/* Google Search Grounding Live Engine (gemini-3.8-flash with googleSearch) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">
                  Google Search Grounded Agricultural Intelligence
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  gemini-3.8-flash • googleSearch
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ask any real-time question regarding agricultural subsidies, seasonal rainfall, and commodity price trends.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={groundedSearchInput}
              onChange={(e) => setGroundedSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && executeGroundedSearch()}
              placeholder="Ask Google Search: e.g. Presidential Fertilizer Initiative depots, flood alerts in Benue, tomato price Kano..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <button
            onClick={() => executeGroundedSearch()}
            disabled={isSearchingGrounded}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isSearchingGrounded ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Ground with Google</span>
          </button>
        </div>

        {/* Quick query chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 text-[11px] text-slate-400">
          <span className="shrink-0 text-slate-500 font-medium">Try asking:</span>
          {[
            "Presidential Fertilizer Initiative price & depots",
            "Current white maize price at Dawanau market Kano",
            "NiMet heavy rainfall & flood alerts 2026",
            "Federal Ministry of Agriculture floor price grains"
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setGroundedSearchInput(prompt);
                executeGroundedSearch(prompt);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-sky-300 transition shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Answer Display */}
        {groundedSearchResponse && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800/90 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
                Grounded Intelligence Answer:
              </span>
              <p className="whitespace-pre-line text-slate-100">{groundedSearchResponse.answer}</p>
            </div>

            {/* Grounding Sources */}
            {groundedSearchResponse.groundingSources.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Verified Web Sources:
                </span>
                <div className="flex flex-wrap gap-2">
                  {groundedSearchResponse.groundingSources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-sky-500/50 text-xs text-sky-300 transition"
                    >
                      <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>{src.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        {/* Category Chips with counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.label}
              id={`news-cat-${cat.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setActiveCategory(cat.label)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.label
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-xs"
                  : "bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === cat.label
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-750 text-slate-400"
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="news-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bulletins, states, policies..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-200 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Verified Grounding Sources Strip */}
      {groundingSources && groundingSources.length > 0 && (
        <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-wrap items-center gap-2 text-slate-400">
          <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Live Grounding Citations:
          </span>
          {groundingSources.slice(0, 4).map((source, i) => (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700/60 text-[11px] text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition"
            >
              <span className="truncate max-w-[180px]">{source.title}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
            </a>
          ))}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && articles.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-3">
              <div className="h-4 bg-slate-800 rounded w-1/4"></div>
              <div className="h-6 bg-slate-800 rounded w-3/4"></div>
              <div className="h-12 bg-slate-950 rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isLoading && filteredArticles.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
            <p className="text-slate-400 text-sm">No bulletins matched your current category or search filter.</p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredArticles.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedArticle(item)}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-emerald-500/50 hover:bg-slate-900 transition cursor-pointer flex flex-col justify-between space-y-3 group backdrop-blur-md relative"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold">
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isLive && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Live
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                        item.urgency === "Critical"
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : item.urgency === "Important"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-slate-800 text-slate-400 border-slate-700/60"
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-100 leading-snug group-hover:text-emerald-400 transition">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>

                {item.affectedStates && item.affectedStates.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.affectedStates.slice(0, 4).map((st) => (
                      <span
                        key={st}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50"
                      >
                        {st}
                      </span>
                    ))}
                    {item.affectedStates.length > 4 && (
                      <span className="text-[10px] text-slate-500 px-1 py-0.5">
                        +{item.affectedStates.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium truncate max-w-[200px]">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{item.source}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-medium text-slate-500">{item.publishedAt}</span>
                  
                  <button
                    title="Copy Alert Summary"
                    onClick={(e) => handleCopyAlert(item, e)}
                    className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                    selectedArticle.urgency === "Critical"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {selectedArticle.urgency} Alert
                </span>
                <span className="text-xs font-semibold text-slate-400">{selectedArticle.category}</span>
                {selectedArticle.isLive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Wire
                  </span>
                )}
              </div>
              <button
                id="close-article-modal-btn"
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-100 mb-2 leading-snug">
                {selectedArticle.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 mb-2">
                <span>Issued by <strong className="text-slate-300">{selectedArticle.source}</strong></span>
                <span>•</span>
                <span>{selectedArticle.publishedAt}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
              <p className="font-semibold text-slate-200">{selectedArticle.summary}</p>
              {selectedArticle.content && (
                <p className="text-slate-300 whitespace-pre-line">{selectedArticle.content}</p>
              )}

              {selectedArticle.affectedStates && selectedArticle.affectedStates.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80">
                  <span className="font-bold text-slate-300 block mb-1.5">Impacted Agro-Zones & States:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedArticle.affectedStates.map((st) => (
                      <span
                        key={st}
                        className="px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold rounded-md text-xs flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedArticle.url && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[280px]">
                  Official Reference: <strong className="text-slate-300">{selectedArticle.source}</strong>
                </span>
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <span>Open Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={(e) => handleCopyAlert(selectedArticle, e)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedId === selectedArticle.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Alert</span>
                  </>
                )}
              </button>

              <button
                id="dismiss-article-btn"
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                Close Bulletin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
