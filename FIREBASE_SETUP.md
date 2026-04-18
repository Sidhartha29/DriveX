# 🔐 Firebase Setup Guide for DriveX Social Login

This guide walks you through setting up Google and Facebook authentication for the DriveX platform.

---

## 📋 Prerequisites

- Google account
- Facebook developer account (for Facebook login)
- Git or direct file edit access
- Node.js 18+ locally installed

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `drivex` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**
6. Wait for the project to initialize (~2 minutes)

---

## Step 2: Register Your Frontend App

1. In Firebase Console, click the **Web** icon (`</>`).
2. App name: `DriveX Web`
3. Check the box for "Firebase Hosting" (optional)
4. Click **"Register app"**
5. Firebase will generate a config object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "drivex-xxx.firebaseapp.com",
  projectId: "drivex-xxx",
  storageBucket: "drivex-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234..."
};
```

6. Copy these values. You'll use them in the next step.

---

## Step 3: Configure Frontend Environment

1. Open or create `frontend/.env` (copy from `.env.example` if it doesn't exist):

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=drivex-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=drivex-xxx
VITE_FIREBASE_STORAGE_BUCKET=drivex-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234...
```

Replace the values with what Firebase generated in Step 2.

---

## Step 4: Enable Google Sign-In

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click the **Sign-in method** tab
3. Find **Google** and click it
4. Toggle **Enable** to ON
5. **Project support email**: Choose your email from the dropdown
6. Click **Save**

Google sign-in is now enabled! ✅

---

## Step 5: Enable Facebook Sign-In

### 5a: Create/Configure a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click **My Apps** → **Create App**
3. App name: `DriveX`
4. App purpose: Select **Consumer**
5. Click **Create App**
6. Set strong password when prompted
7. You're now in the Facebook App Dashboard

### 5b: Add Facebook Login Product

1. In your Facebook App, find **Products** section (left sidebar)
2. Click **Add Product**
3. Find **Facebook Login** and click **Set Up**
4. Choose **Web** as the platform
5. For Website URL, enter: `http://localhost:5173` (during dev)
6. Click **Continue**

### 5c: Configure OAuth Redirect URIs

