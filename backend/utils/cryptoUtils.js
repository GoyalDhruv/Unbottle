import crypto from 'crypto-js';
dotenv.config();
import dotenv from 'dotenv';

export const encryptMsg = (content) => {
    return crypto.AES.encrypt(content, process.env.MSG_SECRET).toString()
}

export const decryptMsg = (content) => {
    return crypto.AES.decrypt(content, process.env.MSG_SECRET).toString(crypto.enc.Utf8)
}

