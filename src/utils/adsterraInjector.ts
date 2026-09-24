import { AdsterraAdConfig, AdsterraPlacement } from '../types';

interface TriggerSessionState {
  [adId: string]: number; // Total clicks / triggers fired in current session
}

// In-memory session tracking for triggers
let sessionTriggers: TriggerSessionState = {};

export const AdsterraInjector = {
  /**
   * Get all active ads matching a specific placement ('homepage' or 'video_page')
   */
  getActiveAdsForPlacement(
    ads: AdsterraAdConfig[] | undefined,
    placement: 'homepage' | 'video_page'
  ): AdsterraAdConfig[] {
    if (!ads || !Array.isArray(ads)) return [];
    return ads.filter((ad) => {
      if (!ad.enabled) return false;
      if (ad.placement === 'both') return true;
      return ad.placement === placement;
    });
  },

  /**
   * Get the script multiplier / instances count (e.g. 5 = 5 scripts running in parallel)
   */
  getMultiplier(ad: AdsterraAdConfig): number {
    return Math.max(1, ad.multiplier || ad.maxTriggers || 1);
  },

  /**
   * Get total times this ad has fired in current session
   */
  getTriggerCount(adId: string): number {
    return sessionTriggers[adId] || 0;
  },

  /**
   * Reset session triggers (useful for testing and simulator restarts)
   */
  resetSessionTriggers(): void {
    sessionTriggers = {};
  },

  /**
   * Trigger popunders / ads continuously according to the multiplier (e.g. 5x script instances).
   * Note: NEVER turns off! Continues to work indefinitely.
   */
  triggerPopunder(ad: AdsterraAdConfig): boolean {
    if (!ad.enabled) return false;

    // Increment session trigger count
    const currentCount = sessionTriggers[ad.id] || 0;
    sessionTriggers[ad.id] = currentCount + 1;

    // Execute popunder action with multi-instance power
    const instances = this.getMultiplier(ad);
    try {
      this.executePopunderScript(ad, instances);
    } catch (e) {
      console.warn('Adsterra execution notice:', e);
    }

    return true;
  },

  /**
   * Execute or open popunder target URL or execute raw script
   */
  executePopunderScript(ad: AdsterraAdConfig, instances: number = 1): void {
    const code = ad.scriptCode?.trim();
    if (!code) return;

    // Check if code contains an http URL (Direct Smartlink or Popunder URL)
    const urlMatch = code.match(/https?:\/\/[^\s"'<>]+/i);
    if (urlMatch && (!code.includes('<script') || ad.type === 'direct_link')) {
      const targetUrl = urlMatch[0];
      try {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
        return;
      } catch {
        // Window open blocked or inside iframe
      }
    }

    // If it's a full HTML script tag, ensure all instances (e.g. 5x) are injected into the DOM
    this.injectMultiScriptTags(ad, instances);
  },

  /**
   * Injects multiple instances of the script tag (e.g. 5 script tags if multiplier is 5)
   * so it functions with the exact power of adding 5 separate scripts into the page.
   */
  injectMultiScriptTags(ad: AdsterraAdConfig, instances: number): void {
    const code = ad.scriptCode?.trim();
    if (!code) return;

    const srcMatch = code.match(/src=["']([^"']+)["']/i);
    const scriptSrc = srcMatch ? srcMatch[1] : null;

    for (let i = 1; i <= instances; i++) {
      const scriptId = `adsterra-instance-${ad.id}-${i}`;
      if (!document.getElementById(scriptId)) {
        try {
          if (scriptSrc) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.type = 'text/javascript';
            script.src = scriptSrc;
            script.async = true;
            document.head.appendChild(script);
          } else {
            const inlineCode = code.replace(/<\/?script[^>]*>/gi, '').trim();
            if (inlineCode) {
              const script = document.createElement('script');
              script.id = scriptId;
              script.type = 'text/javascript';
              script.text = inlineCode;
              document.body.appendChild(script);
            }
          }
        } catch (err) {
          console.warn(`Failed to inject script instance ${i}:`, err);
        }
      }
    }
  },

  /**
   * Injects active Social Bar scripts or Banner widgets with multi-instance support into the DOM
   */
  injectAdWidgets(ads: AdsterraAdConfig[], placement: 'homepage' | 'video_page'): void {
    const eligibleAds = this.getActiveAdsForPlacement(ads, placement);

    eligibleAds.forEach((ad) => {
      const instances = this.getMultiplier(ad);
      this.injectMultiScriptTags(ad, instances);
    });
  },
};
