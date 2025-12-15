import 'dotenv/config';
import logger from './utils/logger';
import app from './server';
import setupDb from './db/setup';

try {
    // parse int from env
    const port = parseInt(process.env.PORT || '4000', 10);

    setupDb()
        .then(() => {
            app.listen(port, async () => {
                logger.info(`Server is running on port ${port}`);
                logger.info(
                    `Database ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE} is connected`
                );
                logger.info(`Environment: ${process.env.NODE_ENV}`);
                logger.info(`Client URL: ${process.env.CLIENT_URL}`);
                logger.info(`Client URL (dev): ${process.env.CLIENT_URL_DEV}`);
            });
        })
        .catch((err: any) => {
            logger.error(`Unable to connect to the database: ${err}`);
        });
} catch (error) {
    // Global error handler
    logger.error({ error }, 'Unhandled exception');
}
