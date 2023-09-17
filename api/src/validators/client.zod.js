const { z } = require('zod')
module.exports.zClient = z.object({
    name: z.string().min(1).max(128),
    email: z.string().email().min(1).max(128),
    phone: z.string().min(1).max(128),
    website: z.string().min(1).max(128),
    description: z.string().min(1).max(128),
})