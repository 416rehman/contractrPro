const { DataTypes, Sequelize } = require('sequelize')
const logger = require('../utils/logger')

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
    process.env.DB_Database,
    process.env.DB_User,
    process.env.DB_Password,
    {
        host: process.env.DB_Host,
        port: process.env.DB_Port,
        dialect: 'postgres',
    },
)

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

const connect = async () => {
    return new Promise((resolve, reject) => {
        logger.info({
            host: process.env.DB_HOST,
            port: process.env.DB_POR,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        })

        sequelize.authenticate().then(async () => {
            await sequelize.sync({
                force: process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development',
            })
            resolve()
        }).catch((err) => {
            logger.error('Unable to connect to database')
            reject(err)
        })
    })
}

module.exports = {
    sequelize,
    connect,
    ...models,
}
