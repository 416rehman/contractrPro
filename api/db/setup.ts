import { db } from './index'
import logger from '../utils/logger'
import { sql } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

export default async () => {
    try {
        await db.execute(sql`SELECT 1`)
        logger.info('Database connection established successfully.')

        if (process.env.NODE_ENV === 'test') {
            logger.info('Running database migrations for test environment...')
            await migrate(db, { migrationsFolder: './db/migrations' })
            logger.info('Migrations completed. Truncating all tables for clean state...')
            
            await db.execute(sql`
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'drizzle_migrations') LOOP
                        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
                    END LOOP;
                END $$;
            `)
            logger.info('Test database is clean and ready.')
        }
    } catch (err: any) {
        logger.error(
            `Unable to connect to the database: ${err.message}.\n Make sure the database server is running.`
        )
        throw err
    }
}
