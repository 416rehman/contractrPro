"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
const sequelize_1 = require("sequelize");
const define = (sequelize, DataTypes) => {
    const JobMember = sequelize.define('JobMember', {
        id: {
            type: sequelize_1.Sequelize.UUID,
            defaultValue: sequelize_1.Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        permissionOverwrites: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    });
    JobMember.associate = (models) => {
        JobMember.belongsTo(models.User, {
            as: 'UpdatedByUser',
        });
        JobMember.belongsTo(models.OrganizationMember);
        JobMember.belongsTo(models.Job);
    };
    return JobMember;
};
exports.define = define;
