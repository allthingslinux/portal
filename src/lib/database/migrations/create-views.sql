-- Create database views for the portal application
-- This file should be run after the main schema migration

-- User account workspace view - shows the user's personal account as their workspace
CREATE OR REPLACE VIEW user_account_workspace AS 
SELECT 
  a.id,
  a.name,
  a.picture_url
FROM accounts a 
WHERE a.is_personal_account = true
LIMIT 1;

-- User accounts view - shows all accounts a user has access to with their role
CREATE OR REPLACE VIEW user_accounts AS
SELECT 
  a.id,
  a.name,
  a.picture_url,
  a.slug,
  am.account_role as role
FROM accounts a
JOIN accounts_memberships am ON a.id = am.account_id
WHERE am.user_id = current_setting('app.current_user_id', true);

-- Grant permissions
GRANT SELECT ON user_account_workspace TO portal;
GRANT SELECT ON user_accounts TO portal;
