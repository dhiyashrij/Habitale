# Habitale 🌸

> **"Your habits, your story."**

Habitale is an aesthetic, personalized routine and productivity tracker designed with the serenity of a luxury digital planner, Pinterest elegance, and minimalist mindfulness.

---

## ✨ Features & Architecture

### 1. Authentication & Onboarding
- **Google Authentication with Firebase Auth:**
  - Secure Google Sign-In with official OAuth flow.
  - User session persistence and automatic profile synchronization.
  - Data isolated per user under `users/{uid}` in Cloud Firestore.
  - Safe sign-out with instant session clearing.
- **5-Step Personalization Onboarding:**
  - Step 1: Welcome & Preferred Name (*Elena*, etc.).
  - Step 2: Choose a starter palette (*Blush Diary*, *Sage Garden*, *Lavender Dreams*, *Vanilla Cream*, *Ocean Mist*).
  - Step 3: Select appearance mode (*Light*, *Dark*, *System Sync*).
  - Step 4: Create your first routine or select a starter habit.
  - Step 5: Launch into your personalized dashboard.

### 2. Personalized Dashboard
- **Time-Aware Greeting & Local Date:**
  - Dynamic greeting (*"Good morning, Elena ✨"*), live date formatted in the user's local timezone.
- **Today's Routine Checklist:**
  - Check off individual routine tasks directly on the dashboard.
  - Live completion progress percentage updates immediately.
  - Sound effects (synthesized gentle marimba bell) and pastel confetti celebration upon completing all routines.
- **Daily Reflection Journal:**
  - Mood selector with intuitive emojis.
  - Rotating thought prompts.
  - Gratitude note capture.
- **Quick To-Do Panel:**
  - Inline task addition with overdue alert banner and bulk *"Carry All to Today"* action.

### 3. Custom Routine Builder
- **Unlimited Routines & Sub-Tasks:**
  - Create routines with custom titles, descriptions, categories, reminder times, and Lucide icons.
  - Add, edit, remove, and reorder routine tasks (Move Up / Move Down).
  - Optional time-of-day timestamps and duration minutes for each task.
  - Recurring weekday selectors (Sunday through Saturday).
- **One-Click Duplication:**
  - Duplicate routines with a single click, generating independent copies with unique sub-task identifiers.
- **Editable Starter Templates:**
  - *Morning Awakening Routine*
  - *Evening Unwind & Sleep Sanctuary*
  - *Deep Study & Knowledge Flow*
  - *Gentle Movement & Vitality*
  - *Mindful Self-Care Sanctuary*
- **Non-Destructive History & Confirmation:**
  - 30-day routine history modal showing daily records.
  - Editing definitions never destroys past completion records.
  - Deleting routines requires explicit confirmation via `ConfirmModal`.

### 4. Mini To-Do Lists & Task Manager
- **Task Organization:**
  - Quick task creation, priority badges (*High*, *Medium*, *Gentle Low*), and optional due dates.
  - Status filters: **Today**, **Upcoming**, **Overdue**, **Completed**, and **All**.
- **Custom Lists & Categories:**
  - Built-in categories (*Personal*, *Work*, *Wellness*, *Study*, *Creative*).
  - **New List Modal:** Create custom categories saved to Firestore and local storage.
- **Non-Destructive Carry Forward:**
  - Individual *"Carry to Today"* clock buttons on overdue tasks.
  - Overdue banner with bulk *"Carry All Overdue to Today"* batch update.
  - Clear completed tasks action.

### 5. Theme Studio & Visual Sanctuary
- **6 Curated Starter Presets:**
  - *Blush Diary* (Default: warm ivory `#FFF8F5`, dusty blush `#D99BAA`, muted sage `#A8B89F`, lavender `#C9BDE7`, charcoal `#353238`)
  - *Sage Garden* (Matcha green, eucalyptus, warm clay)
  - *Lavender Dreams* (Misty lilac, French lavender, periwinkle)
  - *Vanilla Cream* (Warm oat latte, honey vanilla, Scandinavian taupe)
  - *Midnight Bloom* (Nocturnal velvet plum, glowing peony pink, celestial teal)
  - *Ocean Mist* (Coastal seafoam, coral twilight, fresh breeze)
- **Comprehensive Fine-Tuning:**
  - Main webpage background color (`--bg-canvas`).
  - Primary and secondary brand colors.
  - Interactive accent color for buttons, checkboxes, and progress bars.
  - Card background and border colors.
  - Primary and muted text colors.
  - Appearance modes: Light, Dark, and System Sync.
- **Readable Typography:**
  - Headings: *Fraunces*, *Cormorant Garamond*, *Playfair Display*, *Plus Jakarta Sans*, *Outfit*.
  - Body: *Plus Jakarta Sans*, *Inter*, *Outfit*.
