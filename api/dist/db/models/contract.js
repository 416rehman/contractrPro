"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
const sequelize_1 = require("sequelize");
const define = (sequelize, DataTypes) => {
    const Contract = sequelize.define('Contract', {
        id: {
            type: sequelize_1.Sequelize.UUID,
            defaultValue: sequelize_1.Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(1024),
        },
        startDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        dueDate: {
            type: DataTypes.DATE,
        },
        completionDate: {
            type: DataTypes.DATE,
        },
        status: {
            // 0 = draft, 1 = active, 2 = completed, 3 = cancelled
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 0,
        },
    });
    Contract.associate = (models) => {
        Contract.belongsTo(models.Organization, {
            onDelete: 'CASCADE',
            foreignKey: { allowNull: false },
        });
        Contract.belongsTo(models.Client, {
            onDelete: 'RESTRICT',
            foreignKey: { allowNull: false },
        });
        Contract.belongsToMany(models.OrganizationMember, {
            through: models.ContractMember,
        });
        Contract.hasMany(models.Expense);
        Contract.hasMany(models.Invoice);
        Contract.hasMany(models.Job, {
            foreignKey: { allowNull: false },
        });
        Contract.hasMany(models.Comment);
        Contract.belongsTo(models.User, {
            as: 'UpdatedByUser',
        });
    };
    return Contract;
};
exports.define = define;
