"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
const sequelize_1 = require("sequelize");
const define = (sequelize, DataTypes) => {
    const OrganizationMember = sequelize.define('OrganizationMember', {
        id: {
            type: sequelize_1.Sequelize.UUID,
            defaultValue: sequelize_1.Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(512),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        permissions: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['OrganizationId', 'email'], // Create index for uniqueness per organization and email
            },
            {
                unique: true,
                fields: ['OrganizationId', 'phone'], // Create index for uniqueness per organization and phone
            },
        ],
    });
    OrganizationMember.associate = (models) => {
        OrganizationMember.belongsToMany(models.Contract, {
            through: models.ContractMember,
        });
        OrganizationMember.belongsToMany(models.Job, {
            through: models.JobMember,
        });
        OrganizationMember.belongsTo(models.User, {
            as: 'UpdatedByUser',
        });
    };
    return OrganizationMember;
};
exports.define = define;
