import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, RefreshCw, X, ExternalLink, Copy, Check } from 'lucide-react';
import { FirebaseService } from '../../services/firebase';

interface FirebaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConnectionModal: React.FC<FirebaseConnectionModalProps> = ({ isOpen, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    firestore: { ok: boolean; message: string; error?: string };
    rtdb: { ok: boolean; message: string; error?: string };
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await FirebaseService.testFirebaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        firestore: { ok: false, message: 'Test failed', error: err?.message },
        rtdb: { ok: false, message: 'Test failed', error: err?.message },
      });
    } finally {
      setTesting(false);
    }
  };

  const firestoreRulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRulesSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Firebase Sync Diagnostic
              </h2>
              <p className="text-xs text-zinc-400">
                Project: <code className="text-rose-400 font-mono">whatsapp-video-site</code>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Test Action */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <p className="text-sm font-semibold text-white">Direct Firebase Write Test</p>
              <p className="text-xs text-zinc-400">Test if your Firestore allows real-time post saving.</p>
            </div>
            <button
              type="button"
              onClick={runTest}
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-rose-600/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Run Test'}</span>
            </button>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="space-y-2.5 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-start gap-2.5">
                {testResult.firestore.ok ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-bold text-white">
                    Firestore Database: {testResult.firestore.ok ? 'Working' : 'Blocked / Error'}
                  </p>
                  <p className="text-[11px] text-zinc-400">{testResult.firestore.message}</p>
                  {testResult.firestore.error && (
                    <p className="text-[10px] font-mono text-rose-400 mt-1 bg-rose-950/40 p-1.5 rounded border border-rose-900/50">
                      {testResult.firestore.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-zinc-800/80">
                {testResult.rtdb.ok ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-bold text-white">
                    Realtime Database (RTDB): {testResult.rtdb.ok ? 'Working' : 'Notice'}
                  </p>
                  <p className="text-[11px] text-zinc-400">{testResult.rtdb.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Solution: How to fix Firebase Rules in 10 seconds */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Fix: Firebase Console Rules
              </span>
              <button
                type="button"
                onClick={copyRules}
                className="text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Rules'}
              </button>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed">
              যদি ইউজার সাইটে পোস্ট না যায়, তার ৯৯% কারণ থাকে Firebase Firestore Security Rules লক থাকা।
              নিচের কোডটি Firebase Console-এ পেস্ট করে <strong>Publish</strong> করুন:
            </p>

            <pre className="text-[10px] font-mono bg-black/60 p-2.5 rounded-lg text-emerald-400 border border-zinc-800 overflow-x-auto">
              {firestoreRulesSnippet}
            </pre>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-zinc-400">Firebase Console &gt; Firestore &gt; Rules</span>
              <a
                href="https://console.firebase.google.com/project/whatsapp-video-site/firestore/rules"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                Open Rules in Firebase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/95 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
