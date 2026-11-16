import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Filter, 
  MapPin, 
  ArrowUpDown, 
  Calculator, 
  Store, 
  ShieldCheck,
  RefreshCw,
  Clock,
  Layers
} from "lucide-react";
import { MarketPriceItem } from "../types";
import { useMarketPrices } from "../hooks/useMarketPrices";

interface MarketPriceBoardProps {
  prices?: MarketPriceItem[];
  userState?: string;
  lowBandwidthMode?: boolean;
}

export const MarketPriceBoard: React.FC<MarketPriceBoardProps> = ({
  userState = "Kano",
  lowBandwidthMode = false
}) => {
  // Use the dynamic asynchronous hook
  const {
    prices,
    filteredPrices,
    filters,
    availableStates,
    availableMarkets,
    availableCommodities,
    isLoading,
    error,
    lastUpdated,
    setFilter,
    resetFilters,
    refreshPrices
  } = useMarketPrices(userState);

  // Profit Margin Calculator State (dynamically bounded to fetched data)
  const [calcCropId, setCalcCropId] = useState<string>("");
  const [calcQuantity, setCalcQuantity] = useState<number>(25);
  const [middlemanDeductionPercent, setMiddlemanDeductionPercent] = useState<number>(20);

  // Derive active calculation item dynamically
  const activeCalcItem = useMemo(() => {
    if (calcCropId) {
      const found = prices.find((p) => p.id === calcCropId);
      if (found) return found;
    }
    return filteredPrices[0] || prices[0] || null;
  }, [calcCropId, prices, filteredPrices]);

  const marketBenchmarkTotal = activeCalcItem ? activeCalcItem.priceNgn * calcQuantity : 0;
  const middlemanTotal = marketBenchmarkTotal * (1 - middlemanDeductionPercent / 100);
  const directFarmerExtraProfit = marketBenchmarkTotal - middlemanTotal;
  const extraMarginPercent = middlemanDeductionPercent;

  return (
    <div className="space-y-6">
      {/* Middleman vs Direct Market Profitability Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 text-white shadow-2xl border border-emerald-500/20 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              15–25% Farmer Profit Margin Protection
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
              National Produce Market Price Intelligence
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Eliminate predatory gatekeepers and middleman price suppression across Nigerian wholesale hubs. Verified real-time transaction benchmarks updated live across all 36 States and FCT wholesale markets.
            </p>
          </div>

          {/* Quick Interactive Profit Calculator Widget */}
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 text-white space-y-3">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Calculator className="w-4 h-4" /> Direct Profit Simulator
              </span>
              <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded font-mono">+20% Gain Target</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-slate-300 mb-0.5">Commodity Benchmark</label>
                <select
                  id="calc-crop-select"
                  value={activeCalcItem?.id || ""}
                  onChange={(e) => setCalcCropId(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 rounded-lg px-2 py-1 text-xs border border-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  {prices.slice(0, 30).map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                      {p.crop} ({p.state} - {p.marketName.split(" ")[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-300 mb-0.5">
                  Quantity ({activeCalcItem?.unit || "Unit"})
                </label>
                <input
                  id="calc-qty-input"
                  type="number"
                  min={1}
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 text-slate-200 rounded-lg px-2 py-1 text-xs border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Direct Market Value:</span>
                <span className="font-extrabold text-sm text-slate-100">
                  ₦{marketBenchmarkTotal.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 block">Extra Profit by Direct Sale:</span>
                <span className="font-extrabold text-sm text-emerald-400">
                  +₦{directFarmerExtraProfit.toLocaleString()} ({extraMarginPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Filter and Search Control Bar */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="market-search-input"
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilter("searchQuery", e.target.value)}
              placeholder="Search staple (e.g. Rice, Maize, Beans, Garri), Nigerian state, or market..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 text-slate-200 placeholder-slate-500"
            />
          </div>

          {/* Sync Button & Timestamp */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Last updated: <strong className="text-slate-200">{lastUpdated}</strong></span>
            </div>

            <button
              id="refresh-market-prices-btn"
              onClick={() => refreshPrices()}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isLoading ? "Syncing..." : "Sync Prices"}</span>
            </button>
          </div>
        </div>

        {/* Multi-Dimensional Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
          {/* 1. Nigerian State Filter (All 36 States + FCT) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Nigerian State (36 States + FCT)
            </label>
            <select
              id="filter-state-select"
              value={filters.state}
              onChange={(e) => {
                setFilter("state", e.target.value);
                setFilter("market", "All"); // Reset specific market when state changes
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {availableStates.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-slate-200">
                  {st === "All" ? "All 36 States + FCT" : `${st} State`}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Specific Wholesale Market Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              Specific Wholesale Market
            </label>
            <select
              id="filter-market-select"
              value={filters.market}
              onChange={(e) => setFilter("market", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Markets in Selection</option>
              {availableMarkets.filter(m => m !== "All").map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-slate-200">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Staple Commodity Filter (Rice, Maize, Beans, Garri, etc.) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Staple Commodity
            </label>
            <select
              id="filter-commodity-select"
              value={filters.commodity}
              onChange={(e) => setFilter("commodity", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {availableCommodities.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-200">
                  {c === "All" ? "All Staple Commodities" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick commodity pills for fast tactile tapping */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Quick Filter:</span>
          {["All", "Rice", "Maize", "Beans", "Garri", "Yam", "Cassava", "Tomatoes"].map((c) => (
            <button
              key={c}
              onClick={() => setFilter("commodity", c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                filters.commodity === c
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/50"
              }`}
            >
              {c}
            </button>
          ))}
          {(filters.state !== "All" || filters.market !== "All" || filters.commodity !== "All" || filters.searchQuery) && (
            <button
              onClick={resetFilters}
              className="ml-auto text-[11px] text-emerald-400 hover:underline shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && prices.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-4">
              <div className="h-4 bg-slate-800 rounded w-1/3"></div>
              <div className="h-6 bg-slate-800 rounded w-2/3"></div>
              <div className="h-12 bg-slate-950 rounded-xl"></div>
              <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPrices.length === 0 && (
        <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <p className="text-slate-400 text-sm">No wholesale commodity benchmarks matched your active filter criteria.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Clear Filters & View All
          </button>
        </div>
      )}

      {/* Main Produce Price Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrices.map((item) => {
          const isUp = item.trend === "up";
          const isDown = item.trend === "down";

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-slate-700 transition duration-200 flex flex-col justify-between space-y-4 backdrop-blur-md"
            >
              {/* Header with Crop Name and Supply Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    {item.zone && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300">
                        {item.zone}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        item.supplyLevel === "Deficit"
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : item.supplyLevel === "Surplus"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {item.supplyLevel} Supply
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-slate-100">{item.crop}</h4>
                  <p className="text-xs text-slate-400 font-medium">Variety: {item.variety || "Standard Grade"}</p>
                </div>

                {/* Price Trend Direction & Percentage */}
                <div
                  title={`Price trend: ${item.trend.toUpperCase()} (${item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`})`}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 border ${
                    isUp
                      ? "bg-red-500/15 text-red-400 border-red-500/30"
                      : isDown
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {isUp && <TrendingUp className="w-3.5 h-3.5" />}
                  {isDown && <TrendingDown className="w-3.5 h-3.5" />}
                  {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
                  <span>{item.changePercent > 0 ? `+${item.changePercent.toFixed(1)}%` : `${item.changePercent.toFixed(1)}%`}</span>
                </div>
              </div>

              {/* Price Display */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/90 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Wholesale Benchmark</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-100">₦{item.priceNgn.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 font-medium">/ {item.unit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Previous Record</span>
                  <span className="text-xs line-through text-slate-500 font-mono">
                    ₦{item.previousPriceNgn.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Market Location and Last Updated Timestamp Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                  <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate font-medium text-slate-300">{item.marketName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{item.state}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.lastUpdated.replace("Today, ", "")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
