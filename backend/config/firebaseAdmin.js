import admin from 'firebase-admin'

let firebaseAdminApp = null

const parsePrivateKey = (value) => {
  if (!value) return undefined
  return value.replace(/\\n/g, '\n')
}

const parseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (raw) {
    try {
      const serviceAccount = JSON.parse(raw)
      if (serviceAccount.private_key) {
        serviceAccount.private_key = parsePrivateKey(serviceAccount.private_key)
      }
      return serviceAccount
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', error.message)
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
    console.error('Failed to initialize Firebase Admin:', error.message)
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