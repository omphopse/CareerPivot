import type {
  CareerDiagnosisResult,
  SprintPlan,
  InterviewEvaluation,
  InterviewQuestion,
  AdaptiveLog,
  SkillItem,
  InterviewFocusArea,
  SprintDay
} from '../types';

const envGeminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

export const getGeminiApiKey = (): string => {
  return localStorage.getItem('career_pilot_gemini_key') || envGeminiKey;
};

export const setGeminiApiKey = (key: string): void => {
  if (key) localStorage.setItem('career_pilot_gemini_key', key);
  else localStorage.removeItem('career_pilot_gemini_key');
};

export const hasGeminiApiKey = (): boolean => {
  return Boolean(getGeminiApiKey().trim());
};

// Helper to call Gemini REST API with fallback models
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // Supported models in priority order
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastError = new Error(errJson?.error?.message || `Status ${response.status}`);
      }
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API');
}

export const aiService = {
  /**
   * 1. Forensic Career Diagnosis: Audits live Resume against live Job Description
   */
  async analyzeRoleFit(
    resumeText: string,
    jobDescriptionText: string,
    manualRole?: string,
    manualCompany?: string
  ): Promise<CareerDiagnosisResult> {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return generateSyntheticDiagnosis(resumeText, jobDescriptionText, manualRole, manualCompany);
    }

    try {
      const systemInstruction = `You are an elite Tech Career Coach & Staff Technical Recruiter at top tier tech companies.
Your job is to thoroughly and forensically audit a candidate's resume against a targeted Job Description (JD).
Extract the actual target role, target company, location/work mode, and realistic salary range from the JD.
Detect skill parity, missing evidence, and critical competency gaps based strictly on the uploaded text.
Return ONLY valid JSON matching this schema:
{
  "targetRole": string,
  "targetCompany": string,
  "location": string,
  "salary": string,
  "roleFitScore": number (0-100),
  "matchPercentage": number,
  "gapPercentage": number,
  "summary": string,
  "parityExplanation": string,
  "matchedSkills": [
    {
      "id": string,
      "skill": string,
      "category": "Core Language" | "Framework & Architecture" | "Data & Messaging" | "Cloud & DevOps" | "System Design" | "Testing & Quality",
      "importance": "Required" | "Preferred" | "Bonus",
      "strengthLevel": "strong" | "moderate",
      "matchCategory": "match",
      "resumeEvidence": string (exact quotes or references from resume),
      "jdRequirement": string
    }
  ],
  "gapSkills": [
    {
      "id": string,
      "skill": string,
      "category": "Core Language" | "Framework & Architecture" | "Data & Messaging" | "Cloud & DevOps" | "System Design" | "Testing & Quality",
      "importance": "Required" | "Preferred",
      "strengthLevel": "missing",
      "matchCategory": "gap",
      "resumeEvidence": string (explanation of why missing or unverified),
      "jdRequirement": string,
      "actionItem": string (concrete 1-sentence action to bridge this)
    }
  ],
  "weakEvidenceSkills": [
    {
      "id": string,
      "skill": string,
      "category": "Core Language" | "Framework & Architecture" | "Data & Messaging" | "Cloud & DevOps" | "System Design" | "Testing & Quality",
      "importance": "Required" | "Preferred",
      "strengthLevel": "weak",
      "matchCategory": "weak_evidence",
      "resumeEvidence": string,
      "jdRequirement": string,
      "actionItem": string
    }
  ],
  "interviewFocusAreas": [
    {
      "category": string,
      "priority": "Critical" | "High" | "Medium",
      "description": string,
      "sampleQuestions": [string, string]
    }
  ]
}`;

      const prompt = `CANDIDATE RESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jobDescriptionText}\n\nPerform a forensic comparison. Evaluate the candidate's actual demonstrated evidence against the JD requirements.`;
      const rawJson = await callGemini(prompt, systemInstruction);
      const parsed = JSON.parse(rawJson);

      const targetCompany = manualCompany && manualCompany.trim()
        ? manualCompany.trim()
        : (parsed.targetCompany && parsed.targetCompany !== 'Target Company' ? parsed.targetCompany : extractCompany(jobDescriptionText, manualCompany));

      const targetRole = manualRole && manualRole.trim()
        ? manualRole.trim()
        : (parsed.targetRole && parsed.targetRole !== 'Target Role' ? parsed.targetRole : extractRole(jobDescriptionText, manualRole));

      const location = parsed.location || extractLocation(jobDescriptionText);
      const salary = parsed.salary || extractSalary(jobDescriptionText, targetRole);

      return {
        id: `diag-${Date.now()}`,
        createdAt: new Date().toISOString(),
        targetRole,
        targetCompany,
        roleFitScore: typeof parsed.roleFitScore === 'number' ? parsed.roleFitScore : 65,
        matchPercentage: typeof parsed.matchPercentage === 'number' ? parsed.matchPercentage : 60,
        gapPercentage: typeof parsed.gapPercentage === 'number' ? parsed.gapPercentage : 40,
        summary: parsed.summary || `Forensic evaluation comparing candidate resume against ${targetCompany} requirements for ${targetRole}.`,
        parityExplanation: parsed.parityExplanation || `Audit of resume evidence against ${targetRole} job requirements.`,
        matchedSkills: parsed.matchedSkills || [],
        gapSkills: parsed.gapSkills || [],
        weakEvidenceSkills: parsed.weakEvidenceSkills || [],
        interviewFocusAreas: parsed.interviewFocusAreas || [],
        location,
        salary
      };
    } catch (err) {
      console.warn('Gemini analysis error, falling back to heuristic engine:', err);
      return generateSyntheticDiagnosis(resumeText, jobDescriptionText, manualRole, manualCompany);
    }
  },

  /**
   * 2. Personalized Variable-Duration Sprint Plan Generator:
   * Dynamically calculates how many days are required based on the depth of the candidate's gaps!
   */
  async generatePersonalizedSprintPlan(
    targetRole: string,
    targetCompany: string,
    gapSkills: SkillItem[],
    matchedSkills: SkillItem[]
  ): Promise<SprintPlan> {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return generateSyntheticSprintPlan(targetRole, gapSkills, matchedSkills);
    }

    try {
      const systemInstruction = `You are a Principal Engineering Career Mentor.
Given a candidate's target role, target company, and their specific identified skill gaps, determine how many days the candidate realistically needs to bridge these gaps without superficial rushing:
- If 1-2 minor gaps: 5 to 7 days
- If 3-4 significant gaps: 10 to 14 days
- If 5+ critical gaps or a major pivot: 14 to 21 (or up to 28) days!

Provide a variable-day sprint plan. Each day must have:
- dayNumber (1 to totalDays)
- theme (concise and milestone-driven)
- goal (clear 1-sentence sprint objective)
- tasks: 2 to 3 actionable tasks (duration, type: 'concept'|'build'|'practice'|'quiz'|'review', concrete deliverable, resource)
- quiz: authentic conceptual multiple-choice quiz with 4 options, correctIndex (0-3), and explanation.

Return ONLY valid JSON matching this schema:
{
  "targetRole": string,
  "totalDays": number,
  "durationRationale": string (clear explanation of why this duration was calculated based on the candidate's gap count and complexity),
  "masteryScores": { [skillName: string]: number (0-100) },
  "days": [
    {
      "dayNumber": number,
      "theme": string,
      "goal": string,
      "completed": false,
      "tasks": [
        {
          "id": string,
          "title": string,
          "description": string,
          "duration": string,
          "type": "concept" | "build" | "practice" | "quiz" | "review",
          "completed": false,
          "deliverable": string,
          "resource": {
            "title": string,
            "url": string
          }
        }
      ],
      "quiz": {
        "id": string,
        "question": string,
        "options": [string, string, string, string],
        "correctIndex": number (0 to 3),
        "explanation": string
      }
    }
  ]
}`;

      const prompt = `TARGET ROLE: ${targetRole}
TARGET COMPANY: ${targetCompany}

IDENTIFIED CRITICAL SKILL GAPS (${gapSkills.length} Total):
${gapSkills.map((g) => `- ${g.skill} (${g.category}): ${g.actionItem || g.jdRequirement}`).join('\n')}

VERIFIED CANDIDATE STRENGTHS:
${matchedSkills.map((m) => `- ${m.skill}`).join('\n')}

Determine the required sprint duration in days and build the complete variable-day sprint plan.`;

      const rawJson = await callGemini(prompt, systemInstruction);
      const parsed = JSON.parse(rawJson);

      const daysArray: SprintDay[] = Array.isArray(parsed.days) && parsed.days.length > 0
        ? parsed.days
        : generateSyntheticSprintPlan(targetRole, gapSkills, matchedSkills).days;

      const totalDays = parsed.totalDays || daysArray.length;

      return {
        id: `sprint-${Date.now()}`,
        targetRole: parsed.targetRole || targetRole,
        currentDay: 1,
        totalDays,
        durationRationale: parsed.durationRationale || `Calibrated a ${totalDays}-day sprint based on ${gapSkills.length} identified competency gaps.`,
        masteryScores: parsed.masteryScores || initializeMastery(gapSkills, matchedSkills),
        adaptiveLogs: [
          {
            id: `log-init-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reason: `Adaptive Sprint initialized for ${targetRole}`,
            changeSummary: `Dynamically calibrated ${totalDays}-day curriculum based on ${gapSkills.length} detected skill gaps.`,
            affectedSkills: gapSkills.map((g) => g.skill).slice(0, 4)
          }
        ],
        days: daysArray
      };
    } catch (err) {
      console.warn('Gemini sprint generation error, falling back:', err);
      return generateSyntheticSprintPlan(targetRole, gapSkills, matchedSkills);
    }
  },

  /**
   * 3. Role-Specific Interview Questions Generator
   */
  async generateRoleInterviewQuestions(
    targetRole: string,
    gapSkills: SkillItem[],
    focusAreas: InterviewFocusArea[]
  ): Promise<InterviewQuestion[]> {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return generateSyntheticInterviewQuestions(targetRole, gapSkills);
    }

    try {
      const systemInstruction = `You are a Principal Engineer and Bar Raiser Interviewer.
Generate 3 realistic, probing technical interview questions for a candidate targeting: ${targetRole}.
Focus on their weak areas: ${gapSkills.map((g) => g.skill).join(', ')}.
Return ONLY valid JSON matching this schema:
[
  {
    "id": string,
    "role": string,
    "category": string,
    "difficulty": "Mid" | "Senior" | "Lead",
    "question": string,
    "context": string,
    "keyPointsExpected": [string, string, string, string]
  }
]`;

      const prompt = `Generate 3 role-specific technical interview questions for: ${targetRole}. Focus on: ${focusAreas.map((f) => f.category).join(', ')}.`;
      const rawJson = await callGemini(prompt, systemInstruction);
      const parsed = JSON.parse(rawJson);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q, idx) => ({
          ...q,
          id: q.id || `iq-${Date.now()}-${idx}`
        }));
      }
      return generateSyntheticInterviewQuestions(targetRole, gapSkills);
    } catch (err) {
      console.warn('Gemini interview question generation error, falling back:', err);
      return generateSyntheticInterviewQuestions(targetRole, gapSkills);
    }
  },

  /**
   * 4. AI Interview Coach: Evaluate candidate's real answer with consistent rubrics
   */
  async evaluateInterviewAnswer(
    question: InterviewQuestion,
    userAnswer: string
  ): Promise<InterviewEvaluation> {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return generateSyntheticEvaluation(question, userAnswer);
    }

    try {
      const systemInstruction = `You are a Principal Software Engineer evaluating a candidate in a technical interview round for: ${question.role}.
Grade the candidate's answer based on technical accuracy, edge cases, system architecture, and senior engineering depth.
Return ONLY valid JSON matching this schema:
{
  "score": number (0-100),
  "verdict": "Pass" | "Needs Improvement" | "Critical Gap",
  "rubrics": {
    "technicalDepth": number (0-100),
    "systemArchitecture": number (0-100),
    "clarity": number (0-100),
    "evidenceAndExamples": number (0-100)
  },
  "strongPoints": [string, string],
  "improvementAreas": [string, string, string],
  "weakTopics": [string, string],
  "suggestedAnswer": string
}`;

      const prompt = `QUESTION:
${question.question}

CONTEXT & EXPECTED KEY POINTS:
${question.keyPointsExpected.join('\n')}

CANDIDATE ANSWER:
"${userAnswer}"

Evaluate rigorously. If the answer is superficial, suggests anti-patterns, or misses critical engineering nuances, assign low marks and flag specific weak topics.`;

      const rawJson = await callGemini(prompt, systemInstruction);
      const parsed = JSON.parse(rawJson);

      return {
        id: `eval-${Date.now()}`,
        questionId: question.id,
        questionText: question.question,
        userAnswer,
        score: parsed.score ?? 50,
        verdict: parsed.verdict || (parsed.score >= 75 ? 'Pass' : parsed.score >= 50 ? 'Needs Improvement' : 'Critical Gap'),
        rubrics: parsed.rubrics || {
          technicalDepth: parsed.score || 50,
          systemArchitecture: parsed.score || 50,
          clarity: 60,
          evidenceAndExamples: 50
        },
        strongPoints: parsed.strongPoints || ['Addressed the general context of the question'],
        improvementAreas: parsed.improvementAreas || ['Needs more concrete production metrics and failure handling'],
        weakTopics: parsed.weakTopics || [question.category],
        suggestedAnswer: parsed.suggestedAnswer || 'A senior answer explains exact architectural flow, error handling, and trade-offs.',
        createdAt: new Date().toISOString()
      };
    } catch (err) {
      console.warn('Gemini evaluation error, using fallback:', err);
      return generateSyntheticEvaluation(question, userAnswer);
    }
  },

  /**
   * 5. Adaptive Learning Engine: Recalibrates AND Extends Sprint Plan
   * If the sprint schedule is too tight to fit remedial work into existing days,
   * it dynamically appends a brand new remedial day to the sprint!
   */
  recalibrateSprintPlan(
    currentPlan: SprintPlan,
    evaluation: InterviewEvaluation
  ): SprintPlan {
    const updatedMastery = { ...currentPlan.masteryScores };
    const affectedSkills: string[] = [];

    // Reduce mastery for weak topics
    evaluation.weakTopics.forEach((topic) => {
      const topicLower = topic.toLowerCase();
      let matchedKey = false;
      for (const key of Object.keys(updatedMastery)) {
        if (topicLower.includes(key.toLowerCase()) || key.toLowerCase().includes(topicLower)) {
          updatedMastery[key] = Math.max(15, (updatedMastery[key] || 50) - 15);
          if (!affectedSkills.includes(key)) affectedSkills.push(key);
          matchedKey = true;
        }
      }
      if (!matchedKey) {
        updatedMastery[topic] = 30;
        affectedSkills.push(topic);
      }
    });

    const primaryWeakness = evaluation.weakTopics[0] || 'Target Architecture';
    const newDayNumber = currentPlan.days.length + 1;

    // Create a brand new remedial day to prevent overloading the current schedule
    const remedialDay: SprintDay = {
      dayNumber: newDayNumber,
      theme: `⚡ EXTENDED SPRINT: Remedial Mastery in ${primaryWeakness}`,
      goal: `Dynamically added from Mock Interview evaluation (Score: ${evaluation.score}/100): Deep dive and implementation lab for ${primaryWeakness}.`,
      completed: false,
      isNewlyAdded: true,
      tasks: [
        {
          id: `adapt-t-${Date.now()}-1`,
          title: `Architectural Deep Dive: ${primaryWeakness}`,
          description: `Study root cause principles, failure modes, and architectural trade-offs addressing: "${evaluation.improvementAreas[0] || primaryWeakness}".`,
          duration: '45 min',
          type: 'concept',
          completed: false,
          deliverable: `Technical summary notes and architecture diagram for ${primaryWeakness}.`,
          resource: {
            title: `${primaryWeakness} Guide & Architecture`,
            url: 'https://github.com'
          }
        },
        {
          id: `adapt-t-${Date.now()}-2`,
          title: `Hands-On Lab: Build Proof-of-Concept for ${primaryWeakness}`,
          description: `Implement the recommended pattern: "${evaluation.suggestedAnswer.substring(0, 100)}..." with unit test verification.`,
          duration: '60 min',
          type: 'build',
          completed: false,
          deliverable: `Working code implementation verifying error handling and edge cases.`,
          resource: {
            title: 'Hands-on Repository Lab',
            url: 'https://github.com'
          }
        },
        {
          id: `adapt-t-${Date.now()}-3`,
          title: `Interview Retest Practice: ${primaryWeakness}`,
          description: `Practice articulating failure recovery, idempotency, and concurrency guarantees for ${primaryWeakness}.`,
          duration: '30 min',
          type: 'practice',
          completed: false,
          deliverable: `Answer scoring >80% on AI rubrics.`,
          resource: {
            title: 'Career Pilot Mock Simulator',
            url: '#'
          }
        }
      ],
      quiz: {
        id: `q-adapt-${Date.now()}`,
        question: `In production systems, what is the most critical pattern to resolve the weakness in ${primaryWeakness}?`,
        options: [
          `Adopt atomic operations, idempotency keys, and explicit transaction boundary management`,
          `Ignore exceptions and rely on default timeout mechanisms`,
          `Restart the application container whenever a network error occurs`,
          `Increase thread pool size without adding synchronization`
        ],
        correctIndex: 0,
        explanation: `Resolving deficits in ${primaryWeakness} requires rigorous architectural guarantees, explicit transaction boundaries, and idempotent processing.`
      }
    };

    const updatedDays = [...currentPlan.days, remedialDay];

    const newLog: AdaptiveLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reason: `Mock Interview revealed critical deficit in ${evaluation.weakTopics.join(', ')} (Score: ${evaluation.score}/100)`,
      changeSummary: `Sprint schedule was tight: Dynamically extended sprint from ${currentPlan.days.length} to ${newDayNumber} days by appending Day ${newDayNumber} ('${primaryWeakness} Remedial Mastery').`,
      affectedSkills: evaluation.weakTopics
    };

    return {
      ...currentPlan,
      totalDays: newDayNumber,
      days: updatedDays,
      masteryScores: updatedMastery,
      adaptiveLogs: [newLog, ...currentPlan.adaptiveLogs]
    };
  }
};

function initializeMastery(gapSkills: SkillItem[], matchedSkills: SkillItem[]): Record<string, number> {
  const scores: Record<string, number> = {};
  matchedSkills.forEach((m) => {
    scores[m.skill] = m.strengthLevel === 'strong' ? 85 : 70;
  });
  gapSkills.forEach((g) => {
    scores[g.skill] = 30;
  });
  return scores;
}

// Dynamic heuristic text extractors
export function extractCompany(jd: string, manualCompany?: string): string {
  if (manualCompany && manualCompany.trim() && manualCompany.trim().toLowerCase() !== 'target company') {
    return manualCompany.trim();
  }

  const jdClean = jd.trim();
  const explicitPatterns = [
    /(?:Company|Organization|Employer|Client|Hiring Entity):\s*([^\n\r,;|]+)/i,
    /(?:About|Life at|Join(?:ing)?)\s+([A-Z0-9][A-Za-z0-9&.\- ]{1,30})/i,
    /At\s+([A-Z0-9][A-Za-z0-9&.\- ]{1,30}),\s*(?:we|our|you)/i,
    /([A-Z0-9][A-Za-z0-9&.\- ]{1,30})\s+(?:is looking for|is hiring|is seeking|is an?|is proud)/i
  ];

  for (const pat of explicitPatterns) {
    const match = jdClean.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim().replace(/\s+(Pvt|Ltd|Inc|LLC|Corporation|Corp)\.?$/i, '').trim();
      if (candidate.length >= 2 && candidate.length <= 40 && !/^(the|a|an|job|role|this)$/i.test(candidate)) {
        return candidate;
      }
    }
  }

  const lines = jdClean.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < Math.min(4, lines.length); i++) {
    const line = lines[i].replace(/^#+\s*/, '').replace(/^[*\-\s]+/, '').trim();
    if (
      /^[A-Z][A-Za-z0-9&.\- ]{2,30}$/.test(line) &&
      !/engineer|developer|intern|manager|analyst|job|description|requirements|responsibilities|overview|about/i.test(line)
    ) {
      return line;
    }
  }

  return 'Target Employer';
}

export function extractRole(jd: string, manualRole?: string): string {
  if (manualRole && manualRole.trim() && manualRole.trim().toLowerCase() !== 'target role') {
    return manualRole.trim();
  }

  const jdClean = jd.trim();
  const explicitPatterns = [
    /(?:Job Title|Role|Position|Designation|Opening for):\s*([^\n\r,;|]+)/i,
    /(?:Hiring|Looking) for (?:a|an)?\s*([A-Za-z0-9\s\-/]+?)(?:\s*(?:to join|in|at|\n|\.|\,|$))/i
  ];

  for (const pat of explicitPatterns) {
    const match = jdClean.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (candidate.length >= 3 && candidate.length <= 60 && !/^(the|a|an|our)$/i.test(candidate)) {
        return candidate;
      }
    }
  }

  const lines = jdClean.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].replace(/^#+\s*/, '').replace(/^[*\-\s]+/, '').trim();
    if (
      /intern|engineer|developer|analyst|consultant|architect|specialist|lead|manager|designer|associate/i.test(line) &&
      line.length <= 60
    ) {
      return line.replace(/^(?:Role|Job Title|Position):\s*/i, '').trim();
    }
  }

  if (/customer engineer/i.test(jd)) return 'Customer Engineer';
  if (/full stack/i.test(jd)) return 'Full Stack Developer';
  if (/frontend|react/i.test(jd)) return 'Frontend Engineer';
  if (/backend|java|node|python|golang/i.test(jd)) return 'Backend Engineer';
  if (/data analyst|data scientist/i.test(jd)) return 'Data Analyst';
  if (/devops|cloud|sre/i.test(jd)) return 'DevOps / Cloud Engineer';

  return 'Software Engineer';
}

export function extractLocation(jd: string): string {
  const jdLower = jd.toLowerCase();
  let mode = '';
  if (jdLower.includes('remote') || jdLower.includes('work from anywhere') || jdLower.includes('wfh')) {
    mode = 'Remote';
  } else if (jdLower.includes('hybrid')) {
    mode = 'Hybrid';
  } else if (jdLower.includes('on-site') || jdLower.includes('onsite') || jdLower.includes('in-office')) {
    mode = 'On-site';
  }

  const cities = [
    'Bengaluru', 'Bangalore', 'Noida', 'Gurgaon', 'Gurugram', 'Delhi', 'NCR', 'Mumbai',
    'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'San Francisco', 'New York', 'Seattle',
    'Austin', 'London', 'Singapore'
  ];

  let detectedCity = '';
  for (const city of cities) {
    const regex = new RegExp(`\\b${city}\\b`, 'i');
    if (regex.test(jd)) {
      detectedCity = city === 'Bangalore' ? 'Bengaluru' : city === 'Gurgaon' ? 'Gurugram' : city;
      break;
    }
  }

  if (detectedCity && mode) {
    return mode === 'Remote' ? `${detectedCity} (Remote)` : `${detectedCity} / ${mode}`;
  }
  if (detectedCity) return `${detectedCity} (On-site)`;
  if (mode) return mode;

  return 'Remote / Hybrid';
}

export function extractSalary(jd: string, roleName: string): string {
  const explicitSalary = jd.match(/(?:salary|stipend|compensation|pay|ctc|package)\s*[:\-–]\s*([^\n\r;]{3,40})/i);
  if (explicitSalary && explicitSalary[1]) {
    const val = explicitSalary[1].trim();
    if (val.length >= 3 && !/^(competitive|negotiable|as per market|doe)$/i.test(val)) {
      return val;
    }
  }

  const inrMatches = jd.match(/(?:₹|INR|Rs\.?)\s*[\d,.]+(?:\s*[-–to]+\s*(?:₹|INR|Rs\.?)?\s*[\d,.]+)?\s*(?:LPA|lpa|Lacs?|Lakhs?|k|K|\/mo|\/month|PM)?/i);
  if (inrMatches && inrMatches[0]) {
    return inrMatches[0].trim();
  }

  const lpaMatches = jd.match(/(\b\d+(?:\.\d+)?\s*(?:[-–to]+\s*\d+(?:\.\d+)?\s*)?LPA\b)/i);
  if (lpaMatches && lpaMatches[0]) {
    return lpaMatches[0].trim();
  }

  const usdMatches = jd.match(/(?:\$|USD|€|£)\s*[\d,.]+(?:\s*[-–to]+\s*(?:\$|USD|€|£)?\s*[\d,.]+)?\s*(?:k|K|\/yr|\/year)?/i);
  if (usdMatches && usdMatches[0]) {
    return usdMatches[0].trim();
  }

  const roleLower = roleName.toLowerCase();
  if (roleLower.includes('intern') || roleLower.includes('trainee') || roleLower.includes('fellow')) {
    return '₹25,000 - ₹45,000 / month';
  }
  if (roleLower.includes('junior') || roleLower.includes('associate') || roleLower.includes('entry') || roleLower.includes('grad')) {
    return '₹6,00,000 - ₹9,50,000 / year';
  }
  if (roleLower.includes('lead') || roleLower.includes('staff') || roleLower.includes('principal') || roleLower.includes('director')) {
    return '$180,000 - $225,000';
  }
  if (roleLower.includes('senior')) {
    return '$145,000 - $175,000';
  }

  return '$110,000 - $135,000';
}

interface SkillCatalogItem {
  skill: string;
  category: 'Core Language' | 'Framework & Architecture' | 'Data & Messaging' | 'Cloud & DevOps' | 'System Design' | 'Testing & Quality';
  keywords: string[];
  actionItem: (role: string) => string;
}

const MASTER_SKILLS_CATALOG: SkillCatalogItem[] = [
  { skill: 'Python Programming', category: 'Core Language', keywords: ['python'], actionItem: (r) => `Complete advanced ${r} scripting projects with clean PEP-8 standards.` },
  { skill: 'JavaScript / ES6+', category: 'Core Language', keywords: ['javascript', 'js', 'es6'], actionItem: (r) => 'Master modern asynchronous JavaScript (Promises, async/await, closures).' },
  { skill: 'TypeScript & Type Safety', category: 'Core Language', keywords: ['typescript', 'ts'], actionItem: (r) => 'Build production-ready typed interfaces and strict generics.' },
  { skill: 'Java & JVM Fundamentals', category: 'Core Language', keywords: ['java', 'jvm', 'jdk'], actionItem: (r) => 'Master JVM memory tuning, garbage collection, and concurrency.' },
  { skill: 'SQL & Query Optimization', category: 'Data & Messaging', keywords: ['sql', 'queries', 'rdbms'], actionItem: (r) => 'Practice advanced query indexing, explain plan analysis, and normalization.' },
  { skill: 'REST API Design & Architecture', category: 'Framework & Architecture', keywords: ['rest api', 'restful', 'endpoints', 'api design'], actionItem: (r) => 'Implement production RESTful services with idempotency and OpenAPI specs.' },
  { skill: 'React & Frontend Ecosystem', category: 'Framework & Architecture', keywords: ['react', 'reactjs', 'nextjs', 'frontend'], actionItem: (r) => 'Master React component lifecycle, custom hooks, and state management.' },
  { skill: 'Node.js & Express Architecture', category: 'Framework & Architecture', keywords: ['node.js', 'nodejs', 'express'], actionItem: (r) => 'Build high-throughput asynchronous Node.js backend services.' },
  { skill: 'Spring Boot Microservices', category: 'Framework & Architecture', keywords: ['spring boot', 'spring framework'], actionItem: (r) => 'Scaffold enterprise Spring Boot microservices with Spring Cloud.' },
  { skill: 'API Integration & Webhooks', category: 'Framework & Architecture', keywords: ['webhook', 'api integration', 'partner api', 'third-party api'], actionItem: (r) => 'Implement robust webhook handlers with signature verification and retry backoff.' },
  { skill: 'Technical Debugging & Root Cause Analysis', category: 'System Design', keywords: ['debugging', 'troubleshooting', 'root cause', 'rca', 'triaging'], actionItem: (r) => 'Practice methodical log tracing and reproduction scripts for live client issues.' },
  { skill: 'Postman & API Client Workflows', category: 'Testing & Quality', keywords: ['postman', 'curl', 'api testing', 'swagger', 'openapi'], actionItem: (r) => 'Create automated Postman collections and environment variables for contract verification.' },
  { skill: 'Client Communication & Technical Triage', category: 'System Design', keywords: ['client communication', 'merchant onboarding', 'customer support', 'escalation', 'technical support'], actionItem: (r) => 'Document clear technical incident post-mortems and client-facing release notes.' },
  { skill: 'Log Analysis & Observability', category: 'Cloud & DevOps', keywords: ['datadog', 'elk', 'splunk', 'cloudwatch', 'sentry', 'logs', 'telemetry'], actionItem: (r) => 'Master structured log querying, error rate alerting, and APM tracing.' },
  { skill: 'PostgreSQL & Relational Data Flow', category: 'Data & Messaging', keywords: ['postgres', 'postgresql', 'mysql'], actionItem: (r) => 'Configure transactional integrity and composite indexing under scale.' },
  { skill: 'Redis Caching & Session Stores', category: 'Data & Messaging', keywords: ['redis', 'caching', 'memcached'], actionItem: (r) => 'Implement Cache-Aside pattern, TTL invalidation, and rate limiting.' },
  { skill: 'Apache Kafka & Distributed Streaming', category: 'Data & Messaging', keywords: ['kafka', 'event streaming', 'rabbitmq', 'message queue'], actionItem: (r) => 'Design idempotent event consumers and transactional outbox patterns.' },
  { skill: 'Docker Containerization', category: 'Cloud & DevOps', keywords: ['docker', 'container', 'dockerfile'], actionItem: (r) => 'Containerize services with multi-stage builds and security scans.' },
  { skill: 'Kubernetes & Container Orchestration', category: 'Cloud & DevOps', keywords: ['kubernetes', 'k8s', 'helm'], actionItem: (r) => 'Deploy and manage microservice pods, services, and ingress configurations.' },
  { skill: 'AWS / Cloud Infrastructure', category: 'Cloud & DevOps', keywords: ['aws', 'cloud', 'gcp', 'azure', 's3', 'lambda'], actionItem: (r) => 'Deploy scalable cloud workloads with managed databases and IAM roles.' },
  { skill: 'Git & Automated CI/CD Pipelines', category: 'Cloud & DevOps', keywords: ['git', 'github actions', 'ci/cd', 'jenkins'], actionItem: (r) => 'Configure automated linting, test execution, and deployment pipelines.' },
  { skill: 'Distributed System Design & Resilience', category: 'System Design', keywords: ['system design', 'scalability', 'microservices', 'circuit breaker', 'fault tolerance'], actionItem: (r) => 'Design high-availability architectures with bulkhead isolation and load balancing.' },
  { skill: 'Automated Unit & Integration Testing', category: 'Testing & Quality', keywords: ['unit test', 'testing', 'jest', 'junit', 'cypress'], actionItem: (r) => 'Achieve 85%+ code coverage with automated unit and integration tests.' }
];

function performDynamicSkillAudit(
  resume: string,
  jd: string,
  roleName: string,
  companyName: string
) {
  const jdLower = jd.toLowerCase();
  const resumeLower = resume.toLowerCase();

  const relevantCatalog = MASTER_SKILLS_CATALOG.filter((item) =>
    item.keywords.some((kw) => jdLower.includes(kw))
  );

  let auditedItems = relevantCatalog;
  if (auditedItems.length < 4) {
    if (/customer|support|integration|intern/i.test(roleName)) {
      auditedItems = MASTER_SKILLS_CATALOG.filter((i) =>
        ['API Integration & Webhooks', 'Technical Debugging & Root Cause Analysis', 'Postman & API Client Workflows', 'Client Communication & Technical Triage', 'Log Analysis & Observability', 'REST API Design & Architecture'].includes(i.skill)
      );
    } else if (/frontend|react/i.test(roleName)) {
      auditedItems = MASTER_SKILLS_CATALOG.filter((i) =>
        ['JavaScript / ES6+', 'TypeScript & Type Safety', 'React & Frontend Ecosystem', 'REST API Design & Architecture', 'Automated Unit & Integration Testing', 'Git & Automated CI/CD Pipelines'].includes(i.skill)
      );
    } else {
      auditedItems = MASTER_SKILLS_CATALOG.filter((i) =>
        ['REST API Design & Architecture', 'SQL & Query Optimization', 'PostgreSQL & Relational Data Flow', 'Distributed System Design & Resilience', 'Docker Containerization', 'Automated Unit & Integration Testing'].includes(i.skill)
      );
    }
  }

  const matchedSkills: SkillItem[] = [];
  const gapSkills: SkillItem[] = [];
  const weakEvidenceSkills: SkillItem[] = [];

  auditedItems.forEach((item, index) => {
    const isPresentInResume = item.keywords.some((kw) => resumeLower.includes(kw));

    if (isPresentInResume) {
      const hasQuantifiableProof =
        /\b(?:\d+[%kK+]|reduced|optimized|built|delivered|architected|scaled|improved)\b/.test(resume);

      if (hasQuantifiableProof) {
        matchedSkills.push({
          id: `match-${index}-${Date.now()}`,
          skill: item.skill,
          category: item.category,
          importance: 'Required',
          strengthLevel: 'strong',
          matchCategory: 'match',
          resumeEvidence: `Demonstrated technical capability in ${item.keywords[0]} documented in candidate profile.`,
          jdRequirement: `Proven ability to apply ${item.skill} to solve ${companyName} business requirements.`
        });
      } else {
        weakEvidenceSkills.push({
          id: `weak-${index}-${Date.now()}`,
          skill: item.skill,
          category: item.category,
          importance: 'Required',
          strengthLevel: 'weak',
          matchCategory: 'weak_evidence',
          resumeEvidence: `Mentioned ${item.keywords[0]} in resume, but lacks measurable production impact metrics.`,
          jdRequirement: `Hands-on execution experience in ${item.skill}.`,
          actionItem: `Quantify past project outcomes involving ${item.skill} with concrete data metrics.`
        });
      }
    } else {
      gapSkills.push({
        id: `gap-${index}-${Date.now()}`,
        skill: item.skill,
        category: item.category,
        importance: 'Required',
        strengthLevel: 'missing',
        matchCategory: 'gap',
        resumeEvidence: `No verifiable evidence of ${item.skill} verified in candidate resume.`,
        jdRequirement: `Prerequisite competency expected for ${roleName} at ${companyName}.`,
        actionItem: item.actionItem(roleName)
      });
    }
  });

  const total = matchedSkills.length + weakEvidenceSkills.length + gapSkills.length;
  const rawScore = total > 0
    ? Math.round(((matchedSkills.length * 1.0 + weakEvidenceSkills.length * 0.45) / total) * 100)
    : 62;
  const roleFitScore = Math.min(94, Math.max(28, rawScore));
  const matchPercentage = Math.round((matchedSkills.length / Math.max(1, total)) * 100);
  const gapPercentage = 100 - matchPercentage;

  return {
    matchedSkills,
    weakEvidenceSkills,
    gapSkills,
    roleFitScore,
    matchPercentage,
    gapPercentage
  };
}

// Resilient dynamic evaluation engine: Extracts genuine details from the user's uploaded Resume & JD
function generateSyntheticDiagnosis(
  resume: string,
  jd: string,
  manualRole?: string,
  manualCompany?: string
): CareerDiagnosisResult {
  const targetCompany = extractCompany(jd, manualCompany);
  const targetRole = extractRole(jd, manualRole);
  const location = extractLocation(jd);
  const salary = extractSalary(jd, targetRole);

  const { matchedSkills, weakEvidenceSkills, gapSkills, roleFitScore, matchPercentage, gapPercentage } =
    performDynamicSkillAudit(resume, jd, targetRole, targetCompany);

  const primaryGap = gapSkills[0]?.skill || 'Core Domain Workflows';

  const interviewFocusAreas: InterviewFocusArea[] = [
    {
      category: `${primaryGap} & Real-World Edge Cases`,
      priority: 'Critical',
      description: `Interviewers at ${targetCompany} will examine your hands-on proficiency in ${primaryGap} and your methodical triage process.`,
      sampleQuestions: [
        `How do you isolate and resolve intermittent production failures in ${primaryGap}?`,
        `Describe how you design end-to-end testing and validation before releasing changes to production.`
      ]
    },
    {
      category: `${targetRole} Technical Ownership & Communication`,
      priority: 'High',
      description: `Assesses how effectively you communicate technical trade-offs, triage high-priority issues, and collaborate with cross-functional stakeholders.`,
      sampleQuestions: [
        `How do you prioritize competing technical demands during high-pressure production incidents?`,
        `Walk us through an ambiguous technical bug you diagnosed and fixed from scratch.`
      ]
    }
  ];

  return {
    id: `diag-${Date.now()}`,
    createdAt: new Date().toISOString(),
    targetRole,
    targetCompany,
    roleFitScore,
    matchPercentage,
    gapPercentage,
    summary: `Candidate audited against ${targetCompany}'s requirements for ${targetRole}. Evaluated ${matchedSkills.length} verified competencies against ${gapSkills.length} critical bridging milestones.`,
    parityExplanation: `Audit revealed strong baseline foundations, with key growth targets in ${gapSkills.map((g) => g.skill).slice(0, 3).join(', ') || 'specialized domain tooling'}.`,
    matchedSkills,
    gapSkills,
    weakEvidenceSkills,
    interviewFocusAreas,
    location,
    salary
  };
}

function generateSyntheticSprintPlan(
  targetRole: string,
  gapSkills: SkillItem[],
  matchedSkills: SkillItem[]
): SprintPlan {
  const gapCount = gapSkills.length;
  const totalDays = gapCount >= 5 ? 14 : gapCount >= 3 ? 10 : 7;
  const days: SprintDay[] = [];

  // Day 1: Foundational Workflow
  days.push({
    dayNumber: 1,
    theme: `${targetRole} Core Architecture & Standards`,
    goal: `Establish complete familiarity with modern ${targetRole} tooling, workflows, and developer standards.`,
    completed: false,
    tasks: [
      {
        id: 'd1-t1',
        title: `Audit Core Tooling for ${targetRole}`,
        description: `Set up local environments, inspect specifications, and verify dependencies for ${targetRole}.`,
        duration: '45 min',
        type: 'concept',
        completed: false,
        deliverable: `Technical summary outlining standard developer workflows and architecture for ${targetRole}.`,
        resource: { title: `${targetRole} Industry Guide`, url: 'https://github.com' }
      },
      {
        id: 'd1-t2',
        title: 'Scaffold Baseline Milestone Project',
        description: 'Implement a working baseline service, script, or test harness following clean architecture principles.',
        duration: '60 min',
        type: 'build',
        completed: false,
        deliverable: 'Running baseline project repository with initial test verification.',
        resource: { title: 'Project Template', url: 'https://github.com' }
      }
    ],
    quiz: {
      id: 'q-d1',
      question: `In modern ${targetRole} workflows, what is the primary prerequisite before promoting code to staging or production?`,
      options: [
        'Automated regression tests and verified acceptance criteria',
        'Deploying without inspecting server logs',
        'Disabling all authentication to test faster',
        'Hardcoding secret keys into source control'
      ],
      correctIndex: 0,
      explanation: 'Production readiness requires comprehensive test verification and acceptance criteria validation.'
    }
  });

  // Middle Days: Dynamically target each specific gap skill
  const effectiveGaps = gapSkills.length > 0 ? gapSkills : [
    { skill: 'Production Debugging & API Performance', category: 'System Design' } as SkillItem,
    { skill: 'Database Optimization & Schema Flow', category: 'Data & Messaging' } as SkillItem
  ];

  for (let i = 2; i < totalDays; i++) {
    const gapIndex = (i - 2) % effectiveGaps.length;
    const currentGap = effectiveGaps[gapIndex];
    const skillName = currentGap.skill;

    days.push({
      dayNumber: i,
      theme: `${skillName} Mastery & Application`,
      goal: `Close competency deficit in ${skillName} through targeted implementation and edge case handling.`,
      completed: false,
      tasks: [
        {
          id: `d${i}-t1`,
          title: `Deep-Dive on ${skillName}`,
          description: `Study real-world failure modes, best practices, and integration patterns for ${skillName}.`,
          duration: '45 min',
          type: 'concept',
          completed: false,
          deliverable: `Technical documentation detailing how ${skillName} operates in production environments.`,
          resource: { title: `${skillName} Technical Specs`, url: 'https://developer.mozilla.org' }
        },
        {
          id: `d${i}-t2`,
          title: `Hands-on Project: ${skillName}`,
          description: `Build a concrete test project, script, or triage workflow demonstrating hands-on proficiency in ${skillName}.`,
          duration: '60 min',
          type: 'build',
          completed: false,
          deliverable: `Code artifact or test suite validating practical fluency in ${skillName}.`,
          resource: { title: `${skillName} Practical Guide`, url: 'https://github.com' }
        }
      ],
      quiz: {
        id: `q-d${i}`,
        question: `When addressing critical bottlenecks or errors in ${skillName}, what is the recommended engineering approach?`,
        options: [
          'Reproduce systematically in an isolated test environment and analyze logs before modifying code',
          'Make speculative changes directly in production',
          'Ignore the issue until customers submit complaints',
          'Restart servers indefinitely without capturing error telemetry'
        ],
        correctIndex: 0,
        explanation: `Reliable engineering in ${skillName} requires reproducible test scenarios and audit trails to prevent regressions.`
      }
    });
  }

  // Final Day: Capstone & Mock Defense
  days.push({
    dayNumber: totalDays,
    theme: `${targetRole} Capstone & Mock Interview Defense`,
    goal: 'Consolidate all closed skill gaps into a portfolio deliverable and defend your technical decisions.',
    completed: false,
    tasks: [
      {
        id: `d${totalDays}-t1`,
        title: 'Comprehensive Capstone Review',
        description: `Perform end-to-end review of all milestones completed over the ${totalDays}-day sprint.`,
        duration: '50 min',
        type: 'review',
        completed: false,
        deliverable: `Portfolio-ready repository showcasing closed competency gaps for ${targetRole}.`,
        resource: { title: 'Technical Portfolio Guide', url: '#' }
      },
      {
        id: `d${totalDays}-t2`,
        title: 'Bar-Raiser Mock Interview Simulation',
        description: 'Complete the Career Pilot mock interview round to evaluate verbal mastery and technical depth.',
        duration: '60 min',
        type: 'practice',
        completed: false,
        deliverable: 'AI evaluated score of 80%+ across all role competencies.',
        resource: { title: 'Mock Interview Simulator', url: '#' }
      }
    ],
    quiz: {
      id: `q-d${totalDays}`,
      question: `During a final-round technical interview for a ${targetRole} role, what distinguishes a top-tier candidate?`,
      options: [
        'Providing clear trade-off rationale, explaining past failure learnings, and citing tangible project evidence',
        'Claiming to know every tool without mentioning trade-offs',
        'Memorizing answers without understanding underlying principles',
        'Speaking only in abstract buzzwords'
      ],
      correctIndex: 0,
      explanation: 'Hiring managers evaluate technical maturity through clear architectural trade-offs, real debugging stories, and evidence-backed competency.'
    }
  });

  return {
    id: `sprint-${Date.now()}`,
    targetRole,
    currentDay: 1,
    totalDays: days.length,
    durationRationale: `Calibrated a ${days.length}-day custom sprint: Dynamically structured across ${gapSkills.length} identified skill gaps for ${targetRole}. Each day directly targets a specific competency deficit to ensure genuine readiness.`,
    masteryScores: initializeMastery(gapSkills, matchedSkills),
    adaptiveLogs: [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        reason: `Adaptive Sprint initialized for ${targetRole}`,
        changeSummary: `Generated personalized ${days.length}-day curriculum targeting ${gapSkills.map((g) => g.skill).slice(0, 3).join(', ') || 'target role requirements'}.`,
        affectedSkills: gapSkills.map((g) => g.skill).slice(0, 3)
      }
    ],
    days
  };
}

function generateSyntheticInterviewQuestions(
  targetRole: string,
  gapSkills: SkillItem[]
): InterviewQuestion[] {
  const roleLower = targetRole.toLowerCase();
  const primaryGap = gapSkills[0]?.skill || 'Core Technical Problem Solving';
  const secondaryGap = gapSkills[1]?.skill || 'System Resilience & Reliability';

  if (roleLower.includes('customer') || roleLower.includes('support') || roleLower.includes('integration') || roleLower.includes('solutions')) {
    return [
      {
        id: `iq-${Date.now()}-1`,
        role: targetRole,
        category: 'Webhook & API Troubleshooting',
        difficulty: 'Mid',
        question: 'A critical enterprise client reports that their checkout webhook notifications are failing intermittently with 504 Gateway Timeouts. How would you systematically troubleshoot, isolate, and resolve the root cause?',
        context: 'Evaluates your technical debugging methodology, network log analysis (cURL, Postman, server logs), and customer communication.',
        keyPointsExpected: [
          'Reproduce issue using Postman or cURL with identical client payload headers',
          'Inspect server access logs, latency metrics, and database connection pool saturation',
          'Check webhook timeout thresholds, retry policies, and exponential backoff implementation',
          'Provide transparent communication and workarounds to the client while engineering resolves the root cause'
        ]
      },
      {
        id: `iq-${Date.now()}-2`,
        role: targetRole,
        category: primaryGap,
        difficulty: 'Mid',
        question: 'When integrating a new partner API or SDK where the documentation is missing key edge case specifications, what steps do you take to guarantee robust client integration?',
        context: `Tests hands-on integration skills in ${primaryGap}, defensive error handling, and sandbox testing.`,
        keyPointsExpected: [
          'Set up contract testing in a staging/sandbox environment to verify actual response payloads',
          'Implement defensive validation for nullable fields, status codes, and unexpected payload structures',
          'Log request/response correlation IDs for comprehensive audit trails',
          'Document findings and create reusable code samples or Postman collections for other team members'
        ]
      },
      {
        id: `iq-${Date.now()}-3`,
        role: targetRole,
        category: 'Incident Management & Cross-Functional Triage',
        difficulty: 'Senior',
        question: 'During peak traffic hours, multiple merchants report payment verification discrepancies. How do you triage this incident between external clients, product support, and core engineering?',
        context: 'Evaluates prioritization, incident triage, SLA adherence, and technical ownership under pressure.',
        keyPointsExpected: [
          'Assess business impact and declare incident severity level (P0/P1)',
          'Establish a single source of truth communication channel for all stakeholders',
          'Gather telemetry and reproducible error samples for core engineering to accelerate fix deployment',
          'Conduct post-mortem root cause analysis (RCA) and publish preventive preventative measures'
        ]
      }
    ];
  }

  if (roleLower.includes('frontend') || roleLower.includes('react') || roleLower.includes('ui') || roleLower.includes('web')) {
    return [
      {
        id: `iq-${Date.now()}-1`,
        role: targetRole,
        category: 'State Management & Re-render Optimization',
        difficulty: 'Mid',
        question: 'How do you diagnose and eliminate unnecessary re-renders in a complex React dashboard with high-frequency live data updates?',
        context: 'Evaluates React profiling tools, memoization patterns (useMemo, useCallback), and state structure.',
        keyPointsExpected: [
          'Use React DevTools Profiler to identify commit durations and components causing render spikes',
          'Colocate state to prevent global re-render cascades',
          'Implement memoization (React.memo, useMemo) strategically without premature optimization',
          'Consider windowing/virtualization for long lists to reduce DOM nodes'
        ]
      },
      {
        id: `iq-${Date.now()}-2`,
        role: targetRole,
        category: primaryGap,
        difficulty: 'Senior',
        question: `How do you structure client-side data fetching and caching for ${primaryGap} to handle offline states, stale data, and optimistic UI updates?`,
        context: `Tests deep understanding of ${primaryGap}, caching libraries (TanStack Query/SWR), and UX resilience.`,
        keyPointsExpected: [
          'Stale-while-revalidate caching strategy for instant user feedback',
          'Optimistic UI mutations with automatic rollback on server error',
          'Deduplicating concurrent network requests',
          'Graceful offline fallback states and retry mechanisms'
        ]
      },
      {
        id: `iq-${Date.now()}-3`,
        role: targetRole,
        category: 'Web Performance & Core Web Vitals',
        difficulty: 'Senior',
        question: 'What strategies do you employ to optimize Core Web Vitals (LCP, INP, CLS) for high-traffic consumer web applications?',
        context: 'Tests production performance budgeting, asset bundling, and browser rendering pipeline knowledge.',
        keyPointsExpected: [
          'Code splitting and dynamic imports to reduce initial JavaScript bundle size',
          'Preloading critical fonts and optimizing above-the-fold hero images for LCP',
          'Avoiding layout shift by reserving dimensions for images and ads (CLS)',
          'Minimizing main thread execution time to improve Interaction to Next Paint (INP)'
        ]
      }
    ];
  }

  return [
    {
      id: `iq-${Date.now()}-1`,
      role: targetRole,
      category: primaryGap,
      difficulty: 'Senior',
      question: `In modern ${targetRole} architectures, how do you handle concurrency, data consistency, and race conditions when multiple workers mutate shared state in ${primaryGap}?`,
      context: `Tests deep understanding of ${primaryGap}, transactional isolation, and architectural trade-offs.`,
      keyPointsExpected: [
        'Atomic updates and database isolation levels (Read Committed vs Serializable)',
        'Optimistic Locking with versioning vs Pessimistic Locking with SELECT FOR UPDATE',
        'Distributed locks (e.g. Redis Redlock) with TTL and lease extension',
        'Idempotent processing guarantees and retry policies'
      ]
    },
    {
      id: `iq-${Date.now()}-2`,
      role: targetRole,
      category: secondaryGap,
      difficulty: 'Senior',
      question: `How do you design database schema indexing and caching strategies for ${secondaryGap} under high-throughput read and write workloads?`,
      context: 'Evaluates relational/NoSQL query optimization, cache stampede prevention, and indexing strategies.',
      keyPointsExpected: [
        'Composite indexes aligned with query selectivity and WHERE/ORDER BY clauses',
        'Cache-aside pattern with TTL and cache invalidation strategies',
        'Preventing cache stampede with mutex locking or probabilistic early expiration',
        'Read replicas and connection pooling (HikariCP/PgBouncer)'
      ]
    },
    {
      id: `iq-${Date.now()}-3`,
      role: targetRole,
      category: 'System Design & Failure Resilience',
      difficulty: 'Senior',
      question: `When building microservices for ${targetRole}, how do you prevent cascading failures and maintain high availability when downstream services experience latency spikes?`,
      context: 'Evaluates circuit breakers, rate limiting, and graceful degradation in production architectures.',
      keyPointsExpected: [
        'Circuit Breaker pattern (Closed, Open, Half-Open) with automated recovery health checks',
        'Thread pool / semaphore bulkhead isolation to prevent resource exhaustion',
        'Token bucket or leaky bucket rate limiting with HTTP 429 backpressure',
        'Graceful degradation with cached stale data or fallback defaults'
      ]
    }
  ];
}

function generateSyntheticEvaluation(
  question: InterviewQuestion,
  answer: string
): InterviewEvaluation {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const answerLower = answer.toLowerCase();
  let matchedKeyPoints = 0;
  question.keyPointsExpected.forEach((kp) => {
    const keyTerms = kp.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
    const hasOverlap = keyTerms.some((term) => answerLower.includes(term));
    if (hasOverlap) matchedKeyPoints++;
  });

  let score = 35;
  if (wordCount >= 25) score += 15;
  if (wordCount >= 60) score += 15;
  if (wordCount >= 120) score += 10;
  score += Math.min(25, matchedKeyPoints * 7);

  score = Math.min(94, Math.max(32, score));
  const verdict = score >= 75 ? 'Pass' : score >= 50 ? 'Needs Improvement' : 'Critical Gap';

  const strongPoints: string[] = [];
  const improvementAreas: string[] = [];

  if (wordCount >= 50) {
    strongPoints.push('Provided a structured, comprehensive answer demonstrating foundational understanding');
  } else {
    improvementAreas.push('Expand response with concrete implementation details and edge case handling');
  }

  if (matchedKeyPoints >= 2) {
    strongPoints.push(`Demonstrated knowledge of ${question.category} concepts and relevant engineering terminology`);
  } else {
    improvementAreas.push(`Explicitly articulate core architectural patterns related to ${question.category}`);
  }

  if (answerLower.includes('log') || answerLower.includes('test') || answerLower.includes('metric') || answerLower.includes('monitor')) {
    strongPoints.push('Highlighted observability, telemetry, and verification procedures');
  } else {
    improvementAreas.push('Include verification mechanisms: automated tests, error logging, and metrics monitoring');
  }

  return {
    id: `eval-${Date.now()}`,
    questionId: question.id,
    questionText: question.question,
    userAnswer: answer,
    score,
    verdict,
    rubrics: {
      technicalDepth: score,
      systemArchitecture: Math.max(25, score - 5),
      clarity: Math.min(95, score + 8),
      evidenceAndExamples: Math.max(20, score - 8)
    },
    strongPoints,
    improvementAreas,
    weakTopics: score < 70 ? [question.category] : [],
    suggestedAnswer: `A strong answer for ${question.role} directly addresses: ${question.keyPointsExpected.slice(0, 3).join('; ')}.`,
    createdAt: new Date().toISOString()
  };
}
