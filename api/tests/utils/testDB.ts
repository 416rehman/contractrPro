/// <reference types="node" />
import { db } from '../../db'
import { sql } from 'drizzle-orm'
import { organizations, users, organizationMembers } from '../../db/schema'
import { mockOrganizationData, mockUserData } from '../../utils/fake'

export const clearDatabase = async () => {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('clearDatabase() can only be run in the test environment.')
    }
    
    // Truncate all tables and cascade the deletions
    await db.execute(sql`
        DO $$ DECLARE
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
                EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
        END $$;
    `)
    try {
        const [org] = await db.insert(organizations).values(mockOrganizationData()).returning()
        if (process.env.DEV_USER_UUID) {
            const [user] = await db.insert(users).values({
                ...mockUserData(),
                id: process.env.DEV_USER_UUID,
                username: process.env.DEV_USER_USERNAME || 'devuser'
            }).returning()
            
            await db.insert(organizationMembers).values({
                role: 'owner',
                status: 'active',
                organizationId: org.id,
                userId: user.id
            })
        }
    } catch (err: any) {
        console.error('TESTDB SEED ERROR FULL:', err)
        throw err;
    }
}
