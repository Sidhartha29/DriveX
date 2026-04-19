const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const configuredLevel = String(process.env.LOG_LEVEL || '').toLowerCase();
const defaultLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
const currentLevel = LEVELS[configuredLevel] !== undefined ? configuredLevel : defaultLevel;

const shouldLog = (level) => LEVELS[level] <= LEVELS[currentLevel];

const toMetaString = (meta) => {
  if (meta === undefined || meta === null) {
    return '';
  }

  if (typeof meta === 'string') {
    return ` ${meta}`;
  }

  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return ' [unserializable-meta]';
  }
};

const baseLog = (level, message, meta) => {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const normalizedMessage = typeof message === 'string' ? message : String(message);
  const line = `[${timestamp}] [${level.toUpperCase()}] ${normalizedMessage}${toMetaString(meta)}`;

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
};

const logger = {
  error: (message, meta) => baseLog('error', message, meta),
  warn: (message, meta) => baseLog('warn', message, meta),
  info: (message, meta) => baseLog('info', message, meta),
  debug: (message, meta) => baseLog('debug', message, meta),
};

export default logger;