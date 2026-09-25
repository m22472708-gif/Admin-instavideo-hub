import React, { useState } from 'react';
import { GeneralSettings, AdsterraAdConfig, AdsterraAdType, AdsterraPlacement } from '../../types';
import { StorageService } from '../../services/storage';
import { FirebaseService } from '../../services/firebase';
import { useToast } from '../../context/ToastContext';
import {
  DollarSign,
  Plus,
  Play,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Code,
  Radio,
  Tv,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Zap,
  Sliders,
  X,
  Monitor,
  Video as VideoIcon,
  RefreshCw,
  Infinity as InfinityIcon,
  Flame,
  FlaskConical,
  ShieldAlert,
} from 'lucide-react';
import { AdsterraTesterModal } from './AdsterraTesterModal';

interface AdsterraManagerProps {
  settings: GeneralSettings;
  onRefresh: () => void;
  onOpenSimulator?: () => void;
}

export const AdsterraManager: React.FC<AdsterraManagerProps> = ({
  settings,
  onRefresh,
  onOpenSimulator,
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdsterraAdConfig | null>(null);
  const [testingAd, setTestingAd] = useState<AdsterraAdConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<AdsterraAdType>('popunder');
  const [scriptCode, setScriptCode] = useState('');
  const [placement, setPlacement] = useState<AdsterraPlacement>('both');
  const [maxTriggers, setMaxTriggers] = useState<number>(5);
  const [enabled, setEnabled] = useState(true);
  const [notes, setNotes] = useState('');

  const adsList: AdsterraAdConfig[] = settings.adsterraAds || [];

  const handleOpenAddModal = (presetType?: AdsterraAdType) => {
    setEditingAd(null);
    if (presetType === 'popunder') {
      setName('Adsterra Popunder 5x Multiplier');
      setType('popunder');
      setScriptCode(
        `<script type='text/javascript' src='//pl25890000.highcpmgate.com/xx/xx/xx.js'></script>`
      );
      setPlacement('both');
      setMaxTriggers(5);
    } else if (presetType === 'socialbar') {
      setName('Adsterra Social Bar 5x Multiplier');
      setType('socialbar');
      setScriptCode(
        `<script type='text/javascript' src='//pl25890001.highcpmgate.com/yy/yy/yy.js'></script>`
      );
      setPlacement('both');
      setMaxTriggers(5);
    } else {
      setName('');
      setType('popunder');
      setScriptCode('');
      setPlacement('both');
      setMaxTriggers(5);
    }
    setEnabled(true);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ad: AdsterraAdConfig) => {
    setEditingAd(ad);
    setName(ad.name);
    setType(ad.type);
    setScriptCode(ad.scriptCode);
    setPlacement(ad.placement);
    setMaxTriggers(ad.multiplier || ad.maxTriggers || 5);
    setEnabled(ad.enabled);
    setNotes(ad.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Validation Error', 'Please enter an Ad Campaign Name', 'error');
      return;
    }
    if (!scriptCode.trim()) {
      showToast('Validation Error', 'Please paste your Adsterra script code or URL', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const currentAds = [...(settings.adsterraAds || [])];
      const count = Math.max(1, Number(maxTriggers) || 1);
      const newAd: AdsterraAdConfig = {
        id: editingAd ? editingAd.id : `ad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        type,
        scriptCode: scriptCode.trim(),
        placement,
        maxTriggers: count,
        multiplier: count,
        continuous: true, // Continuous execution (never turns off after 5 times)
        enabled,
        notes: notes.trim(),
        createdAt: editingAd ? editingAd.createdAt : Date.now(),
      };

      let updatedList: AdsterraAdConfig[];
      if (editingAd) {
        updatedList = currentAds.map((a) => (a.id === editingAd.id ? newAd : a));
      } else {
        updatedList = [newAd, ...currentAds];
      }

      const updatedSettings: GeneralSettings = {
        ...settings,
        adsterraAds: updatedList,
      };

      // Save locally and to Firebase
      StorageService.saveSettings(updatedSettings);
      await FirebaseService.saveSettings(updatedSettings);

      showToast(
        'Success',
        editingAd
          ? `${count}x Multiplier Ad Unit updated!`
          : `New ${count}x Multiplier Ad Unit activated (Continuous Mode)!`,
        'success'
      );
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Could not save ad configuration', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAdStatus = async (ad: AdsterraAdConfig) => {
    try {
      const currentAds = [...(settings.adsterraAds || [])];
      const updatedList = currentAds.map((a) =>
        a.id === ad.id ? { ...a, enabled: !a.enabled } : a
      );

      const updatedSettings: GeneralSettings = {
        ...settings,
        adsterraAds: updatedList,
      };

      StorageService.saveSettings(updatedSettings);
      await FirebaseService.saveSettings(updatedSettings);

      showToast(
        ad.enabled ? 'Ad Unit Paused' : 'Ad Unit Activated',
        `${ad.name} is now ${!ad.enabled ? 'Active (Continuous)' : 'Disabled'}`,
        'info'
      );
      onRefresh();
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  const handleDeleteAd = async (adId: string, adName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${adName}"?`)) return;

    try {
      const currentAds = [...(settings.adsterraAds || [])];
      const updatedList = currentAds.filter((a) => a.id !== adId);

      const updatedSettings: GeneralSettings = {
        ...settings,
        adsterraAds: updatedList,
      };

      StorageService.saveSettings(updatedSettings);
      await FirebaseService.saveSettings(updatedSettings);

      showToast('Deleted', `"${adName}" removed from active ads`, 'info');
      onRefresh();
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    }
  };

  const activeAdsCount = adsList.filter((a) => a.enabled).length;
  const activePopunders = adsList.filter((a) => a.enabled && (a.type === 'popunder' || a.type === 'direct_link'));
  const activeSocialBars = adsList.filter((a) => a.enabled && a.type === 'socialbar');
  const activeBanners = adsList.filter((a) => a.enabled && (a.type === 'native_banner' || a.type === 'custom_script'));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 🌟 1. ADSTERRA COMMAND HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-zinc-900 border border-slate-800 dark:border-zinc-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/20 via-rose-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/15 via-sky-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <InfinityIcon className="w-3.5 h-3.5" />
              <span>Multi-Script Parallel Multiplier (Continuous Mode - Never Turns Off)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Adsterra Ads Controller
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              আপনি স্ক্রিপ্টে <strong>৫</strong> লিখে সেট করলে সাইটে একসাথে <strong>৫টি স্ক্রিপ্ট যোগ করার মতো সমান্তরালে কাজ করবে</strong> এবং ৫ বার হওয়ার পর বন্ধ হবে না — <strong>আজীবন অবিরাম (Continuous) কাজ করবে!</strong>
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeAdsCount} Active Units</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                <Flame className="w-3.5 h-3.5 fill-emerald-400" />
                <span>Continuous Non-Stop Mode</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAddModal('popunder')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add 5x Popunder</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddModal('socialbar')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add 5x Social Bar</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs border border-zinc-700 active:scale-95 transition-all"
            >
              <Code className="w-4 h-4 text-sky-400" />
              <span>Custom Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 LIVE ACTIVE ADS RADAR BOARD (বর্তমানে কোন কোন অ্যাড সক্রিয় আছে) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              Currently Active Ads Live Status (লাইভ সক্রিয় অ্যাড তালিকা)
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {activeAdsCount} Active / {adsList.length} Total Units
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Active Status 1: Popunder */}
          <div className={`p-4 rounded-2xl border transition-all ${
            activePopunders.length > 0
              ? 'bg-amber-500/10 border-amber-500/40 dark:bg-amber-500/5'
              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  activePopunders.length > 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                }`}>
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Popunder Ads</h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Opens on user clicks</p>
                </div>
              </div>
              {activePopunders.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] uppercase animate-pulse">
                  ● ACTIVE ({activePopunders.length})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-500 text-[10px] font-bold uppercase">
                  OFF
                </span>
              )}
            </div>
            {activePopunders.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-amber-500/20 text-[11px] space-y-1">
                {activePopunders.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-mono">
                    <span className="truncate max-w-[140px] font-semibold">{ad.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20">{ad.multiplier || 5}x Parallel</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Status 2: Social Bar */}
          <div className={`p-4 rounded-2xl border transition-all ${
            activeSocialBars.length > 0
              ? 'bg-rose-500/10 border-rose-500/40 dark:bg-rose-500/5'
              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  activeSocialBars.length > 0 ? 'bg-rose-600 text-white font-black' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                }`}>
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Social Bar Ads</h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Floating push bar</p>
                </div>
              </div>
              {activeSocialBars.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] uppercase animate-pulse">
                  ● ACTIVE ({activeSocialBars.length})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-500 text-[10px] font-bold uppercase">
                  OFF
                </span>
              )}
            </div>
            {activeSocialBars.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-rose-500/20 text-[11px] space-y-1">
                {activeSocialBars.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-mono">
                    <span className="truncate max-w-[140px] font-semibold">{ad.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20">{ad.placement}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Status 3: Native Banners */}
          <div className={`p-4 rounded-2xl border transition-all ${
            activeBanners.length > 0
              ? 'bg-sky-500/10 border-sky-500/40 dark:bg-sky-500/5'
              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  activeBanners.length > 0 ? 'bg-sky-600 text-white font-black' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Banner / Custom</h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Native display slots</p>
                </div>
              </div>
              {activeBanners.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] uppercase">
                  ● ACTIVE ({activeBanners.length})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-500 text-[10px] font-bold uppercase">
                  OFF
                </span>
              )}
            </div>
            {activeBanners.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-sky-500/20 text-[11px] space-y-1">
                {activeBanners.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between text-sky-600 dark:text-sky-400 font-mono">
                    <span className="truncate max-w-[140px] font-semibold">{ad.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20">{ad.placement}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🚀 2. QUICK HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Preset 1: Popunder Multiplier */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Popunder 5x Multiplier
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  5টি স্ক্রিপ্টের সমান পাওয়ার (নন-স্টপ)
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-300">
            ব্যবহারকারী হোমপেজ বা ভিডিওতে ক্লিক করলেই Popunder কাজ করবে এবং কখনো বন্ধ হবে না।
          </p>
          <button
            type="button"
            onClick={() => handleOpenAddModal('popunder')}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black font-bold text-xs transition-all text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add 5x Popunder Unit
          </button>
        </div>

        {/* Preset 2: Social Bar Multiplier */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Social Bar 5x Multiplier
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  সমান্তরাল নোটিফিকেশন বার
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-300">
            ইউজারের স্ক্রিনে ফ্লোটিং পুশ নোটিফিকেশন প্রদর্শন করবে হাই-কনভার্সন সিপিসি/সিপিএম রেটে।
          </p>
          <button
            type="button"
            onClick={() => handleOpenAddModal('socialbar')}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-rose-600 hover:text-white font-bold text-xs transition-all text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add 5x Social Bar
          </button>
        </div>

        {/* Preset 3: Native / Direct Link */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Custom Script & Smartlink
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  কাস্টম মাল্টিপ্লায়ার ইনস্ট্যান্স
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-300">
            Adsterra জোন ট্যাগ বা স্মার্টলিঙ্ক পেস্ট করে যেকোনো পরিমাণের মাল্টিপ্লায়ার সেট করুন।
          </p>
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-sky-600 hover:text-white font-bold text-xs transition-all text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Custom Unit
          </button>
        </div>
      </div>

      {/* 📋 3. ACTIVE AD UNITS TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span>Configured Adsterra Units ({adsList.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              All scripts below run in Continuous Multiplier mode without shutting down.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Ad Unit
          </button>
        </div>

        {adsList.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
            <Zap className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Adsterra Ad Units Configured
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Click the button below to add your first <strong>5x Multiplier Popunder</strong> script.
            </p>
            <button
              type="button"
              onClick={() => handleOpenAddModal('popunder')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add 5x Popunder Script
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {adsList.map((ad) => {
              const typeBadges: Record<string, { label: string; bg: string }> = {
                popunder: { label: 'Popunder', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
                socialbar: { label: 'Social Bar', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
                native_banner: { label: 'Native Banner', bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
                direct_link: { label: 'Direct Link', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
                custom_script: { label: 'Custom Script', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
              };
              const currentType = typeBadges[ad.type] || typeBadges.custom_script;

              const placementLabels: Record<string, { label: string; icon: any }> = {
                homepage: { label: 'Homepage Only', icon: Monitor },
                video_page: { label: 'Video Page Only', icon: VideoIcon },
                both: { label: 'Both (Home & Video)', icon: Layers },
              };
              const currentPlacement = placementLabels[ad.placement] || placementLabels.both;
              const PlacementIcon = currentPlacement.icon;
              const multiplierVal = (ad as any).multiplier || (ad as any).maxTriggers || 5;

              return (
                <div
                  key={ad.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    ad.enabled
                      ? 'bg-slate-50/80 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-amber-500/50'
                      : 'bg-slate-100/50 dark:bg-zinc-950/40 border-slate-200/50 dark:border-zinc-800/50 opacity-70'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Info */}
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${currentType.bg}`}>
                          {currentType.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold">
                          <PlacementIcon className="w-3 h-3 text-slate-500" />
                          <span>{currentPlacement.label}</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/20 flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-emerald-500" />
                          <span>{multiplierVal}x Parallel Multiplier (Never Off)</span>
                        </span>
                        {ad.enabled ? (
                          <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1 shadow-xs animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>🟢 LIVE ON USER PANEL</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400 text-[10px] font-bold border border-zinc-500/30">
                            ⚪ PAUSED / INACTIVE
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {ad.name}
                      </h3>

                      {/* Code Snippet Preview */}
                      <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-black font-mono text-[11px] text-emerald-400 overflow-x-auto max-w-xl truncate border border-slate-800">
                        <code>{ad.scriptCode}</code>
                      </div>
                    </div>

                    {/* Actions & Switch */}
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start lg:self-center">
                      <button
                        type="button"
                        onClick={() => setTestingAd(ad)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30 transition-all shadow-xs"
                        title="Test & Diagnose Script Live"
                      >
                        <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
                        <span>Test & Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAdStatus(ad)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          ad.enabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300'
                        }`}
                      >
                        {ad.enabled ? 'Enabled' : 'Disabled'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(ad)}
                        className="p-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-all"
                        title="Edit Ad Unit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAd(ad.id, ad.name)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all border border-rose-500/20"
                        title="Delete Ad Unit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🛠️ 4. CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingAd ? 'Edit Multiplier Ad Unit' : 'Configure Multiplier Ad Unit'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Set script code, parallel instances multiplier, and continuous placement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAd} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* Campaign Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Ad Campaign Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adsterra Popunder 5x Multiplier"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Format & Placement (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ad Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Ad Format / Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AdsterraAdType)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="popunder">Popunder (Opens on Clicks)</option>
                    <option value="socialbar">Social Bar (Floating Push Bar)</option>
                    <option value="native_banner">Native Banner / Banner Ad</option>
                    <option value="direct_link">Direct Smartlink URL</option>
                    <option value="custom_script">Custom JS Script / Zone</option>
                  </select>
                </div>

                {/* Placement */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Display Placement
                  </label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as AdsterraPlacement)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="both">Both (Homepage & Video Page)</option>
                    <option value="homepage">Homepage Only</option>
                    <option value="video_page">Video Page / Player Only</option>
                  </select>
                </div>
              </div>

              {/* Multiplier / Instance Count */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Script Multiplier (একসাথে কয়টি স্ক্রিপ্ট যোগ করার মতো কাজ করবে?)</span>
                  </label>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-black font-black text-[10px] uppercase">
                    Non-Stop (কখনো বন্ধ হবে না)
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={maxTriggers}
                    onChange={(e) => setMaxTriggers(Math.max(1, Number(e.target.value) || 1))}
                    className="w-28 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-amber-500/40 text-slate-900 dark:text-white font-mono font-black text-base focus:outline-hidden focus:border-amber-500 text-center shadow-xs"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[1, 3, 5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setMaxTriggers(num)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          maxTriggers === num
                            ? 'bg-amber-500 text-black shadow-xs font-black'
                            : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 border border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {num}x Multiplier
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                  💡 <strong>{maxTriggers}</strong> লিখে সেট করলে সাইটে একসাথে <strong>{maxTriggers}টি স্ক্রিপ্ট যোগ করার মতো সমান্তরালে কাজ করবে</strong> এবং {maxTriggers} বার হওয়ার পরও বন্ধ হবে না, আজীবন অবিরাম চলতে থাকবে।
                </p>
              </div>

              {/* Script Code Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Adsterra Script Code / Smartlink URL <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={scriptCode}
                  onChange={(e) => setScriptCode(e.target.value)}
                  placeholder={`<script type='text/javascript' src='//pl25890000.highcpmgate.com/xx/xx/xx.js'></script>`}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-800 focus:outline-hidden focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Paste the exact script tag or direct link given by Adsterra dashboard.
                </p>
              </div>

              {/* Enabled Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Active Status
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Enable or pause this ad campaign immediately
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-zinc-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingAd ? 'Update Multiplier Unit' : 'Activate Multiplier Unit'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 🔬 5. TEST & INSPECT MODAL */}
      {testingAd && (
        <AdsterraTesterModal
          ad={testingAd}
          onClose={() => setTestingAd(null)}
        />
      )}
    </div>
  );
};
