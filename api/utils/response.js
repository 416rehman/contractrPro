module.exports.createSuccessResponse = (data) => {
    return {
        status: 'success',
        data,
    }
}

module.exports.createErrorResponse = (message, err) => {
    return {
        status: 'error',
        message: message,
        data: err?.code ? err.code + ': ' + err?.message : err?.message,
    }
}
