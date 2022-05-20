// exports.JWT_SECRET_KEY = '133742069'

exports.JWT_ACCESS_OPTIONS = {
    expiresIn: '15m'

}
exports.JWT_REFRESH_OPTIONS = {
    expiresIn: '10h'

}

exports.BCRYPT_SALT_ROUNDS = 10

exports.ALLOWED_ORIGINS = [
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    '127.0.0.1:3001', // Testing - npm test
    'http://127.0.0.1:3001', // Testing - npm test
    'https://127.0.0.1:3001', // Testing - npm test
    "https://fragservices.app",
    "https://reportrr-918ff.web.app"
];

exports.REQUEST_LIMIT = 1024 * 1024 * 10 // 10MB
exports.FILE_SIZE_LIMIT = 1024 * 1024 * 100 // 100MB