- **Card & Sidebar Aesthetics:**
  - Corner radius: `Sharp (4px)`, `Subtle (10px)`, `Soft (18px)`, `Rounded (26px)`, `Pill (36px)`.
  - Elevation styles: `Subtle Shadow`, `Clean Flat`, `Frosted Glassmorphic`, `Defined Border`.
  - Sidebar appearance: `Solid`, `Glassmorphic`, `Gradient Accented`.
- **Subtle Background Patterns:**
  - `None`, `Handmade Paper`, `Micro Dots`, `Drafting Grid`, `Botanical Leaves`, `Calming Waves`.
- **Readability & Contrast Checker:**
  - Real-time WCAG AA/AAA contrast ratio validation between text and background.
- **Actions:**
  - Apply & Save Theme (persists to Cloud Firestore).
  - Undo Unsaved Changes.
  - Restore Default Theme.

### 6. Progress & Analytics Sanctuary
- **Periodic Completion Rates:**
  - Daily, weekly (7-day), and monthly (30-day) routine completion rates calculated from actual stored data.
  - Never inflates progress or counts future tasks.
- **7-Day Activity Chart:**
  - Interactive visual bar chart showing task completion percentages for each day of the past week.
- **Month Calendar View with Completed Habits:**
  - Full calendar grid with previous/next month navigation.
  - Day cells displaying completion status (`complete`, `partial`, `missed`, `rest`, `future`).
- **Date Record Inspector:**
  - Click any calendar day or navigate with `< Prev Day` / `Next Day >`.
  - Inspect scheduled routines, completed sub-tasks, to-dos, and reflection journals on that date.
- **Routine History Drill-Down:**
  - Inspect individual routine performance: current streak, longest streak, lifetime completions, and sub-task frequency.
- **To-Do Analytics Summary:**
  - Total created, active, completed, and overdue tasks.
  - Breakdown by category and priority.
- **Reflection Journal Archive:**
  - Filter past entries by mood or search by keyword and gratitude notes.

### 7. Reliability, Accessibility & Data Portability
- **Data Isolation:** All user records are partitioned under `users/{uid}/...` in Firestore.
- **Safe Confirmations:** Irreversible actions (deleting routines, tasks, clearing data) use `ConfirmModal`.
- **Account Deletion Flow:**
  - Danger zone action permanently erasing Firestore user documents and collections with double confirmation.
- **Data Portability:**
  - Full JSON backup export and import/restore.
- **Accessibility:**
  - Visible `:focus-visible` indicators.
  - Respects `@media (prefers-reduced-motion: reduce)`.
  - Semantic HTML with accessible ARIA labels.

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
The output will be generated in the `dist/` directory.

---

## ☁️ Firebase Setup Instructions

Habitale uses Firebase Authentication (Google provider) and Cloud Firestore:

1. Visit the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In **Build > Authentication**:
   - Enable the **Google** sign-in provider.
   - Add your authorized domains (e.g., `localhost` and your production domain).
3. In **Build > Firestore Database**:
   - Create a database in production or test mode.
   - Recommended security rules:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId}/{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
     ```
4. Register a Web App in Project Settings and copy your Firebase config keys.
5. Provide credentials via either:
   - **Option A (UI Configuration)**:
     - Open the app, click **Settings** (or click the gear icon on the Welcome page), and paste your API Key, Project ID, and App ID.
   - **Option B (Environment Variables)**:
     - Create a `.env` file in the root directory:
       ```env
       VITE_FIREBASE_API_KEY=your_api_key
       VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
       VITE_FIREBASE_PROJECT_ID=your_project_id
       VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
       VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
       VITE_FIREBASE_APP_ID=your_app_id
       ```

---

## 🚢 Deployment Guide

### Deploying to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Set public directory to 'dist' and configure as a single-page app (Yes)
npm run build
firebase deploy --only hosting
```

### Deploying to Vercel
```bash
npm install -g vercel
vercel
```
Set build command to `npm run build` and output directory to `dist`. Add your `VITE_FIREBASE_*` environment variables in the Vercel dashboard.

### Deploying to Netlify
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```
Ensure a `_redirects` file with `/*  /index.html  200` is present for SPA routing.

---

## 🎨 Core Design Tokens

| Token | Color | Hex Code | Purpose |
|---|---|---|---|
| Background Canvas | Warm Ivory | `#FFF8F5` | Serene page background |
| Primary Accent | Dusty Blush | `#D99BAA` | Core actions, buttons, active states |
| Secondary | Muted Sage | `#A8B89F` | Habit streaks, calm indicators |
| Soft Accent | Soft Lavender | `#C9BDE7` | Buttons, checkboxes, progress bars |
| Text Main | Deep Charcoal | `#353238` | High readability typography |
| Cards | Crisp White | `#FFFFFF` | Rounded cards with delicate borders |
