import process from 'process'
const githubWorkflow = process.env.GITHUB_WORKFLOW_ENV | false
export const isProd = window.location.hostname !== 'localhost'
export const BASE_URL = githubWorkflow ? 'http://10.1.0.43' : isProd ? 'https://reportr-paai9.ondigitalocean.app' : 'http://localhost:3001'
