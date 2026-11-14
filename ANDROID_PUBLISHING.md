# Publishing Natural Number Game 4 (NNG4) as an Android APK

This project is pre-configured for **two** standard Android publishing workflows:
1. **Standalone Offline Native APK / Play Store AAB (Capacitor)** — bundles the entire web app + offline Lean 4 Peano engine directly inside `/android` with zero network dependency.
2. **Trusted Web Activity (TWA) APK / AAB (Bubblewrap / PWABuilder)** — wraps the deployed PWA URL with Digital Asset Links (`/.well-known/assetlinks.json`).

---

## App Identity & Assets Included
* **Package ID**: `dev.leanprover.nng4`
* **App Name**: `NNG4 Lean` (`Natural Number Game 4 (Lean 4)`)
* **Version**: `1.0.0` (`versionCode: 1`)
* **Icons & Splash Screens**:
  * Adaptive mipmaps (`ic_launcher`, `ic_launcher_round`, foreground/background) & dark splash drawables generated under `android/app/src/main/res/`
  * Compliant PWA PNGs (`public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-maskable-512x512.png`, `public/apple-touch-icon.png`, `public/favicon.ico`)
* **Native Android Integrations**:
  * Dark `#020617` status bar & hardware Back button navigation (`src/utils/nativeAndroid.ts`)
  * `VIBRATE` permission for tactile keyboard haptics & `adjustResize` keyboard handling

---

## Option 1: Standalone Offline APK / AAB (Capacitor — Recommended)

### A. Automated Cloud Build via GitHub Actions
1. Push this repository to GitHub.
2. Open the **Actions** tab → **Build Android APK & AAB** (`.github/workflows/android-apk.yml`).
3. Download **`nng4-lean-debug-apk`** (`app-debug.apk`) directly to install on any Android device.
4. *(Optional for signed Play Store `.aab`/`.apk`)* Add four repository secrets in GitHub Settings → Secrets and variables → Actions:
   * `ANDROID_KEYSTORE_BASE64` (`base64 -w 0 android/nng4-release.jks`)
   * `ANDROID_KEYSTORE_PASSWORD`
   * `ANDROID_KEY_ALIAS` (`nng4-key`)
   * `ANDROID_KEY_PASSWORD`

### B. Local Build (Android Studio / Gradle)
Prerequisites: JDK 21 and Android Studio (or Android SDK platform tools).

```bash
# 1. Install dependencies & sync latest Vite build into /android
npm install
npm run android:sync

# 2. Build sideloadable Debug APK
npm run apk:debug
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# 3. Generate release keystore (first time only)
keytool -genkey -v \
  -keystore android/nng4-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias nng4-key

# 4. Copy signing template and enter your passwords
cp android/keystore.properties.example android/keystore.properties

# 5. Build signed Release APK & Google Play App Bundle (.aab)
npm run apk:release
npm run aab:release
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

Or open the native project directly in Android Studio via:
```bash
npm run android:open
```

---

## Option 2: Trusted Web Activity (Bubblewrap / PWABuilder)

1. Deploy the web app over HTTPS (`npm run build`).
2. Update `twa-manifest.json` (`host`, `iconUrl`, `maskableIconUrl`, `webManifestUrl`, `fullScopeUrl`) if you deploy to a custom domain.
3. Run Bubblewrap:
   ```bash
   npm i -g @bubblewrap/cli
   bubblewrap update
   bubblewrap build
   ```
4. Extract your keystore's SHA-256 fingerprint:
   ```bash
   keytool -list -v -keystore android-release.keystore -alias nng4-key
   ```
5. Paste the `SHA256` fingerprint into `public/.well-known/assetlinks.json` and redeploy so the TWA launches fullscreen without a browser bar.
