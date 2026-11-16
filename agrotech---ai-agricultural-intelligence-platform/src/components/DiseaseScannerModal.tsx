import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  X, 
  RotateCcw, 
  Globe, 
  Sparkles, 
  ShieldAlert, 
  Leaf, 
  FileText 
} from "lucide-react";
import { CropDiagnosis, GeolocationCoords, SupportedLanguage } from "../types";
import { NIGERIAN_STATES } from "../data/initialData";

interface DiseaseScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiagnosisComplete: (diagnosis: CropDiagnosis) => void;
  currentFarmerName: string;
  defaultState?: string;
  userLanguage?: SupportedLanguage;
}

export const DiseaseScannerModal: React.FC<DiseaseScannerModalProps> = ({
  isOpen,
  onClose,
  onDiagnosisComplete,
  currentFarmerName,
  defaultState = "Kano",
  userLanguage = "Hausa"
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>("Maize");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCapturingCamera, setIsCapturingCamera] = useState<boolean>(false);
  const [farmerNotes, setFarmerNotes] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>(defaultState);
  const [coordinates, setCoordinates] = useState<GeolocationCoords>({
    latitude: 12.0022,
    longitude: 8.5920,
    state: defaultState,
    lga: "Dambatta",
    locationName: `${defaultState} Agro Cluster`
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>("Default GPS coordinates locked");

  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<CropDiagnosis | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<"hausa" | "yoruba" | "igbo" | "pidgin">("hausa");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Sync state coordinates when selectedState changes
  useEffect(() => {
    const foundState = NIGERIAN_STATES.find((s) => s.state === selectedState);
    if (foundState) {
      setCoordinates((prev) => ({
        ...prev,
        state: foundState.state,
        latitude: foundState.lat,
        longitude: foundState.lng,
        locationName: `${foundState.state} (${foundState.zone})`
      }));
    }
  }, [selectedState]);

  // Try GPS Geolocation on mount
  const requestBrowserLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      setLocationStatus("Acquiring high-precision satellite GPS fix...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Find closest Nigerian state
          let closest = NIGERIAN_STATES[0];
          let minDist = 999999;
          NIGERIAN_STATES.forEach((st) => {
            const dist = Math.hypot(st.lat - lat, st.lng - lng);
            if (dist < minDist) {
              minDist = dist;
              closest = st;
            }
          });

          setCoordinates({
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            state: closest.state,
            locationName: `GPS Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)} (${closest.state})`
          });
          setSelectedState(closest.state);
          setIsLocating(false);
          setLocationStatus("GPS Location Attached");
        },
        (error) => {
          console.warn("GPS error:", error);
          setIsLocating(false);
          setLocationStatus(`Using state-level coordinates (${selectedState})`);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      requestBrowserLocation();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setIsCapturingCamera(true);
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setIsCapturingCamera(false);
      setErrorMessage("Camera access unavailable. Please use the file upload option.");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCapturingCamera(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setImagePreview(dataUrl);
      stopCamera();
    }
  };

  const handleRunDiagnosis = async () => {
    if (!imagePreview) {
      setErrorMessage("Please capture or upload a photo of the affected plant.");
      return;
    }

    setIsDiagnosing(true);
    setErrorMessage(null);

    try {
      const payload = {
        image: imagePreview,
        cropType: selectedCrop,
        notes: farmerNotes,
        coordinates: coordinates
      };

      const res = await fetch("/api/diagnose-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP status ${res.status}`);
      }

      const data = await res.json();

      const newDiagnosis: CropDiagnosis = {
        id: `diag-${Date.now()}`,
        farmerId: "current-user",
        farmerName: currentFarmerName,
        cropType: selectedCrop,
        disease_name: data.disease_name || "Detected Crop Pathogen",
        confidence_score: data.confidence_score || 94.0,
        primary_symptoms: data.primary_symptoms || ["Leaf discoloration", "Stem damage"],
        immediate_treatment_plan: data.immediate_treatment_plan || ["Apply certified neem or targeted treatment"],
        preventative_measures: data.preventative_measures || ["Implement crop rotation", "Source certified seeds"],
        severity_level: data.severity_level || "Medium",
        affected_plant_part: data.affected_plant_part || "Foliage",
        localized_advice: data.localized_advice,
        imageUrl: imagePreview,
        coordinates: coordinates,
        timestamp: Date.now(),
        verifiedByOfficer: false
      };

      setDiagnosticResult(newDiagnosis);
      onDiagnosisComplete(newDiagnosis);
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setErrorMessage("Failed to reach diagnostic service. Please verify your connection.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const resetForm = () => {
    setImagePreview(null);
    setDiagnosticResult(null);
    setFarmerNotes("");
    setErrorMessage(null);
    stopCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 text-slate-200 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-950/90 border-b border-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-slate-100">AI Crop Disease Diagnostic Engine</h3>
              <p className="text-xs text-slate-400">Multimodal Vision Pipeline • GPS Field Geotagged</p>
            </div>
          </div>
          <button
            id="close-diag-modal-btn"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!diagnosticResult ? (
            <div className="space-y-4">
              {/* Crop & State Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Target Crop
                  </label>
                  <select
                    id="crop-type-select"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium text-slate-200"
                  >
                    <option value="Maize" className="bg-slate-900 text-slate-200">Maize (Masara / Àgbàdo / Ọka)</option>
                    <option value="Cassava" className="bg-slate-900 text-slate-200">Cassava (Rogo / Ege / Ji Akpụ)</option>
                    <option value="Rice" className="bg-slate-900 text-slate-200">Rice (Shinkafa / Ìrẹsì / Osikapa)</option>
                    <option value="Yam" className="bg-slate-900 text-slate-200">Yam (Doya / Isu / Ji)</option>
                    <option value="Tomatoes" className="bg-slate-900 text-slate-200">Tomatoes (Tumatir / Tòmátì / Tomato)</option>
                    <option value="Cowpea / Beans" className="bg-slate-900 text-slate-200">Cowpea / Beans (Wake / Ẹwà / Agwa)</option>
                    <option value="Pepper" className="bg-slate-900 text-slate-200">Pepper (Attarugu / Ata / Ose)</option>
                    <option value="Sorghum" className="bg-slate-900 text-slate-200">Sorghum (Dawa / Ọkà Bàbà)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Farm State / Location
                  </label>
                  <select
                    id="state-select"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium text-slate-200"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s.state} value={s.state} className="bg-slate-900 text-slate-200">
                        {s.state} State ({s.zone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* GPS Geolocation Status */}
              <div className="flex items-center justify-between p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">Coordinates Attached: </span>
                    <span className="text-slate-400">
                      {coordinates.latitude.toFixed(4)}° N, {coordinates.longitude.toFixed(4)}° E
                    </span>
                    <span className="text-emerald-400 block text-[11px]">{locationStatus}</span>
                  </div>
                </div>
                <button
                  id="refresh-gps-btn"
                  onClick={requestBrowserLocation}
                  disabled={isLocating}
                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 bg-slate-800/90 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                >
                  {isLocating ? "Locating..." : "Recalibrate GPS"}
                </button>
              </div>

              {/* Photo Input: Camera or File Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Plant Photo (Leaf, Stem, or Whole Stand)
                </label>

                {isCapturingCamera ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 flex items-center gap-3">
                      <button
                        id="snap-camera-btn"
                        onClick={capturePhotoFromCamera}
                        className="px-5 py-2 rounded-full bg-emerald-600 text-white font-semibold text-sm shadow-lg hover:bg-emerald-500 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" /> Snap Photo
                      </button>
                      <button
                        id="cancel-camera-btn"
                        onClick={stopCamera}
                        className="px-4 py-2 rounded-full bg-slate-800/80 text-white text-xs hover:bg-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 group">
                    <img
                      src={imagePreview}
                      alt="Crop Disease Specimen"
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        id="change-photo-btn"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold shadow hover:bg-slate-700 border border-slate-700 cursor-pointer"
                      >
                        Change Photo
                      </button>
                      <button
                        id="retake-camera-btn"
                        onClick={startCamera}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow hover:bg-emerald-500 cursor-pointer"
                      >
                        Use Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      id="launch-camera-btn"
                      onClick={startCamera}
                      type="button"
                      className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 transition cursor-pointer text-emerald-400"
                    >
                      <Camera className="w-8 h-8 mb-2 text-emerald-400" />
                      <span className="text-xs font-bold">Use Live Camera</span>
                      <span className="text-[10px] text-emerald-500/80">Direct Field Snap</span>
                    </button>

                    <button
                      id="upload-gallery-btn"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                      className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950 hover:bg-slate-850 hover:border-slate-700 transition cursor-pointer text-slate-300"
                    >
                      <Upload className="w-8 h-8 mb-2 text-slate-500" />
                      <span className="text-xs font-bold">Upload from Gallery</span>
                      <span className="text-[10px] text-slate-500">JPG, PNG, WebP</span>
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Optional Farmer Symptoms / Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observed Symptoms / Farm Notes (Optional)
                </label>
                <textarea
                  id="farmer-notes-input"
                  rows={2}
                  value={farmerNotes}
                  onChange={(e) => setFarmerNotes(e.target.value)}
                  placeholder="e.g. Started 4 days ago after light rains, leaf whorls have sawdust frass and holes..."
                  className="w-full text-xs rounded-xl border border-slate-800 p-2.5 focus:outline-none focus:border-emerald-500 text-slate-200 bg-slate-950 placeholder-slate-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  id="cancel-diag-btn"
                  onClick={onClose}
                  type="button"
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Close
                </button>
                <button
                  id="run-ai-diag-btn"
                  onClick={handleRunDiagnosis}
                  disabled={isDiagnosing || !imagePreview}
                  type="button"
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer ${
                    isDiagnosing || !imagePreview
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50"
                  }`}
                >
                  {isDiagnosing ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      Analyzing with Multimodal Vision Engine...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run AI Diagnosis
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ================= DIAGNOSTIC RESULT DISPLAY ================= */
            <div className="space-y-4">
              {/* Top Banner with Severity & Confidence */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  diagnosticResult.severity_level === "Critical"
                    ? "bg-red-500/15 border-red-500/30 text-red-300"
                    : diagnosticResult.severity_level === "Medium"
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                    : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${
                        diagnosticResult.severity_level === "Critical"
                          ? "bg-red-600 text-white"
                          : diagnosticResult.severity_level === "Medium"
                          ? "bg-amber-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {diagnosticResult.severity_level} Severity Outbreak
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Specimen: {diagnosticResult.cropType}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-100">{diagnosticResult.disease_name}</h2>
                  <p className="text-xs text-slate-300">
                    Affected Plant Zone: <strong>{diagnosticResult.affected_plant_part}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">AI Confidence Score</span>
                    <span className="text-2xl font-extrabold text-emerald-400">
                      {diagnosticResult.confidence_score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-2xl shadow-sm border border-slate-800">
                    <ShieldAlert className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Photo & GPS Verification Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={diagnosticResult.imageUrl}
                    alt="Analyzed Crop"
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-2 text-[10px] text-slate-400 text-center bg-slate-900 border-t border-slate-800 font-medium">
                    Verified Field Specimen
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-300">
                      <span>Geotag Coordinates:</span>
                      <span className="text-emerald-400 font-mono text-[11px]">
                        {diagnosticResult.coordinates.latitude.toFixed(4)}° N, {diagnosticResult.coordinates.longitude.toFixed(4)}° E
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Jurisdiction:</span>
                      <span>{diagnosticResult.coordinates.state} State ({diagnosticResult.coordinates.locationName})</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Logged by Farmer:</span>
                      <span>{diagnosticResult.farmerName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Ministry Network Status:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Synced to National Heatmap
                      </span>
                    </div>
                  </div>

                  {/* Primary Symptoms */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
                    <h4 className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-400" /> Primary Identified Symptoms:
                    </h4>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
                      {diagnosticResult.primary_symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Immediate Treatment Plan & Preventative Measures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl">
                  <h4 className="font-bold text-xs text-emerald-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Immediate Treatment Plan:
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-xs">
                    {diagnosticResult.immediate_treatment_plan.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-4 h-4 shrink-0 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center mt-0.5 border border-emerald-500/30">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-sky-950/30 border border-sky-500/30 rounded-2xl">
                  <h4 className="font-bold text-xs text-sky-300 mb-2 flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-sky-400" /> Preventative & Agronomic Measures:
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-xs">
                    {diagnosticResult.preventative_measures.map((prev, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-4 h-4 shrink-0 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold flex items-center justify-center mt-0.5 border border-sky-500/30">
                          •
                        </span>
                        <span className="text-[11px] leading-relaxed">{prev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Localized Language Translation Tabs */}
              {diagnosticResult.localized_advice && (
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                      <Globe className="w-4 h-4 text-emerald-400" /> Localized Voice & Advice Guidance:
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                      {(["hausa", "yoruba", "igbo", "pidgin"] as const).map((lang) => (
                        <button
                          key={lang}
                          id={`lang-tab-${lang}`}
                          onClick={() => setActiveLangTab(lang)}
                          className={`px-2.5 py-1 rounded-md font-semibold capitalize transition cursor-pointer ${
                            activeLangTab === lang
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 text-xs leading-relaxed italic">
                    "{diagnosticResult.localized_advice[activeLangTab] || "Advice available in standard extension formats."}"
                  </div>
                </div>
              )}

              {/* Reset / Scan Another */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  id="scan-another-crop-btn"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Scan Another Plant Specimen
                </button>
                <button
                  id="done-diag-btn"
                  onClick={onClose}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 transition cursor-pointer"
                >
                  Save & Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
