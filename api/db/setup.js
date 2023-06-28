const { sequelize } = require('./index')
const logger = require('../utils/logger')
const { populate } = require('../utils/fake')

module.exports = () => {
    return sequelize
        .authenticate()
        .then(async () => {
            await sequelize.sync({
                force:
                    process.env.NODE_ENV === 'test' ||
                    process.env.NODE_ENV === 'development',
            })

            logger.debug(`Running in ${process.env.NODE_ENV} mode`)

            if (process.env.NODE_ENV === 'test' ||
                process.env.NODE_ENV === 'development') {
                await populate()
                logger.debug(`Database populated!`)
            }
        })
        .catch((err) => {
            logger.error(`Unable to connect to the database: ${err}`)
        })
}
