const crypto = require('crypto');

const KEY = Buffer.from(process.env.TOKEN_ENCRYPT_KEY || '', 'hex')
const IV = Buffer.from(process.env.TOKEN_ENCRYPT_IV || '', "hex")

if (KEY.length !== 32 || IV.length !== 16) {
    console.warn('TOKEN_ENCRYPT_KEY (32 bytes hex) and TOKEN_ENCRYPT_IV (16bytes hex) should be set in .env')
};


function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;

}
function decrypt(hash) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
    let dec = decipher.update(hash, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;

}


module.exports = { encrypt, decrypt }