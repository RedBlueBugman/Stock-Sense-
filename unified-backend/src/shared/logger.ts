export const logger = {
  info: (msg: string, meta?: any) => console.log(`[${new Date().toISOString()}] [INFO] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`, meta || ''),
  debug: (msg: string, meta?: any) => process.env.NODE_ENV !== 'production' && console.log(`[DEBUG] ${msg}`, meta || ''),
};
