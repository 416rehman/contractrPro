module.exports.job_users = (sequelize, DataTypes) => {
    return sequelize.define("Job_Users", {
        contract_user_id: {
            type: DataTypes.INTEGER,
        },
        job_id: {
            type: DataTypes.INTEGER,
        },
        permission_overwrites: {
            type: DataTypes.BIGINT,
        },
    });
}