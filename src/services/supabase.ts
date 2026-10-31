import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  CareerDiagnosisResult,
  SprintPlan,
  InterviewEvaluation,
  JobApplication
} from '../types';

const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Let user configure Supabase from Settings modal or environment
export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('career_pilot_supabase_url');
  const customKey = localStorage.getItem('career_pilot_supabase_key');
  return {
    url: customUrl || envSupabaseUrl,
    key: customKey || envSupabaseKey
  };
};

export const setSupabaseConfig = (url: string, key: string) => {
  if (url) localStorage.setItem('career_pilot_supabase_url', url);
  else localStorage.removeItem('career_pilot_supabase_url');

  if (key) localStorage.setItem('career_pilot_supabase_key', key);
  else localStorage.removeItem('career_pilot_supabase_key');
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, key);
    }
    return supabaseInstance;
  } catch (err) {
    console.warn('Supabase initialization error:', err);
    return null;
  }
};

export const isSupabaseConnected = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
};

const STORAGE_KEYS = {
  DIAGNOSIS: 'cp_diagnosis_data',
  SPRINT_PLAN: 'cp_sprint_plan_data',
  INTERVIEWS: 'cp_interviews_data',
  APPLICATIONS: 'cp_applications_data',
  QUESTIONS: 'cp_questions_data',
  ANSWERS: 'cp_interview_answers'
};

export const storageService = {
  // Diagnosis
  async saveDiagnosis(diagnosis: CareerDiagnosisResult): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.DIAGNOSIS, JSON.stringify(diagnosis));
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('analyses').upsert({
          id: diagnosis.id,
          target_role: diagnosis.targetRole,
          target_company: diagnosis.targetCompany,
          resume_text: 'stored',
          job_description_text: 'stored',
          role_fit_score: diagnosis.roleFitScore,
          match_percentage: diagnosis.matchPercentage,
          gap_percentage: diagnosis.gapPercentage,
          summary_explanation: diagnosis.summary,
          matched_skills: diagnosis.matchedSkills,
          gap_skills: diagnosis.gapSkills,
          weak_evidence_skills: diagnosis.weakEvidenceSkills,
          interview_focus_areas: diagnosis.interviewFocusAreas
        });
      } catch (e) {
        console.warn('Supabase save error (falling back to local):', e);
      }
    }
  },

  getDiagnosis(): CareerDiagnosisResult | null {
    const raw = localStorage.getItem(STORAGE_KEYS.DIAGNOSIS);
    return raw ? JSON.parse(raw) : null;
  },

  // Sprint Plan
  async saveSprintPlan(plan: SprintPlan): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SPRINT_PLAN, JSON.stringify(plan));
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('sprint_plans').upsert({
          id: plan.id,
          target_role: plan.targetRole,
          current_day: plan.currentDay,
          days: plan.days,
          mastery_scores: plan.masteryScores,
          adaptive_logs: plan.adaptiveLogs
        });
      } catch (e) {
        console.warn('Supabase save sprint error (falling back to local):', e);
      }
    }
  },

  getSprintPlan(): SprintPlan | null {
    const raw = localStorage.getItem(STORAGE_KEYS.SPRINT_PLAN);
    return raw ? JSON.parse(raw) : null;
  },

  // Interview History
  async saveInterviewEvaluation(evaluation: InterviewEvaluation): Promise<void> {
    const current = this.getInterviewEvaluations();
    const updated = [evaluation, ...current.filter((e) => e.id !== evaluation.id)];
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(updated));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('mock_interviews').insert({
          id: evaluation.id,
          target_role: 'Senior Java Backend Engineer',
          question_text: evaluation.questionText,
          category: 'Interview Practice',
          user_answer: evaluation.userAnswer,
          score: evaluation.score,
          feedback: evaluation.rubrics,
          weak_topics: evaluation.weakTopics
        });
      } catch (e) {
        console.warn('Supabase save mock interview error:', e);
      }
    }
  },

  getInterviewEvaluations(): InterviewEvaluation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    return raw ? JSON.parse(raw) : [];
  },

  // Job Applications
  async saveJobApplications(apps: JobApplication[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    const client = getSupabaseClient();
    if (client) {
      try {
        // Upsert all applications
        for (const app of apps) {
          await client.from('job_applications').upsert({
            id: app.id,
            company: app.company,
            role: app.role,
            location: app.location,
            salary_range: app.salary,
            status: app.status,
            job_url: app.jobUrl,
            next_action: app.nextAction,
            follow_up_date: app.followUpDate || null,
            fit_score: app.fitScore,
            notes: app.notes
          });
        }
      } catch (e) {
        console.warn('Supabase save applications error:', e);
      }
    }
  },

  getJobApplications(): JobApplication[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    return raw ? JSON.parse(raw) : [];
  },

  // Dynamic Interview Questions
  saveInterviewQuestions(questions: any[]): void {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  },

  getInterviewQuestions(): any[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return raw ? JSON.parse(raw) : [];
  },

  // Answers per question
  saveInterviewAnswers(answers: Record<string, string>): void {
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
  },

  getInterviewAnswers(): Record<string, string> {
    const raw = localStorage.getItem(STORAGE_KEYS.ANSWERS);
    return raw ? JSON.parse(raw) : {};
  },

  // Reset/Clear Pivot Session
  clearPivotData(): void {
    localStorage.removeItem(STORAGE_KEYS.DIAGNOSIS);
    localStorage.removeItem(STORAGE_KEYS.SPRINT_PLAN);
    localStorage.removeItem(STORAGE_KEYS.INTERVIEWS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.ANSWERS);
  }
};
