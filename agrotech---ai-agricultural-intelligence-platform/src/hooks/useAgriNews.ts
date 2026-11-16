import { useState, useEffect, useCallback, useMemo } from "react";
import { AgriNewsItem, NewsCategory } from "../types";

export interface CategorizedNews {
  "Government Policies": AgriNewsItem[];
  "Weather Alerts": AgriNewsItem[];
  "Fertilizer Availability": AgriNewsItem[];
}

export type SupportedNewsFilterCategory = 
  | "All" 
  | "Government Policies" 
  | "Weather Alerts" 
  | "Fertilizer Availability";

export interface AgriculturalNewsState {
  articles: AgriNewsItem[];
  categorized: CategorizedNews;
  activeCategory: SupportedNewsFilterCategory;
  selectedState: string;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
  isLiveGrounded: boolean;
  groundingSources: { title: string; url: string }[];
  searchQueries: string[];
}

function categorizeArticle(item: AgriNewsItem): "Government Policies" | "Weather Alerts" | "Fertilizer Availability" {
  const cat = (item.category || "").toLowerCase();
  const title = (item.title || "").toLowerCase();
  const summary = (item.summary || "").toLowerCase();

  if (
    cat.includes("weather") || 
    cat.includes("flood") || 
    title.includes("nimet") || 
    title.includes("rainfall") || 
    title.includes("flood") || 
    summary.includes("precipitation")
  ) {
    return "Weather Alerts";
  }

  if (
    cat.includes("fertiliz") || 
    cat.includes("subsidy") || 
    title.includes("fertilizer") || 
    title.includes("npk") || 
    title.includes("urea") || 
    summary.includes("fertilizer")
  ) {
    return "Fertilizer Availability";
  }

  return "Government Policies";
}

export function useAgriNews(initialState: string = "National") {
  // Dynamic state without hardcoded mock arrays
  const [articles, setArticles] = useState<AgriNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading wire...");
  const [isLiveGrounded, setIsLiveGrounded] = useState<boolean>(true);
  const [groundingSources, setGroundingSources] = useState<{ title: string; url: string }[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);

  // Filter states
  const [activeCategory, setActiveCategory] = useState<SupportedNewsFilterCategory>("All");
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Asynchronous news fetcher
  const fetchNews = useCallback(async (targetState?: string, forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);
    const queryState = targetState ?? selectedState;

    try {
      const endpoint = `/api/realtime-news?state=${encodeURIComponent(queryState)}${forceRefresh ? "&refresh=true" : ""}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && Array.isArray(data.news)) {
        // Normalize categories into the 3 target structures
        const normalized: AgriNewsItem[] = data.news.map((item: any) => ({
          ...item,
          category: categorizeArticle(item)
        }));

        setArticles(normalized);
        setIsLiveGrounded(!!data.grounded);
        setGroundingSources(data.groundingSources || []);
        setSearchQueries(data.searchQueries || []);
        
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLastUpdated(data.fromCache ? `Cached (${data.cachedAt || time})` : `Live Wire (${time})`);
      } else {
        setArticles([]);
      }
    } catch (err: any) {
      console.warn("[useAgriNews] Asynchronous fetch notice:", err.message);
      setError(err.message || "Failed to load live news bulletins");
    } finally {
      setIsLoading(false);
    }
  }, [selectedState]);

  // Initial fetch on mount
  useEffect(() => {
    fetchNews(selectedState, false);
  }, []);

  // Separate live-fetched articles into explicit categories
  const categorized = useMemo<CategorizedNews>(() => {
    const buckets: CategorizedNews = {
      "Government Policies": [],
      "Weather Alerts": [],
      "Fertilizer Availability": []
    };

    articles.forEach((article) => {
      const bucketKey = categorizeArticle(article);
      buckets[bucketKey].push(article);
    });

    return buckets;
  }, [articles]);

  // Filtered articles list based on active category, state, and search query
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      // 1. Category filter
      if (activeCategory !== "All") {
        const itemCategory = categorizeArticle(item);
        if (itemCategory !== activeCategory) {
          return false;
        }
      }

      // 2. State filter
      if (selectedState !== "National" && selectedState !== "All States") {
        if (item.affectedStates && item.affectedStates.length > 0) {
          const match = item.affectedStates.some(
            (st) => st.toLowerCase() === selectedState.toLowerCase()
          );
          if (!match) return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          (item.affectedStates && item.affectedStates.some((s) => s.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      return true;
    });
  }, [articles, activeCategory, selectedState, searchQuery]);

  // Action helpers
  const handleCategoryChange = useCallback((category: SupportedNewsFilterCategory) => {
    setActiveCategory(category);
  }, []);

  const handleStateChange = useCallback((stateName: string) => {
    setSelectedState(stateName);
    fetchNews(stateName, true);
  }, [fetchNews]);

  const handleRefresh = useCallback(() => {
    return fetchNews(selectedState, true);
  }, [fetchNews, selectedState]);

  return {
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
    setActiveCategory: handleCategoryChange,
    setSelectedState: handleStateChange,
    setSearchQuery,
    refreshNews: handleRefresh
  };
}
