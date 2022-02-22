
export const isProd = window.location.hostname !== 'localhost'
export const isTesting = true
export const BASE_URL = isProd ? 'https://reportr-paai9.ondigitalocean.app' : 'http://localhost:3001'
