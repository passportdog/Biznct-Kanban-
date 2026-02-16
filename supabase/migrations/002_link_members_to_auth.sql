-- Link members to auth.users
-- Run this in Supabase SQL Editor

-- Link Kenny (CEO)
UPDATE crm_members 
SET user_id = (SELECT id FROM auth.users WHERE email = 'kenny@biznct.com' LIMIT 1)
WHERE email = 'kenny@biznct.com' AND role = 'ceo';

-- Link Marcus (Sales)
UPDATE crm_members 
SET user_id = (SELECT id FROM auth.users WHERE email = 'marcus@biznct.com' LIMIT 1)
WHERE email = 'marcus@biznct.com' AND role = 'sales';

-- Verify the links
SELECT m.display_name, m.email, m.role, m.user_id, u.email as auth_email
FROM crm_members m
LEFT JOIN auth.users u ON m.user_id = u.id;
