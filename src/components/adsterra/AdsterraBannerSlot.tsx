import React, { useEffect, useRef, useState } from 'react';
import { AdsterraAdConfig } from '../../types';
import { DollarSign, ExternalLink, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface AdsterraBannerSlotProps {
  ad?: AdsterraAdConfig;
  placementName?: string;
  className?: string;
}

export const AdsterraBannerSlot: React.FC<AdsterraBannerSlotProps> = ({
  ad,
  placementName = 'Banner Ad',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeSrcDoc, setIframeSrcDoc] = useState<string>('');
  const [isAdBlockActive, setIsAdBlockActive] = useState<boolean>(false);

  // Check if browser has adblocker active
  useEffect(() => {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox ad-placement doubleclick pub_300x250';
    testAd.style.position = 'absolute';
    testAd.style.left = '-9999px';
    document.body.appendChild(testAd);

    setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        setIsAdBlockActive(true);
      }
      testAd.remove();
    }, 150);
  }, []);

  useEffect(() => {
    if (!ad || !ad.scriptCode) return;

    const rawCode = ad.scriptCode.trim();

    // Prepare complete HTML document for isolated sandboxed execution
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <base target="_blank">
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 80px;
              background: transparent;
              overflow: hidden;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
          </style>
        </head>
        <body>
          ${rawCode}
        </body>
      </html>
    `;

    setIframeSrcDoc(fullHtml);
  }, [ad]);

  if (!ad || !ad.enabled) return null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900/90 dark:bg-black/80 p-3 shadow-lg my-3 ${className}`}
    >
      {/* Header Tag */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Sponsored Ad: {ad.name || placementName}</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[9px] font-mono uppercase">
            {ad.type}
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Adsterra Live Network</span>
      </div>

      {/* AdBlock Warning if detected */}
      {isAdBlockActive && (
        <div className="mb-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            <strong>AdBlock Detected:</strong> আপনার ব্রাউজারে AdBlock/Brave Shields অন থাকলে অ্যাড লোড নাও হতে পারে। টেস্ট করার জন্য AdBlock অফ করুন।
          </span>
        </div>
      )}

      {/* Direct link handling or Iframe render */}
      {ad.type === 'direct_link' || (!ad.scriptCode.includes('<script') && ad.scriptCode.startsWith('http')) ? (
        <a
          href={ad.scriptCode.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-white transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300 group-hover:text-amber-200">
                Exclusive Sponsor Promotion
              </h4>
              <p className="text-xs text-zinc-300">Tap to explore special partner offers & 4K streams</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Visit Now</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </a>
      ) : (
        <div className="relative w-full flex justify-center items-center min-h-[90px] bg-black/40 rounded-xl overflow-hidden">
          <iframe
            title={`Adsterra Ad ${ad.name}`}
            srcDoc={iframeSrcDoc}
            className="w-full border-0 overflow-hidden"
            style={{ minHeight: '95px' }}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
          />
        </div>
      )}
    </div>
  );
};
