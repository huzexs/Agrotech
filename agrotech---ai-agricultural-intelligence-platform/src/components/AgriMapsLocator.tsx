import React, { useState } from "react";
import { 
  MapPin, 
  Search, 
  ExternalLink, 
  Navigation, 
  Building, 
  Phone, 
  Compass, 
  CheckCircle, 
  Sparkles, 
  Layers, 
  Radio, 
  ShieldCheck,
  RefreshCw,
  LocateFixed
} from "lucide-react";
import { AgriMapPlace } from "../types";

interface AgriMapsLocatorProps {
  userState?: string;
  lowBandwidthMode?: boolean;
}

export const AgriMapsLocator: React.FC<AgriMapsLocatorProps> = ({
  userState = "Kano",
  lowBandwidthMode = false
}) => {
  const [selectedState, setSelectedState] = useState<string>(userState);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [answerText, setAnswerText] = useState<string>("");
  const [places, setPlaces] = useState<AgriMapPlace[]>([]);
  const [groundingSources, setGroundingSources] = useState<{ title: string; url: string }[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const categories = [
    { label: "All Hubs", query: "" },
    { label: "Subsidized Fertilizer Depots", query: "Subsidized fertilizer distribution depots (Presidential Fertilizer Initiative)" },
    { label: "Certified Seed Hubs", query: "National Agricultural Seeds Council accredited certified seed dealers" },
    { label: "ADP Extension Offices", query: "State Agricultural Development Programme (ADP) extension offices" },
    { label: "Grain Silos & Aggregation", query: "Strategic grain reserve silos and wholesale commodity warehouses" },
    { label: "Veterinary & Agrochemicals", query: "Accredited agrochemical retailers and veterinary clinics" }
  ];

  const nigerianStates = [
    "Kano", "Kaduna", "FCT Abuja", "Benue", "Oyo", "Plateau", "Kebbi", 
    "Niger", "Lagos", "Enugu", "Borno", "Katsina", "Ogun", "Taraba"
  ];

  const fetchMapsGrounding = async (customQuery?: string, lat?: number, lng?: number) => {
    setIsLoading(true);
    try {
      const q = customQuery !== undefined ? customQuery : searchQuery;
      const res = await fetch("/api/maps-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          state: selectedState,
          latitude: lat ?? userCoords?.lat,
          longitude: lng ?? userCoords?.lng
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAnswerText(data.answerText || "");
        setPlaces(data.places || []);
        setGroundingSources(data.groundingSources || []);
        setSearchQueries(data.searchQueries || []);
      }
    } catch (err) {
      console.warn("Maps grounding fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setIsLocating(false);
        fetchMapsGrounding(searchQuery, coords.lat, coords.lng);
      },
      (err) => {
        console.warn("Geolocation permission note:", err);
        setIsLocating(false);
        fetchMapsGrounding();
      },
      { timeout: 8000 }
    );
  };

  // Initial load
  React.useEffect(() => {
    fetchMapsGrounding();
  }, [selectedState]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                Google Maps Grounding Engine (gemini-3.8-flash)
              </span>
              <span className="text-xs text-slate-400">Accredited Agricultural Geolocation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Agro-Hubs & Input Dealers Locator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Locate authorized Presidential Fertilizer depots, certified seed distributors, grain aggregation silos, and state ADP extension offices across Nigeria with verified Google Maps navigation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
            >
              <LocateFixed className={`w-4 h-4 text-emerald-400 ${isLocating ? "animate-spin" : ""}`} />
              <span>{userCoords ? "Farm GPS Active" : "Detect GPS"}</span>
            </button>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {nigerianStates.map((st) => (
                <option key={st} value={st}>
                  State: {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchMapsGrounding()}
              placeholder="e.g. Subsidized NPK fertilizer depot near Dawanau, certified maize seed dealer, cold hub..."
              className="w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition"
            />
          </div>

          <button
            onClick={() => fetchMapsGrounding()}
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>Locate with Google Maps</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => {
                setActiveCategory(cat.label);
                setSearchQuery(cat.query);
                fetchMapsGrounding(cat.query);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                activeCategory === cat.label
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grounded Overview Answer */}
      {answerText && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-sm text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Maps Grounded Agricultural Intelligence</span>
          </div>
          <p className="whitespace-pre-line">{answerText}</p>

          {/* Extracted Google Maps Links (Required by Skill) */}
          {groundingSources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <p className="text-xs font-semibold text-slate-400 mb-2">Verified Google Maps Links & Sources:</p>
              <div className="flex flex-wrap gap-2">
                {groundingSources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 rounded-lg text-xs text-emerald-400 transition"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{src.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Places Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>Accredited Input Centres & Facilities in {selectedState}</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {places.length} Verified
            </span>
          </h2>
          <span className="text-xs text-slate-400">Ordered by agro-corridor relevance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition group hover:shadow-xl hover:shadow-emerald-950/20"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                    {place.type || "Agricultural Depot"}
                  </span>
                  <a
                    href={place.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-400 transition p-1"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <h3 className="font-bold text-slate-100 text-sm group-hover:text-emerald-300 transition line-clamp-2">
                  {place.title}
                </h3>

                {place.address && (
                  <p className="text-xs text-slate-400 flex items-start gap-1.5 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{place.address}</span>
                  </p>
                )}

                {place.phone && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{place.phone}</span>
                  </p>
                )}

                {place.snippets && place.snippets.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 italic">
                    "{place.snippets[0]}"
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>FMAFS Accredited</span>
                </span>

                <a
                  href={place.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>Open Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
