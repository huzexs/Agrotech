import React, { useState, useEffect } from "react";
import { 
  UserProfile, 
  SupportedLanguage, 
  CropDiagnosis, 
  MarketPriceItem, 
  AgriNewsItem, 
  RegionalOutbreakData 
} from "./types";
import { 
  INITIAL_DIAGNOSES, 
  REGIONAL_OUTBREAK_HEATMAP 
} from "./data/initialData";
import { 
  db, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  addDoc, 
  updateDoc 
} from "./lib/firebase";

// Modular Components & Dynamic Hooks
import { Header } from "./components/Header";
import { FarmerPortal } from "./components/FarmerPortal";
import { MinistryDashboard } from "./components/MinistryDashboard";
import { MarketPriceBoard } from "./components/MarketPriceBoard";
import { AgriNewsFeed } from "./components/AgriNewsFeed";
import { DiseaseScannerModal } from "./components/DiseaseScannerModal";
import { VoiceAssistantModal } from "./components/VoiceAssistantModal";
import { AuthModal } from "./components/AuthModal";
import { AgriMapsLocator } from "./components/AgriMapsLocator";
import { AudioTranscriber } from "./components/AudioTranscriber";
import { auth, onAuthStateChanged, getDoc, onSnapshot } from "./lib/firebase";
import { useMarketPrices } from "./hooks/useMarketPrices";
import { useAgriNews } from "./hooks/useAgriNews";

