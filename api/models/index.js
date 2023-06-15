const { DataTypes, Sequelize } = require('sequelize')
const logger = require('../logger')
const address = require('./address'),
    attachment = require('./attachment'),
    client = require('./client'),
    comment = require('./comment'),
    contract = require('./contract'),
    contractMember = require('./contractMember'),
    expense = require('./expense'),
    expenseEntry = require('./expenseEntry'),
    invite = require('./invite'),
    invoice = require('./invoice'),
    invoiceEntry = require('./invoiceEntry'),
    job = require('./job'),
    jobMember = require('./jobMember'),
    member = require('./member'),
    organization = require('./organization'),
    user = require('./user'),
    vendor = require('./vendor')

logger.info(`DB Connection Info:
    host: ${process.env.DB_HOST}
    port: ${process.env.DB_PORT}
    user: ${process.env.DB_USER}
    password: ${process.env.DB_PASSWORD}
    database: ${process.env.DB_DATABASE}`)

const sequelize = new Sequelize(
    process.env.DB_Database,
    process.env.DB_User,
    process.env.DB_Password,
    {
        host: process.env.DB_Host,
        port: process.env.DB_Port,
        dialect: 'postgres',
    },
)

sequelize
    .authenticate()
    .then(function() {
        console.info('Connection has been established successfully.')
    })
    .catch(function(err) {
        console.error('Unable to connect to the database:', err)
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
    Member: member.define(sequelize, DataTypes),
    Organization: organization.define(sequelize, DataTypes),
    User: user.define(sequelize, DataTypes),
    Vendor: vendor.define(sequelize, DataTypes),
}

for (const model of Object.values(models)) {
    if (typeof model.associate === 'function') {
        model.associate(models)
    }
}

module.exports = {
    sequelize,
    ...models,
}
