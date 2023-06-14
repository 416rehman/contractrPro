module.exports.job = (sequelize, DataTypes) => {
    return sequelize.define('Job', {
        //id field acts as job_number too
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        purchase_order: {
            type: DataTypes.STRING(256),
            allowNull: false
        },
        job_name: {
            type: DataTypes.STRING(256),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(512),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('open', 'closed', 'in progress'),
            defaultValue: 'open',
        },
        comments: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        //Job can be associated with one contract
        contract_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        }, 
        updated_by: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
    }, {
        paranoid: true,
    });
}
