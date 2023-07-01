const { sequelize } = require('./index')
const logger = require('../utils/logger')
const { populate } = require('../utils/fake')

module.exports = () => {
    return sequelize
        .authenticate()
        .then(async () => {
            if (
                process.env.NODE_ENV === 'test' ||
                process.env.NODE_ENV === 'development'
            ) {
                logger.debug(`Running in ${process.env.NODE_ENV} mode`)

                logger.debug(`Syncing database...`)
                await sequelize.sync({ force: true })

                logger.debug(`Populating database...`)
                await populate()
                logger.debug(`Database populated!`)
            } else {
                await sequelize.sync()
            }
        })
        .catch((err) => {
            logger.error(`Unable to connect to the database: ${err}`)
        })
}
