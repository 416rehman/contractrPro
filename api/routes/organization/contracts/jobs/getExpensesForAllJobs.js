const { sequelize, JobExpense, Job } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')

// Gets all the organization's contract job expenses
module.exports = async (req, res) => {
                try {
    
                    const contractID = req.params.contract_id;
    
                    if (!contractID || !validator(contractID)) {
                        return res
                            .status(400)
                            .json(createErrorResponse('Contract ID required'))
                    }
    
                    const jobs = await Job.findAll({
                        where: {
                            contract_id: contractID,
                        },
                        include: [
                            {
                                model: JobExpense,
                                as: 'expenses',
                            },
                        ],
                    })
    
                    return res.status(201).json(createSuccessResponse(jobs))
    
                } catch (error) {
                    return res.status(500).json(createErrorResponse(error.message))
                }
    
        }
