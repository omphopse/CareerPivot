// Career Pilot - AI Career Pivot Coach Types

export type StrengthLevel = 'strong' | 'moderate' | 'weak' | 'missing';
export type MatchCategory = 'match' | 'gap' | 'weak_evidence';

export interface SkillItem {
  id: string;
  skill: string;
  category: 'Core Language' | 'Framework & Architecture' | 'Data & Messaging' | 'Cloud & DevOps' | 'System Design' | 'Testing & Quality';
  importance: 'Required' | 'Preferred' | 'Bonus';
  strengthLevel: StrengthLevel;
  matchCategory: MatchCategory;
  resumeEvidence: string;
  jdRequirement: string;
  actionItem?: string;
}

export interface InterviewFocusArea {
  category: string;
  priority: 'High' | 'Medium' | 'Critical';
  description: string;
  sampleQuestions: string[];
}

export interface CareerDiagnosisResult {
  id: string;
  createdAt: string;
  targetRole: string;
  targetCompany: string;
  roleFitScore: number;
  matchPercentage: number;
  gapPercentage: number;
  summary: string;
  parityExplanation: string;
  matchedSkills: SkillItem[];
  gapSkills: SkillItem[];
  weakEvidenceSkills: SkillItem[];
  interviewFocusAreas: InterviewFocusArea[];
}

export interface SprintTask {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'concept' | 'build' | 'practice' | 'quiz' | 'review';
  completed: boolean;
  deliverable: string;
  resource?: {
    title: string;
    url: string;
  };
}

export interface DailyQuiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  userSelectedIndex?: number;
  passed?: boolean;
}

export interface SprintDay {
  dayNumber: number;
  theme: string;
  goal: string;
  completed: boolean;
  tasks: SprintTask[];
  quiz: DailyQuiz;
  isNewlyAdded?: boolean;
}

export interface AdaptiveLog {
  id: string;
  timestamp: string;
  reason: string;
  changeSummary: string;
  affectedSkills: string[];
}

export interface SprintPlan {
  id: string;
  targetRole: string;
  currentDay: number;
  totalDays: number;
  durationRationale?: string;
  days: SprintDay[];
  masteryScores: Record<string, number>;
  adaptiveLogs: AdaptiveLog[];
}

export interface InterviewQuestion {
  id: string;
  role: string;
  category: string;
  difficulty: 'Mid' | 'Senior' | 'Lead';
  question: string;
  context: string;
  keyPointsExpected: string[];
}

export interface RubricBreakdown {
  technicalDepth: number;
  systemArchitecture: number;
  clarity: number;
  evidenceAndExamples: number;
}

export interface InterviewEvaluation {
  id: string;
  questionId: string;
  questionText: string;
  userAnswer: string;
  score: number;
  verdict: 'Pass' | 'Needs Improvement' | 'Critical Gap';
  rubrics: RubricBreakdown;
  strongPoints: string[];
  improvementAreas: string[];
  weakTopics: string[];
  suggestedAnswer: string;
  createdAt: string;
}

export type ApplicationStatus = 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  status: ApplicationStatus;
  fitScore: number;
  jobUrl: string;
  nextAction: string;
  followUpDate: string;
  notes: string;
  dateAdded: string;
}

export interface DashboardStats {
  roleFitScore: number;
  skillsMastered: number;
  activeGapCount: number;
  sprintProgressPercentage: number;
  totalApplications: number;
  activeInterviews: number;
  interviewAverageScore: number;
  dayStreak: number;
}
