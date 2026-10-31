-- Career Pilot - AI Career Pivot Coach
-- Supabase PostgreSQL Database Schema
-- Provides tables for Profiles, Analyses, Sprint Plans, Mock Interviews, and Job Applications

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    current_role TEXT DEFAULT 'Full Stack Developer',
    target_role TEXT DEFAULT 'Senior Java Backend Engineer',
    target_company TEXT DEFAULT 'FinTech Unicorn / Enterprise Platform',
    experience_years INT DEFAULT 3
);

-- 2. Resume & JD Analyses Table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    target_company TEXT,
    resume_text TEXT NOT NULL,
    job_description_text TEXT NOT NULL,
    role_fit_score INT NOT NULL DEFAULT 68,
    match_percentage INT NOT NULL DEFAULT 70,
    gap_percentage INT NOT NULL DEFAULT 30,
    summary_explanation TEXT NOT NULL,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    gap_skills JSONB DEFAULT '[]'::jsonb,
    weak_evidence_skills JSONB DEFAULT '[]'::jsonb,
    interview_focus_areas JSONB DEFAULT '[]'::jsonb
);

-- 3. 7-Day Sprint Plans & Dynamic Mastery Table
CREATE TABLE IF NOT EXISTS public.sprint_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
    target_role TEXT NOT NULL,
    current_day INT DEFAULT 1,
    total_progress INT DEFAULT 0,
    days JSONB NOT NULL DEFAULT '[]'::jsonb,
    mastery_scores JSONB DEFAULT '{}'::jsonb,
    adaptive_logs JSONB DEFAULT '[]'::jsonb
);

-- 4. Mock Interview Practice & AI Graded Feedback Table
CREATE TABLE IF NOT EXISTS public.mock_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    question_text TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Senior',
    user_answer TEXT,
    score INT DEFAULT 0,
    feedback JSONB DEFAULT '{}'::jsonb,
    weak_topics JSONB DEFAULT '[]'::jsonb,
    triggered_sprint_update BOOLEAN DEFAULT FALSE
);

-- 5. Job Applications CRM Tracker Table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT DEFAULT 'Remote / Hybrid',
    salary_range TEXT,
    status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('wishlist', 'applied', 'interviewing', 'offer', 'rejected')),
    job_url TEXT,
    next_action TEXT,
    follow_up_date DATE,
    fit_score INT DEFAULT 75,
    notes TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprint_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated Policies for Hackathon Demo Simplicity
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read analyses" ON public.analyses FOR SELECT USING (true);
CREATE POLICY "Allow public insert analyses" ON public.analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update analyses" ON public.analyses FOR UPDATE USING (true);

CREATE POLICY "Allow public read sprint_plans" ON public.sprint_plans FOR SELECT USING (true);
CREATE POLICY "Allow public insert sprint_plans" ON public.sprint_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update sprint_plans" ON public.sprint_plans FOR UPDATE USING (true);

CREATE POLICY "Allow public read mock_interviews" ON public.mock_interviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert mock_interviews" ON public.mock_interviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read job_applications" ON public.job_applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert job_applications" ON public.job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update job_applications" ON public.job_applications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete job_applications" ON public.job_applications FOR DELETE USING (true);
