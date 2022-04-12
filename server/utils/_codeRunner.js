const crypto = require('crypto')
const { BCRYPT_SALT_ROUNDS } = require("../specific");
const bcrypt = require('bcrypt');


const algorithm = "aes-256-cbc";
// generate 16 bytes of random data
let initVector = 'b9bd40365e653a55' // cd83fb57-505d-4382-b9bd-40365e653a55 8 4 4 4 12 (32)
// secret key generate 32 bytes of random data
let Securitykey = '9d66ef474a9d4dab94c668c0c0d96dcc' //9d66ef47-4a9d-4dab-94c6-68c0c0d96dcc 8 4 4 4 12 (32)

const encrypt = (secret) => {
    // the cipher function
    const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
    // encrypt the message
    // input encoding
    // output encoding
    let encryptedSecret = cipher.update(secret, "utf-8", "hex");
    encryptedSecret += cipher.final("hex");
    return encryptedSecret
}


const decrypt = (secret) => {
    const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
    let decryptedData = decipher.update(secret, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData
}


let SECRET = "shhhhhh!"
console.log(`Secret: ${SECRET}`)

const encryptedSecret = encrypt(SECRET)
console.log(`E-Secret: ${encryptedSecret}`)

const decryptSecret = decrypt(encryptedSecret)
console.log(`D-Secret: ${decryptSecret}`)

const passwordTohash = '40797bf372264ffeb8b3d74fee1b69f3'
bcrypt.hash(passwordTohash, BCRYPT_SALT_ROUNDS, function (err, hash) {
    console.log(`Hash for ${passwordTohash} is ${hash}`)
});
