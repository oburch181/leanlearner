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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0C1B2E]/45 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[#F4F8FC] border border-[#A8C4E0] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-[#E6F0FA] border-b border-[#C5D8EC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-[#475569]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0C1B2E]">Get App on Your Phone</h3>
              <p className="text-xs text-[#36506B]">GitHub Pages APK Download &amp; PWA Install</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-xl text-[#36506B] hover:text-[#0C1B2E] hover:bg-[#D5E6F7] transition flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#DCE9F7] border-b border-[#A8C4E0] text-xs">
          <button
            onClick={() => setActiveTab('download')}
            className={`min-h-[38px] py-1.5 rounded-xl font-bold transition text-center cursor-pointer ${
              activeTab === 'download'
                ? 'bg-[#0369A1] text-[#FFFFFF] shadow-xs'
                : 'text-[#36506B] hover:bg-[#C2D7EE]'
            }`}
          >
            Phone App
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`min-h-[38px] py-1.5 rounded-xl font-bold transition text-center cursor-pointer ${
              activeTab === 'capacitor'
                ? 'bg-[#0369A1] text-[#FFFFFF] shadow-xs'
                : 'text-[#36506B] hover:bg-[#C2D7EE]'
            }`}
          >
            Build APK
          </button>
          <button
            onClick={() => setActiveTab('twa')}
            className={`min-h-[38px] py-1.5 rounded-xl font-bold transition text-center cursor-pointer ${
              activeTab === 'twa'
                ? 'bg-[#0369A1] text-[#FFFFFF] shadow-xs'
                : 'text-[#36506B] hover:bg-[#C2D7EE]'
            }`}
          >
            Play Store
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {activeTab === 'download' && (
            <>
              {/* Direct APK Download Card when hosted via GitHub Pages workflow */}
              {apkAvailable ? (
                <div className="p-4 rounded-2xl bg-[#F1F5F9] border border-[#CBD5E1] space-y-3">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-[#334155]">
                    <Package className="w-5 h-5 text-[#475569]" />
                    <span>Android APK Ready for Download</span>
                  </div>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Download the standalone offline Android installer directly to your phone and open it to install <strong className="text-[#0C1B2E]">NNG4 Lean</strong>.
                  </p>
                  <a
                    href={apkUrl}
                    download="nng4-lean.apk"
                    className="w-full min-h-[48px] py-3 rounded-xl bg-[#0369A1] hover:bg-[#075985] text-[#FFFFFF] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download nng4-lean.apk</span>
                  </a>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-[#334155]">
                    <Globe className="w-4 h-4 text-[#475569]" />
                    <span>GitHub Pages Auto-Deploy &amp; APK Link</span>
                  </div>
                  <ol className="list-decimal list-inside text-sm text-[#36506B] space-y-1.5 font-sans leading-relaxed">
                    <li>Push this repository to GitHub.</li>
                    <li>Open <strong className="text-[#0C1B2E]">Settings → Pages</strong> and set Source to <strong className="text-[#0369A1]">GitHub Actions</strong>.</li>
                    <li>Open your <code className="font-mono font-bold text-[#0369A1]">github.io</code> link on your phone to download <code className="font-mono font-bold text-[#334155]">nng4-lean.apk</code> or install as an app!</li>
                  </ol>
                </div>
              )}

              {/* Instant Chrome PWA Install Option */}
              {isInstalled ? (
                <div className="p-3.5 rounded-2xl bg-[#F1F5F9] border border-[#CBD5E1] flex items-center gap-3 text-sm text-[#334155] font-medium">
                  <CheckCircle className="w-5 h-5 text-[#475569] shrink-0" />
                  <span>
                    NNG4 is running in standalone Android mode with full offline support.
                  </span>
                </div>
              ) : isInstallable ? (
                <div className="p-4 rounded-2xl bg-[#E0F2FE] border border-[#7DD3FC] space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-[#0369A1]">
                    <Sparkles className="w-4 h-4 text-[#0369A1]" />
                    <span>One-Tap Browser App Install (PWA)</span>
                  </div>
                  <p className="text-sm text-[#0C1B2E] leading-relaxed">
                    Install directly from Chrome onto your phone&apos;s home screen with offline caching.
                  </p>
                  <button
                    onClick={async () => {
                      const res = await install();
                      if (res) onClose();
                    }}
                    className="w-full min-h-[46px] py-2.5 rounded-xl bg-[#0369A1] hover:bg-[#075985] text-[#FFFFFF] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App to Home Screen</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] space-y-2">
                  <div className="text-sm font-extrabold text-[#0C1B2E]">
                    Or Install via Chrome for Android:
                  </div>
                  <ol className="list-decimal list-inside text-sm text-[#36506B] space-y-1.5 font-sans leading-relaxed">
                    <li>Open your GitHub Pages URL in <strong className="text-[#0C1B2E]">Google Chrome</strong> on Android.</li>
                    <li>Tap the <strong className="text-[#0C1B2E]">three dots (⋮)</strong> menu in the top-right corner.</li>
                    <li>Tap <strong className="text-[#0369A1]">Install app</strong> or <strong className="text-[#0369A1]">Add to Home screen</strong>.</li>
                  </ol>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-[#E6F0FA]/70 border border-[#C5D8EC] text-sm text-[#0C1B2E] space-y-1">
                <span className="font-extrabold text-[#0369A1]">100% Offline Peano Engine:</span>
                <p className="text-xs text-[#36506B] leading-relaxed">
                  All Lean 4 proof verification, AST normalization, and levels run locally on your phone.
                </p>
              </div>
            </>
          )}

          {activeTab === 'capacitor' && (
            <div className="space-y-3.5">
              <p className="text-sm text-[#0C1B2E] leading-relaxed">
                This project includes a complete <strong>Capacitor Android</strong> Gradle project configured with adaptive icons, splash screens, ice-blue status bar, and hardware Back navigation for building a standalone offline <code className="font-mono font-bold text-[#334155]">.apk</code> or Play Store <code className="font-mono font-bold text-[#334155]">.aab</code>.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#0C1B2E] flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#475569]" />
                    <span>1. Build Offline APK / AAB</span>
                  </span>
                  <button
                    onClick={() => handleCopy('cap', capacitorCmds)}
                    className="flex items-center gap-1 text-xs font-bold text-[#0C1B2E] px-2.5 py-1 rounded-lg bg-[#E6F0FA] border border-[#A8C4E0] hover:bg-[#DCE9F7] cursor-pointer"
                  >
                    {copiedKey === 'cap' ? <CheckCircle className="w-3.5 h-3.5 text-[#475569]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cap' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#EDF4FC] border border-[#C5D8EC] text-xs font-mono text-[#0C1B2E] overflow-x-auto whitespace-pre leading-relaxed">
                  {capacitorCmds}
                </pre>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#0C1B2E] flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-[#0369A1]" />
                    <span>2. Generate Release Signing Key</span>
                  </span>
                  <button
                    onClick={() => handleCopy('keytool', keystoreCmd)}
                    className="flex items-center gap-1 text-xs font-bold text-[#0C1B2E] px-2.5 py-1 rounded-lg bg-[#E6F0FA] border border-[#A8C4E0] hover:bg-[#DCE9F7] cursor-pointer"
                  >
                    {copiedKey === 'keytool' ? <CheckCircle className="w-3.5 h-3.5 text-[#475569]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'keytool' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#EDF4FC] border border-[#C5D8EC] text-xs font-mono text-[#0369A1] overflow-x-auto whitespace-pre leading-relaxed">
                  {keystoreCmd}
                </pre>
                <p className="text-xs text-[#36506B]">
                  See <code className="font-mono font-bold text-[#0C1B2E]">ANDROID_PUBLISHING.md</code> for GitHub Pages and keystore signing steps.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'twa' && (
            <div className="space-y-3.5">
              <p className="text-sm text-[#0C1B2E] leading-relaxed">
                Compliant <code className="font-mono font-bold text-[#334155]">manifest.webmanifest</code>, maskable PNG icons, <code className="font-mono font-bold text-[#334155]">twa-manifest.json</code>, and <code className="font-mono font-bold text-[#334155]">.well-known/assetlinks.json</code> (with <code className="font-mono font-bold text-[#334155]">.nojekyll</code>) are ready for Trusted Web Activity (TWA) publishing.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#0369A1]">1. Online APK / AAB Generator</span>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-[#0369A1] hover:underline"
                  >
                    <span>PWABuilder.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-[#36506B] leading-relaxed">
                  Enter your GitHub Pages HTTPS URL in PWABuilder to download a Google Play-ready Android package.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#C5D8EC] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#0C1B2E] flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-[#36506B]" />
                    <span>2. Google Bubblewrap CLI</span>
                  </span>
                  <button
                    onClick={() => handleCopy('twa', bubblewrapCode)}
                    className="flex items-center gap-1 text-xs font-bold text-[#0C1B2E] px-2.5 py-1 rounded-lg bg-[#E6F0FA] border border-[#A8C4E0] hover:bg-[#DCE9F7] cursor-pointer"
                  >
                    {copiedKey === 'twa' ? <CheckCircle className="w-3.5 h-3.5 text-[#475569]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'twa' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#EDF4FC] border border-[#C5D8EC] text-xs font-mono text-[#0C1B2E] overflow-x-auto whitespace-pre leading-relaxed">
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
