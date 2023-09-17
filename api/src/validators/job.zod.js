const { z } = require('zod')
module.exports.zJob = z.object({
    reference: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    description: z.string().min(1).max(512),
    status: z.number().optional(),
    startDate: z.date(),
    dueDate: z.date().optional(),
    completionDate: z.date().optional(),
    assignedTo: z.array(z.string().cuid2()).optional(),
})