const { User } = require('../db')
const bcrypt = require('bcrypt')
const { generateRefreshToken } = require('./utils')
const { Op } = require('sequelize')

module.exports.ping = function (req, res) {
    res.status(200).json({ message: 'Auth Working!' })
}

/**
 * Verifies the user's credentials and returns the user if successful
 * @param username if no email is provided
 * @param email if no username is provided
 * @param password
 * @returns {Promise<User>} User if successful, error if not
 */
module.exports.authenticate = function (username, email, password) {
    return new Promise((resolve, reject) => {
        User.findOne({
            where: {
                [Op.or]: [
                    { username: username || null },
                    { email: email || null },
                ],
            },
        })
            .then((user) => {
                if (!user) {
                    reject(new Error('User not found'))
                }
                bcrypt.compare(password, user.password, function (err, result) {
                    if (err) reject(err)
                    if (result) resolve(user)
                    else reject(new Error('Password is incorrect'))
                })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

/**
 * Checks if the refresh token is valid and returns the user if successful
 * @param refreshToken
 * @returns {Promise<unknown>}
 */
module.exports.verifyRefreshToken = function (refreshToken) {
    return new Promise((resolve, reject) => {
        User.findOne({ where: { refreshToken: refreshToken } })
            .then((user) => {
                if (!user) {
                    reject(new Error('User not found'))
                }
                resolve(user)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

module.exports.createUser = function (user_data) {
    return new Promise((resolve, reject) => {
        User.findOne({ where: { username: user_data.username } })
            .then((user) => {
                if (user) {
                    reject(new Error('User already exists'))
                }
                bcrypt.hash(user_data.password, 10, async function (err, hash) {
                    if (err) reject(err)

                    user = User.build({
                        username: user_data.username,
                        password: hash,
                        email: user_data.email,
                        name: user_data.name,
                        phone: user_data.phone,
                        avatarUrl: user_data.avatar,
                    })

                    try {
                        user.refreshToken = await generateRefreshToken()
                        const savedUser = await user.save();
                        // remove the password from the returned object
                        delete savedUser.password
                        resolve(savedUser)
                    } catch (err) {
                        reject(err)
                    }
                })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

module.exports.deleteUser = function (username) {
    return new Promise((resolve, reject) => {
        User.destroy({ where: { username: username } })
            .then((user) => {
                resolve(`${user || 0} rows deleted`)
            })
            .catch((err) => {
                reject(err)
            })
    })
}
