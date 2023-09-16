const zod = require('zod')
module.exports.zAddress = zod.object({
    country: zod.string().min(1).max(128),
    postalCode: zod.string().min(1).max(10),
    province: zod.string().min(1).max(128),
    city: zod.string().min(1).max(128),
    addressLine1: zod.string().min(1).max(128),
    addressLine2: zod.string().max(128).optional(),
})
