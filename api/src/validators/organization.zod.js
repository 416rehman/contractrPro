const { z } = require('zod')
module.exports.zOrganization = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(512).optional(),
    email: z.string().max(255).email().optional(),
    phone: z.string().max(25).optional(),
    website: z.string().max(255).optional(),
    logoUrl: z.string().max(255).optional(),
})