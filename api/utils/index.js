const crypto = require('crypto')
const jwt = require('jsonwebtoken')

/**
 * @returns {string} - Returns a random refresh token
 */
module.exports.generateRefreshToken = function () {
    return crypto.randomBytes(64).toString('hex')
}

// generates a random alphanumeric string of specified length (default 8)
module.exports.generateRandomCode = function (length = 8) {
    return crypto.randomBytes(length / 2).toString('hex')
}

// Checks if a string is an 8 character alphanumeric string
module.exports.isValidInviteCode = function (inviteCode) {
    return /^[a-z0-9]{8}$/i.test(inviteCode)
}

/**
 * @param {object} payload
 * @param {string} secret
 * @returns {Promise<String>} The JWT token
 */
module.exports.signJWT = function (payload, secret) {
    return new Promise((resolve, reject) => {
        try {
            //15 minutes
            jwt.sign(payload, secret, { expiresIn: 15 * 60 }, (err, token) => {
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
module.exports.pick = (obj, fields) => {
    if (!obj) return {}
    const picked = {}
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