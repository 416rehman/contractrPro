const { sequelize, Job, Contract } = require('../../../db');
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response');
const { validator } = require('../../../utils/validator');

//Get all the organization's jobs for a specific contract
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const contractID = req.params.contract_id;

        if (!orgID || !validator(orgID) || !contractID || !validator(contractID)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization or contract ID'))
        }

        const jobs = await Job.findAll({
            where: {
                organizationId: orgID,
                contractId: contractID
            },
            include: [
                {
                    model: Contract,
                    where: {
                        organizationId: orgID,
                        id: contractID
                    }
                }
            ]
        });

        return res.status(200).json(createSuccessResponse(jobs))
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
