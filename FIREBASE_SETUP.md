# Firebase Configuration & Google Authentication Setup Guide

This guide walks you through setting up real Google Authentication and Cloud Firestore for **Habitale**.

---

## 1. Create a Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Enter a project name (e.g. `habitale-app`) and click **Continue**.
4. Disable Google Analytics (or leave enabled) and click **Create project**.

---

## 2. Enable Google Authentication

1. In the Firebase console left menu, click **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Google** from the list of additional providers.
4. Toggle the **Enable** switch.
5. Choose a **Project public-facing name** (e.g., `Habitale`) and select your support email address.
6. Click **Save**.

### Crucial: Verify Authorized Domains
Under **Authentication** > **Settings** > **Authorized domains**, ensure:
- `localhost` is listed (enabled by default).
- If deploying to Vercel, Netlify, or custom domain, click **Add domain** and enter your production domain.

---

## 3. Set Up Cloud Firestore

1. In the Firebase console left menu, click **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose a location closest to your users.
4. Select **Start in test mode** for development (or production mode if you apply rules immediately).
5. In the **Rules** tab of Firestore, paste the rules from `firestore.rules`:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         match /{subcollection=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```
6. Click **Publish**.

---

## 4. Get Your Web App Keys & Configure Habitale

1. In the Firebase console, click the gear icon ⚙️ next to **Project Overview** and select **Project settings**.
2. Scroll down to the **Your apps** section and click the Web icon `</>`.
3. Register app with nickname `habitale-web` (no need to check Firebase Hosting).
4. Copy the `firebaseConfig` object keys.

### Applying to Habitale (Two Methods):

#### Option A: In-App Configuration (Zero Restart)
1. Open Habitale at [http://localhost:5173](http://localhost:5173).
2. On the Welcome login screen, if Firebase is not yet connected, click **"Setup Firebase Keys"** (or in **Settings** page if already logged in).
3. Paste your `apiKey`, `authDomain`, `projectId`, and `appId`.
4. Click **Save & Connect**. The application connects immediately.

#### Option B: Environment File
Create a `.env.local` file in the root of the `habitale` project:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=habitale-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=habitale-app
VITE_FIREBASE_STORAGE_BUCKET=habitale-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:...
```
Restart the dev server:
```bash
npm run dev
```

---

## 5. Testing Real Google Authentication

1. Open [http://localhost:5173](http://localhost:5173).
2. Click **"Continue with Google"**.
3. A Google Sign-In popup will appear. Select your Google account.
4. Upon successful login, you will immediately enter the **5-step First-Time Onboarding**:
   - Welcome screen greeting you with your real first name.
   - Choose starter palette.
   - Select Light or Dark mode.
   - Create your first routine (or click "Skip for now").
   - Launch your personalized dashboard.
5. Refresh the page: as a returning user, you skip onboarding straight into your Dashboard!
6. Click **Sign Out** from the desktop sidebar or settings to return securely to the protected login screen.
