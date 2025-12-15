"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
const { generateRandomCode } = require('../../utils');
const define = (sequelize, DataTypes) => {
    const Invite = sequelize.define('Invite', {
        id: {
            // an 8 character random alphanumeric string
            type: DataTypes.STRING(8),
            primaryKey: true,
            defaultValue: () => {
                return generateRandomCode(8);
            },
        },
        uses: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        maxUses: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    });
    Invite.associate = (models) => {
        // The organization that the invite is for. Cannot be null.
        Invite.belongsTo(models.Organization, {
            foreignKey: {
                allowNull: false,
            },
        });
        // The organizationMember the invite is for.
        // For example, if the organization has a member without a user associated with it,
        // then an invite can be created for that member, so whoever uses the invite will be
        // associated with that member, and the invite will be deleted after it is used.
        //
        // If this is null, then a new OrganizationMember will be created for the user with info from their user account.
        Invite.belongsTo(models.OrganizationMember, {
            as: 'ForOrganizationMember',
        });
        Invite.belongsTo(models.User, {
            as: 'UpdatedByUser',
        });
    };
    return Invite;
};
exports.define = define;
