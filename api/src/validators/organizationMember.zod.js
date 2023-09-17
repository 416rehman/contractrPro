const { z } = require('zod')
module.exports.zOrganizationMember = z.object({
    email: z.string().email().max(255),
    name: z.string().min(3).max(128).optional(),
    phoneCountry: z.string().min(1).max(5).optional(),
    phoneNumber: z.string().min(5).max(20).optional(),
})