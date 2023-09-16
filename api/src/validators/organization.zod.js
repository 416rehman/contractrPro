const zod = require('zod')
module.exports.zOrganization = zod.object({
    name: zod.string().min(1).max(255),
    description: zod.string().max(512).optional(),
    email: zod.string().max(255).email().optional(),
    phone: zod.string().max(25).optional(),
    website: zod.string().max(255).optional(),
    logoUrl: zod.string().max(255).optional(),
})
