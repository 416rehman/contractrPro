/// <reference types="node" />
import { db } from '../../db'
import { sql } from 'drizzle-orm'

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
}
