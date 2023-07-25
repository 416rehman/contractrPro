module.exports.createSuccessResponse = (data) => {
    return {
        status: 'success',
        data,
    }
}

module.exports.createErrorResponse = (message, err) => {
    let hint = ''
    try {
        if (err?.message?.includes('violates foreign key constraint')) {
            // example error: "insert or update on table \"Contracts\" violates foreign key constraint \"Contracts_ClientId_fkey\""
            // We need to get the table name from the error message (i.e "Contracts") and the foreign key name (i.e "ClientId")
            const foreignKey = err?.message?.split('"')?.[3]?.split('_')?.[1]
            const entity = err?.message?.split('"')?.[1]
            hint = `${entity} must have a valid ${foreignKey}`
        }
        // null value in column "name" of relation "Jobs" violates not-null constraint
        else if (err?.message?.includes('violates not-null constraint')) {
            const column = err?.message?.split('"')?.[1]
            const entity = err?.message?.split('"')?.[3]
            hint = `Make sure "${column}" is not null for "${entity}"`
        }
    } catch (e) {
        console.log(e)
    }

    return {
        status: 'error',
        message: message || hint || err?.message || 'Something went wrong',
        data: err?.code ? err.code + ': ' + err?.message : err?.message,
    }
}