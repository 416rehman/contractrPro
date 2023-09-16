module.exports.createSuccessResponse = (data) => {
    return {
        status: 'success',
        data,
    }
}

module.exports.createErrorResponse = (message, err) => {
    let hint = '';
    try {
        // handle PrismaClientKnownRequestError exceptions
        const target = err?.meta?.target?.[0];
        if (err?.code) {
            switch (err?.code) {
                case 'P2000': {
                    hint = `The provided value for the column is too long for the column's type: ${target || 'This value'}`;
                    break;
                }
                case 'P2001': {
                    hint = `The record you're looking for doesn't exist: ${target || 'Record'}`;
                    break;
                }
                case 'P2002': {
                    hint = `The provided ${target || 'data'} already exists`;
                    break;
                }
                case 'P2003': {
                    hint = `The foreign key constraint failed on the field: ${target || 'Field'}`;
                    break;
                }
                case 'P2004': {
                    hint = `A constraint failed on the database: ${target || 'Database'}`;
                    break;
                }
                case 'P2005': {
                    hint = `The value ${target || 'This value'} stored in the database for the field ${err?.meta?.field} is invalid for the field's type`;
                    break;
                }
                case 'P2006': {
                    hint = `The provided ${target || 'value'} for ${err?.meta?.model} field ${err?.meta?.field} is not valid`;
                    break;
                }
                case 'P2007': {
                    hint = `Data validation error: ${target || 'Validation error'}`;
                    break;
                }
                case 'P2008': {
                    hint = `Failed to parse the query: ${err?.meta?.query_parsing_error} at position: ${err?.meta?.query_position}`;
                    break;
                }
                case 'P2009': {
                    hint = `Failed to validate the query: ${err?.meta?.query_validation_error} at position: ${err?.meta?.query_position}`;
                    break;
                }
                case 'P2010': {
                    hint = `Raw query failed. Code: ${err?.meta?.code}. Message: ${err?.meta?.message}`;
                    break;
                }
                case 'P2011': {
                    hint = `Null constraint violation on the ${target || 'constraint'}`;
                    break;
                }
                case 'P2012': {
                    hint = `Missing a required value at ${err?.meta?.path}`;
                    break;
                }
                case 'P2013': {
                    hint = `Missing the required argument ${err?.meta?.argument_name} for field ${err?.meta?.field_name} on ${err?.meta?.object_name}`;
                    break;
                }
                case 'P2014': {
                    hint = `The change you are trying to make would violate the required relation '${err?.meta?.relation_name}' between the ${err?.meta?.model_a_name} and ${err?.meta?.model_b_name} models`;
                    break;
                }
                case 'P2015': {
                    hint = `A related record could not be found: ${err?.meta?.details}`;
                    break;
                }
                case 'P2016': {
                    hint = `Query interpretation error: ${err?.meta?.details}`;
                    break;
                }
                case 'P2017': {
                    hint = `The records for relation ${err?.meta?.relation_name} between the ${err?.meta?.parent_name} and ${err?.meta?.child_name} models are not connected`;
                    break;
                }
                case 'P2018': {
                    hint = `The required connected records were not found: ${err?.meta?.details}`;
                    break;
                }
                case 'P2019': {
                    hint = `Input error: ${err?.meta?.details}`;
                    break;
                }
                case 'P2020': {
                    hint = `Value out of range for the type: ${err?.meta?.details}`;
                    break;
                }
                case 'P2021': {
                    hint = `The table ${err?.meta?.table} does not exist in the current database`;
                    break;
                }
                case 'P2022': {
                    hint = `The column ${err?.meta?.column} does not exist in the current database`;
                    break;
                }
                case 'P2023': {
                    hint = `Inconsistent column data: ${err?.meta?.message}`;
                    break;
                }
                case 'P2024': {
                    hint = `Timed out fetching a new connection from the connection pool. (Current connection pool timeout: ${err?.meta?.timeout}, connection limit: ${err?.meta?.connection_limit})`;
                    break;
                }
                case 'P2025': {
                    hint = `An operation failed because it depends on one or more records that were required but not found: ${err?.meta?.cause}`;
                    break;
                }
                case 'P2026': {
                    hint = `The current database provider doesn't support a feature that the query used: ${err?.meta?.feature}`;
                    break;
                }
                case 'P2027': {
                    hint = `Multiple errors occurred on the database during query execution: ${err?.meta?.errors}`;
                    break;
                }
                case 'P2028': {
                    hint = `Transaction API error: ${err?.meta?.error}`;
                    break;
                }
                case 'P2030': {
                    hint = `Cannot find a fulltext index to use for the search, try adding a @@fulltext([Fields...]) to your schema`;
                    break;
                }
                case 'P2031': {
                    hint = `Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set. See details: https://pris.ly/d/mongodb-replica-set`;
                    break;
                }
                case 'P2033': {
                    hint = `A number used in the query does not fit into a 64 bit signed integer. Consider using BigInt as field type if you're trying to store large integers: ${err?.meta?.details}`;
                    break;
                }
                case 'P2034': {
                    hint = `Transaction failed due to a write conflict or a deadlock. Please retry your transaction: ${err?.meta?.details}`;
                    break;
                }
            }
        }
    } catch (e) {
        console.log(e);
    }

    return {
        status: 'error',
        message: message || hint || err?.message || 'Something went wrong',
        data: err
    };
};


