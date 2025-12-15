import { db } from './index';
import logger from '../utils/logger';
import { sql } from 'drizzle-orm';

export default async () => {
    try {
        await db.execute(sql`SELECT 1`);
        logger.info('Database connection established successfully.');

        if (process.env.NODE_ENV === 'development') {
            logger.debug(`Running in ${process.env.NODE_ENV} mode`);
            // Migrations are handled by drizzle-kit
            // Populate logic to be restored later
        }

    } catch (err: any) {
        logger.error(
            `Unable to connect to the database: ${err}.\n Make sure the database server is running.`
        );
        throw err;
    }
};
