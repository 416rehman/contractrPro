// jest.config.js

// Get the full path to our env.jest file
const path = require('path')
const envFile = path.join(__dirname, 'jest.env')
require('dotenv').config({ path: envFile })

const logger = require('./utils/logger')
const db = require('./db')
const { populate } = require('./utils/fake')

// Log a message to remind developers how to see more detail from log messages
logger.info(`Testing in ${process.env.NODE_ENV} mode.`)

// Set our Jest options, see https://jestjs.io/docs/configuration
module.exports = (async () => {
    try {
        await db.connect()
        logger.info(`Populating database with mock data...`)
        populate()
            .then(() => {
                logger.info(`Database populated!`)
            })
            .catch((err) => {
                logger.error('Unable to populate database')
                logger.error(err)
            })
    } catch (err) {
        logger.error('Unable to connect to database')
        logger.error(err)
    }

    return {
        verbose: true,
        testTimeout: 5000,
    }
})()
