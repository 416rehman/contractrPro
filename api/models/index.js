const {DataTypes, Sequelize} = require("sequelize");
const {address} = require("./address"),
    {contract} = require("./contract"),
    {expense} = require("./expense"),
    {invite} = require("./invite"),
    {invoice} = require("./invoice"),
    {job} = require("./job"),
    {organization} = require("./organization"),
    {user} = require("./user"),
    {contract_users} = require("./contract_user"),
    {job_users} = require("./job_user"),
    {organization_users} = require("./organization_user");

console.log(`DB Connection Info:
    host: ${process.env.DB_HOST}
    port: ${process.env.DB_PORT}
    user: ${process.env.DB_USER}
    password: ${process.env.DB_PASSWORD}
    database: ${process.env.DB_DATABASE}`);

const sequelize = new Sequelize(process.env.DB_Database, process.env.DB_User, process.env.DB_Password, {
    host: process.env.DB_Host,
    port: process.env.DB_Port,
    dialect: 'postgres'
});

sequelize.authenticate().then(function () {
    console.log('Connection has been established successfully.');
}).catch(function (err) {
    console.log('Unable to connect to the database:', err);
});

const Address = address(sequelize, DataTypes);
const Contract = contract(sequelize, DataTypes);
const Expense = expense(sequelize, DataTypes);
const Invite = invite(sequelize, DataTypes);
const Invoice = invoice(sequelize, DataTypes);
const Job = job(sequelize, DataTypes);
const Organization = organization(sequelize, DataTypes);
const User = user(sequelize, DataTypes);
const Contract_Users = contract_users(sequelize, DataTypes);
const Job_Users = job_users(sequelize, DataTypes);
const Organization_Users = organization_users(sequelize, DataTypes);

/**
 * Contract can have many invoices
 * Contract can have many jobs
 * Contract can have many expenses
 */
// Contract can have many invoices but an invoice can only have one contract
Contract.hasMany(Invoice, {
    foreignKey: "contract_id",
    allowNull: false,
});
Invoice.belongsTo(Contract, {foreignKey: "contract_id", allowNull: false,});

// Contract can have many jobs but a job can only have one contract
Contract.hasMany(Job, {
    foreignKey: "contract_id",
    allowNull: false,
});
Job.belongsTo(Contract, {foreignKey: "contract_id", allowNull: false,});

// Contract can have many expenses (expense type: contract) but a general-expense can only belong to one contract
Contract.hasMany(Expense, {
    foreignKey: "contract_id",
    as: "general_expenses"
});
Expense.belongsTo(Contract, {foreignKey: "contract_id", as: "general_expenses",});


/**
 * Organization can have many contracts
 * Organization can have many invites
 * Organization can have one address
 */

//Organization can have many contracts but a contract can only have one organization
Organization.hasMany(Contract, {
    foreignKey: "organization_id",
    allowNull: false
});
Contract.belongsTo(Organization, {foreignKey: "organization_id", allowNull: false,});
// organization can have many invites but an invite can only have one organization
Organization.hasMany(Invite, {
    foreignKey: "organization_id",
    allowNull: false
});
Invite.belongsTo(Organization, {foreignKey: "organization_id", allowNull: false,});

// organization can have one address
Organization.hasOne(Address, {
    foreignKey: "organization_id",
    allowNull: false,
});
Address.belongsTo(Organization, {foreignKey: "organization_id", allowNull: false,});

/**
 * Job can have many expenses (expense type: job)
 */
Job.hasMany(Expense, {
    foreignKey: 'job_id',
    as: 'job_expenses'
});
Expense.belongsTo(Job,{ foreignKey: 'job_id', as: 'job_expenses'});

/**
 * User can have many invites
 * User can own many organizations
 */
// user can create many invites, but an invite can only be created by one user
User.hasMany(Invite, {
    foreignKey: 'created_by',
    allowNull: false,
});
Invite.belongsTo(User, { foreignKey: 'created_by', allowNull: false,});
// user can OWN many organizations, but an organization can only be owned by one user
User.hasMany(Organization, {
    foreignKey: 'owner_id',
    allowNull: false,
});
Organization.belongsTo(User, {foreignKey: 'owner_id', allowNull: false,});


/**
 * MANY TO MANY RELATIONSHIPS
 **/

//Invoice can have many jobs and jobs can have many invoices
Invoice.belongsToMany(Job, {
    through: "Invoice_Jobs",
    allowNull: false,
})
Job.belongsToMany(Invoice, {
    through: 'Invoice_Jobs',
    allowNull: false,
});

//user can be in many organizations and organizations can have many users
User.belongsToMany(Organization, {
    through: 'Organization_Users',
    foreignKey: 'user_id',
    allowNull: false,
});
Organization.belongsToMany(User, {
    through: "Organization_Users",
    foreignKey: "organization_id",
    allowNull: false
});

// Jobs has many users and User has many jobs (with permissions)
Job.belongsToMany(Contract_Users, {
    through: 'Job_Users',
    foreignKey: 'job_id',
    allowNull: false,
});
Contract_Users.belongsToMany(Job, {
    through: "Job_Users",
    foreignKey: "contract_user_id",
    allowNull: false,
});

//Contract has many Users, and User has many Contracts
Contract.belongsToMany(Organization_Users, {
    through: "Contract_Users",
    foreignKey: "contract_id",
    allowNull: false,
});
Organization_Users.belongsToMany(Contract, {
    through: "Contract_Users",
    foreignKey: "organization_user_id",
    allowNull: false
});

module.exports.sequelize = sequelize
module.exports.Address = Address;
module.exports.Contract = Contract
module.exports.Expense = Expense
module.exports.Invite = Invite
module.exports.Invoice = Invoice
module.exports.Job = Job
module.exports.Organization = Organization
module.exports.User = User
module.exports.Contract_Users = Contract_Users
module.exports.Job_Users = Job_Users
module.exports.Organization_Users = Organization_Users
