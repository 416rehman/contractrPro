/**
 * Returns true if the flag is set
 * @param bitmask the integer field containing the tokenFlags, i.e. 2
 * @param flag the flag, i.e. UserFlags.FLAG_EMAIL_VERIFIED where FLAG_EMAIL_VERIFIED = 1
 * @returns {boolean}
 *
 * @example isFlagSet(FLAG_EMAIL_VERIFIED, 2) // false
 */
const isFlagSet = (bitmask, flag) => {
    return (flag & bitmask) !== 0
}

/**
 * Sets the flag and returns the new flagSet
 * @param flag the flag, i.e. UserFlags.FLAG_EMAIL_VERIFIED where FLAG_EMAIL_VERIFIED = 1
 * @param bitmask the integer field containing the tokenFlags, i.e. 2
 * @returns {number}
 * @example setFlag(FLAG_EMAIL_VERIFIED, 2) // 3
 */
const setFlag = (bitmask, flag) => {
    return flag | bitmask
}

/**
 * Unsets the flag and returns the new flagSet
 * @param flag the flag, i.e. UserFlags.FLAG_EMAIL_VERIFIED where FLAG_EMAIL_VERIFIED = 1
 * @param bitmask the integer field containing the tokenFlags, i.e. 2
 * @returns {number}
 * @example unsetFlag(FLAG_EMAIL_VERIFIED, 2) // 0
 */
const unsetFlag = (bitmask, flag) => {
    return bitmask & ~flag
}

/**
 * Sets 1 flag and unsets all other tokenFlags
 * @param bitmask the integer field containing the tokenFlags, i.e. 2
 * @param flag the flag, i.e. UserFlags.FLAG_EMAIL_VERIFIED where FLAG_EMAIL_VERIFIED = 1
 * @returns {number} the new bitmask
 */
const setOnlyFlag = (bitmask, flag) => {
    // Unset all tokenFlags except the desired flag
    const unsetFlags = ~bitmask

    // Set the desired flag
    return flag & unsetFlags
}

/**
 * Returns an object with the tokenFlags and a boolean value indicating if the flag is set
 * @param bitmask, the integer field containing the tokenFlags, i.e. 2
 * @param flagsObject, an object with the tokenFlags and their flagSets { FLAG_EMAIL_VERIFIED: 1, FLAG_PHONE_VERIFIED: 2, FLAG_BANNED: 4, FLAG_MUST_CHANGE_PASSWORD: 8, FLAG_ADMIN: 16}
 * @returns {{}}    an object with the tokenFlags and a boolean value indicating if the flag is set
 * @example readFlags(2) // { FLAG_EMAIL_VERIFIED: false, FLAG_PHONE_VERIFIED: true, FLAG_BANNED: false, FLAG_MUST_CHANGE_PASSWORD: false, FLAG_ADMIN: false }
 */
const readFlags = (bitmask, flagsObject) => {
    const result = {}
    for (const key in flagsObject) {
        result[key] = isFlagSet(flagsObject[key], bitmask)
    }
    return result
}

module.exports = {
    isFlagSet,
    setFlag,
    unsetFlag,
    setOnlyFlag,
    readFlags,
}
