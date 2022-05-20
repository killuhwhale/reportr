import process from 'process'

const githubWorkflow = process.env.USER === "runner"
export const isProd = window.location.hostname !== 'localhost'
export const BASE_URL = false ? 'http://10.1.0.43' : isProd ? 'https://reportr-paai9.ondigitalocean.app' : 'http://localhost:3001'
console.log(`Environment:: BASE_URL `, BASE_URL)
console.log(process.env, process.env.WORKFLOW_GITHUB_ENV)