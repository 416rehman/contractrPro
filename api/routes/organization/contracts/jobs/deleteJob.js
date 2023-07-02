const { sequelize, Job, Contract } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')

// Deletes the organization's contract job
module.exports = async (req, res) => {
    
                try {
    
                    const jobID = req.params.job_id;
    
                    if (!jobID || !validator(jobID)) {
                        return res
                            .status(400)
                            .json(createErrorResponse('Job ID required'))
                    }
    
                    await sequelize.transaction(async (transaction) => {
    
                        const job = await Job.findOne({
                            where: {
                                id: jobID,
                            },
                            transaction,
                        })
    
                        if (!job) {
                            return res
                            .status(400)
                            .json(createErrorResponse('Job not found'))
                        }
    
                        await job.destroy({
                            transaction,
                        })
    
                        return res.status(201).json(createSuccessResponse('Job deleted successfully'))
                    })
    
                } catch (error) {
                    return res.status(500).json(createErrorResponse(error.message))
                }
    
        }
