//  White list for emails that are allowed to be registered as an owner.
exports.WHITE_LIST = ['t@g.com'].map(email => email.toLocaleLowerCase())
exports.JWT_SECRET_KEY = '133742069'
exports.JWT_OPTIONS = {
    expiresIn: "10h"
}
exports.BCRYPT_SALT_ROUNDS = 10

exports.HACKER_PASSWORD = '40797bf372264ffeb8b3d74fee1b69f3'
exports.HACKER_EMAIL = 'notrace@hacker.com'

exports.ALLOWED_ORIGINS = [
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    '127.0.0.1:3001', // Testing - npm test
    "https://fragservices.app",
    "https://reportrr-918ff.web.app"
];

exports.REQUEST_LIMIT = 1024 * 1024 * 10 // 10MB
exports.FILE_SIZE_LIMIT = 1024 * 1024 * 100 // 100MB