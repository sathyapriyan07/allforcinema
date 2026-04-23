-- Step 1: After signing up, run this to find your user ID:
SELECT id, email FROM auth.users;

-- Step 2: Copy your user ID and run (replace with your actual ID):
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-USER-ID-HERE';

-- Or if your email is already in auth.users:
-- Single query to update by email (run after you sign up):
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');