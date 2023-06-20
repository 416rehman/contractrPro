require('dotenv').config()
const logger = require('./utils/logger')
const app = require('./server')
const db = require('./db')
const { populate } = require('./utils/fake')

// If we're going to crash because of an uncaught exception, log it first.
// https://nodejs.org/api/process.html#event-uncaughtexception
process.on('uncaughtException', (err, origin) => {
    logger.fatal({ err, origin }, 'uncaughtException')
    throw err
})

// If we're going to crash because of an unhandled promise rejection, log it first.
// https://nodejs.org/api/process.html#event-unhandledrejection
process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({ reason, promise }, 'unhandledRejection')
    throw reason
})

const port = process.env.PORT || 3000

db.connect()
    .then(() => {
        logger.debug(`Connected to database`)
        logger.debug(`Running in ${process.env.NODE_ENV} mode`)

        if (process.env.NODE_ENV === 'development') {
            logger.info(`Populating database with mock data...`)
            populate()
                .then(() => {
                    logger.info(`Database populated!`)
                })
                .catch((err) => {
                    logger.error('Unable to populate database')
                    logger.error(err)
                })
        }

        app.listen(port, async () => {
            logger.info(`Server is running on port ${port}`)
        })
    })
    .catch((err) => {
        logger.error(err)
    })
