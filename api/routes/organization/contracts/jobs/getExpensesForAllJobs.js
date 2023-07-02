const { sequelize, JobExpense, Job } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')

// Gets all the organization's contract expenses for ALL the jobs
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const contractID = req.params.contract_id;

        if (!orgID || !validator(orgID) || !contractID || !validator(contractID)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization or contract ID'));
        }

        const expenses = await JobExpense.findAll({
            where: {
                organizationId: orgID,
                contractId: contractID
            },
            include: [
                {
                    model: Job,
                    where: {
                        organizationId: orgID,
                        contractId: contractID
                    }
                }
            ]
        });

        return res.status(200).json(createSuccessResponse(expenses));
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message));
    }
};
