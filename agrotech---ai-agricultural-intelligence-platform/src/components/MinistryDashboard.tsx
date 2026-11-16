import React, { useState } from "react";
import { 
  BarChart3, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Clock, 
  Sprout, 
  ChevronRight, 
  CheckCircle2, 
  Send, 
  Layers, 
  Download,
  Filter,
  Check,
  Building,
  Radio,
  FileSpreadsheet
} from "lucide-react";
import { RegionalOutbreakData, CropDiagnosis, MarketPriceItem } from "../types";
import { GeospatialMap } from "./GeospatialMap";

interface MinistryDashboardProps {
  outbreaks: RegionalOutbreakData[];
  diagnoses: CropDiagnosis[];
  prices: MarketPriceItem[];
  onVerifyDiagnosis: (id: string, notes: string) => void;
}

export const MinistryDashboard: React.FC<MinistryDashboardProps> = ({
  outbreaks,
  diagnoses,
  prices,
  onVerifyDiagnosis
}) => {
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>("All");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"spatial" | "analytics" | "verification" | "interventions">("spatial");
  
  // Verification action state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [officerNotesInput, setOfficerNotesInput] = useState<string>("");

  // Intervention dispatch notification state
  const [dispatchedAlert, setDispatchedAlert] = useState<string | null>(null);

  // National metrics calculation
  const totalReportedCases = outbreaks.reduce((acc, curr) => acc + curr.totalOutbreaks, 0);
  const highRiskCount = outbreaks.filter((o) => o.riskLevel === "Severe" || o.riskLevel === "High").length;
  const avgLossRisk = (outbreaks.reduce((acc, curr) => acc + curr.estimatedLossPercent, 0) / outbreaks.length).toFixed(1);

  const handleDispatchIntervention = (stateName: string, interventionType: string) => {
    setDispatchedAlert(`Emergency Resource Deployed: ${interventionType} dispatched to ${stateName} State agricultural cluster.`);
    setTimeout(() => setDispatchedAlert(null), 5000);
  };

  const handleVerify = (diagId: string) => {
    onVerifyDiagnosis(diagId, officerNotesInput || "Verified by State Agricultural Development Project (ADP) Officer.");
    setVerifyingId(null);
    setOfficerNotesInput("");
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
              Federal Ministry of Agriculture & Food Security (FMAFS)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[10px] font-semibold">
              36 States + FCT Operational Command
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            National Agricultural Intelligence & Spatial Policy Portal
          </h2>
          <p className="text-xs text-slate-400">
            Real-time geospatial epidemiological surveillance, food reserve metrics, and predictive crop protection.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 p-1 rounded-2xl text-xs font-bold shrink-0">
          <button
            id="min-tab-spatial"
            onClick={() => setActiveTab("spatial")}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "spatial"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" /> Spatial Heatmap
          </button>
          <button
            id="min-tab-analytics"
            onClick={() => setActiveTab("analytics")}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "analytics"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Impact Projections
          </button>
          <button
            id="min-tab-verification"
            onClick={() => setActiveTab("verification")}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "verification"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Officer Verification ({diagnoses.filter((d) => !d.verifiedByOfficer).length})
          </button>
          <button
            id="min-tab-interventions"
            onClick={() => setActiveTab("interventions")}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "interventions"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-red-400" /> Emergency Dispatch
          </button>
        </div>
      </div>

      {dispatchedAlert && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{dispatchedAlert}</span>
        </div>
      )}

      {/* 4 Core Numeric Performance Target Metric Cards (Directly from Proposal Document) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Crop Loss Reduction Target */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Crop Loss Reduction</span>
            <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-md font-bold text-[10px]">
              Target: 20–35%
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100">28.4%</div>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Early multimodal vision detection deployed
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full" style={{ width: "81%" }}></div>
          </div>
        </div>

        {/* Metric 2: Farmer Profit Margin Increase Target */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Farmer Profit Margins</span>
            <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-md font-bold text-[10px]">
              Target: 15–25%
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100">+21.5%</div>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Middleman price suppression eliminated
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full" style={{ width: "86%" }}></div>
          </div>
        </div>

        {/* Metric 3: Farmer Support Response Speed */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Support Response Speed</span>
            <span className="px-2 py-0.5 bg-sky-500/15 border border-sky-500/30 text-sky-400 rounded-md font-bold text-[10px]">
              Target: 40% Faster
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100">42% Faster</div>
          <p className="text-[11px] text-sky-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Localized Multilingual Voice Assistant
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-gradient-to-r from-sky-600 to-blue-500 h-full rounded-full" style={{ width: "100%" }}></div>
          </div>
        </div>

        {/* Metric 4: Projected User Growth */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Onboarded Farmers</span>
            <span className="px-2 py-0.5 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-md font-bold text-[10px]">
              Goal: 100,000 (Y2)
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100">14,280</div>
          <p className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Projected: 500,000+ by Year 3
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full" style={{ width: "14%" }}></div>
          </div>
        </div>
      </div>

      {/* TAB 1: SPATIAL HEATMAP & GEOGRAPHIC COMMAND */}
      {activeTab === "spatial" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-emerald-400" /> Filter Map Data:
              </span>
              <div className="flex items-center gap-2">
                <select
                  id="map-crop-filter"
                  value={selectedCropFilter}
                  onChange={(e) => setSelectedCropFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All" className="bg-slate-900">All Crops</option>
                  <option value="Maize" className="bg-slate-900">Maize</option>
                  <option value="Cassava" className="bg-slate-900">Cassava</option>
                  <option value="Tomatoes" className="bg-slate-900">Tomatoes</option>
                  <option value="Rice" className="bg-slate-900">Rice</option>
                  <option value="Yam" className="bg-slate-900">Yam</option>
                </select>

                <select
                  id="map-severity-filter"
                  value={selectedSeverityFilter}
                  onChange={(e) => setSelectedSeverityFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All" className="bg-slate-900">All Severity Levels</option>
                  <option value="Critical" className="bg-slate-900">Critical Only</option>
                  <option value="Medium" className="bg-slate-900">Medium</option>
                  <option value="Low" className="bg-slate-900">Low</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span>Tracking <strong className="text-slate-200">{outbreaks.length}</strong> State Geo-Clusters</span>
              <span>•</span>
              <span><strong className="text-slate-200">{diagnoses.length}</strong> Farmer GPS Pins Plotted</span>
            </div>
          </div>

          {/* Interactive Leaflet Map */}
          <GeospatialMap
            outbreaks={outbreaks}
            diagnoses={diagnoses}
            selectedCrop={selectedCropFilter}
            selectedSeverity={selectedSeverityFilter}
          />

          {/* Regional Outbreak Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {outbreaks.slice(0, 6).map((outbreak) => (
              <div
                key={outbreak.state}
                className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-2 backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-100">{outbreak.state} State</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                      outbreak.riskLevel === "Severe"
                        ? "bg-red-500/15 text-red-400 border-red-500/30"
                        : outbreak.riskLevel === "High"
                        ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                        : outbreak.riskLevel === "Moderate"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {outbreak.riskLevel} Risk
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    <strong className="text-slate-300">Dominant Pathogen:</strong> {outbreak.dominantDisease}
                  </div>
                  <div>
                    <strong className="text-slate-300">Crops at Risk:</strong> {outbreak.primaryCropAtRisk}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                    <span>Reported Cases: <strong className="text-slate-200">{outbreak.totalOutbreaks}</strong></span>
                    <span className="text-red-400 font-bold">Est. Loss: {outbreak.estimatedLossPercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: IMPACT ANALYTICS & NUMERIC PROJECTIONS */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Target Projections Breakdown */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-100">
                  National Farmer Onboarding Trajectory
                </h3>
                <p className="text-xs text-slate-400">Scale target from Agrotech Technical Proposal</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
                Target: 100k (24 Mo)
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Year 1 Deployment Target</span>
                  <span className="text-emerald-400 font-bold">10,000 Farmers (Achieved: 14,280 - 142%)</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Year 2 Target (First 24 Months)</span>
                  <span className="text-purple-300 font-bold">100,000 Farmers (Currently: 14.3%)</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: "14.3%" }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Year 3 Expansion Target</span>
                  <span className="text-slate-400 font-bold">500,000+ Farmers Nationwide</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-slate-700 h-full rounded-full" style={{ width: "2.8%" }}></div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-950/30 rounded-2xl border border-purple-500/30 text-xs text-purple-300 leading-relaxed">
              <strong className="text-purple-200">Geopolitical Zone Penetration:</strong> North West leads in grain cooperative registrations (38%), followed by North Central food basket clusters (27%), and South West cassava/horticulture groups (21%).
            </div>
          </div>

          {/* Crop Loss Mitigation Tracker */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-100">
                  Crop Loss Reduction by Pathogen Class
                </h3>
                <p className="text-xs text-slate-400">Benchmark vs 20–35% Project Goal</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                Avg 28.4% Saved
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">Maize Fall Armyworm</span>
                  <span className="text-[11px] text-slate-400">Kano, Kaduna, Niger, Benue</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 text-sm">31.2% Loss Reduction</span>
                  <span className="text-[10px] text-slate-500 block">From 45% historical loss</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">Cassava Mosaic & Mealybug</span>
                  <span className="text-[11px] text-slate-400">Oyo, Ogun, Benue, Edo</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 text-sm">26.8% Loss Reduction</span>
                  <span className="text-[10px] text-slate-500 block">Resistant stems deployed</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">Tomato Leafminer (Tuta Absoluta)</span>
                  <span className="text-[11px] text-slate-400">Kano, Kaduna, Plateau</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 text-sm">33.5% Loss Reduction</span>
                  <span className="text-[10px] text-slate-500 block">Pheromone monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXTENSION OFFICER VERIFICATION QUEUE */}
      {activeTab === "verification" && (
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-base text-slate-100">
                Field Diagnosis Verification & Extension Dispatch
              </h3>
              <p className="text-xs text-slate-400">
                Agricultural Officers certify farmer multimodal scans and trigger local intervention packages.
              </p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-xl font-bold border border-slate-700">
              {diagnoses.length} Diagnoses in Registry
            </span>
          </div>

          <div className="space-y-3">
            {diagnoses.map((diag) => (
              <div
                key={diag.id}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={diag.imageUrl}
                    alt={diag.disease_name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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
                      <span className="font-bold text-sm text-slate-100">{diag.disease_name}</span>
                      <span className="text-xs text-slate-400">({diag.cropType})</span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Farmer: <strong className="text-slate-300">{diag.farmerName}</strong> • {diag.coordinates.state} State ({diag.coordinates.locationName || `${diag.coordinates.latitude}, ${diag.coordinates.longitude}`})
                    </div>

                    <div className="text-[11px] text-slate-500">
                      AI Confidence: <strong className="text-emerald-400">{diag.confidence_score.toFixed(1)}%</strong> • Logged: {new Date(diag.timestamp).toLocaleDateString()}
                    </div>

                    {diag.officerNotes && (
                      <div className="p-2 bg-emerald-950/30 text-emerald-300 text-[11px] rounded-lg border border-emerald-500/30 font-medium">
                        <strong>Officer Notes:</strong> {diag.officerNotes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {diag.verifiedByOfficer ? (
                    <span className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Officer Verified
                    </span>
                  ) : verifyingId === diag.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={officerNotesInput}
                        onChange={(e) => setOfficerNotesInput(e.target.value)}
                        placeholder="Add extension note or dosage verification..."
                        className="text-xs px-3 py-1.5 border border-slate-700 rounded-xl bg-slate-900 text-slate-100 w-64 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        id={`confirm-verify-${diag.id}`}
                        onClick={() => handleVerify(diag.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setVerifyingId(null)}
                        className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`verify-btn-${diag.id}`}
                      onClick={() => {
                        setVerifyingId(diag.id);
                        setOfficerNotesInput("Verified in field inspection. Cluster advisory issued.");
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.25)] transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Verify & Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EMERGENCY DISPATCH & INTERVENTION ENGINE */}
      {activeTab === "interventions" && (
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-base text-slate-100">
                Food Shortage & Regional Outbreak Rapid Response Engine
              </h3>
              <p className="text-xs text-slate-400">
                Deploy subsidized inputs, pesticide buffer squads, or mobile extension clinics directly to high-risk zones.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-red-400 animate-pulse" /> Live Dispatch Channel
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outbreaks.map((outbreak) => (
              <div
                key={outbreak.state}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-slate-100 text-base">{outbreak.state} State</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                        outbreak.riskLevel === "Severe" || outbreak.riskLevel === "High"
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {outbreak.riskLevel} Alert
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Outbreaks: <strong className="text-slate-200">{outbreak.totalOutbreaks}</strong> • Dominant: {outbreak.dominantDisease}
                  </p>
                  <p className="text-xs text-red-400 font-bold mt-1">
                    Yield Risk: {outbreak.estimatedLossPercent}%
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300 block">Deploy Action:</span>
                  <button
                    id={`dispatch-spray-${outbreak.state.toLowerCase()}`}
                    onClick={() => handleDispatchIntervention(outbreak.state, "Drone Bio-Pesticide Buffer Spray")}
                    className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 hover:border-emerald-500/40 border border-slate-800 text-xs font-medium text-slate-200 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>Dispatch Drone Spot-Spray Squad</span>
                    <Send className="w-3 h-3 text-emerald-400" />
                  </button>

                  <button
                    id={`dispatch-seeds-${outbreak.state.toLowerCase()}`}
                    onClick={() => handleDispatchIntervention(outbreak.state, "Emergency Certified Resistant Seed Stems")}
                    className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 hover:border-emerald-500/40 border border-slate-800 text-xs font-medium text-slate-200 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>Release Resistant Seed Stock</span>
                    <Sprout className="w-3 h-3 text-emerald-400" />
                  </button>

                  <button
                    id={`dispatch-officers-${outbreak.state.toLowerCase()}`}
                    onClick={() => handleDispatchIntervention(outbreak.state, "10 Extension Field Agents")}
                    className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 hover:border-emerald-500/40 border border-slate-800 text-xs font-medium text-slate-200 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>Deploy Mobile Extension Officers</span>
                    <Users className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
