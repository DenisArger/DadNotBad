# Mobile Dev Workflow

## One-time setup

1. Install dependencies:
   ```bash
   yarn
   ```
2. Create and install the Android dev build:
   ```bash
   yarn android
   ```

## Daily workflow

1. Start Metro for the dev client:
   ```bash
   yarn dev
   ```
2. Open the app on the emulator from Android Studio or by reinstalling if needed.

## When to reload

- `App.tsx`, `src/*`, UI, text, and state changes usually update with Fast Refresh.
- If the app looks stuck, use reload from the dev menu.

## When to rebuild

- Changes in `app.json`.
- Native dependencies.
- Anything under `android/` or `ios/`.
- After adding or removing Expo plugins.
