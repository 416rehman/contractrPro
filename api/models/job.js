module.exports.job = (sequelize, DataTypes) => {
    return sequelize.define('Job', {
        //id field acts as job_number too
        purchase_order: DataTypes.STRING(256),
        job_name: DataTypes.STRING(256),
        description: DataTypes.STRING(512),
        status: {
            type: DataTypes.ENUM('open', 'closed', 'in progress'),
            defaultValue: 'open',
        },
        comments: DataTypes.STRING(1024),
        contract_id: DataTypes.INTEGER, //Job can be associated with one contract
    });
}

module.exports.calc = function (test) {

}