module.exports.createSuccessResponse = (data) => {
    return {
        status: 'success',
        data,
    }
}

module.exports.createErrorResponse = (message, err) => {
    let hint = ''
    if (err?.message?.includes('violates foreign key constraint')) {
        // example error: "insert or update on table \"Contracts\" violates foreign key constraint \"Contracts_ClientId_fkey\""
        // We need to get the table name from the error message
        const entity = err.message.split('"')[1]
        hint = `Make sure the Id related to ${entity} is valid`
    }
    // null value in column "name" of relation "Jobs" violates not-null constraint
    else if (err?.message?.includes('violates not-null constraint')) {
        const column = err.message.split('"')[1]
        const entity = err.message.split('"')[3]
        hint = `Make sure "${column}" is not null for "${entity}"`
    }
    return {
        status: 'error',
        message: message || hint || err?.message || 'Something went wrong',
        data: err?.code ? err.code + ': ' + err?.message : err?.message,
    }
}