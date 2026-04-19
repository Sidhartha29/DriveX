import admin from 'firebase-admin'
import logger from '../utils/logger.js'

let firebaseAdminApp = null

const parsePrivateKey = (value) => {
  if (!value) return undefined

  let normalized = String(value).trim()

  if ((normalized.startsWith('"') && normalized.endsWith('"')) || (normalized.startsWith("'") && normalized.endsWith("'"))) {
    normalized = normalized.slice(1, -1)
  }

  return normalized
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
}

const normalizeServiceAccount = (serviceAccount) => {
  if (!serviceAccount || typeof serviceAccount !== 'object') {
    return null
  }

  const normalized = { ...serviceAccount }
  if (normalized.private_key) {
    normalized.private_key = parsePrivateKey(normalized.private_key)
  }

  return normalized
}

const parseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (raw) {
    try {
      return normalizeServiceAccount(JSON.parse(raw))
    } catch (error) {
      logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON', { error: error.message })
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY)

  if (projectId && clientEmail && privateKey) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey,
    }
  }

  return null
}

export const initializeFirebaseAdmin = () => {
  if (firebaseAdminApp) {
    return firebaseAdminApp
  }

  if (admin.apps.length > 0) {
    firebaseAdminApp = admin.app()
    return firebaseAdminApp
  }

  const serviceAccount = parseServiceAccount()
  const projectId = process.env.FIREBASE_PROJECT_ID

  try {
    if (serviceAccount) {
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
      return firebaseAdminApp
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      })
      return firebaseAdminApp
    }

    if (projectId) {
      firebaseAdminApp = admin.initializeApp({ projectId })
      return firebaseAdminApp
    }
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin', {
      error: error.message,
      hint: 'Check FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PRIVATE_KEY formatting, especially newlines in the private key'
    })
    return null
  }

  return null
}

export const getFirebaseAdminAuth = () => {
  const app = initializeFirebaseAdmin()
  if (!app) {
    return null
  }

  return admin.auth(app)
}

export const getFirebaseAdminDb = () => {
  const app = initializeFirebaseAdmin()
  if (!app) {
    return null
  }

  return admin.firestore(app)
}

export default admin