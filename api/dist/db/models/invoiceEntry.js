"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
const sequelize_1 = require("sequelize");
const define = (sequelize, DataTypes) => {
    const InvoiceEntry = sequelize.define('InvoiceEntry', {
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
            type: DataTypes.STRING(512),
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unitCost: {
            type: DataTypes.FLOAT(),
            allowNull: false,
        },
    });
    InvoiceEntry.associate = (models) => {
        InvoiceEntry.belongsTo(models.Invoice, {
            foreignKey: {
                allowNull: false,
            },
            onDelete: 'CASCADE',
        }); // the invoice that owns this invoice entry
    };
    return InvoiceEntry;
};
exports.define = define;
