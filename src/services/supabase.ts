import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  CareerDiagnosisResult,
  SprintPlan,
  InterviewEvaluation,
  JobApplication
} from '../types';

const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Application Supabase configuration strictly driven by environment
export const getSupabaseConfig = () => {
  return {
    url: envSupabaseUrl,
    key: envSupabaseKey
  };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
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
  activeUserId: null as string | null,

  setUserId(userId: string | null) {
    this.activeUserId = userId;
  },

  getStorageKeys(userId?: string) {
    const id = userId || this.activeUserId;
    const prefix = id ? `cp_${id}_` : 'cp_';
    return {
      DIAGNOSIS: `${prefix}diagnosis_data`,
      SPRINT_PLAN: `${prefix}sprint_plan_data`,
      INTERVIEWS: `${prefix}interviews_data`,
      APPLICATIONS: `${prefix}applications_data`,
      QUESTIONS: `${prefix}questions_data`,
      ANSWERS: `${prefix}interview_answers`
    };
  },

  // Diagnosis
  async saveDiagnosis(diagnosis: CareerDiagnosisResult, userId?: string): Promise<void> {
    const uid = userId || this.activeUserId;
    const keys = this.getStorageKeys(uid || undefined);
    localStorage.setItem(keys.DIAGNOSIS, JSON.stringify(diagnosis));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('analyses').upsert({
          id: diagnosis.id,
          user_id: uid,
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
        console.warn('Supabase save diagnosis error (falling back to local):', e);
      }
    }
  },

  getDiagnosis(userId?: string): CareerDiagnosisResult | null {
    const keys = this.getStorageKeys(userId);
    const raw = localStorage.getItem(keys.DIAGNOSIS);
    return raw ? JSON.parse(raw) : null;
  },

  // Sprint Plan
  async saveSprintPlan(plan: SprintPlan, userId?: string): Promise<void> {
    const uid = userId || this.activeUserId;
    const keys = this.getStorageKeys(uid || undefined);
    localStorage.setItem(keys.SPRINT_PLAN, JSON.stringify(plan));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('sprint_plans').upsert({
          id: plan.id,
          user_id: uid,
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

  getSprintPlan(userId?: string): SprintPlan | null {
    const keys = this.getStorageKeys(userId);
    const raw = localStorage.getItem(keys.SPRINT_PLAN);
    return raw ? JSON.parse(raw) : null;
  },

  // Interview History
  async saveInterviewEvaluation(evaluation: InterviewEvaluation, userId?: string): Promise<void> {
    const uid = userId || this.activeUserId;
    const current = this.getInterviewEvaluations(uid || undefined);
    const updated = [evaluation, ...current.filter((e) => e.id !== evaluation.id)];
    const keys = this.getStorageKeys(uid || undefined);
    localStorage.setItem(keys.INTERVIEWS, JSON.stringify(updated));

    const currentDiag = this.getDiagnosis(uid || undefined);
    const targetRole = currentDiag?.targetRole || 'Technical Interview Practice';

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('mock_interviews').upsert({
          id: evaluation.id,
          user_id: uid,
          target_role: targetRole,
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

  getInterviewEvaluations(userId?: string): InterviewEvaluation[] {
    const keys = this.getStorageKeys(userId);
    const raw = localStorage.getItem(keys.INTERVIEWS);
    return raw ? JSON.parse(raw) : [];
  },

  // Job Applications
  async saveJobApplications(apps: JobApplication[], userId?: string): Promise<void> {
    const uid = userId || this.activeUserId;
    const keys = this.getStorageKeys(uid || undefined);
    localStorage.setItem(keys.APPLICATIONS, JSON.stringify(apps));

    const client = getSupabaseClient();
    if (client) {
      try {
        for (const app of apps) {
          await client.from('job_applications').upsert({
            id: app.id,
            user_id: uid,
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

  async deleteJobApplication(appId: string, userId?: string): Promise<void> {
    const uid = userId || this.activeUserId;
    const keys = this.getStorageKeys(uid || undefined);
    const existing = this.getJobApplications(uid || undefined);
    const updated = existing.filter((a) => a.id !== appId);
    localStorage.setItem(keys.APPLICATIONS, JSON.stringify(updated));

    const client = getSupabaseClient();
    if (client && uid) {
      try {
        await client.from('job_applications').delete().eq('id', appId).eq('user_id', uid);
      } catch (e) {
        console.warn('Supabase delete application error:', e);
      }
    }
  },

  async fetchJobApplicationsFromRemote(userId?: string): Promise<JobApplication[] | null> {
    const uid = userId || this.activeUserId;
    const client = getSupabaseClient();
    if (!client || !uid) return null;

    try {
      const { data, error } = await client
        .from('job_applications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch applications error:', error);
        return null;
      }

      if (data && Array.isArray(data)) {
        return data.map((row) => ({
          id: row.id,
          company: row.company,
          role: row.role,
          location: row.location || 'Remote',
          salary: row.salary_range || '$150,000 - $185,000',
          status: row.status as any,
          fitScore: row.fit_score ?? 70,
          jobUrl: row.job_url || '#',
          nextAction: row.next_action || '',
          followUpDate: row.follow_up_date || '',
          notes: row.notes || '',
          dateAdded: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
        }));
      }
      return null;
    } catch (e) {
      console.warn('Failed to fetch applications from Supabase:', e);
      return null;
    }
  },

  getJobApplications(userId?: string): JobApplication[] {
    const keys = this.getStorageKeys(userId);
    const raw = localStorage.getItem(keys.APPLICATIONS);
    return raw ? JSON.parse(raw) : [];
  },

  // Dynamic Interview Questions
  saveInterviewQuestions(questions: any[], userId?: string): void {
    const keys = this.getStorageKeys(userId);
    localStorage.setItem(keys.QUESTIONS, JSON.stringify(questions));
  },

  getInterviewQuestions(userId?: string): any[] {
    const keys = this.getStorageKeys(userId);
    const raw = localStorage.getItem(keys.QUESTIONS);
    return raw ? JSON.parse(raw) : [];
  },

  // Answers per question
  saveInterviewAnswers(answers: Record<string, string>, userId?: string): void {
    const keys = this.getStorageKeys(userId);
    localStorage.setItem(keys.ANSWERS, JSON.stringify(answers));
  },

  getInterviewAnswers(userId?: string): Record<string, string> {
    const keys = this.getStorageKeys(userId);
    const raw = localStorage.getItem(keys.ANSWERS);
    return raw ? JSON.parse(raw) : {};
  },

  // Reset/Clear Pivot Session for the user (retains historical job applications CRM)
  clearPivotData(userId?: string): void {
    const keys = this.getStorageKeys(userId);
    localStorage.removeItem(keys.DIAGNOSIS);
    localStorage.removeItem(keys.SPRINT_PLAN);
    localStorage.removeItem(keys.INTERVIEWS);
    // Preserved: keys.APPLICATIONS is intentionally kept so candidate's job tracking history is never lost!
    localStorage.removeItem(keys.QUESTIONS);
    localStorage.removeItem(keys.ANSWERS);
  },

  // Clear all data including job applications (only for explicit Settings factory reset)
  clearAllData(userId?: string): void {
    const keys = this.getStorageKeys(userId);
    localStorage.removeItem(keys.DIAGNOSIS);
    localStorage.removeItem(keys.SPRINT_PLAN);
    localStorage.removeItem(keys.INTERVIEWS);
    localStorage.removeItem(keys.APPLICATIONS);
    localStorage.removeItem(keys.QUESTIONS);
    localStorage.removeItem(keys.ANSWERS);
  }
};
