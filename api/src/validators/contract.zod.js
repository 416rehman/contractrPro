const { z } = require('zod')
module.exports.zContract = z.object({
    name: z.string().min(1).max(255),
    description: z.string().min(1).max(1024).optional(),
    startDate: z.date().optional(),
    dueDate: z.date().optional(),
    completionDate: z.date().optional(),
    status: z.number().optional(),
    clientId: z.string().cuid2(),
})