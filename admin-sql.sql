-- ============================================================
-- ADMIN PANEL — New Tables & Policies
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add columns to profiles for ban + role
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';

-- 2. site_settings — one row only
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name TEXT NOT NULL DEFAULT 'DentalEd Year 3',
  registration_enabled BOOLEAN NOT NULL DEFAULT true,
  welcome_message TEXT NOT NULL DEFAULT 'Access your subjects, review materials, and stay ahead.',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT NOT NULL DEFAULT 'The platform is under maintenance. Please check back soon.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_settings"  ON public.site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_settings" ON public.site_settings FOR ALL   TO authenticated USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 3. admin_log — activity log
CREATE TABLE IF NOT EXISTS public.admin_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,   -- 'student' | 'content' | 'question' | 'announcement' | 'settings' | 'admin'
  target_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.admin_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_read_log"   ON public.admin_log FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');
CREATE POLICY "admin_insert_log" ON public.admin_log FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');

-- 4. Add scheduled_at + expires_at to announcements
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 5. Allow admin to read ALL profiles (for student management)
CREATE POLICY "admin_read_profiles" ON public.profiles 
  FOR SELECT TO authenticated 
  USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com' OR auth.uid() = id);

CREATE POLICY "admin_update_profiles" ON public.profiles 
  FOR UPDATE TO authenticated 
  USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');

CREATE POLICY "admin_delete_profiles" ON public.profiles 
  FOR DELETE TO authenticated 
  USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com');

-- 6. Allow admin to read all quiz_attempts
CREATE POLICY "admin_read_attempts" ON public.quiz_attempts
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' = 'tahacabello3@gmail.com' OR auth.uid() = student_id);
