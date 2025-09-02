-- PostgreSQL configuration to allow host connections
-- This script configures PostgreSQL to accept connections from the host machine

-- Allow connections from all hosts (for development)
ALTER SYSTEM SET listen_addresses = '*';

-- Configure pg_hba.conf equivalent settings
-- Allow connections from any host with password authentication
CREATE OR REPLACE FUNCTION update_pg_hba() RETURNS void AS $$
BEGIN
    -- This is a workaround since we can't directly modify pg_hba.conf
    -- The docker-compose.yml should handle the networking
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE crypto_risk_db TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Reload configuration
SELECT pg_reload_conf();
