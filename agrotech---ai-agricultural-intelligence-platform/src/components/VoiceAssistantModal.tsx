import React, { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Globe, 
  Sparkles, 
  X, 
  Send, 
  Languages, 
  CheckCircle, 
  RotateCcw,
  Headphones,
  HelpCircle,
  Radio,
  Square,
  AlertCircle
} from "lucide-react";
import { SupportedLanguage, VoiceAssistantResponse } from "../types";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLanguage?: SupportedLanguage;
  farmerState?: string;
  primaryCrop?: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  defaultLanguage = "Hausa",
  farmerState = "Kano",
  primaryCrop = "Maize"
}) => {
  const [mode, setMode] = useState<"live" | "advisory">("live");
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(defaultLanguage);
  
  // Live API States
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isLiveListening, setIsLiveListening] = useState<boolean>(false);
  const [liveUserTranscript, setLiveUserTranscript] = useState<string>("");
  const [liveModelTranscript, setLiveModelTranscript] = useState<string>("");
  const [liveError, setLiveError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Turn-by-turn Advisory States
  const [isRecordingAdvisory, setIsRecordingAdvisory] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>("");
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState<boolean>(false);
  const [advisoryResponse, setAdvisoryResponse] = useState<VoiceAssistantResponse | null>(null);

  // Web Audio & Live WebSocket Refs
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextAudioStartTimeRef = useRef<number>(0);
  const currentSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Helpers for 16-bit PCM Little Endian encoding/decoding
  const floatTo16BitPCM = (input: Float32Array): ArrayBuffer => {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return output.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const playLiveAudioChunk = (base64Audio: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const arrayBuffer = base64ToArrayBuffer(base64Audio);
      const dataView = new DataView(arrayBuffer);
      const numSamples = arrayBuffer.byteLength / 2;
      const float32 = new Float32Array(numSamples);

      for (let i = 0; i < numSamples; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7FFF;
      }

      const audioBuffer = ctx.createBuffer(1, numSamples, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      const startTime = Math.max(currentTime, nextAudioStartTimeRef.current);
      source.start(startTime);
      nextAudioStartTimeRef.current = startTime + audioBuffer.duration;

      currentSourcesRef.current.push(source);
      source.onended = () => {
        currentSourcesRef.current = currentSourcesRef.current.filter((s) => s !== source);
      };

      setAudioLevel(Math.random() * 70 + 30);
      setTimeout(() => setAudioLevel(0), 400);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  };

  const stopAllPlayback = () => {
    currentSourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {}
    });
    currentSourcesRef.current = [];
    nextAudioStartTimeRef.current = 0;
  };

  // Start Gemini Live API Session
  const startLiveSession = async () => {
    try {
      setLiveError(null);
      setLiveUserTranscript("");
      setLiveModelTranscript("");
      stopAllPlayback();

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLiveConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.ready) {
            startMicCapture();
          }
          if (msg.inputTranscript) {
            setLiveUserTranscript((prev) => (prev ? `${prev} ${msg.inputTranscript}` : msg.inputTranscript));
          }
          if (msg.outputTranscript) {
            setLiveModelTranscript((prev) => (prev ? `${prev} ${msg.outputTranscript}` : msg.outputTranscript));
          }
          if (msg.audio) {
            playLiveAudioChunk(msg.audio);
          }
          if (msg.interrupted) {
            stopAllPlayback();
          }
          if (msg.error) {
            setLiveError(msg.error);
          }
        } catch (e) {
          console.warn("Failed to parse Live WS message:", e);
        }
      };

      ws.onerror = (e) => {
        console.warn("Live WebSocket error:", e);
        setLiveError("Live WebSocket connection notice. Switching to localized voice query mode.");
        setIsLiveConnected(false);
      };

      ws.onclose = () => {
        setIsLiveConnected(false);
        setIsLiveListening(false);
        cleanupMicCapture();
      };
    } catch (err: any) {
      setLiveError(err?.message || "Failed to initiate Live API session");
    }
  };

  const startMicCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputAudioCtx;

      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const channelData = e.inputBuffer.getChannelData(0);
        
        // Calculate level for animation
        let sum = 0;
        for (let i = 0; i < channelData.length; i++) {
          sum += Math.abs(channelData[i]);
        }
        const avg = sum / channelData.length;
        setAudioLevel(Math.min(100, Math.round(avg * 400)));

        const pcmBuffer = floatTo16BitPCM(channelData);
        const base64 = arrayBufferToBase64(pcmBuffer);
        wsRef.current.send(JSON.stringify({ audio: base64 }));
      };

      source.connect(processor);
      processor.connect(inputAudioCtx.destination);
      setIsLiveListening(true);
    } catch (err: any) {
      console.warn("Mic capture error:", err);
      setLiveError("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const cleanupMicCapture = () => {
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {}
      scriptProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveListening(false);
  };

  const stopLiveSession = () => {
    cleanupMicCapture();
    stopAllPlayback();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsLiveConnected(false);
    setAudioLevel(0);
  };

  // Turn-by-Turn Fallback Advisory
  const sendAdvisoryQuery = async (queryText?: string) => {
    const textToSend = queryText || textInput;
    if (!textToSend.trim()) return;

    setIsLoadingAdvisory(true);
    try {
      const res = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textQuery: textToSend,
          language: selectedLanguage,
          contextCrop: primaryCrop,
          state: farmerState
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAdvisoryResponse(data);
        if (data.response_text && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(data.audio_script || data.response_text);
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.warn("Advisory error:", err);
    } finally {
      setIsLoadingAdvisory(false);
    }
  };

  // Close modal and cleanup
  const handleClose = () => {
    stopLiveSession();
    onClose();
  };

  useEffect(() => {
    if (isOpen && mode === "live") {
      startLiveSession();
    }
    return () => {
      stopLiveSession();
    };
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Agricultural Voice Companion
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Low-latency bidirectional speech for Nigerian farming corridors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setMode("live")}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  mode === "live"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Radio className="w-3 h-3" />
                <span>Live Audio</span>
              </button>
              <button
                onClick={() => {
                  stopLiveSession();
                  setMode("advisory");
                }}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  mode === "advisory"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Advisory</span>
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4">
          {mode === "live" ? (
            /* Live Audio Mode (gemini-3.8-live) */
            <div className="space-y-4">
              {/* Central Pulsing Waveform Ring */}
              <div className="aspect-[16/8] bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div
                  className="w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-150"
                  style={{
                    borderColor: isLiveListening ? "#10b981" : "#475569",
                    boxShadow: isLiveListening
                      ? `0 0 ${Math.max(15, audioLevel)}px rgba(16, 185, 129, 0.4)`
                      : "none",
                    transform: `scale(${1 + (audioLevel / 200)})`
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    {isLiveListening ? <Mic className="w-7 h-7 animate-pulse" /> : <MicOff className="w-7 h-7 text-slate-500" />}
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 justify-center">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isLiveConnected ? "bg-emerald-400 animate-pulse" : "bg-orange-400"
                      }`}
                    />
                    {isLiveConnected
                      ? isLiveListening
                        ? "Streaming voice with Gemini 3.8 Live (Speak freely)"
                        : "Connecting microphone stream..."
                      : "Connecting to Live WebSocket..."}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports English, Hausa, Yoruba, Igbo, and Nigerian Pidgin
                  </p>
                </div>
              </div>

              {/* Live Transcripts Box */}
              <div className="space-y-3">
                {liveUserTranscript && (
                  <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      You said (Real-time transcription):
                    </span>
                    <p className="text-slate-200 italic font-medium">"{liveUserTranscript}"</p>
                  </div>
                )}

                {liveModelTranscript && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Gemini 3.8 Live Response:
                    </span>
                    <p className="text-slate-100 font-medium leading-relaxed">{liveModelTranscript}</p>
                  </div>
                )}

                {liveError && (
                  <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 text-xs text-orange-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{liveError}</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="Hausa">Hausa</option>
                    <option value="Yoruba">Yoruba</option>
                    <option value="Igbo">Igbo</option>
                    <option value="Nigerian Pidgin">Nigerian Pidgin</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={isLiveListening ? stopLiveSession : startLiveSession}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isLiveListening
                        ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                        : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    }`}
                  >
                    {isLiveListening ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isLiveListening ? "Mute / Pause" : "Resume Voice"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Advisory Turn-by-Turn Mode */
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold">Common Agricultural Questions:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "When is the best time to apply NPK 20:10:10 for maize in Kano?",
                    "How do I prevent Cassava Mosaic Disease and whiteflies?",
                    "What are current paddy rice prices in northern mills?",
                    "How do I qualify for the Presidential Fertilizer Initiative?"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTextInput(preset);
                        sendAdvisoryQuery(preset);
                      }}
                      className="text-left text-xs px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition hover:border-emerald-500/40"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendAdvisoryQuery()}
                  placeholder="Type or ask an agronomic question in Hausa, Yoruba, Igbo, or English..."
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => sendAdvisoryQuery()}
                  disabled={isLoadingAdvisory}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>

              {/* Advisory Response Display */}
              {isLoadingAdvisory ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Sparkles className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
                  Generating authoritative agronomic extension advice...
                </div>
              ) : advisoryResponse ? (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
                  <div>
                    <span className="font-bold text-emerald-400 block mb-1">
                      {advisoryResponse.language} Advisory:
                    </span>
                    <p className="text-slate-100 leading-relaxed font-medium">{advisoryResponse.response_text}</p>
                  </div>

                  {advisoryResponse.english_translation && (
                    <div className="pt-2 border-t border-slate-800/80 text-slate-400">
                      <span className="font-semibold text-slate-300 block mb-0.5">English Translation:</span>
                      <p>{advisoryResponse.english_translation}</p>
                    </div>
                  )}

                  {advisoryResponse.key_recommendations && advisoryResponse.key_recommendations.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="font-bold text-slate-300 block mb-1">Key Action Items:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {advisoryResponse.key_recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
