import { getApp, getApps, initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId)

const app = hasFirebaseConfig ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null

export const firebaseAuth = app ? getAuth(app) : null
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({ prompt: 'select_account' })

export const isFirebaseConfigured = hasFirebaseConfig