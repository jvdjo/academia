# Academia Pro Mobile (Expo)

Mobile app that uses the same backend APIs as the web app.

## Prereqs
- Node.js LTS
- npm or yarn
- Expo CLI (installed automatically by `npx expo` commands)
- Backend running and reachable from your device (default: http://<LAN_IP>:3001)

## Configure API URL
Set the API base URL using an env var or `app.json`:

- Quick (recommended while developing on LAN):
  - Windows PowerShell:
    - `$env:EXPO_PUBLIC_API_URL = "http://<LAN_IP>:3001"; npx expo start`
  - CMD:
    - `set EXPO_PUBLIC_API_URL=http://<LAN_IP>:3001 && npx expo start`
- Or edit `mobile/app.json` > `expo.extra.apiUrl`

If unset, the app tries to derive the LAN IP from Expo host and assumes port 3001.

## Run
- From repo root:
  - `cd mobile`
  - `npm install`
  - `npm start`
- Open Expo Go on your phone and scan the QR. Ensure your phone is on the same network as your computer.

## Features
- Login/Register (stores JWT securely with AsyncStorage)
- Weekly planner with days grid
- Edit day modal: search exercises, add/remove, add/remove sets, edit reps and weight
- Uses the same endpoints:
  - POST /api/auth/login
  - POST /api/auth/register
  - GET /api/workouts
  - PUT /api/workouts/:dayKey
  - DELETE /api/workouts/:dayKey
  - GET /api/exercises

## Notes
- CORS: Native apps send requests without browser origin. Your backend already allows requests with no origin, so it works by default.
- Render: The same production URL can be used for EXPO_PUBLIC_API_URL if your backend is publicly accessible.
