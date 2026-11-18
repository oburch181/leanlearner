# Natural Number Game 4 (Lean 4) — Android & PWA

An offline-first **Android & Progressive Web App** adaptation of the Lean community's [**Natural Number Game 4 (NNG4)**](https://github.com/leanprover-community/NNG4), built with a self-contained Lean 4 Peano symbolic proof engine, custom tactile mobile keyboard, Freeplay sandbox, and native Capacitor APK packaging.

---

## Play & Download on Your Phone (GitHub Pages)

Once GitHub Pages is enabled in your repository (**Settings → Pages → Source: GitHub Actions**), your site automatically deploys both the offline web app and a compiled Android installer:

* **Live GitHub Pages App**: [`https://<your-github-username>.github.io/<repo-name>/`](https://<your-github-username>.github.io/<repo-name>/)
* **Direct Android APK Download**: [`https://<your-github-username>.github.io/<repo-name>/downloads/nng4-lean.apk`](https://<your-github-username>.github.io/<repo-name>/downloads/nng4-lean.apk)
* **In-App Download**: Open the GitHub Pages URL on your phone, tap **App** in the top-right header, and choose **Download `nng4-lean.apk`** (or **Install App to Home Screen** in Chrome).

> Replace `<your-github-username>` and `<repo-name>` above with your GitHub username and repository name after pushing. (If your repository is named `<your-github-username>.github.io`, the root URL is `https://<your-github-username>.github.io/`.)

---

## Features

* **100% Offline Lean 4 Peano Proof Engine**
  * Verifies tactic proofs locally on-device with zero network latency.
  * Supports `rfl`, `rw [h]` / `rw [← h]` / `rw [...] at h`, `repeat <tactic>`, `induction n with d hd`, `intro`, `apply`, `exact`, `simp`, `decide` (ground arithmetic & inequalities), and `ring` (multivariate polynomial identity checker over `ℕ`).
  * Requires explicit closing tactics (`rfl`) rather than auto-completing matched goals.
* **6 Worlds • 24 Guided Levels**
  * **Tutorial World** (8 levels): `rfl`, forward/backward rewriting, `repeat`, `add_zero`, `add_succ`, numeral unfolding.
  * **Addition World** (5 levels): structural induction, `zero_add`, `succ_add`, `add_comm`, `add_assoc`, `add_right_comm`.
  * **Multiplication World** (5 levels): `mul_one`, `zero_mul`, `succ_mul`, `mul_comm`, `mul_add`.
  * **Power World** (3 levels): `zero_pow_zero`, `pow_one`, `pow_add`.
  * **Implication World** (2 levels): `intro`, `exact`, `apply`, `imp_self`, `imp_trans`.
  * **Inequality World** (1 level): `le_refl` reflexivity on `≤`.
* **Mobile-First Proof Lab & Custom Tactile Keyboard**
  * Dedicated **Level Briefing** screen separated from the interactive **Proof Lab**.
  * Suppresses the default Android keyboard (`inputMode="none"`, toggleable anytime) with a 4-tab custom keyboard (*Tactics*, *Variables*, *Symbols*, *Lemmas*), smart cursor placement inside `rw [|]`, continuous hold-to-delete Backspace, synthesized Web Audio chimes, and haptic vibration.
* **Freeplay Sandbox & Settings**
  * Write custom Lean 4 theorems (`theorem my_id (a b : ℕ) : ...`), explore 6 curated presets, and save proved theorems for reuse.
  * Configurable **Settings**: progressive world/tactic unlocking by default, with toggles to unlock all worlds or all tactics immediately, sound/haptics, phone frame preview, and JSON progress export.

---

## Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server (http://localhost:3000)
npm run dev

# Type-check & build production web + PWA bundle
npm run lint
npm run build
```

---

## Building the Android APK / Play Store AAB

This project includes a native **Capacitor Android** project (`dev.leanprover.nng4`) under `/android/` as well as Bubblewrap TWA configuration (`twa-manifest.json` & `public/.well-known/assetlinks.json`).

```bash
# Build web bundle and sync into /android
npm run android:sync

# Build sideloadable Debug APK
npm run apk:debug
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# Build signed Release APK or Play Store App Bundle (.aab)
npm run apk:release
npm run aab:release
```

See **[ANDROID_PUBLISHING.md](./ANDROID_PUBLISHING.md)** for full keystore signing, GitHub Actions release secrets, and Google Play / Bubblewrap publishing instructions.

---

## License

This project is open source and licensed under the **[MIT License](./LICENSE)**.

Curriculum levels and mathematical structure are inspired by Kevin Buzzard and Jon Eugster's [**Natural Number Game 4 (NNG4)**](https://github.com/leanprover-community/NNG4) from the Lean Theorem Proving Community.
