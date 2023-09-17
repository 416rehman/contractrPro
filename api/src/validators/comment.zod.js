const { z } = require('zod')
module.exports.zComment = z.object({
    content: z.string().min(1).max(1024),
})

module.exports.zAttachment = z.object({
    name: z.string().min(1).max(256),
    type: z.string().min(1).max(256),
})