"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
const sequelize_1 = require("sequelize");
const define = (sequelize, DataTypes) => {
    const Address = sequelize.define('Address', {
        id: {
            type: sequelize_1.Sequelize.UUID,
            defaultValue: sequelize_1.Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        country: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        postalCode: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        province: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        addressLine1: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        addressLine2: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
    });
    Address.associate = (models) => {
        Address.belongsTo(models.User, {
            as: 'UpdatedByUser',
        });
    };
    return Address;
};
exports.define = define;
