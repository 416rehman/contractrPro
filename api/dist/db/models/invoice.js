"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
const sequelize_1 = require("sequelize");
const define = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('Invoice', {
        id: {
            type: sequelize_1.Sequelize.UUID,
            defaultValue: sequelize_1.Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        invoiceNumber: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        issueDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        poNumber: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        note: {
            type: DataTypes.STRING(512),
            allowNull: true,
        },
        taxRate: {
            type: DataTypes.FLOAT(),
            allowNull: false,
            defaultValue: 0,
        },
    });
    Invoice.associate = (models) => {
        // An invoice belongs to an organization
        Invoice.belongsTo(models.Organization, {
            onDelete: 'CASCADE',
            foreignKey: {
                allowNull: false,
            },
        });
        Invoice.belongsTo(models.Contract); // the contract this invoice was derived from
        Invoice.belongsTo(models.Job); // the job this invoice was derived from
        Invoice.hasMany(models.InvoiceEntry, {
            onDelete: 'CASCADE',
        });
        Invoice.belongsTo(models.Client, {
            as: 'BillToClient',
        });
        Invoice.hasMany(models.Comment, {
            onDelete: 'CASCADE',
        });
        Invoice.belongsTo(models.User, {
            as: 'UpdatedByUser',
        });
    };
    return Invoice;
};
exports.define = define;
