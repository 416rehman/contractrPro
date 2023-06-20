// jest.config.js

// Get the full path to our env.jest file
const path = require('path')
const envFile = path.join(__dirname, 'jest.env')
require('dotenv').config({ path: envFile })

const logger = require('./utils/logger')

// Log a message to remind developers how to see more detail from log messages
logger.info(`Testing in ${process.env.NODE_ENV} mode.`)

// Set our Jest options, see https://jestjs.io/docs/configuration
module.exports = {
    verbose: true,
    testTimeout: 15000,
    setupFiles: ['./db/setup'],
}
