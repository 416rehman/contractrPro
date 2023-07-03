const { sequelize, Job, Contract } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')


//Create a new job for a specific contract
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const contractID = req.params.contract_id;

        if (!orgID || !validator(orgID) || !contractID || !validator(contractID)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization or contract ID'))
        }

        const { name, description, startDate, endDate } = req.body;

        if (!name || !validator(name) || !description || !validator(description) || !startDate || !validator(startDate) || !endDate || !validator(endDate)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid name, description, start date, or end date'))
        }

        const job = await Job.create({
            name,
            description,
            startDate,
            endDate,
            organizationId: orgID,
            contractId: contractID
        })

        return res.status(200).json(createSuccessResponse(job))
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
}
