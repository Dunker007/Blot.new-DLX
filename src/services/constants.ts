export const CONNECTION_TIMEOUTS = {
  HEALTH_CHECK: 3000,
  REQUEST: 30000,
  STREAM: 60000,
  RETRY_BASE: 1000,
  RETRY_MAX: 10000,
} as const;

export const CACHE_CONFIG = {
  MAX_SIZE: 100,
  TTL_MINUTES: 60,
  CLEANUP_INTERVAL: 5 * 60 * 1000,
} as const;

export const STREAM_BUFFER = {
  MAX_SIZE: 50,
  MAX_DELAY: 16,
  MIN_CHUNK_SIZE: 10,
  BATCH_SIZE: 5,
  BATCH_DELAY: 50,
} as const;

export const CONNECTION_POOL = {
  MAX_SIZE: 5,
  MAX_RETRIES: 3,
  HEALTH_CHECK_INTERVAL: 30000,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
} as const;

export const LOCAL_PROVIDER_PORTS = {
  LM_STUDIO: 1234,
  OLLAMA: 11434,
} as const;

export const LOCAL_ENDPOINTS = [
  `http://localhost:${LOCAL_PROVIDER_PORTS.LM_STUDIO}`,
  `http://localhost:${LOCAL_PROVIDER_PORTS.OLLAMA}`,
  `http://127.0.0.1:${LOCAL_PROVIDER_PORTS.LM_STUDIO}`,
  `http://127.0.0.1:${LOCAL_PROVIDER_PORTS.OLLAMA}`,
] as const;

export const RLS_POLICIES = {
  COLLABORATION: {
    TEAM_MEMBER_CHECK: 'team_members.user_id = auth.uid()',
    PROJECT_ACCESS:
      'EXISTS (SELECT 1 FROM team_members WHERE project_id = ? AND user_id = auth.uid())',
  },
} as const;

export const FILE_LOCK_DURATION = 30 * 60 * 1000;

export const PRESENCE_UPDATE_INTERVAL = 30000;

export const ERROR_MESSAGES = {
  MODEL_NOT_FOUND: 'Model not found',
  PROVIDER_NOT_AVAILABLE: 'Provider not available',
  NO_LOCAL_PROVIDERS: 'No local providers available',
  CONNECTION_TIMEOUT: 'Connection timeout',
  REQUEST_FAILED: 'Request failed',
  CACHE_MISS: 'Cache miss',
} as const;

export const SUCCESS_MESSAGES = {
  SESSION_CREATED: 'Session created successfully',
  LOCK_ACQUIRED: 'File lock acquired',
  LOCK_RELEASED: 'File lock released',
  CACHE_HIT: 'Cache hit',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const COLLABORATION_EVENTS = {
  JOIN: 'join',
  LEAVE: 'leave',
  EDIT: 'edit',
  COMMENT: 'comment',
  LOCK: 'lock',
  UNLOCK: 'unlock',
  CURSOR_MOVE: 'cursor_move',
  FILE_OPEN: 'file_open',
  FILE_CLOSE: 'file_close',
} as const;

export const USER_STATUS = {
  ONLINE: 'online',
  AWAY: 'away',
  BUSY: 'busy',
  OFFLINE: 'offline',
} as const;

export const SESSION_STATUS = {
  ACTIVE: 'active',
  IDLE: 'idle',
  DISCONNECTED: 'disconnected',
} as const;
