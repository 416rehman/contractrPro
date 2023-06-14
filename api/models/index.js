const { DataTypes, Sequelize } = require('sequelize')
const address = require('./address'),
    attachment = require('./attachment'),
    comment = require('./comment'),
    contract = require('./contract'),
    expense = require('./expense'),
    invite = require('./invite'),
    invoice = require('./invoice'),
    job = require('./job'),
    organization = require('./organization'),
    user = require('./user'),
    contract_users = require('./contract_user'),
    job_users = require('./job_user'),
    organization_users = require('./organization_user')

console.log(`DB Connection Info:
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
        console.log('Connection has been established successfully.')
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err)
    })

const Address = address.define(sequelize, DataTypes)
const Attachment = attachment.define(sequelize, DataTypes)
const Comment = comment.define(sequelize, DataTypes)
const Contract = contract.define(sequelize, DataTypes)
const Expense = expense.define(sequelize, DataTypes)
const Invite = invite.define(sequelize, DataTypes)
const Invoice = invoice.define(sequelize, DataTypes)
const Job = job.define(sequelize, DataTypes)
const Organization = organization.define(sequelize, DataTypes)
const User = user.define(sequelize, DataTypes)
const Contract_Users = contract_users.define(sequelize, DataTypes)
const Job_Users = job_users.define(sequelize, DataTypes)
const Organization_Users = organization_users.define(sequelize, DataTypes)

/**
 * Comment can have many contracts
 * Comment can have many jobs
 * Comment can have many expenses
 * Comment can have many invoices
 * Comment can have many attachments
 */

// Contract can have many comments but a comment can only belong to one contract
Contract.hasMany(Comment, {
    foreignKey: 'contract_id',
    allowNull: false,
})
Comment.belongsTo(Contract, { foreignKey: 'contract_id', allowNull: false })

// Job can have many comments but a comment can only belong to one job
Job.hasMany(Comment, {
    foreignKey: 'job_id',
    allowNull: false,
})
Comment.belongsTo(Job, { foreignKey: 'job_id', allowNull: false })

// Expense can have many comments but a comment can only belong to one expense
Expense.hasMany(Comment, {
    foreignKey: 'expense_id',
    allowNull: false,
})
Comment.belongsTo(Expense, { foreignKey: 'expense_id', allowNull: false })

// Invoice can have many comments but a comment can only belong to one invoice
Invoice.hasMany(Comment, {
    foreignKey: 'invoice_id',
    allowNull: false,
})
Comment.belongsTo(Invoice, { foreignKey: 'invoice_id', allowNull: false })

Comment.hasMany(Attachment, {
    foreignKey: 'comment_id',
    allowNull: false,
})
Attachment.belongsTo(Comment, { foreignKey: 'comment_id', allowNull: false })

/**
 * Contract can have many invoices
 * Contract can have many jobs
 * Contract can have many expenses
 */

// Contract can have many invoices but an invoice can only have one contract
Contract.hasMany(Invoice, {
    foreignKey: 'contract_id',
    allowNull: false,
})
Invoice.belongsTo(Contract, { foreignKey: 'contract_id', allowNull: false })

// Contract can have many jobs but a job can only have one contract
Contract.hasMany(Job, {
    foreignKey: 'contract_id',
    allowNull: false,
})
Job.belongsTo(Contract, { foreignKey: 'contract_id', allowNull: false })

// Contract can have many expenses (expense type: contract) but a general-expense can only belong to one contract
Contract.hasMany(Expense, {
    foreignKey: 'contract_id',
    as: 'general_expenses',
})
Expense.belongsTo(Contract, {
    foreignKey: 'contract_id',
    as: 'general_expenses',
})

/**
 * Organization can have many contracts
 * Organization can have many invites
 * Organization can have one address
 */

//Organization can have many contracts but a contract can only have one organization
Organization.hasMany(Contract, {
    foreignKey: 'organization_id',
    allowNull: false,
})
Contract.belongsTo(Organization, {
    foreignKey: 'organization_id',
    allowNull: false,
})
// organization can have many invites but an invite can only have one organization
Organization.hasMany(Invite, {
    foreignKey: 'organization_id',
    allowNull: false,
})
Invite.belongsTo(Organization, {
    foreignKey: 'organization_id',
    allowNull: false,
})

// organization can have one address
Organization.hasOne(Address, {
    foreignKey: 'organization_id',
    allowNull: false,
})
Address.belongsTo(Organization, {
    foreignKey: 'organization_id',
    allowNull: false,
})

/**
 * Job can have many expenses (expense type: job)
 */
Job.hasMany(Expense, {
    foreignKey: 'job_id',
    as: 'job_expenses',
})
Expense.belongsTo(Job, { foreignKey: 'job_id', as: 'job_expenses' })

/**
 * User can have many invites
 * User can own many organizations
 */

// User can create many invites, but an invite can only be created by one user
User.hasMany(Invite, {
    foreignKey: 'created_by',
    allowNull: false,
})
Invite.belongsTo(User, { foreignKey: 'created_by', allowNull: false })

// User can OWN many organizations, but an organization can only be owned by one user
User.hasMany(Organization, {
    foreignKey: 'owner_id',
    allowNull: false,
})
Organization.belongsTo(User, { foreignKey: 'owner_id', allowNull: false })

/**
 * MANY TO MANY RELATIONSHIPS
 **/

// Invoice can have many jobs and jobs can have many invoices
Invoice.belongsToMany(Job, {
    through: 'Invoice_Jobs',
    allowNull: false,
})
Job.belongsToMany(Invoice, {
    through: 'Invoice_Jobs',
    allowNull: false,
})

// User can be in many organizations and organizations can have many users
User.belongsToMany(Organization, {
    through: 'Organization_Users',
    foreignKey: 'user_id',
    allowNull: false,
})
Organization.belongsToMany(User, {
    through: 'Organization_Users',
    foreignKey: 'organization_id',
    allowNull: false,
})

// Jobs has many users and User has many jobs (with permissions)
Job.belongsToMany(Contract_Users, {
    through: 'Job_Users',
    foreignKey: 'job_id',
    allowNull: false,
})
Contract_Users.belongsToMany(Job, {
    through: 'Job_Users',
    foreignKey: 'contract_user_id',
    allowNull: false,
})

// Contract has many Users, and User has many Contracts
Contract.belongsToMany(Organization_Users, {
    through: 'Contract_Users',
    foreignKey: 'contract_id',
    allowNull: false,
})
Organization_Users.belongsToMany(Contract, {
    through: 'Contract_Users',
    foreignKey: 'organization_user_id',
    allowNull: false,
})

module.exports = {
    sequelize,
    Address,
    Attachment,
    Comment,
    Contract,
    Expense,
    Invite,
    Invoice,
    Job,
    Organization,
    User,
    Contract_Users,
    Job_Users,
    Organization_Users,
}