1. Go to **Settings** → **Basic**
2. Copy your **App ID** and **App Secret** (you'll need these soon)
3. Go to **Products** → **Facebook Login** → **Settings**
4. Under **Valid OAuth Redirect URIs**, add:
   - `http://localhost:5173/` (development)
   - `http://localhost:3000/` (alternate dev port)
   - Your production domain when deployed

5. Click **Save Changes**

### 5d: Configure Firebase for Facebook

1. Back in [Firebase Console](https://console.firebase.google.com/), go to **Authentication** → **Sign-in method**
2. Find **Facebook** and click it
3. Toggle **Enable** to ON
4. Paste your Facebook **App ID** and **App Secret** (from Step 5c)
5. Click **Save**

Facebook sign-in is now enabled! ✅

---

## Step 6: Create Firebase Admin Service Account

### 6a: Generate Service Account Key

1. In Firebase Console, click the **Settings** ⚙️ icon (top-left)
2. Select **Project Settings**
3. Go to the **Service Accounts** tab
4. Click **Generate New Private Key**
5. A JSON file will download automatically
6. **Save this file safely** — it contains sensitive credentials

### 6b: Extract the JSON and Format for .env

Open the downloaded JSON file. It looks like:

```json
{
  "type": "service_account",
  "project_id": "drivex-xxx",
  "private_key_id": "xxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMII...===\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@drivex-xxx.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40drivex-xxx.iam.gserviceaccount.com"
}
```

---

## Step 7: Configure Backend Environment

1. Open or create `backend/.env` (copy from `.env.example` if needed)
2. Add this line with the **entire JSON stringified** (single line, no newlines except `\n` in the private_key):

```bash
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"drivex-xxx","private_key_id":"xxx",...,"client_x509_cert_url":"..."}
```

**⚠️ Important:** The JSON must be on ONE line. Replace the placeholders with your actual service account JSON.

### Easier approach using PowerShell:

```powershell
# Read the service account JSON file
$serviceAccountJson = Get-Content 'path/to/downloaded/service-account-key.json' -Raw | ConvertFrom-Json | ConvertTo-Json -Compress

# Add to your .env
Add-Content 'backend/.env' "FIREBASE_SERVICE_ACCOUNT_JSON=$serviceAccountJson"
```

---

## Step 8: Test the Integration

### Backend Test (verify Firebase Admin loads):

```bash
cd backend
npm run dev
```

Check the logs—you should NOT see Firebase errors. The server should start normally on `http://localhost:5000`.

### Frontend Test (verify Firebase Auth initializes):

```bash
cd frontend
npm run dev
```

1. Open **http://localhost:5173/auth**
2. You should see the **Google** and **Facebook** buttons
3. Click **Google** button
4. A Google sign-in popup should appear
5. Sign in with your Google account
6. After sign-in, you should be redirected to your dashboard (customer, manager, or admin)
7. Check browser DevTools Console — no error messages should appear

### Test Flow:

1. **Sign out** from dashboard
2. Click **Facebook** button
3. A Facebook sign-in popup should appear
4. Sign in with a Facebook test account
5. You should be redirected to the dashboard
6. Verify your account was created with `authProvider: 'facebook'`

---

## Step 9: Verify User Creation

After signing in with Google or Facebook, check the MongoDB database:

```javascript
// Connect to MongoDB (e.g., MongoDB Compass or mongosh)
db.users.findOne({ email: 'your-email@example.com' });

// You should see:
{
  _id: ObjectId(...),
  name: "Your Name",
  email: "your-email@example.com",
  role: "customer",
  authProvider: "google", // or "facebook"
  firebaseUid: "...",
  photoURL: "https://lh3.googleusercontent.com/...",
  isActive: true,
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

---

## Step 10: Production Deployment

When deploying to production:

1. **Update Firebase OAuth URIs** (Step 5c):
   - Remove `http://localhost:*` entries
   - Add your production domain(s):
     - `https://yourdomain.com`
     - `https://www.yourdomain.com` (if applicable)

2. **Update Environment Variables**:
   - Frontend: Set `VITE_FIREBASE_PROJECT_ID` and Firebase credentials in your hosting platform (Vercel, Netlify, etc.)
   - Backend: Set `FIREBASE_SERVICE_ACCOUNT_JSON` in your server environment

3. **Update API URLs**:
   - Frontend: Change `VITE_API_BASE_URL` to your production backend URL
   - Ensure CORS is configured in backend for your production domains

---

## Troubleshooting

### Firebase Config Not Loading

**Error:** "Firebase is not configured. Add your Vite Firebase env variables first."

**Fix:**
- Verify all `VITE_FIREBASE_*` variables are in `frontend/.env`
- Restart the dev server (`npm run dev`)
- Check that `.env` is NOT committed to Git (add to `.gitignore`)

### Backend Firebase Error: "FIREBASE_SERVICE_ACCOUNT_JSON is missing"

**Error:** "Firebase authentication is not configured on the server"

**Fix:**
- Check `backend/.env` has `FIREBASE_SERVICE_ACCOUNT_JSON`
- Verify the JSON is properly formatted (single line, escaped newlines)
- Restart the backend server

### Google Sign-In Popup Blocked

**Error:** Popup does not appear when clicking Google button

**Fix:**
- Check browser console for errors
- Ensure localhost is whitelisted (it is by default in dev)
- Try in a private/incognito window
- Check browser popup blocker settings

### Facebook Sign-In Fails

**Error:** "Facebook login failed" or popup closes without response

**Fix:**
- Verify Facebook App ID and App Secret are correct in Firebase Console
- Ensure `http://localhost:5173` is in Facebook App's **Valid OAuth Redirect URIs**
- Check Facebook App status is **Live** (not Development)

### Email Not Verified

**Error:** "Firebase account does not have a verified email address"

**Fix:**
- In your Firebase/Google/Facebook account settings, ensure your email is marked as verified
- Try signing in again

---

## Security Best Practices

✅ **DO:**
- Store `FIREBASE_SERVICE_ACCOUNT_JSON` as an environment variable (never commit to Git)
- Use strong passwords for Firebase, Google, and Facebook accounts
- Rotate service account keys annually
- Enable two-factor authentication on Firebase, Google, and Facebook accounts

❌ **DON'T:**
- Commit `.env` files to Git
- Share service account keys
- Expose API keys in frontend console logs (Firebase Web SDK is safe, designed for public use)
- Use the same password across Firebase, Google, and Facebook

---

## Next Steps

After verifying the integration:

1. ✅ Test email/password login still works
2. ✅ Test Google sign-in flow
3. ✅ Test Facebook sign-in flow
4. ✅ Test logout clears both Firebase and app session
5. ✅ Verify protected routes still require auth
6. ✅ Test with multiple users (different Google/Facebook accounts)
7. 📝 Document any custom logic for handling OAuth user data

---

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Web SDK](https://firebase.google.com/docs/auth/web/start)
- [Google Sign-In Setup](https://developers.google.com/identity/sign-in/web)
- [Facebook Login Setup](https://developers.facebook.com/docs/facebook-login/web)

---

**Date Created:** April 4, 2026  
**Last Updated:** April 4, 2026
