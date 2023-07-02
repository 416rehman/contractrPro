const { sequelize, Invite, Organization } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')

// Deletes an organization's invite by ID
module.exports = async (req, res) => {
            try {
    
                const orgID = req.params.org_id;
    
                if (!orgID || !validator(orgID)) {
                    return res
                        .status(400)
                        .json(createErrorResponse('Organization ID required'))
                }
    
                const inviteID = req.params.invite_id;
    
                if (!inviteID || !validator(inviteID)) {
                    return res
                        .status(400)
                        .json(createErrorResponse('Invite ID required'))
                }
    
                await sequelize.transaction(async (transaction) => {
    
                    const org = await Organization.findOne({
                        where: {
                            id: orgID,
                        },
                        transaction,
                    })
    
                    if (!org) {
                        return res
                        .status(400)
                        .json(createErrorResponse('Organization not found'))
                    }
    
                    const invite = await Invite.findOne({
                        where: {
                            id: inviteID,
                        },
                        transaction,
                    })
    
                    if (!invite) {
                        return res
                        .status(400)
                        .json(createErrorResponse('Invite not found'))
                    }
    
                    await invite.destroy({
                        transaction,
                    })
    
                    return res.status(201).json(createSuccessResponse('Invite deleted successfully'))
                })
    
            } catch (error) {
                return res.status(500).json(createErrorResponse(error.message))
            }
    
    }
