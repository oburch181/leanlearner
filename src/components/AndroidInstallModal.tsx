import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Terminal,
  Copy,
  Package,
  Globe,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { copyToClipboard } from '../utils/clipboard';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'download' | 'capacitor' | 'twa'>('download');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apkAvailable, setApkAvailable] = useState<boolean>(false);

  const apkUrl = `${import.meta.env.BASE_URL}downloads/nng4-lean.apk`;

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    fetch(apkUrl, { method: 'HEAD' })
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        const isBinaryApk = res.ok && !contentType.includes('text/html');
        if (active) setApkAvailable(isBinaryApk);
      })
      .catch(() => {
        if (active) setApkAvailable(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, apkUrl]);

  if (!isOpen) return null;

  const capacitorCmds = `# 1. Install dependencies & sync web bundle to Android
npm install
npm run android:sync

# 2. Build debug APK (sideload directly on Android)
npm run apk:debug
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# 3. Build signed release APK or Play Store AAB
npm run apk:release
npm run aab:release`;

  const keystoreCmd = `keytool -genkey -v \\
  -keystore android/nng4-release.jks \\
  -keyalg RSA -keysize 2048 -validity 10000 \\
  -alias nng4-key`;

  const bubblewrapCode = `# 1. Install Google Bubblewrap CLI
npm i -g @bubblewrap/cli

# 2. Build Trusted Web Activity APK from twa-manifest.json
bubblewrap update
bubblewrap build

# App ID: dev.leanprover.nng4`;

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Get App on Your Phone</h3>
              <p className="text-[10px] text-slate-400">GitHub Pages APK Download &amp; PWA Install</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 gap-1 p-1.5 bg-slate-950 border-b border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveTab('download')}
            className={`py-1.5 rounded-lg font-medium transition text-center ${
              activeTab === 'download'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Phone Download
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`py-1.5 rounded-lg font-medium transition text-center ${
              activeTab === 'capacitor'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Build APK
          </button>
          <button
            onClick={() => setActiveTab('twa')}
            className={`py-1.5 rounded-lg font-medium transition text-center ${
              activeTab === 'twa'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Play Store TWA
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {activeTab === 'download' && (
            <>
              {/* Direct APK Download Card when hosted via GitHub Pages workflow */}
              {apkAvailable ? (
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>Android APK Ready for Download</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Download the standalone offline Android installer directly to your phone and open it to install <strong className="text-white">NNG4 Lean</strong>.
                  </p>
                  <a
                    href={apkUrl}
                    download="nng4-lean.apk"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download nng4-lean.apk</span>
                  </a>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>GitHub Pages Auto-Deploy &amp; APK Link</span>
                  </div>
                  <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-1 font-sans leading-relaxed">
                    <li>Push this repository to GitHub.</li>
                    <li>Open <strong className="text-slate-200">Settings → Pages</strong> and set Source to <strong className="text-emerald-400">GitHub Actions</strong>.</li>
                    <li>Open your <code className="text-indigo-300">github.io</code> link on your phone to download <code className="text-emerald-300">nng4-lean.apk</code> or install as an app!</li>
                  </ol>
                </div>
              )}

              {/* Instant Chrome PWA Install Option */}
              {isInstalled ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-200">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    NNG4 is running in standalone Android mode with full offline support.
                  </span>
                </div>
              ) : isInstallable ? (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>One-Tap Browser App Install (PWA)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Install directly from Chrome onto your phone&apos;s home screen with offline caching.
                  </p>
                  <button
                    onClick={async () => {
                      const res = await install();
                      if (res) onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App to Home Screen</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-200">
                    Or Install via Chrome for Android:
                  </div>
                  <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 font-sans leading-relaxed">
                    <li>Open your GitHub Pages URL in <strong className="text-slate-200">Google Chrome</strong> on Android.</li>
                    <li>Tap the <strong>three dots (⋮)</strong> menu in the top-right corner.</li>
                    <li>Tap <strong className="text-emerald-400">Install app</strong> or <strong className="text-emerald-400">Add to Home screen</strong>.</li>
                  </ol>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-indigo-300">100% Offline Peano Engine:</span>
                <p className="text-[11px] text-slate-400">
                  All Lean 4 proof verification, AST normalization, and levels run locally on your phone.
                </p>
              </div>
            </>
          )}

          {activeTab === 'capacitor' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                This project includes a complete <strong className="text-white">Capacitor Android</strong> Gradle project configured with adaptive icons, splash screens, dark status bar, and hardware Back navigation for building a standalone offline <code className="text-emerald-300">.apk</code> or Play Store <code className="text-emerald-300">.aab</code>.
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1. Build Offline APK / AAB</span>
                  </span>
                  <button
                    onClick={() => handleCopy('cap', capacitorCmds)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
                  >
                    {copiedKey === 'cap' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'cap' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-300 overflow-x-auto whitespace-pre">
                  {capacitorCmds}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>2. Generate Release Signing Key</span>
                  </span>
                  <button
                    onClick={() => handleCopy('keytool', keystoreCmd)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
                  >
                    {copiedKey === 'keytool' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'keytool' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-sky-300 overflow-x-auto whitespace-pre">
                  {keystoreCmd}
                </pre>
                <p className="text-[10px] text-slate-400">
                  See <code className="text-slate-300">ANDROID_PUBLISHING.md</code> for GitHub Pages and keystore signing steps.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'twa' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Compliant <code className="text-emerald-300">manifest.webmanifest</code>, maskable PNG icons, <code className="text-emerald-300">twa-manifest.json</code>, and <code className="text-emerald-300">.well-known/assetlinks.json</code> (with <code className="text-emerald-300">.nojekyll</code>) are ready for Trusted Web Activity (TWA) publishing.
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">1. Online APK / AAB Generator</span>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
                  >
                    <span>PWABuilder.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enter your GitHub Pages HTTPS URL in PWABuilder to download a Google Play-ready Android package.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    <span>2. Google Bubblewrap CLI</span>
                  </span>
                  <button
                    onClick={() => handleCopy('twa', bubblewrapCode)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
                  >
                    {copiedKey === 'twa' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'twa' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-300 overflow-x-auto whitespace-pre">
                  {bubblewrapCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
