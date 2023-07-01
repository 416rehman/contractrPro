const {DataTypes, Sequelize} = require('sequelize')
const logger = require('../utils/logger')
const {Client} = require('pg')

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
    vendor = require('./models/vendor')

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
    }
)

// Create DB if it doesn't exist
sequelize.beforeConnect(async (config) => {
    console.log('beforeConnect')
    // check if database process.env.DB_DATABASE exists
    const pgClient = new Client({
        user: config.username,
        password: config.password,
        host: config.host,
    })
    await pgClient.connect()
    try {
        const dbToCreate = process.env.DB_DATABASE.toLowerCase()
        const result = await pgClient.query(`SELECT 1 FROM pg_database WHERE lower(datname) = lower('${dbToCreate}')`)
        if (result.rows.length === 0) {
            await pgClient.query(`CREATE DATABASE ${dbToCreate}`)
        }
        // lowercase the database name
        config.database = dbToCreate
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
}

for (const model of Object.values(models)) {
    if (typeof model.associate === 'function') {
        logger.info(`Associating ${model.name}`)
        model.associate(models)
    }
}

module.exports = {
    sequelize,
    ...models,
}
