import React, { useState, useEffect } from 'react';
import { AdsterraAdConfig } from '../../types';
import {
  Zap,
  X,
  Play,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code,
  AlertTriangle,
  Monitor,
  RefreshCw,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { AdsterraInjector } from '../../utils/adsterraInjector';

interface AdsterraTesterModalProps {
  ad: AdsterraAdConfig;
  onClose: () => void;
}

export const AdsterraTesterModal: React.FC<AdsterraTesterModalProps> = ({ ad, onClose }) => {
  const [isAdBlockDetected, setIsAdBlockDetected] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [testClicks, setTestClicks] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  // Check for AdBlock extension
  useEffect(() => {
    const testDiv = document.createElement('div');
    testDiv.className = 'adsbox ad-placement doubleclick pub_300x250';
    testDiv.style.position = 'absolute';
    testDiv.style.left = '-9999px';
    document.body.appendChild(testDiv);

    setTimeout(() => {
      if (testDiv.offsetHeight === 0) {
        setIsAdBlockDetected(true);
      }
      testDiv.remove();
    }, 200);
  }, []);

  // Parse script details
  const srcMatch = ad.scriptCode?.match(/src=["']([^"']+)["']/i);
  const detectedUrl = srcMatch ? srcMatch[1] : (ad.scriptCode.match(/https?:\/\/[^\s"'<>]+/i)?.[0] || null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ad.scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFirePopunderNow = () => {
    setTestClicks((c) => c + 1);
    AdsterraInjector.triggerPopunder(ad);
  };

  const fullSandboxHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <base target="_blank">
        <style>
          body {
            margin: 0;
            padding: 16px;
            font-family: system-ui, -apple-system, sans-serif;
            color: #e2e8f0;
            background: #09090b;
            text-align: center;
          }
          .info-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 8px;
            background: rgba(245, 158, 11, 0.15);
            color: #fbbf24;
            font-size: 11px;
            margin-bottom: 12px;
            border: 1px solid rgba(245, 158, 11, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="info-badge">Sandbox Environment Loaded</div>
        <div id="ad-render-zone">
          ${ad.scriptCode}
        </div>
      </body>
    </html>
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Adsterra Script Live Inspector & Diagnostic</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Verify script execution, detect adblockers, and test live popunder triggers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* AdBlocker Warning if Active */}
          {isAdBlockDetected ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-extrabold text-sm">AdBlocker Detected in your Browser!</h4>
                <p className="leading-relaxed">
                  আপনার ব্রাউজারে AdBlock, uBlock Origin, বা Brave Shields চালু আছে। এই কারণে ব্রাউজার নিজেই Adsterra ডোমেইন ব্লক করে দিচ্ছে এবং অ্যাড দেখা যাচ্ছে না।
                </p>
                <p className="font-bold text-rose-600 dark:text-rose-300">
                  👉 সমাধান: টেস্ট করার জন্য আপনার ব্রাউজারের AdBlocker টি কিছুক্ষণের জন্য Pause/Disable করুন।
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 text-xs font-semibold">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>No AdBlocker detected. Your browser is ready to load Adsterra live network requests.</span>
            </div>
          )}

          {/* Diagnostic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Ad Unit Name
              </span>
              <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{ad.name}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Ad Format & Mode
              </span>
              <p className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase font-mono">
                {ad.type} ({(ad.multiplier || ad.maxTriggers || 5)}x Continuous)
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Target Placement
              </span>
              <p className="font-bold text-xs text-sky-600 dark:text-sky-400 capitalize">
                {ad.placement}
              </p>
            </div>
          </div>

          {/* Script CDN Source & Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-amber-500" />
                <span>Configured Script Snippet</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto max-h-32">
              <pre>{ad.scriptCode}</pre>
            </div>

            {detectedUrl && (
              <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                <span>Detected Network URL:</span>
                <span className="font-mono text-sky-400 underline truncate">{detectedUrl}</span>
              </p>
            )}
          </div>

          {/* Interactive Live Test Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 dark:bg-zinc-950 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Instant Test Sandbox</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Click below to trigger a test popunder action or reload sandbox
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload Sandbox</span>
                </button>

                <button
                  type="button"
                  onClick={handleFirePopunderNow}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Test Fire Popunder ({testClicks} Clicks)</span>
                </button>
              </div>
            </div>

            {/* Sandbox Iframe Window */}
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black min-h-[120px]">
              <iframe
                key={iframeKey}
                title="Adsterra Sandbox"
                srcDoc={fullSandboxHtml}
                className="w-full min-h-[140px] border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
              />
            </div>
          </div>

          {/* Troubleshooting FAQs in Bengali */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-500" />
              <span>Adsterra স্ক্রিপ্ট সেভ করার পরও অ্যাড না দেখার প্রধান ৩টি কারণ ও সমাধান:</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-zinc-300">
              <li>
                <strong>AdBlocker / Brave Shields:</strong> আপনার ব্রাউজারে অ্যাডব্লকার অন থাকলে অ্যাড ব্লক হয়ে যাবে। টেস্ট করার জন্য অ্যাডব্লকার বন্ধ করুন।
              </li>
              <li>
                <strong>Adsterra Activation Delay:</strong> Adsterra ড্যাশবোর্ড থেকে নতুন ডোমেইন বা স্ক্রিপ্ট তৈরি করলে এটি সক্রিয় হতে <strong>৫ থেকে ১৫ মিনিট</strong> সময় নিতে পারে।
              </li>
              <li>
                <strong>Popunder Click Trigger:</strong> Popunder অ্যাড পেজ লোড হওয়ার সাথে সাথেই স্ক্রিনে দৃশ্যমান হয় না, ব্যবহারকারী সাইটের <strong>যেকোনো জায়গায় বা ভিডিওতে প্রথম ক্লিক</strong> করলেই নতুন ট্যাবে পপআন্ডার ওপেন হয়।
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800 flex justify-end bg-slate-50 dark:bg-zinc-950">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
