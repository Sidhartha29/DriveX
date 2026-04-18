# 🚀 Firebase Integration Checklist for DriveX

Track your Firebase setup progress here. Follow the steps in [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions.

---

## Phase 1: Firebase Project Setup

- [ ] **1.1** Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
- [ ] **1.2** Register web app in Firebase Console
- [ ] **1.3** Copy Firebase config values (API Key, Project ID, etc.)

---

## Phase 2: Frontend Configuration

- [ ] **2.1** Create or update `frontend/.env` file
- [ ] **2.2** Add all `VITE_FIREBASE_*` environment variables
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
- [ ] **2.3** Restart frontend dev server (`npm run dev` in `frontend/`)
- [ ] **2.4** Verify no errors in browser console on `/auth` page

---

## Phase 3: Google Sign-In Setup

- [ ] **3.1** Enable Google provider in Firebase Console
  - Go to **Authentication** → **Sign-in method**
  - Enable **Google**
  - Select project support email
  - Click **Save**
- [ ] **3.2** Test Google sign-in button on login page

---

## Phase 4: Facebook Sign-In Setup

- [ ] **4.1** Create Facebook Developer account at [developers.facebook.com](https://developers.facebook.com)
- [ ] **4.2** Create or configure Facebook app
- [ ] **4.3** Add Facebook Login product to the app
- [ ] **4.4** Copy **App ID** and **App Secret**
- [ ] **4.5** Add valid OAuth redirect URIs:
  - `http://localhost:5173/`
  - `http://localhost:3000/`
- [ ] **4.6** Enable Facebook provider in Firebase Console
  - Go to **Authentication** → **Sign-in method**
  - Enable **Facebook**
  - Paste App ID and App Secret
  - Click **Save**
- [ ] **4.7** Test Facebook sign-in button on login page

---

## Phase 5: Backend Configuration

- [ ] **5.1** Generate Firebase Admin service account key
  - Go to Firebase Console → **Settings** ⚙️ → **Project Settings**
  - **Service Accounts** tab
  - **Generate New Private Key**
  - Save the downloaded JSON file securely
- [ ] **5.2** Create or update `backend/.env` file
- [ ] **5.3** Add `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable
  - Format as single-line JSON string
  - Or use the PowerShell script in [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- [ ] **5.4** Restart backend server (`npm run dev` in `backend/`)
- [ ] **5.5** Verify no Firebase errors in server logs

---

## Phase 6: Integration Testing

- [ ] **6.1** Email/Password Login
  - [ ] Register with email/password works
  - [ ] Login with email/password works
  - [ ] Logout works

- [ ] **6.2** Google Sign-In
  - [ ] Click Google button → popup appears
  - [ ] Sign in with Google account
  - [ ] Redirected to dashboard
  - [ ] User created in MongoDB with `authProvider: "google"`
  - [ ] Logout clears session

- [ ] **6.3** Facebook Sign-In
  - [ ] Click Facebook button → popup appears
  - [ ] Sign in with Facebook account
  - [ ] Redirected to dashboard
  - [ ] User created in MongoDB with `authProvider: "facebook"`
  - [ ] Logout clears session

- [ ] **6.4** Cross-Provider Account Linking
  - [ ] Sign up with Google using email: `test@example.com`
  - [ ] Logout
  - [ ] Sign up with Facebook using same email
  - [ ] Verify same account is used (not duplicate)

- [ ] **6.5** Protected Routes
  - [ ] Logout
  - [ ] Try accessing `/customer-dashboard`
  - [ ] Redirected to `/auth`
  - [ ] Can access after signing in again

- [ ] **6.6** Role-Based Access
  - [ ] Sign in as customer → redirected to `/customer-dashboard`
  - [ ] Sign in as manager → redirected to `/manager-dashboard`
  - [ ] Sign in as admin → redirected to `/admin-dashboard`

---

## Phase 7: Production Preparation

- [ ] **7.1** Add production domain to Firebase OAuth URIs
  - Frontend: Your production domain(s)
  - Facebook: Add production domain to **Valid OAuth Redirect URIs**

- [ ] **7.2** Update environment variables in production:
  - [ ] Frontend hosting (Vercel, Netlify, etc.)
  - [ ] Backend server

- [ ] **7.3** Update `VITE_API_BASE_URL` to production backend URL

- [ ] **7.4** Enable CORS for production domain in `backend/server.js`

- [ ] **7.5** Test full flow in production deployment

---

## Phase 8: Documentation & Monitoring

- [ ] **8.1** Document any custom OAuth user data handling
- [ ] **8.2** Set up Firebase Console monitoring/alerts
- [ ] **8.3** Add OAuth provider info to user dashboard (optional)
- [ ] **8.4** Create backup of Firebase service account key
- [ ] **8.5** Document rollback plan in case of Firebase outage

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Firebase is not configured" | Check `frontend/.env` has all `VITE_FIREBASE_*` variables |
| Popup blocked | Check browser console; ensure localhost is whitelisted |
| "Firebase authentication is not configured on the server" | Verify `backend/.env` has `FIREBASE_SERVICE_ACCOUNT_JSON` |
| Backend Firebase error | Check JSON format is single line with escaped newlines (`\n`) |
| User created twice for same email | Ensure both providers use same Firebase project |
| Logout doesn't clear Firebase | Verify `logoutFromFirebase()` is being called in AuthContext |

---

## Files Modified/Created

✅ **Frontend:**
- `frontend/src/config/firebase.js` — Firebase client initialization
- `frontend/src/services/authService.js` — Social login methods
- `frontend/src/context/AuthContext.jsx` — loginWithSocial hook
- `frontend/src/pages/LoginRegisterPage.jsx` — Social login UI
- `frontend/.env.example` — Firebase env template
- `frontend/package.json` — Added `firebase` dependency

✅ **Backend:**
- `backend/config/firebaseAdmin.js` — Firebase Admin initialization
- `backend/controllers/authController.js` — /api/auth/firebase endpoint
- `backend/routes/authRoutes.js` — Firebase auth route
- `backend/models/User.js` — Added authProvider, firebaseUid, photoURL fields
- `backend/.env.example` — Firebase service account template
- `backend/package.json` — Added `firebase-admin` dependency

✅ **Documentation:**
- `FIREBASE_SETUP.md` — Detailed setup guide
- `FIREBASE_INTEGRATION_CHECKLIST.md` — This file

---

## Architecture Summary

```
User clicks Google/Facebook
         ↓
Firebase Auth SDK popup
         ↓
User signs in with provider
         ↓
Firebase returns ID token
         ↓
Frontend exchanges token for DriveX JWT
         ↓
Backend verifies token with Firebase Admin
         ↓
Create/update user in MongoDB
         ↓
Return DriveX JWT + user data
         ↓
Frontend stores JWT + user in AuthContext
         ↓
Protected routes work as before
```

---

## Security Checklist

- [ ] `.env` files added to `.gitignore`
- [ ] Service account key stored securely (not in Git)
- [ ] Firebase project restricted to your domains
- [ ] Two-factor authentication enabled on Firebase/Google/Facebook
- [ ] Regular key rotation planned (annually)
- [ ] CORS configured for specific domains only

---

## Completion Status

- [ ] All phases completed
- [ ] All tests passing
- [ ] Production deployment ready
- [ ] Team documentation complete

**Setup Date:** _______________  
**Completion Date:** _______________  
**Verified By:** _______________

---

Need help? See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions or check the [backend README](backend/README.md) and [frontend README](frontend/README.md).
