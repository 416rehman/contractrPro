const { z } = require('zod')
module.exports.zExpense = z.object({
    expenseNumber: z.string().max(64),
    description: z.string().max(512).optional(),
    date: z.date().optional(),
    taxRate: z.number().optional(),
    vendorId: z.string().cuid2(),
    contractId: z.string().cuid2().optional(),
    jobId: z.string().cuid2().optional(),
})

module.exports.zExpenseEntry = z.object({
    name: z.string().max(128),
    description: z.string().max(128).optional(),
    quantity: z.number(),
    unitPrice: z.number(),
    unit: z.string().max(32).optional(),
})