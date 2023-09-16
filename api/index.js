require('dotenv').config()
const logger = require('./src/utils/logger')
const app = require('./src/server')
const setupDb = require('./src/dbsetup')

try {
    // parse int from env
    const port = parseInt(process.env.PORT, 10) || 4000

    setupDb()
        .then(() => {
            app.listen(port, async () => {
                logger.info(`Server is running on port ${port}`)
                logger.info(`Database URL: ${process.env.DATABASE_URL}`)
                logger.info(`Environment: ${process.env.NODE_ENV}`)
                logger.info(`Client URL: ${process.env.CLIENT_URL}`)
                logger.info(`Client URL (dev): ${process.env.CLIENT_URL_DEV}`)
            })
        })
        .catch((err) => {
            logger.error(`Unable to connect to the database: ${err}`)
        })
} catch (error) {
    // Global error handler
    logger.error('Unhandled exception: ', error)
}
