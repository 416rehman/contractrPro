module.exports.createSuccessResponse = (data) => {
    return {
        status: 'success',
        data,
    }
}

module.exports.createErrorResponse = (message, data) => {
    return {
        status: 'error',
        error: message,
        data,
    }
}
