const { DataTypes, Sequelize } = require('sequelize')
const logger = require('../src/utils/logger')
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const address = require('./models/address'),
    attachment = require('./models/attachment'),
    client = require('./models/client'),
    comment = require('./models/comment'),
    contract = require('./models/contract'),
    contractMember = require('./models/contractMember'),
    expense = require('./models/expense'),
    expenseEntry = require('./models/expenseEntry'),
    invite = require('./models/invite'),
    invoice = require('./models/invoice'),
    invoiceEntry = require('./models/invoiceEntry'),
    job = require('./models/job'),
    jobMember = require('./models/jobMember'),
    organizationMember = require('./models/organizationMember'),
    organization = require('./models/organization'),
    user = require('./models/user'),
    vendor = require('./models/vendor'),
    token = require('./models/token'),
    organizationSettings = require('./models/organizationSettings')

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5000,
        },
    }
)

// Create DB if it doesn't exist
sequelize.beforeConnect(async (config) => {
    // check if database process.env.DB_DATABASE exists
    const pgClient = new Client({
        user: config.username,
        password: config.password,
        host: config.host,
    })
    await pgClient.connect()
    try {
        const dbToCreate = config.database.toLowerCase()
        const result = await pgClient.query(
            `SELECT 1 FROM pg_database WHERE lower(datname) = lower('${dbToCreate}')`
        )
        if (result.rows.length === 0) {
            logger.debug(`Creating database ${dbToCreate}`)
            await pgClient.query(`CREATE DATABASE ${dbToCreate}`)
            config.database = dbToCreate
        }
    } catch (err) {
        logger.error(err)
    }
})

const models = {
    Address: address.define(sequelize, DataTypes),
    Attachment: attachment.define(sequelize, DataTypes),
    Client: client.define(sequelize, DataTypes),
    Comment: comment.define(sequelize, DataTypes),
    Contract: contract.define(sequelize, DataTypes),
    ContractMember: contractMember.define(sequelize, DataTypes),
    Expense: expense.define(sequelize, DataTypes),
    ExpenseEntry: expenseEntry.define(sequelize, DataTypes),
    Invite: invite.define(sequelize, DataTypes),
    Invoice: invoice.define(sequelize, DataTypes),
    InvoiceEntry: invoiceEntry.define(sequelize, DataTypes),
    Job: job.define(sequelize, DataTypes),
    JobMember: jobMember.define(sequelize, DataTypes),
    OrganizationMember: organizationMember.define(sequelize, DataTypes),
    Organization: organization.define(sequelize, DataTypes),
    User: user.define(sequelize, DataTypes),
    Vendor: vendor.define(sequelize, DataTypes),
    Token: token.define(sequelize, DataTypes),
    OrganizationSettings: organizationSettings.define(sequelize, DataTypes),
}

logger.debug('Associating models...')
for (const model of Object.values(models)) {
    if (typeof model.associate === 'function') {
        model.associate(models)
    }
}
logger.debug('Models associated')

const dumpMethods = () => {
    try {
        // loops through all models and dumps their "prototype" methods to the current directory
        const dumpDir = path.join(__dirname, 'dump')
        if (fs.existsSync(dumpDir)) {
            logger.debug(
                `Dump directory ${dumpDir} already exists. Delete the directory to dump again.`
            )
            return
        } else {
            fs.mkdirSync(dumpDir)
        }

        for (const model of Object.values(models)) {
            const dumpFile = path.join(dumpDir, `.${model.name}.methods.txt`)
            const dumpStream = fs.createWriteStream(dumpFile)
            dumpStream.write(
                `====================\n${model.name}\n====================\n`
            )
            const methods = Object.keys(model.prototype).filter(
                (key) => typeof model.prototype[key] === 'function'
            )
            dumpStream.write(methods.join('\n'))
            dumpStream.write('\n\n')
            dumpStream.end()
        }

        logger.debug(`Dumped special model methods to ${dumpDir}.`)
    } catch (err) {
        logger.error(err)
    }
}

module.exports = {
    sequelize,
    dumpMethods,
    ...models,
}
