-- TimescaleDB initialization script
-- This script sets up TimescaleDB extension and basic configuration

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create the crypto_risk_db database if it doesn't exist
-- Note: This script runs after the database is created by Docker

-- Set timezone
SET timezone = 'UTC';

-- Create a function to check if TimescaleDB is working
CREATE OR REPLACE FUNCTION check_timescaledb()
RETURNS text AS $$
BEGIN
    IF timescaledb_version() IS NOT NULL THEN
        RETURN 'TimescaleDB is working correctly. Version: ' || timescaledb_version();
    ELSE
        RETURN 'TimescaleDB is not working correctly';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Test TimescaleDB
SELECT check_timescaledb();

-- Set default chunk time interval for hypertables
-- This can be overridden when creating specific hypertables
-- Default is 7 days, but we'll set it to 1 day for crypto data
-- SELECT set_default_chunk_time_interval(INTERVAL '1 day');

-- Create a view to show hypertable information
CREATE OR REPLACE VIEW hypertable_info AS
SELECT 
    hypertable_name,
    chunk_time_interval,
    compression_enabled,
    is_distributed
FROM timescaledb_information.hypertables;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Create indexes for better performance on time-series data
-- These will be created when the tables are created via migrations

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'TimescaleDB initialization completed successfully';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'TimescaleDB version: %', timescaledb_version();
    RAISE NOTICE 'PostgreSQL version: %', version();
END $$;
