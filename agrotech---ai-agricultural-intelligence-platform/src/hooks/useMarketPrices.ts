import { useState, useEffect, useCallback, useMemo } from "react";
import { MarketPriceItem } from "../types";
import { NIGERIAN_STATES } from "../data/initialData";

export interface MarketPriceFilters {
  state: string; // "All" or any of the 36 states + FCT
  market: string; // "All" or a specific market name
  commodity: string; // "All" or "Rice", "Maize", "Beans", "Garri", etc.
  searchQuery: string;
}

export interface MarketPricesState {
  prices: MarketPriceItem[];
  filteredPrices: MarketPriceItem[];
  filters: MarketPriceFilters;
  availableStates: string[];
  availableMarkets: string[];
  availableCommodities: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

const ALL_36_STATES_AND_FCT = [
  "All",
  ...NIGERIAN_STATES.map((s) => s.state)
];

const STAPLE_COMMODITIES = [
  "All",
  "Rice",
  "Maize",
  "Beans",
  "Garri",
  "Yam",
  "Cassava",
  "Tomatoes",
  "Sorghum",
  "Millet"
];

export function useMarketPrices(initialStateFilter: string = "All") {
  // Dynamic state for market prices
  const [prices, setPrices] = useState<MarketPriceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading benchmarks...");
  
  // Filter state supporting all 36 states + FCT, specific markets, and staple commodities
  const [filters, setFilters] = useState<MarketPriceFilters>({
    state: initialStateFilter,
    market: "All",
    commodity: "All",
    searchQuery: ""
  });

  const [availableMarkets, setAvailableMarkets] = useState<string[]>(["All"]);
  const [availableCommodities, setAvailableCommodities] = useState<string[]>(STAPLE_COMMODITIES);

  // Asynchronous data fetcher hook
  const fetchMarketPrices = useCallback(async (currentFilters?: Partial<MarketPriceFilters>) => {
    setIsLoading(true);
    setError(null);

    const activeState = currentFilters?.state ?? filters.state;
    const activeMarket = currentFilters?.market ?? filters.market;
    const activeCommodity = currentFilters?.commodity ?? filters.commodity;
    const activeSearch = currentFilters?.searchQuery ?? filters.searchQuery;

    const queryParams = new URLSearchParams();
    if (activeState && activeState !== "All") queryParams.set("state", activeState);
    if (activeMarket && activeMarket !== "All") queryParams.set("market", activeMarket);
    if (activeCommodity && activeCommodity !== "All") queryParams.set("commodity", activeCommodity);
    if (activeSearch) queryParams.set("search", activeSearch);

    try {
      const response = await fetch(`/api/market-prices?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && Array.isArray(data.prices)) {
        setPrices(data.prices);
        setLastUpdated(data.lastUpdatedFormatted || `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        
        if (Array.isArray(data.availableMarkets) && data.availableMarkets.length > 0) {
          setAvailableMarkets(data.availableMarkets);
        }
        if (Array.isArray(data.availableCommodities) && data.availableCommodities.length > 0) {
          setAvailableCommodities(data.availableCommodities);
        }
      } else {
        setPrices([]);
      }
    } catch (err: any) {
      console.warn("[useMarketPrices] Asynchronous fetch notice:", err.message);
      setError(err.message || "Failed to load market prices");
    } finally {
      setIsLoading(false);
    }
  }, [filters.state, filters.market, filters.commodity, filters.searchQuery]);

  // Initial asynchronous fetch
  useEffect(() => {
    fetchMarketPrices();
  }, []);

  // Update a single filter
  const setFilter = useCallback(<K extends keyof MarketPriceFilters>(key: K, value: MarketPriceFilters[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      state: "All",
      market: "All",
      commodity: "All",
      searchQuery: ""
    });
  }, []);

  // Compute filtered prices with multi-dimensional criteria (State, Market, Staple Commodity, Query)
  const filteredPrices = useMemo(() => {
    return prices.filter((item) => {
      // 1. State filter (All 36 states + FCT)
      if (filters.state !== "All" && item.state.toLowerCase() !== filters.state.toLowerCase()) {
        return false;
      }

      // 2. Specific market filter
      if (filters.market !== "All" && item.marketName.toLowerCase() !== filters.market.toLowerCase()) {
        return false;
      }

      // 3. Staple commodity filter (Rice, Maize, Beans, Garri, Yam, etc.)
      if (filters.commodity !== "All") {
        const itemCrop = item.crop.toLowerCase();
        const targetCom = filters.commodity.toLowerCase();
        const matches = 
          itemCrop.includes(targetCom) ||
          ((item as any).commodity && (item as any).commodity.toLowerCase() === targetCom);
        if (!matches) return false;
      }

      // 4. Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery = 
          item.crop.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q) ||
          item.marketName.toLowerCase().includes(q) ||
          (item.variety && item.variety.toLowerCase().includes(q)) ||
          (item.zone && item.zone.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [prices, filters]);

  // Available markets specific to currently selected state
  const stateSpecificMarkets = useMemo(() => {
    if (filters.state === "All") {
      return availableMarkets;
    }
    const marketsInState = new Set<string>();
    prices.forEach((p) => {
      if (p.state.toLowerCase() === filters.state.toLowerCase()) {
        marketsInState.add(p.marketName);
      }
    });
    return ["All", ...Array.from(marketsInState)];
  }, [prices, filters.state, availableMarkets]);

  return {
    prices,
    filteredPrices,
    filters,
    availableStates: ALL_36_STATES_AND_FCT,
    availableMarkets: stateSpecificMarkets,
    availableCommodities,
    isLoading,
    error,
    lastUpdated,
    setFilter,
    resetFilters,
    refreshPrices: fetchMarketPrices
  };
}