export default function App() {
  // Current active user persona
  const [userProfile, setUserProfile] = useState<UserProfile>({
    uid: "f-kano-amina",
    displayName: "Amina Bello",
    phoneNumber: "+234 802 987 1122",
    role: "Farmer",
    state: "Kano",
    lga: "Dambatta LGA",
    preferredLanguage: "Hausa",
    farmSizeHectares: 4.5,
    primaryCrops: ["Maize", "Sorghum", "Cowpea"]
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<"farmer" | "ministry" | "prices" | "news" | "maps" | "transcribe">("farmer");

  // Application Data States (Diagnostics & Regional Outbreaks)
  const [diagnoses, setDiagnoses] = useState<CropDiagnosis[]>(INITIAL_DIAGNOSES);
  const [outbreaks, setOutbreaks] = useState<RegionalOutbreakData[]>(REGIONAL_OUTBREAK_HEATMAP);

  // Dynamic Asynchronous Hooks for Market Prices & Agricultural News (Zero Static Mock Arrays)
  const {
    prices,
    isLoading: isLoadingPrices,
    lastUpdated: lastPricesUpdate,
    refreshPrices
  } = useMarketPrices(userProfile.state);

  const {
    articles: newsItems,
    categorized: categorizedNews,
    isLoading: isLoadingLiveNews,
    isLiveGrounded,
    lastUpdated: lastNewsUpdate,
    groundingSources,
    searchQueries,
    refreshNews: fetchRealtimeNews
  } = useAgriNews(userProfile.state);

  // Modals & UI States
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [lowBandwidthMode, setLowBandwidthMode] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("Hausa");

  // Load Firestore data, real-time snapshot listener & Auth state tracking
  useEffect(() => {
    // 1. Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserProfile({
              uid: currentUser.uid,
              displayName: data.displayName || currentUser.displayName || "Agrotech Farmer",
              email: currentUser.email || undefined,
              photoURL: currentUser.photoURL || undefined,
              phoneNumber: data.phoneNumber || undefined,
              role: data.role || "Farmer",
              state: data.state || "Kano",
              preferredLanguage: data.preferredLanguage || "Hausa",
              farmSizeHectares: data.farmSizeHectares || 3.0,
              primaryCrops: data.primaryCrops || ["Maize", "Sorghum"]
            });
            if (data.preferredLanguage) {
              setSelectedLanguage(data.preferredLanguage);
            }
          }
        } catch (err) {
          console.warn("Firestore profile sync notice:", err);
        }
      }
    });

    // 2. Real-time Firestore sync for Diagnostics
    const unsubscribeDiag = onSnapshot(collection(db, "diagnostics"), (snapshot) => {
      if (!snapshot.empty) {
        const liveItems: CropDiagnosis[] = [];
        snapshot.forEach((d) => {
          liveItems.push({ id: d.id, ...d.data() } as CropDiagnosis);
        });
        if (liveItems.length > 0) {
          setDiagnoses(liveItems);
        }
      }
    }, (err) => {
      console.warn("Firestore real-time diagnostics notice:", err);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDiag();
    };
  }, []);

  // When user persona changes, update appropriate tab
  const handleSelectPersona = (profile: UserProfile) => {
    setUserProfile(profile);
    setSelectedLanguage(profile.preferredLanguage);
    if (profile.role === "Ministry Admin") {
      setCurrentTab("ministry");
    } else if (profile.role === "Agricultural Officer") {
      setCurrentTab("ministry");
    } else {
      setCurrentTab("farmer");
    }
  };

  const handleLogout = () => {
    setUserProfile({
      uid: "guest-farmer",
      displayName: "Guest Farmer",
      role: "Farmer",
      state: "Kano",
      preferredLanguage: "Hausa"
    });
    setCurrentTab("farmer");
  };

  // Add new diagnostic result
  const handleDiagnosisComplete = async (newDiag: CropDiagnosis) => {
    setDiagnoses((prev) => [newDiag, ...prev]);

    // Also increment state outbreak count in regional heatmap
    setOutbreaks((prev) =>
      prev.map((o) =>
        o.state.toLowerCase() === newDiag.coordinates.state.toLowerCase()
          ? { ...o, totalOutbreaks: o.totalOutbreaks + 1 }
          : o
      )
    );

    // Save to Firestore
    try {
      await addDoc(collection(db, "diagnostics"), newDiag);
    } catch (err) {
      console.warn("Saved to local diagnostic registry:", err);
    }
  };

  // Verify diagnostic case by Agricultural Officer
  const handleVerifyDiagnosis = async (id: string, notes: string) => {
    setDiagnoses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, verifiedByOfficer: true, officerNotes: notes } : d))
    );

    try {
      const docRef = doc(db, "diagnostics", id);
      await updateDoc(docRef, { verifiedByOfficer: true, officerNotes: notes });
    } catch (err) {
      console.warn("Verified in memory registry:", err);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors relative ${
      lowBandwidthMode ? "bg-[#020617] text-slate-200" : "bg-[#020617] text-slate-200"
    }`}>
      {/* Subtle Immersive Ambient Glow Backdrop */}
      {!lowBandwidthMode && (
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(2,6,23,0))] z-0" />
      )}

      {/* Top Application Header */}
      <Header
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        userProfile={userProfile}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        selectedLanguage={selectedLanguage}
        onChangeLanguage={(lang) => {
          setSelectedLanguage(lang);
          setUserProfile((prev) => ({ ...prev, preferredLanguage: lang }));
        }}
        lowBandwidthMode={lowBandwidthMode}
        onToggleLowBandwidth={() => setLowBandwidthMode(!lowBandwidthMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {currentTab === "farmer" && (
          <FarmerPortal
            userProfile={userProfile}
            diagnoses={diagnoses}
            prices={prices}
            newsItems={newsItems}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
            onNavigateTab={setCurrentTab}
            lowBandwidthMode={lowBandwidthMode}
          />
        )}

        {currentTab === "ministry" && (
          <MinistryDashboard
            outbreaks={outbreaks}
            diagnoses={diagnoses}
            prices={prices}
            onVerifyDiagnosis={handleVerifyDiagnosis}
          />
        )}

        {currentTab === "prices" && (
          <MarketPriceBoard
            prices={prices}
            userState={userProfile.state}
            lowBandwidthMode={lowBandwidthMode}
          />
        )}

        {currentTab === "news" && (
          <AgriNewsFeed
            newsItems={newsItems}
            userState={userProfile.state}
            onRefreshNews={(state) => fetchRealtimeNews(state, true)}
            isLoadingLive={isLoadingLiveNews}
            isLiveGrounded={isLiveGrounded}
            lastUpdatedTime={lastNewsUpdate}
            groundingSources={groundingSources}
            searchQueries={searchQueries}
          />
        )}

        {currentTab === "maps" && (
          <AgriMapsLocator
            userState={userProfile.state}
            lowBandwidthMode={lowBandwidthMode}
          />
        )}

        {currentTab === "transcribe" && (
          <AudioTranscriber
            userProfile={userProfile}
            onUseTranscriptionAsSearch={() => {
              setCurrentTab("news");
            }}
            onUseTranscriptionAsDiagnosisNotes={() => {
              setIsScannerOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer with Performance Targets & Institutional Partners */}
      <footer className="bg-slate-950/90 border-t border-slate-800/80 mt-12 py-8 text-slate-400 text-xs backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Performance Targets Strip from Document */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-3 text-center shadow-lg">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Crop Loss Reduction</div>
              <div className="text-base font-extrabold text-emerald-400">20–35%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Farmer Profit Increase</div>
              <div className="text-base font-extrabold text-emerald-400">15–25%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Voice AI Response Speed</div>
              <div className="text-base font-extrabold text-emerald-400">40% Faster</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Projected Scale</div>
              <div className="text-base font-extrabold text-slate-100">500,000+ Farmers</div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Operational Scope</div>
              <div className="text-base font-extrabold text-slate-100">36 States + FCT</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-[11px] text-slate-500">
            <div>
              <strong className="text-slate-300">Agrotech AI Platform</strong> • Built in accordance with Federal Ministry of Agriculture and Food Security (FMAFS) Framework.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="text-emerald-400/90 font-medium">Firebase Cloud Firestore</span>
              <span>•</span>
              <span className="text-emerald-400/90 font-medium">Gemini Multimodal AI</span>
              <span>•</span>
              <span className="text-emerald-400/90 font-medium">OpenStreetMap / Leaflet</span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Multimodal Crop Disease Scanner */}
      <DiseaseScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDiagnosisComplete={handleDiagnosisComplete}
        currentFarmerName={userProfile.displayName}
        defaultState={userProfile.state}
        userLanguage={selectedLanguage}
      />

      {/* 2. Localized Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        defaultLanguage={selectedLanguage}
        farmerState={userProfile.state}
        primaryCrop={userProfile.primaryCrops?.[0] || "Maize"}
      />

      {/* 3. Authentication & RBAC Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectPersona={handleSelectPersona}
      />
    </div>
  );
}
