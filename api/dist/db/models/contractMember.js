"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
const sequelize_1 = require("sequelize");
const define = (sequelize, DataTypes) => {
    const ContractMember = sequelize.define('ContractMember', // A contract member is a member that has access to a contract
    {
        id: {
            type: sequelize_1.Sequelize.UUID,
            defaultValue: sequelize_1.Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        permissionOverwrites: {
            type: DataTypes.BIGINT,
        },
    });
    ContractMember.associate = (models) => {
        ContractMember.belongsTo(models.User, {
            as: 'UpdatedByUser',
        });
    };
    return ContractMember;
};
exports.define = define;
