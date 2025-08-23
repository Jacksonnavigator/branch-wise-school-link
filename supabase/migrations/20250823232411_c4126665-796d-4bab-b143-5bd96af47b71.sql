-- Insert demo notifications for all existing users
INSERT INTO public.notifications (title, message, type, recipient_id, branch_id)
SELECT 
  'Welcome to EduManager Pro!' as title,
  'Your notifications system is now active. You can receive important updates about students, fees, and system announcements here.' as message,
  'success' as type,
  u.id as recipient_id,
  COALESCE(u.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) as branch_id
FROM users u
WHERE u.id IS NOT NULL;