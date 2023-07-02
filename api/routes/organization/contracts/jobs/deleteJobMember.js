const { sequelize, JobMember, Job } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')

// Deletes the organization's contract job member
module.exports = async (req, res) => {
                    try {
            
                        const jobMemberID = req.params.job_member_id;
            
                        if (!jobMemberID || !validator(jobMemberID)) {
                            return res
                                .status(400)
                                .json(createErrorResponse('Job Member ID required'))
                        }
            
                        await sequelize.transaction(async (transaction) => {
            
                            const jobMember = await JobMember.findOne({
                                where: {
                                    id: jobMemberID,
                                },
                                transaction,
                            })
            
                            if (!jobMember) {
                                return res
                                .status(400)
                                .json(createErrorResponse('Job Member not found'))
                            }
            
                            await jobMember.destroy({
                                transaction,
                            })
            
                            return res.status(201).json(createSuccessResponse('Job Member deleted successfully'))
                        })
            
                    } catch (error) {
                        return res.status(500).json(createErrorResponse(error.message))
                    }
            
            }
