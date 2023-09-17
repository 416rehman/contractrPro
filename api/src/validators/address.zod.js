const { z } = require('zod')
module.exports.zAddress = z.object({
    country: z.string().min(1).max(128),
    postalCode: z.string().min(1).max(10),
    province: z.string().min(1).max(128),
    city: z.string().min(1).max(128),
    addressLine1: z.string().min(1).max(128),
    addressLine2: z.string().max(128).optional(),
})