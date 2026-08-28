import React, { useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from 'firebase/auth';
import { setStoredGoogleAccessToken } from '../services/calendarService';
import {
  User as UserIcon,
  X,
  Sparkles,
  Database,
  CheckCircle2,
  LogIn,
  LogOut,
  Palette,
  Globe,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceTheme: string;
  onSelectSpaceTheme: (theme: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  spaceTheme,
  onSelectSpaceTheme,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [cloudSqlStatus, setCloudSqlStatus] = useState<{
    connected: boolean;
    database?: string;
    tables?: string[];
  }>({ connected: false });
  const [bio, setBio] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        syncCloudSqlUser(currentUser);
      }
    });
    fetchCloudSqlStatus();
    return () => unsubscribe();
  }, []);

  const fetchCloudSqlStatus = async () => {
    try {
      const res = await fetch('/api/cloudsql/status');
      const data = await res.json();
      if (data.success) {
        setCloudSqlStatus({
          connected: true,
          database: data.database,
          tables: data.tables,
        });
      }
    } catch (err) {
      console.warn('Cloud SQL status check error:', err);
    }
  };

  const syncCloudSqlUser = async (userObj: User) => {
    setIsSyncing(true);
    try {
      const token = await userObj.getIdToken();
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: userObj.uid,
          email: userObj.email,
          displayName: userObj.displayName,
          photoUrl: userObj.photoURL,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.profile) {
        setBio(data.data.profile.bio || '');
        if (data.data.user?.spaceTheme) {
          onSelectSpaceTheme(data.data.user.spaceTheme);
        }
      }
    } catch (err) {
      console.error('Error syncing user with Cloud SQL:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setStoredGoogleAccessToken(credential.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          bio,
          spaceTheme,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Error saving profile to Cloud SQL:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-[#18181b]/95 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/40 text-[#ECECF1]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#27272a] bg-gradient-to-r from-purple-900/30 via-black to-blue-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">User Profile & Cloud SQL</h2>
              <p className="text-xs text-zinc-400">Manage identity, space visuals & database sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Cloud SQL Connection Status */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-emerald-300">
                  Cloud SQL (PostgreSQL) Connected
                </p>
                <p className="text-[11px] text-zinc-400">
                  Region: asia-southeast1 • Project: splendid-authority-njhcx
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Active
            </span>
          </div>

          {/* User Profile Info / Login */}
          {!user ? (
            <div className="text-center p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <UserIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Sign In with Google Profile</h3>
                <p className="text-xs text-zinc-400">
                  Connect your profile to persist settings in Cloud SQL and sync Google Workspace data.
                </p>
              </div>
              <button
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/20"
              >
                <LogIn className="w-4 h-4" />
                Sign in with Google OAuth
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-11 h-11 rounded-full border-2 border-purple-500/40"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">{user.displayName || 'Aether Explorer'}</h4>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-red-950 hover:text-red-400 text-zinc-400 text-xs flex items-center gap-1.5 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>

              {/* Bio Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                  Cloud SQL User Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter your cosmic profile bio..."
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-purple-500 transition resize-none h-20"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSyncing}
                className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 transition"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Saved to Cloud SQL!
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    {isSyncing ? 'Syncing...' : 'Save Profile to Cloud SQL'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Space Visual Theme Customizer */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              Real Photorealistic Space Backgrounds & Themes
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'deep-space', label: '🌌 Deep Space Nebula', desc: 'Photorealistic deep space dust & auroras' },
                { id: 'nebula-violet', label: '🔮 Pulsar Violet', desc: 'Vibrant violet celestial energy' },
                { id: 'cosmic-cyan', label: '💎 Spiral Galaxy Core', desc: 'Photorealistic galaxy stellar core' },
                { id: 'supernova-gold', label: '✨ Supernova Flare', desc: 'Warm solar flare & cosmic dust' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectSpaceTheme(t.id)}
                  className={`p-3 rounded-xl text-left border text-xs transition flex flex-col gap-1 relative overflow-hidden ${
                    spaceTheme === t.id
                      ? 'bg-purple-950/70 border-purple-400 text-white shadow-lg shadow-purple-900/40 ring-1 ring-purple-400/50'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <span className="font-bold text-white flex items-center justify-between">
                    {t.label}
                    {spaceTheme === t.id && <Sparkles className="w-3 h-3 text-purple-300" />}
                  </span>
                  <span className="text-[10px] text-zinc-400 leading-tight">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
