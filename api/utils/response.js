module.exports.createSuccessResponse = (data) => {
    return {
        status: 'success',
        data,
    }
}

module.exports.createErrorResponse = (message, err) => {
    return {
        status: 'error',
        message: message || err?.message || 'Something went wrong',
        data: err?.code ? err.code + ': ' + err?.message : err?.message,
    }
}