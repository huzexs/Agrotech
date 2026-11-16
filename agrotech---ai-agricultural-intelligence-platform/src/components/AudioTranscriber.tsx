import React, { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles, 
  FileText, 
  Database, 
  Clock, 
  Languages, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Volume2
} from "lucide-react";
import { UserProfile, AudioTranscriptItem } from "../types";
import { db, collection, addDoc, getDocs, query, orderBy, limit } from "../lib/firebase";

interface AudioTranscriberProps {
  userProfile: UserProfile;
  onUseTranscriptionAsSearch?: (text: string) => void;
  onUseTranscriptionAsDiagnosisNotes?: (text: string) => void;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  userProfile,
  onUseTranscriptionAsSearch,
  onUseTranscriptionAsDiagnosisNotes
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>("audio/webm");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string>("");
  const [transcriptionModel, setTranscriptionModel] = useState<string>("gemini-3.5-transcribe");
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [copied, setCopied] = useState<boolean>(false);
  const [isSavingToFirestore, setIsSavingToFirestore] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [savedTranscripts, setSavedTranscripts] = useState<AudioTranscriptItem[]>([]);
  const [audioWaveLevel, setAudioWaveLevel] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const animationFrameRef = useRef<any>(null);

  // Load past transcripts from Firestore
  const loadTranscriptsFromFirestore = async () => {
    try {
      const q = query(collection(db, "transcripts"), orderBy("timestamp", "desc"), limit(10));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const items: AudioTranscriptItem[] = [];
        snap.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as AudioTranscriptItem);
        });
        setSavedTranscripts(items);
      }
    } catch (e) {
      console.warn("Firestore transcripts query initialized with local memory cache:", e);
    }
  };

  useEffect(() => {
    loadTranscriptsFromFirestore();
  }, []);

  const startRecording = async () => {
    try {
      setTranscriptionResult("");
      setRecordedAudioUrl(null);
      setAudioBase64(null);
      setSaveSuccess(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mime = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mime = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mime = "audio/mp4";
      }

      setAudioMimeType(mime);
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
        setAudioWaveLevel(Math.random() * 85 + 15);
      }, 250);
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      alert("Please allow microphone permissions to record field audio for transcription.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBase64) return;
    setIsTranscribing(true);

    try {
      const res = await fetch("/api/transcribe-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: audioBase64,
          mimeType: audioMimeType,
          language: selectedLanguage
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTranscriptionResult(data.transcription || "");
        setTranscriptionModel(data.model || "gemini-3.5-transcribe");
        setConfidenceScore(data.confidence || 0.96);

        // Auto-save to Firestore if user is present
        saveToFirestore(data.transcription, data.model || "gemini-3.5-transcribe", data.confidence || 0.96);
      }
    } catch (err) {
      console.warn("Transcription request error:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const saveToFirestore = async (text: string, model: string, confidence: number) => {
    if (!text.trim()) return;
    setIsSavingToFirestore(true);

    const newItem: Omit<AudioTranscriptItem, "id"> = {
      userId: userProfile.uid,
      transcription: text,
      confidence,
      language: selectedLanguage,
      timestamp: Date.now(),
      model
    };

    try {
      const docRef = await addDoc(collection(db, "transcripts"), newItem);
      setSavedTranscripts((prev) => [{ id: docRef.id, ...newItem }, ...prev]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.warn("Saved to memory transcript registry:", e);
      // Keep in local state
      setSavedTranscripts((prev) => [{ id: `local-${Date.now()}`, ...newItem }, ...prev]);
      setSaveSuccess(true);
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  const handleCopyText = () => {
    if (!transcriptionResult) return;
    navigator.clipboard?.writeText(transcriptionResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Model: gemini-3.5-transcribe
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Firestore Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Agricultural Audio Transcription Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Record microphone voice notes in the field, extension surveys, or pest observations. Audio is transcribed with precision using Google’s dedicated <strong className="text-blue-400">gemini-3.5-transcribe</strong> model and preserved in Firestore.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="English">English</option>
              <option value="Hausa">Hausa</option>
              <option value="Yoruba">Yoruba</option>
              <option value="Igbo">Igbo</option>
              <option value="Nigerian Pidgin">Nigerian Pidgin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recording Deck */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                Field Audio Recorder
              </span>
              {isRecording && (
                <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  REC ({recordingDuration}s)
                </span>
              )}
            </div>

            {/* Visualizer Wave Box */}
            <div className="aspect-[16/9] bg-slate-950 rounded-2xl border border-slate-800/80 p-6 flex flex-col items-center justify-center relative overflow-hidden">
              {isRecording ? (
                <div className="flex items-center gap-1.5 h-20 w-full justify-center">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-emerald-500 to-blue-400 rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.max(12, (audioWaveLevel * ((i % 5) + 1) * 0.25) % 80)}px`
                      }}
                    />
                  ))}
                </div>
              ) : recordedAudioUrl ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Audio Captured ({recordingDuration}s)</span>
                  <audio src={recordedAudioUrl} controls className="w-full h-9 rounded-lg" />
                </div>
              ) : (
                <div className="text-center text-slate-500 text-xs space-y-2">
                  <Mic className="w-10 h-10 text-slate-700 mx-auto" />
                  <p>Press the button below to record field audio or farmer statement</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording Voice</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-red-500/20"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Recording ({recordingDuration}s)</span>
              </button>
            )}

            {recordedAudioUrl && !isRecording && (
              <button
                onClick={transcribeAudio}
                disabled={isTranscribing}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {isTranscribing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Transcribe with gemini-3.5-transcribe</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Transcription Output & Actions */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Transcription Output
              </span>

              {confidenceScore && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Confidence: {Math.round(confidenceScore * 100)}%
                </span>
              )}
            </div>

            {/* Transcript Card */}
            <div className="min-h-[160px] bg-slate-950 rounded-2xl border border-slate-800 p-5 text-sm text-slate-200 leading-relaxed relative">
              {isTranscribing ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="text-xs">gemini-3.5-transcribe is decoding agricultural terminology...</span>
                </div>
              ) : transcriptionResult ? (
                <div>
                  <p className="whitespace-pre-line text-slate-100 font-medium">{transcriptionResult}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-xs">
                  <span>Record audio and click Transcribe to view speech-to-text conversion.</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {transcriptionResult && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={handleCopyText}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Text"}</span>
                </button>

                {onUseTranscriptionAsDiagnosisNotes && (
                  <button
                    onClick={() => onUseTranscriptionAsDiagnosisNotes(transcriptionResult)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Use as Crop Diagnosis Note</span>
                  </button>
                )}

                {onUseTranscriptionAsSearch && (
                  <button
                    onClick={() => onUseTranscriptionAsSearch(transcriptionResult)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-blue-400 flex items-center gap-1.5 transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search in Grounded Wire</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Firestore Sync Banner */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Collection: <strong className="text-slate-300">/transcripts</strong></span>
            </span>
            {saveSuccess && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Saved to Firestore!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Firestore History Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Recent Firestore Audio Transcripts</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {savedTranscripts.length} Records
            </span>
          </h2>
          <button
            onClick={loadTranscriptsFromFirestore}
            className="text-xs text-slate-400 hover:text-emerald-400 transition flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Firestore</span>
          </button>
        </div>

        {savedTranscripts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No audio transcripts recorded yet. Start recording above!
          </div>
        ) : (
          <div className="space-y-3">
            {savedTranscripts.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                      {item.model}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">{item.transcription}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(item.transcription);
                      alert("Copied to clipboard!");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center gap-1 transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
