// get the full path to our jest env file
const path = require('path');
const envFile = path.join(__dirname, 'jest.env');
require('dotenv').config({ path: envFile });

console.log(`Testing in ${process.env.NODE_ENV} mode.`);
console.log(
    `Database: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
);

module.exports = {
    verbose: true,
    testTimeout: 15000,
    globalSetup: '<rootDir>/db/setup.ts',
    openHandlesTimeout: 15000,
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {}],
    },
};
