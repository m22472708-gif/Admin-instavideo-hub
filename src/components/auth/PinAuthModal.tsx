import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { ShieldCheck, Lock, KeyRound, Sparkles, AlertCircle, Film, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface PinAuthModalProps {
  onAuthenticated: () => void;
}

export const PinAuthModal: React.FC<PinAuthModalProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const { showSuccessToast } = useToast();

  const settings = StorageService.getSettings();
  const currentAdminPin = settings.adminPin || '1234';

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const verifyPin = (inputPin: string) => {
    if (inputPin === currentAdminPin) {
      StorageService.setAuthenticated(true);
      showSuccessToast('Access Granted', 'Welcome to StreamPulse Admin Portal');
      onAuthenticated();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setPin(''), 600);
    }
  };

  const handleQuickEnter = () => {
    StorageService.setAuthenticated(true);
    showSuccessToast('Quick Enter Verified', 'Owner direct access mode activated');
    onAuthenticated();
  };

  // Allow physical keyboard typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, currentAdminPin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-xl p-4 overflow-y-auto">
      {/* Subtle cinematic glow in background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Cinema Logo Header */}
        {settings.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt={settings.siteName || 'Logo'}
            className="w-16 h-16 rounded-2xl object-cover bg-zinc-900 border border-zinc-700 shadow-lg shadow-rose-950/50 mb-4 mx-auto ring-4 ring-rose-500/20"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 shadow-lg shadow-rose-950/50 mb-4 ring-4 ring-rose-500/20">
            <Film className="w-8 h-8 text-white" />
          </div>
        )}

        <h1 className="text-2xl font-bold text-white tracking-tight">
          {settings.siteName || 'StreamPulse'} Admin Portal
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
          {settings.tagline || 'Owner & Management Security Portal. Enter 4-digit master passkey to continue.'}
        </p>

        {/* PIN Display Indicators */}
        <div className={`flex justify-center items-center gap-3 my-7 ${shake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-12 h-14 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                  error
                    ? 'border-rose-500 bg-rose-950/30 text-rose-400'
                    : isFilled
                    ? 'border-rose-500 bg-zinc-800/90 text-white ring-2 ring-rose-500/30'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-600'
                }`}
              >
                {isFilled ? (
                  <span className="text-xl font-mono font-bold">•</span>
                ) : (
                  <span className="text-xs text-zinc-700">_</span>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 mb-4 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Incorrect PIN passkey. Please try again.</span>
          </div>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 text-white font-medium text-lg border border-zinc-700/60 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-zinc-950/70 hover:bg-zinc-800/80 active:scale-95 text-zinc-400 text-xs font-semibold border border-zinc-800/80 transition-all uppercase tracking-wider"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 text-white font-medium text-lg border border-zinc-700/60 transition-all shadow-sm"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-zinc-950/70 hover:bg-zinc-800/80 active:scale-95 text-zinc-400 text-xs font-semibold border border-zinc-800/80 transition-all uppercase tracking-wider"
          >
            Del
          </button>
        </div>

        {/* Quick Enter Action for Owner */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleQuickEnter}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-rose-950/50 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Quick Enter (Owner Bypass)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <p className="text-[11px] text-zinc-500 mt-1">
            Default Security PIN: <code className="font-mono text-zinc-300 font-bold">1234</code> · Configurable in settings
          </p>
        </div>
      </div>
    </div>
  );
};
