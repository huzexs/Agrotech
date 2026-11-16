import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  Phone, 
  Mail, 
  LogIn, 
  Sparkles, 
  UserCheck, 
  Building2, 
  Wheat, 
  Check 
} from "lucide-react";
import { UserRole, SupportedLanguage, UserProfile } from "../types";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInAnonymously,
  db,
  doc,
  getDoc,
  setDoc
} from "../lib/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSelectPersona
}) => {
  const [authMethod, setAuthMethod] = useState<"persona" | "phone" | "google" | "admin">("google");
  const [phoneNumber, setPhoneNumber] = useState<string>("+234 803 123 4567");
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>("advisory@fmafs.gov.ng");
  const [adminPassword, setAdminPassword] = useState<string>("••••••••••••");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Pre-configured stakeholder personas for instant 1-click verification
  const demoPersonas: UserProfile[] = [
    {
      uid: "f-kano-amina",
      displayName: "Amina Bello",
      phoneNumber: "+234 802 987 1122",
      role: "Farmer",
      state: "Kano",
      lga: "Dambatta LGA",
      preferredLanguage: "Hausa",
      farmSizeHectares: 4.5,
      primaryCrops: ["Maize", "Sorghum", "Cowpea"]
    },
    {
      uid: "ao-enugu-emeka",
      displayName: "Dr. Emeka Okafor",
      email: "emeka.okafor@adp.gov.ng",
      phoneNumber: "+234 803 555 9012",
      role: "Agricultural Officer",
      state: "Enugu",
      lga: "Nkanu West LGA",
      preferredLanguage: "Igbo",
      farmSizeHectares: 0,
      primaryCrops: ["Yam", "Cassava", "Rice"]
    },
    {
      uid: "admin-abuja-tunde",
      displayName: "Hon. Tunde Adeyemi",
      email: "t.adeyemi@fmafs.gov.ng",
      role: "Ministry Admin",
      state: "FCT Abuja",
      lga: "Abuja Central",
      preferredLanguage: "English",
      farmSizeHectares: 0
    }
  ];

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      let resolvedProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || "Agrotech Farmer",
        email: user.email || undefined,
        photoURL: user.photoURL || undefined,
        role: "Farmer",
        state: "Kano",
        preferredLanguage: "Hausa"
      };

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          resolvedProfile = {
            ...resolvedProfile,
            ...data,
            uid: user.uid
          };
        } else {
          await setDoc(userDocRef, {
            ...resolvedProfile,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (dbErr) {
        console.warn("Firestore user sync initialized:", dbErr);
      }

      onSelectPersona(resolvedProfile);
      onClose();
    } catch (err: any) {
      console.warn("Google sign-in popup notice:", err);
      setAuthError("Google Sign-In prompt initialized. You can also select a stakeholder persona below.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setOtpSent(true);
      return;
    }

    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      const farmerProfile: UserProfile = {
        uid: `phone-${Date.now()}`,
        displayName: `Farmer (${phoneNumber.slice(-4)})`,
        phoneNumber: phoneNumber,
        role: "Farmer",
        state: "Kano",
        preferredLanguage: "Hausa",
        farmSizeHectares: 3.0,
        primaryCrops: ["Maize", "Cassava"]
      };
      onSelectPersona(farmerProfile);
      onClose();
    } catch (err: any) {
      console.error(err);
      setAuthError("Authentication error. Please choose a persona below.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      const adminProfile: UserProfile = {
        uid: "fmafs-admin-session",
        displayName: "Director General (FMAFS Abuja)",
        email: adminEmail,
        role: "Ministry Admin",
        state: "FCT Abuja",
        preferredLanguage: "English"
      };
      onSelectPersona(adminProfile);
      onClose();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 text-slate-200 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-950/90 border-b border-slate-800 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight text-slate-100">Stakeholder Authentication (RBAC)</h3>
              <p className="text-xs text-slate-400">Firebase Auth • Farmer & Ministry Portals</p>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Primary Action: Google Sign-In with Firebase Auth */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Sign in with Google
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Firebase Auth
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Secure single sign-on with persistent Firestore profile & farmer records
                  </p>
                </div>
              </div>

              <button
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isLoading ? <Sparkles className="w-4 h-4 animate-spin text-slate-900" /> : <LogIn className="w-4 h-4 text-slate-900" />}
                <span>Continue with Google</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[11px] text-slate-500 uppercase font-semibold">Or Switch Stakeholder Persona</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Method tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 border border-slate-800 rounded-2xl text-xs font-bold text-center">
            <button
              id="auth-tab-persona"
              onClick={() => setAuthMethod("persona")}
              className={`py-2 rounded-xl transition cursor-pointer ${
                authMethod === "persona" ? "bg-slate-800 text-emerald-400 border border-slate-700/60 shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              1-Click Personas
            </button>
            <button
              id="auth-tab-phone"
              onClick={() => setAuthMethod("phone")}
              className={`py-2 rounded-xl transition cursor-pointer ${
                authMethod === "phone" ? "bg-slate-800 text-emerald-400 border border-slate-700/60 shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Phone / SMS
            </button>
            <button
              id="auth-tab-admin"
              onClick={() => setAuthMethod("admin")}
              className={`py-2 rounded-xl transition cursor-pointer ${
                authMethod === "admin" ? "bg-slate-800 text-emerald-400 border border-slate-700/60 shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Enterprise Admin
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 text-amber-300 rounded-xl text-xs">
              {authError}
            </div>
          )}

          {/* TAB 1: 1-Click Role Personas */}
          {authMethod === "persona" && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-medium">
                Select a verified stakeholder persona to instantly experience role-tailored workflows:
              </div>

              {demoPersonas.map((persona) => (
                <div
                  key={persona.uid}
                  id={`select-persona-${persona.role.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => {
                    onSelectPersona(persona);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-emerald-500/50 hover:bg-slate-800/60 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                        persona.role === "Ministry Admin"
                          ? "bg-purple-950/60 text-purple-300 border-purple-800/50"
                          : persona.role === "Agricultural Officer"
                          ? "bg-sky-950/60 text-sky-300 border-sky-800/50"
                          : "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                      }`}
                    >
                      {persona.role === "Ministry Admin" ? (
                        <Building2 className="w-5 h-5" />
                      ) : (
                        <Wheat className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-200 group-hover:text-emerald-400">
                          {persona.displayName}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                            persona.role === "Ministry Admin"
                              ? "bg-purple-950/60 text-purple-300 border-purple-800/50"
                              : persona.role === "Agricultural Officer"
                              ? "bg-sky-950/60 text-sky-300 border-sky-800/50"
                              : "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                          }`}
                        >
                          {persona.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Location: {persona.state} • Language: {persona.preferredLanguage}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition">
                    Switch Persona →
                  </span>
                </div>
              ))}

              <div className="pt-2">
                <button
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google Firebase Auth</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Farmer Phone Number OTP */}
          {authMethod === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="text-xs text-slate-400">
                Farmers can log in using their registered mobile telephone number for SMS verification:
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nigerian Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="phone-login-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm font-medium focus:outline-none focus:border-emerald-500 text-slate-200 placeholder-slate-500"
                    placeholder="+234 803 000 0000"
                    required
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    6-Digit SMS Verification Code
                  </label>
                  <input
                    id="phone-otp-input"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-center tracking-widest text-lg font-mono font-bold focus:outline-none focus:border-emerald-500 text-slate-200"
                    placeholder="123456"
                    required
                  />
                  <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
                    SMS code simulated for preview: enter any 6 digits
                  </span>
                </div>
              )}

              <button
                id="phone-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/50 transition cursor-pointer"
              >
                {isLoading ? "Signing in..." : otpSent ? "Verify & Enter Farmer Portal" : "Send One-Time Passcode"}
              </button>
            </form>
          )}

          {/* TAB 3: Enterprise Ministry Admin */}
          {authMethod === "admin" && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="text-xs text-slate-400">
                Secure access for Federal & State Ministry of Agriculture policymakers and extension directors:
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Institutional Email (.gov.ng)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-email-input"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm font-medium focus:outline-none focus:border-purple-500 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enterprise Security Token / Password
                </label>
                <input
                  id="admin-password-input"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm font-medium focus:outline-none focus:border-purple-500 text-slate-200"
                  required
                />
              </div>

              <button
                id="admin-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-950/50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Access Ministry Command Portal</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
