import logger from './logger.js';

const PLACEHOLDER_PATTERNS = [
  /<[^>]+>/,
  /^replace_with_/i,
  /^your_/i,
  /^example/i,
];

const isPresent = (value) => String(value || '').trim().length > 0;

const looksLikePlaceholder = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return true;
  }

  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized));
};

const collectErrors = () => {
  const errors = [];

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!isPresent(mongoUri) || looksLikePlaceholder(mongoUri)) {
    errors.push('MONGO_URI is missing or still uses a placeholder value');
  }

  if (!isPresent(process.env.JWT_SECRET) || looksLikePlaceholder(process.env.JWT_SECRET)) {
    errors.push('JWT_SECRET is missing or still uses a placeholder value');
  }

  if (!isPresent(process.env.ADMIN_PANEL_PASSWORD) || looksLikePlaceholder(process.env.ADMIN_PANEL_PASSWORD)) {
    errors.push('ADMIN_PANEL_PASSWORD is missing or still uses a placeholder value');
  }

  const allowInsecureFirebaseAuth = String(process.env.ALLOW_INSECURE_FIREBASE_AUTH || '').toLowerCase() === 'true';
  const shouldRequireFirebaseConfig = process.env.NODE_ENV === 'production' || !allowInsecureFirebaseAuth;

  if (shouldRequireFirebaseConfig) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
    const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    let hasValidServiceAccount = false;

    if (isPresent(serviceAccountJson)) {
      try {
        const parsed = JSON.parse(serviceAccountJson);
        hasValidServiceAccount = Boolean(
          isPresent(parsed?.project_id)
          && isPresent(parsed?.client_email)
          && isPresent(parsed?.private_key)
          && !looksLikePlaceholder(parsed.project_id)
          && !looksLikePlaceholder(parsed.client_email)
          && !looksLikePlaceholder(parsed.private_key)
        );
      } catch {
        errors.push('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
      }
    }

    const hasSplitFirebaseCredentials = Boolean(
      isPresent(firebaseProjectId)
      && isPresent(firebaseClientEmail)
      && isPresent(firebasePrivateKey)
      && !looksLikePlaceholder(firebaseProjectId)
      && !looksLikePlaceholder(firebaseClientEmail)
      && !looksLikePlaceholder(firebasePrivateKey)
    );

    if (!hasValidServiceAccount && !hasSplitFirebaseCredentials) {
      errors.push('Firebase Admin credentials are missing or invalid. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY');
    }
  }

  return errors;
};

export const validateStartupConfig = () => {
  const errors = collectErrors();

  if (errors.length > 0) {
    logger.error('Startup configuration validation failed', { errors });
    throw new Error(errors.join('; '));
  }

  logger.info('Startup configuration validation passed');
};
