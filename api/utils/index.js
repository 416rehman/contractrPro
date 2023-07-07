const crypto = require('crypto')
const jwt = require('jsonwebtoken')

/**
 * @returns {object} - Returns a random refresh token
 */
module.exports.generateRefreshToken = function () {
    return new Promise((resolve, reject) => {
        try {
            const refreshToken = crypto.randomBytes(64).toString('hex')
            resolve(refreshToken)
        } catch (e) {
            reject(e)
        }
    })
}

// generates a random 8 character alphanumeric string
module.exports.generateInviteCode = function () {
    return crypto.randomBytes(4).toString('hex')
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
            jwt.sign(payload, secret, { expiresIn: 30 * 60 }, (err, token) => {
                //30 minutes
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
    const picked = {}
    for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(obj, field)) {
            picked[field] = obj[field]
        }
    }
    return picked
}
