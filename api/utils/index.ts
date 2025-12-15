import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * @returns {string} - Returns a random refresh token
 */
export const generateRefreshToken = function () {
    return crypto.randomBytes(64).toString('hex')
}

// generates a random alphanumeric string of specified length (default 8)
export const generateRandomCode = function (length = 8) {
    return crypto.randomBytes(length / 2).toString('hex')
}

// Checks if a string is an 8 character alphanumeric string
export const isValidInviteCode = function (inviteCode: string) {
    return /^[a-z0-9]{8}$/i.test(inviteCode)
}

/**
 * @param {object} payload
 * @param {string} secret
 * @returns {Promise<String>} The JWT token
 */
export const signJWT = function (payload: any, secret: string) {
    return new Promise((resolve, reject) => {
        try {
            //15 minutes
            jwt.sign(payload, secret, { expiresIn: 15 * 60 }, (err: any, token: any) => {
                if (err) reject(err)
                else resolve(token)
            })
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Pick - returns an object with only the specified fields
 * @param {object} obj - The object to pick from
 * @param {string[]} fields - The fields to pick
 */
export const pick = (obj: any, fields: string[]) => {
    const picked: any = {}
    for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(obj, field)) {
            picked[field] = obj[field]
            // if it can be trimmed, trim it
            if (typeof picked[field] === 'string') {
                picked[field] = picked[field].trim()
            }
        }
    }
    return picked
}
