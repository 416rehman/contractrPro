const { z } = require('zod')
module.exports.zAccount = z.object({
    // username can only contain letters, numbers, underscores, dashes, and dots
    username: z
        .string()
        .min(3)
        .max(32)
        .regex(/^[a-z0-9_.-]+$/i, {
            message:
                'Username can only contain letters, numbers, underscores, dashes, and dots',
        }),
    password: z.string().min(6).max(128),
    email: z.string().email().max(255),
    name: z.string().min(3).max(128).optional(),
    phoneCountry: z.string().min(1).max(5).optional(),
    phoneNumber: z.string().min(5).max(20).optional(),
    avatarUrl: z.string().url().optional(),
})