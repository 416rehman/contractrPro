-- Set the default timezone to UTC
SET TIME ZONE 'UTC';

-- Generates a 19 digit random BIGINT which can be used as a primary key.
-- https://rob.conery.io/2014/05/29/a-better-id-generator-for-postgresql/
CREATE OR REPLACE FUNCTION generate_uid(value BIGINT) RETURNS BIGINT AS
$$
DECLARE
    our_epoch  BIGINT := 1314220021721;
    seq_id     BIGINT;
    now_millis BIGINT;
    result     BIGINT;
BEGIN
    SELECT value % 1024 INTO seq_id;

    SELECT FLOOR(EXTRACT(EPOCH FROM CLOCK_TIMESTAMP()) * 1000) INTO now_millis;
    result := (now_millis - our_epoch) << 23;
    result := result | (11 << 10);
    result := result | (seq_id);
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ENUMs ----------------------------------------------------------------------
CREATE TYPE "enum_Jobs_status" AS ENUM (
    'open', -- Job is open and can be assigned to users
    'in_progress', -- Job is in progress and is assigned to a user
    'completed', -- Job is completed and is assigned to a user
    'cancelled' -- Job is cancelled
    );