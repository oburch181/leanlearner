# Publishing Natural Number Game 4 (NNG4) on GitHub Pages & Android APK

This repository is set up for **one-click GitHub Pages hosting + automatic phone APK download**, plus local Android Studio / Play Store packaging.

---

## Quickest Way to Download on Your Phone (GitHub Pages)

1. Push this repository to **GitHub** (`main` or `master` branch).
2. In your GitHub repository, open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Wait ~2–3 minutes for **Deploy GitHub Pages & Phone APK Download** (`.github/workflows/deploy-github-pages.yml`) to complete.
5. Open your GitHub Pages URL on your Android phone (`https://<your-username>.github.io/<repo-name>/`):
   * **Download APK directly**: Tap **Android** in the top-right header → **Download `nng4-lean.apk`** (or visit `<your-pages-url>/downloads/nng4-lean.apk`) and open the downloaded file to install the standalone offline Android app.
   * **Install as PWA**: Or tap **Install App to Home Screen** (Chrome `⋮ → Install app`) for zero-sideload offline installation.

### Optional: Sign the GitHub Pages / Release APK
By default, `nng4-lean.apk` builds cleanly with Android's debug key so you can sideload immediately. To auto-sign release `.apk` and `.aab` builds in GitHub Actions:
1. Create a keystore:
   ```bash
   keytool -genkey -v \
     -keystore android/nng4-release.jks \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias nng4-key
   ```
2. Add four secrets under GitHub **Settings → Secrets and variables → Actions**:
   * `ANDROID_KEYSTORE_BASE64` (`base64 -w 0 android/nng4-release.jks`)
   * `ANDROID_KEYSTORE_PASSWORD`
   * `ANDROID_KEY_ALIAS` (`nng4-key`)
   * `ANDROID_KEY_PASSWORD`

---

## Local Build (Android Studio / Gradle)
Prerequisites: JDK 21 and Android Studio (or Android SDK platform tools).

```bash
# 1. Install dependencies & sync latest Vite build into /android
npm install
npm run android:sync

# 2. Build sideloadable Debug APK
npm run apk:debug
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# 3. Build signed Release APK & Google Play App Bundle (.aab)
cp android/keystore.properties.example android/keystore.properties
npm run apk:release
npm run aab:release
```

---

## Optional: Bubblewrap / PWABuilder (TWA)
`public/.nojekyll` ensures GitHub Pages serves `/.well-known/assetlinks.json`. Update `public/.well-known/assetlinks.json` with your keystore's SHA-256 fingerprint and point `twa-manifest.json` to your GitHub Pages host if publishing a Trusted Web Activity wrapper.
