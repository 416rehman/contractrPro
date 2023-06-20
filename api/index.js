require('dotenv').config()
const logger = require('./utils/logger')
const app = require('./server')
const setupDb = require('./db/setup')

const port = process.env.PORT || 3000

setupDb()
    .then(() => {
        app.listen(port, async () => {
            logger.info(`Server is running on port ${port}`)
        })
    })
    .catch((err) => {
        logger.error(`Unable to connect to the database: ${err}`)
    })
