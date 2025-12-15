"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
const sequelize_1 = require("sequelize");
const define = (sequelize, DataTypes) => {
    const ExpenseEntry = sequelize.define('ExpenseEntry', {
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
    ExpenseEntry.associate = (models) => {
        ExpenseEntry.belongsTo(models.Expense, {
            onDelete: 'CASCADE',
            foreignKey: {
                allowNull: false,
            },
        }); // the expense that owns this expense entry
    };
    return ExpenseEntry;
};
exports.define = define;
