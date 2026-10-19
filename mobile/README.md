# Fluffy Forest 1.1.0 — platform source package

Publisher: Black Orange Groupe. App ID: `agency.blackorange.fluffyforest`.
This is a native source package, NOT a signed AAB or IPA. No store submission has occurred.

## Included
- Complete offline web game bundled in `www/`.
- Android Studio project in `android/`; Xcode SPM project in `ios/App/`.
- Original artwork, branded launch screens and app icons.
- Three difficulty campaigns, 100 levels each; independent progress and stars.
- Genuine closed-eye animation frame, ear movement, idle reactions and celebration.
- Store copy in Ukrainian and English; privacy page in `www/privacy.html`.
- Tests validating all 300 level solution paths, and reproducible dependency lockfile.

## Build prerequisites
Node 22+, npm, Android Studio 2025.2.1+ with the SDK required by android/variables.gradle; iOS requires macOS and a Capacitor-8-compatible Xcode. See https://capacitorjs.com/docs/getting-started/environment-setup . Dependencies are locked to Capacitor 8.5.3.

## Android
1. `npm ci` then `npx cap sync android`.
2. `npx cap open android`.
3. Let Gradle sync, run on a physical device, then Build > Generate Signed Bundle / APK > Android App Bundle.
4. Use your existing upload key, or create an upload key if this is the first release. Keep it and passwords outside this repository.
5. The package uses versionCode 2 and versionName 1.1.0. Increase versionCode for each later upload. Check Play Console's current target API requirement before submitting.
6. Upload the signed AAB to internal testing first. Complete account verification, content rating, Data Safety, store details and any required testing shown by your Play Console account.

CLI debug build: `cd android && ./gradlew assembleDebug`.
CLI unsigned release bundle: `cd android && ./gradlew bundleRelease`.
An unsigned release bundle must be signed with your upload key before Play upload.

## iOS
1. On a Mac: `npm ci && npx cap sync ios && npx cap open ios`.
2. Select your Apple Developer Team under Signing & Capabilities. Confirm the bundle identifier is unused/registered for your account.
3. Set a physical iPhone or generic iOS device destination. Test, then Product > Archive > Distribute App > App Store Connect.
4. Release version is 1.1.0, build 2. Configure signing in Xcode; no Apple credentials are embedded.
5. Upload to TestFlight, complete privacy and age rating forms, real device screenshots, public support/privacy URLs, then submit for review.

## Before store submission — still required
- Signed AAB / IPA or Xcode Archive and physical-device QA. Neither binary was built in this environment (Android SDK and Xcode absent).
- Capture REAL gameplay screenshots on required device sizes. None are fabricated in this package.
- App icons and the Google Play 1024×500 feature graphic are included in store/.
- Publish `www/privacy.html` to a publicly reachable URL; the owner-private ChatGPT preview must not be used as the store privacy URL.
- Confirm publisher contact details, audience and age rating in each console. Do not infer child-directed status from the artwork alone.
- Review any future advertising, analytics or purchases before changing privacy declarations. This build has none.

## Test and maintenance
`npm test`. The test verifies every generated board, animal counts, capacities and every solution move for all 300 campaign levels.
`www/` is canonical mobile web source. Run `npx cap sync` after changes.
The root GitHub web deployment uses the same game files; online hosting access is separate from offline mobile behavior.

## Validation completed
All 300 solutions validated. DOM checks passed for difficulty selection, expert concealment, hints, moving, undo and saved state. No visual device QA or native binary compilation has been performed.
