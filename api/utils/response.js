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
        // if err class is a sequelize error
        else if (err?.name?.includes('Sequelize')) {
            // Provide client-facing error messages for common errors
            if (err?.name === 'SequelizeUniqueConstraintError') {
                return {
                    status: 'error',
                    message: 'This record already exists',
                    data: err?.errors,
                }
            }

            if (err?.name === 'SequelizeValidationError') {
                return {
                    status: 'error',
                    message: err?.errors?.[0]?.message || 'Validation error',
                    data: err?.errors,
                }
            }

            if (err?.name === 'SequelizeDatabaseError') {
                return {
                    status: 'error',
                    message: 'Database error',
                    data: err?.errors,
                }
            }

            // else if it has err?.errors, return the first error message
            if (err?.errors) {
                return {
                    status: 'error',
                    message: err?.errors?.[0]?.message || 'Something went wrong',
                    data: err?.errors,
                }
            }
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
