const data = require('data.json')

module.exports.isValidCurrencyCode = function (currency) {
    return !!data.currency.codes[currency]
}

module.exports.isValidCurrencySymbol = function (currencySymbol) {
    return !!data.currency.symbols[currencySymbol]
}