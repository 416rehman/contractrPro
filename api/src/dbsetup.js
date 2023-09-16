const { Client } = require('pg')
const logger = require('./utils/logger')

module.exports = async () => {
    // check if the database exists, if not, create it
    // check if database process.env.DB_DATABASE exists, connection url is in process.env.DATABASE_URL
    const pgClient = new Client({
        connectionString: process.env.DATABASE_URL
    })

    await pgClient.connect()
    try {
        const dbToCreate = process.env.DB_DATABASE
        const result = await pgClient.query(
            `SELECT 1 FROM pg_database WHERE datname = '${dbToCreate}'`
        )
        if (result.rows.length === 0) {
            logger.debug(`Creating database ${dbToCreate}`)
            await pgClient.query(`CREATE DATABASE ${dbToCreate}`)
        }
    } catch (err) {
        logger.error(err)
    }
}
