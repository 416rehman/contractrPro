require('dotenv').config()
const logger = require('./utils/logger')
const app = require('./server')
const setupDb = require('./db/setup')

// parse int from env
const port = parseInt(process.env.PORT, 10) || 4000

setupDb()
    .then(() => {
        app.listen(port, async () => {
            logger.info(`Server is running on port ${port}`)
            logger.info(`Database ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME} is connected`)
        })
    })
    .catch((err) => {
        logger.error(`Unable to connect to the database: ${err}`)
    })
