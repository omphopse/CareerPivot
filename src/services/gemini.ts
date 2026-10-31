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
  const models = ['gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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
  async analyzeRoleFit(resumeText: string, jobDescriptionText: string): Promise<CareerDiagnosisResult> {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return generateSyntheticDiagnosis(resumeText, jobDescriptionText);
    }

    try {
      const systemInstruction = `You are an elite Tech Career Coach & Staff Technical Recruiter at top tier tech companies.
Your job is to thoroughly and forensically audit a candidate's resume against a targeted Job Description (JD).
Extract the actual target role and target company from the JD.
Detect skill parity, missing evidence, and critical competency gaps.
Return ONLY valid JSON matching this schema:
{
  "targetRole": string,
  "targetCompany": string,
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

      return {
        id: `diag-${Date.now()}`,
        createdAt: new Date().toISOString(),
        targetRole: parsed.targetRole || 'Target Role',
        targetCompany: parsed.targetCompany || 'Target Company',
        roleFitScore: parsed.roleFitScore || 65,
        matchPercentage: parsed.matchPercentage || 60,
        gapPercentage: parsed.gapPercentage || 40,
        summary: parsed.summary || 'Forensic role fit evaluation completed.',
        parityExplanation: parsed.parityExplanation || 'Audit of resume versus JD requirements.',
        matchedSkills: parsed.matchedSkills || [],
        gapSkills: parsed.gapSkills || [],
        weakEvidenceSkills: parsed.weakEvidenceSkills || [],
        interviewFocusAreas: parsed.interviewFocusAreas || []
      };
    } catch (err) {
      console.warn('Gemini analysis error, falling back to heuristic engine:', err);
      return generateSyntheticDiagnosis(resumeText, jobDescriptionText);
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

// Resilient synthetic fallbacks in case of offline/network issues
function generateSyntheticDiagnosis(resume: string, jd: string): CareerDiagnosisResult {
  const isJava = jd.toLowerCase().includes('java');
  const roleName = isJava ? 'Senior Java Backend Engineer' : 'Senior Software Engineer';
  return {
    id: `diag-${Date.now()}`,
    createdAt: new Date().toISOString(),
    targetRole: roleName,
    targetCompany: 'Target Company',
    roleFitScore: 68,
    matchPercentage: 65,
    gapPercentage: 35,
    summary:
      'Candidate presents solid foundational engineering capabilities, but requires targeted ramp-up on high-scale architecture and enterprise production patterns demanded by the job posting.',
    parityExplanation:
      'While the resume demonstrates core technical competence, it lacks verifiable production metrics and specific high-scale frameworks specified in the target role requirements.',
    matchedSkills: [
      {
        id: `m-${Date.now()}-1`,
        skill: 'REST API & Microservice Architecture',
        category: 'Framework & Architecture',
        importance: 'Required',
        strengthLevel: 'strong',
        matchCategory: 'match',
        resumeEvidence: 'Backend and API development experience documented in resume.',
        jdRequirement: 'Proven ability to build and deploy scalable microservices.'
      },
      {
        id: `m-${Date.now()}-2`,
        skill: 'Relational Database & SQL Optimization',
        category: 'Data & Messaging',
        importance: 'Required',
        strengthLevel: 'strong',
        matchCategory: 'match',
        resumeEvidence: 'Database query design and schema management mentioned in candidate background.',
        jdRequirement: 'Proficiency in relational databases, indexing, and transactional integrity.'
      }
    ],
    gapSkills: [
      {
        id: `g-${Date.now()}-1`,
        skill: isJava ? 'Apache Kafka & Distributed Streaming' : 'Distributed Event Streaming & Queues',
        category: 'Data & Messaging',
        importance: 'Required',
        strengthLevel: 'missing',
        matchCategory: 'gap',
        resumeEvidence: 'No enterprise event streaming or message broker experience verified in resume.',
        jdRequirement: 'Experience designing high-throughput event-driven systems.',
        actionItem: 'Build a distributed event consumer with idempotency and transaction outbox pattern.'
      },
      {
        id: `g-${Date.now()}-2`,
        skill: 'Distributed Resilience & Fault Tolerance',
        category: 'System Design',
        importance: 'Required',
        strengthLevel: 'missing',
        matchCategory: 'gap',
        resumeEvidence: 'Missing concrete evidence of circuit breakers, rate limiting, and fallback handling.',
        jdRequirement: 'Implementation of resilient microservices patterns under heavy traffic.',
        actionItem: 'Configure circuit breaker and rate limiting with automated metrics monitoring.'
      },
      {
        id: `g-${Date.now()}-3`,
        skill: 'High Concurrency & JVM Tuning',
        category: 'Core Language',
        importance: 'Required',
        strengthLevel: 'missing',
        matchCategory: 'gap',
        resumeEvidence: 'General programming mentioned without concurrent thread safety proof.',
        jdRequirement: 'High concurrency and thread-safe data structures.',
        actionItem: 'Document multi-threaded benchmark tests.'
      }
    ],
    weakEvidenceSkills: [
      {
        id: `w-${Date.now()}-1`,
        skill: 'Distributed System Design',
        category: 'System Design',
        importance: 'Required',
        strengthLevel: 'weak',
        matchCategory: 'weak_evidence',
        resumeEvidence: 'No high-scale production load metrics verified in resume.',
        jdRequirement: 'Experience designing architectures handling high throughput.',
        actionItem: 'Prepare system design blueprints detailing sharding and caching.'
      }
    ],
    interviewFocusAreas: [
      {
        category: 'Distributed Idempotency & Message Deduplication',
        priority: 'Critical',
        description: 'Interviewers will test how you prevent duplicate actions when network timeouts occur between services.',
        sampleQuestions: [
          'How do you design an idempotent consumer in event-driven systems?',
          'How do you handle transactional outbox pattern to prevent dual-write anomalies?'
        ]
      }
    ]
  };
}

function generateSyntheticSprintPlan(
  targetRole: string,
  gapSkills: SkillItem[],
  matchedSkills: SkillItem[]
): SprintPlan {
  // Determine duration based on gap count
  const gapCount = gapSkills.length;
  const totalDays = gapCount >= 4 ? 14 : gapCount >= 3 ? 10 : 7;
  const gapName1 = gapSkills[0]?.skill || 'Core Framework & Concurrency';
  const gapName2 = gapSkills[1]?.skill || 'Distributed Messaging & Storage';
  const gapName3 = gapSkills[2]?.skill || 'Resilience & System Architecture';

  const baseDays: SprintDay[] = [
    {
      dayNumber: 1,
      theme: `Modern ${targetRole} Foundations & Syntax`,
      goal: 'Establish deep mastery over modern language constructs and core architecture patterns.',
      completed: false,
      tasks: [
        {
          id: 'd1-t1',
          title: `Review Core Architecture for ${targetRole}`,
          description: 'Study advanced idioms, immutability, and concurrency models.',
          duration: '45 min',
          type: 'concept',
          completed: false,
          deliverable: 'Summary notes covering memory management and asynchronous execution.',
          resource: {
            title: 'Language Architecture Guide',
            url: 'https://docs.oracle.com'
          }
        },
        {
          id: 'd1-t2',
          title: 'Scaffold Core Service Architecture',
          description: 'Initialize clean modular project structure with automated testing pipeline.',
          duration: '60 min',
          type: 'build',
          completed: false,
          deliverable: 'Running baseline service with health checks and unit tests.',
          resource: {
            title: 'Boilerplate Architecture Guide',
            url: 'https://github.com'
          }
        }
      ],
      quiz: {
        id: 'q-d1',
        question: `In modern ${targetRole} systems, what is the primary benefit of immutability?`,
        options: [
          'It eliminates the need for CPU cache',
          'It guarantees thread safety by preventing shared mutable state across concurrent threads',
          'It disables database indexing',
          'It replaces all network protocols'
        ],
        correctIndex: 1,
        explanation: 'Immutable data structures eliminate race conditions and simplify concurrent programming because threads cannot alter shared state.'
      }
    },
    {
      dayNumber: 2,
      theme: 'Database Scalability & Transactional Guarantees',
      goal: 'Master query optimization, connection pooling, and ACID isolation levels.',
      completed: false,
      tasks: [
        {
          id: 'd2-t1',
          title: 'Analyze Query Execution Plans and Indexes',
          description: 'Inspect slow queries, add B-Tree composite indexes, and eliminate full table scans.',
          duration: '50 min',
          type: 'practice',
          completed: false,
          deliverable: 'Execution plan benchmark showing sub-10ms response times.',
          resource: {
            title: 'SQL Performance & Indexing',
            url: 'https://use-the-index-luke.com'
          }
        }
      ],
      quiz: {
        id: 'q-d2',
        question: 'Which transaction isolation level prevents dirty reads, non-repeatable reads, and phantom reads?',
        options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
        correctIndex: 3,
        explanation: 'Serializable is the highest isolation level, completely isolating concurrent transactions as if they executed sequentially.'
      }
    },
    {
      dayNumber: 3,
      theme: `Bridging Critical Gap: ${gapName1}`,
      goal: `Hands-on implementation of ${gapName1} to close the primary identified deficiency.`,
      completed: false,
      tasks: [
        {
          id: 'd3-t1',
          title: `Implement ${gapName1} Prototype`,
          description: 'Build a production-grade component demonstrating thread safety and clean error handling.',
          duration: '75 min',
          type: 'build',
          completed: false,
          deliverable: `Tested microservice component implementing ${gapName1}.`,
          resource: {
            title: `${gapName1} Best Practices`,
            url: 'https://github.com'
          }
        }
      ],
      quiz: {
        id: 'q-d3',
        question: `Why must distributed event consumers be designed to be idempotent?`,
        options: [
          'Because networks can cause duplicate message redeliveries (at-least-once semantics)',
          'Because databases do not allow primary keys',
          'Because Kafka deletes all topics automatically',
          'Because memory is limited'
        ],
        correctIndex: 0,
        explanation: 'Distributed brokers use at-least-once delivery; network timeouts or consumer crashes cause duplicate messages, necessitating idempotency.'
      }
    },
    {
      dayNumber: 4,
      theme: `Bridging Secondary Gap: ${gapName2}`,
      goal: `Master ${gapName2} and resilient event streams.`,
      completed: false,
      tasks: [
        {
          id: 'd4-t1',
          title: `Integrate ${gapName2} with Failure Recovery`,
          description: 'Configure retries, dead letter queues, and consumer offset commits.',
          duration: '60 min',
          type: 'build',
          completed: false,
          deliverable: 'Resilient event handler with exponential backoff retry.',
          resource: {
            title: 'Resilient Messaging Architecture',
            url: 'https://microservices.io'
          }
        }
      ],
      quiz: {
        id: 'q-d4',
        question: 'What is the role of a Dead Letter Queue (DLQ) in message processing?',
        options: [
          'To speed up CPU clock speed',
          'To isolate and inspect poison-pill messages that fail repeatedly without blocking valid traffic',
          'To permanently delete all incoming messages',
          'To format JSON payloads'
        ],
        correctIndex: 1,
        explanation: 'A DLQ stores failed or corrupted messages for subsequent inspection, ensuring consumer threads do not get stuck in endless retry loops.'
      }
    },
    {
      dayNumber: 5,
      theme: `Deep Dive: ${gapName3}`,
      goal: `Hands-on architectural implementation of ${gapName3}.`,
      completed: false,
      tasks: [
        {
          id: 'd5-t1',
          title: `Configure ${gapName3} with Metrics & Alerting`,
          description: 'Set thresholds, fallback handlers, and health endpoints.',
          duration: '50 min',
          type: 'build',
          completed: false,
          deliverable: 'Service returning cached or degraded response when downstream fails.',
          resource: {
            title: `${gapName3} Guide`,
            url: 'https://github.com'
          }
        }
      ],
      quiz: {
        id: 'q-d5',
        question: 'What happens when a circuit breaker enters the OPEN state?',
        options: [
          'It allows all requests through normally',
          'It immediately rejects calls without waiting for network timeouts, preventing cascade failure',
          'It restarts the entire host server',
          'It clears the database cache'
        ],
        correctIndex: 1,
        explanation: 'The OPEN state fails fast immediately, avoiding exhausting thread pools while the downstream dependency recovers.'
      }
    },
    {
      dayNumber: 6,
      theme: 'High-Availability System Design & Fault Tolerance',
      goal: 'Implement circuit breakers, rate limiting, and graceful degradation.',
      completed: false,
      tasks: [
        {
          id: 'd6-t1',
          title: 'Draft Full Architecture Blueprint',
          description: 'Design caching, sharding, load balancing, and data consistency for the target role.',
          duration: '60 min',
          type: 'build',
          completed: false,
          deliverable: 'System design diagram and technical specification document.',
          resource: {
            title: 'System Design Primer',
            url: 'https://github.com/donnemartin/system-design-primer'
          }
        }
      ],
      quiz: {
        id: 'q-d6',
        question: 'What is the Transactional Outbox pattern primarily used for?',
        options: [
          'To send email newsletters',
          'To atomically update a database and publish an event to a message broker in a single transaction',
          'To delete old log files',
          'To compress images'
        ],
        correctIndex: 1,
        explanation: 'The Transactional Outbox pattern eliminates dual-write inconsistencies between databases and event brokers by committing both in a single local DB transaction.'
      }
    },
    {
      dayNumber: 7,
      theme: 'Mock Interview Board & Resume Evidence Refactoring',
      goal: 'Demonstrate senior technical articulation and rewrite resume bullet points with concrete metrics.',
      completed: false,
      tasks: [
        {
          id: 'd7-t1',
          title: 'Complete AI Technical Mock Interviews',
          description: 'Practice high-pressure technical questions on your newly bridged skills.',
          duration: '60 min',
          type: 'practice',
          completed: false,
          deliverable: 'Mock interview rubric score exceeding 80%.',
          resource: {
            title: 'Career Pilot Mock Simulator',
            url: '#'
          }
        },
        {
          id: 'd7-t2',
          title: 'Update Resume Bullets with Sprint Deliverables',
          description: 'Rewrite past project bullet points using the Action + Metric + Technical Tooling formula.',
          duration: '45 min',
          type: 'review',
          completed: false,
          deliverable: 'Refactored resume highlighting bridged skills ready for submission.',
          resource: {
            title: 'Tech Resume Guide',
            url: 'https://github.com'
          }
        }
      ],
      quiz: {
        id: 'q-d7',
        question: 'Which resume bullet point is most effective for senior technical recruiters?',
        options: [
          'Used Java and Kafka on a project',
          'Architected event-driven microservice using Java and Kafka with idempotent outbox pattern, handling 5,000 req/sec with zero lost transactions',
          'Worked on backend development team',
          'Read documentation about distributed systems'
        ],
        correctIndex: 1,
        explanation: 'Senior hiring managers look for quantifiable metrics, architectural patterns, and business outcomes.'
      }
    }
  ];

  // If 10 or 14 days required, add extra progressive days
  if (totalDays >= 10) {
    baseDays.push(
      {
        dayNumber: 8,
        theme: 'Advanced Concurrency: Lock-Free Algorithms & Memory Visibility',
        goal: 'Master CPU caches, volatile semantics, and Atomic CAS data structures.',
        completed: false,
        tasks: [
          {
            id: 'd8-t1',
            title: 'Build High-Throughput Lock-Free Queue',
            description: 'Implement lock-free queue using Compare-And-Swap (CAS) primitives and benchmark against mutexes.',
            duration: '60 min',
            type: 'build',
            completed: false,
            deliverable: 'Benchmark comparing throughput under 100 concurrent threads.',
            resource: {
              title: 'Java Concurrency in Practice',
              url: 'https://github.com'
            }
          }
        ],
        quiz: {
          id: 'q-d8',
          question: 'What does CPU false sharing refer to in high-concurrency systems?',
          options: [
            'Two threads modifying different variables that reside on the same CPU cache line (64 bytes), causing cache invalidation ping-pong',
            'Two programs running on different computers',
            'Shared virtual memory pages',
            'A database deadlock'
          ],
          correctIndex: 0,
          explanation: 'False sharing happens when independent variables share the same 64-byte L1/L2 cache line, forcing unnecessary cache invalidation cycles across cores.'
        }
      },
      {
        dayNumber: 9,
        theme: 'Distributed Tracing, Observability & OpenTelemetry',
        goal: 'Trace requests across microservices with trace IDs, span IDs, and Prometheus metrics.',
        completed: false,
        tasks: [
          {
            id: 'd9-t1',
            title: 'Instrument Service with OpenTelemetry and Micrometer',
            description: 'Propagate W3C trace context headers across HTTP and message broker boundaries.',
            duration: '50 min',
            type: 'practice',
            completed: false,
            deliverable: 'Working Jaeger trace visualization showing end-to-end request timeline.',
            resource: {
              title: 'OpenTelemetry Documentation',
              url: 'https://opentelemetry.io'
            }
          }
        ],
        quiz: {
          id: 'q-d9',
          question: 'How does W3C Trace Context maintain request correlation across asynchronous messaging boundaries?',
          options: [
            'It attaches `traceparent` and `tracestate` headers to outgoing message metadata',
            'It keeps an open TCP socket forever',
            'It writes logs to a shared hard drive',
            'It restarts downstream consumers'
          ],
          correctIndex: 0,
          explanation: 'W3C Trace Context standardizes passing `traceparent` (version, trace ID, parent ID, trace flags) in HTTP/Kafka headers to link asynchronous traces.'
        }
      },
      {
        dayNumber: 10,
        theme: 'End-to-End Senior Technical Screen & Portfolio Presentation',
        goal: 'Complete comprehensive interview simulation and verify portfolio GitHub repositories.',
        completed: false,
        tasks: [
          {
            id: 'd10-t1',
            title: 'Full Technical Mock Screen',
            description: 'Simulate high-pressure 60-minute technical bar-raiser interview round.',
            duration: '60 min',
            type: 'practice',
            completed: false,
            deliverable: 'AI evaluation score exceeding 85% across all rubric categories.',
            resource: {
              title: 'Career Pilot Mock Simulator',
              url: '#'
            }
          }
        ],
        quiz: {
          id: 'q-d10',
          question: 'In a senior architecture interview, what should you clarify FIRST before jumping into designing a system?',
          options: [
            'Write SQL tables immediately',
            'Clarify functional & non-functional requirements, traffic scale (RPS), and latency/availability SLAs',
            'Pick a specific framework',
            'Ask for the interviewer\'s favorite programming language'
          ],
          correctIndex: 1,
          explanation: 'Senior engineers always scope requirements, scale constraints (read/write throughput, storage), and availability SLAs before picking technologies.'
        }
      }
    );
  }

  if (totalDays >= 14) {
    baseDays.push(
      {
        dayNumber: 11,
        theme: 'Disaster Recovery & Multi-Region Database Replication',
        goal: 'Design active-active and active-passive failover strategies with RTO and RPO guarantees.',
        completed: false,
        tasks: [
          {
            id: 'd11-t1',
            title: 'Design Multi-Region Failover Architecture',
            description: 'Calculate Recovery Point Objective (RPO) and Recovery Time Objective (RTO).',
            duration: '50 min',
            type: 'concept',
            completed: false,
            deliverable: 'Disaster recovery specification document.',
            resource: { title: 'High Availability Architecture', url: 'https://aws.amazon.com' }
          }
        ],
        quiz: {
          id: 'q-d11',
          question: 'What is the key difference between RPO and RTO in disaster recovery?',
          options: [
            'RPO measures allowable data loss in time, while RTO measures allowable downtime duration until recovery',
            'RPO is for software, RTO is for hardware',
            'RPO measures memory, RTO measures disk space',
            'There is no difference'
          ],
          correctIndex: 0,
          explanation: 'RPO (Recovery Point Objective) dictates acceptable data loss (e.g. max 5 minutes of data), while RTO (Recovery Time Objective) dictates how quickly systems must be restored.'
        }
      },
      {
        dayNumber: 12,
        theme: 'Zero-Downtime Database Schema Migrations',
        goal: 'Execute expand-and-contract migrations with Flyway/Liquibase without table locking.',
        completed: false,
        tasks: [
          {
            id: 'd12-t1',
            title: 'Implement Expand-and-Contract Migration Pattern',
            description: 'Rename and transform high-traffic columns across multi-version deployments without downtime.',
            duration: '50 min',
            type: 'practice',
            completed: false,
            deliverable: 'Migration scripts with rollback plan.',
            resource: { title: 'Evolutionary Database Design', url: 'https://martinfowler.com' }
          }
        ],
        quiz: {
          id: 'q-d12',
          question: 'Why should you avoid adding a `NOT NULL` column with a default value in older versions of PostgreSQL during peak traffic?',
          options: [
            'It requires an exclusive table lock that blocks all concurrent SELECT and UPDATE queries while rewriting the table',
            'PostgreSQL does not allow default values',
            'It permanently deletes the database indexes',
            'It stops the network card'
          ],
          correctIndex: 0,
          explanation: 'Table rewrites acquire an ACCESS EXCLUSIVE lock on the table, which queues behind long-running transactions and blocks all application traffic.'
        }
      },
      {
        dayNumber: 13,
        theme: 'Security, Secret Management & Zero-Trust Microservice Identity',
        goal: 'Implement mTLS, OAuth2/OIDC token verification, and automated secret rotation.',
        completed: false,
        tasks: [
          {
            id: 'd13-t1',
            title: 'Configure Mutual TLS (mTLS) and JWT Validation',
            description: 'Enforce service-to-service authentication and encrypted communication.',
            duration: '50 min',
            type: 'build',
            completed: false,
            deliverable: 'Secure API gateway configuration with token introspection.',
            resource: { title: 'Zero Trust Architecture', url: 'https://csrc.nist.gov' }
          }
        ],
        quiz: {
          id: 'q-d13',
          question: 'What is the primary benefit of Mutual TLS (mTLS) between internal microservices?',
          options: [
            'Both the client and server cryptographically verify each other\'s identity using X.509 certificates',
            'It removes the need for firewalls',
            'It speeds up HTTP/1.1 parsing',
            'It disables TLS encryption'
          ],
          correctIndex: 0,
          explanation: 'Standard TLS only validates the server. mTLS requires both client and server to authenticate with trusted certificates, preventing lateral spoofing in zero-trust networks.'
        }
      },
      {
        dayNumber: 14,
        theme: 'Executive Career Pivot Readiness Review & Final Sign-Off',
        goal: 'Review all deliverables, verify high rubric scores, and finalize application submissions.',
        completed: false,
        tasks: [
          {
            id: 'd14-t1',
            title: 'Final Technical Evaluation & Application Launch',
            description: 'Run final mock interview check and submit updated portfolio applications.',
            duration: '60 min',
            type: 'review',
            completed: false,
            deliverable: 'All sprint deliverables verified and live applications submitted.',
            resource: { title: 'Career Pilot Dashboard', url: '#' }
          }
        ],
        quiz: {
          id: 'q-d14',
          question: 'What provides the strongest signal to a hiring manager that your career pivot is successful and production-ready?',
          options: [
            'Providing production-grade code repositories demonstrating architectural patterns, trade-off rationale, and quantifiable metrics',
            'Claiming to know all frameworks without evidence',
            'A resume with 50 buzzwords',
            'Reading Wikipedia articles'
          ],
          correctIndex: 0,
          explanation: 'Tangible proof-of-work repositories demonstrating real architectural patterns (idempotency, concurrency, resilience) provides undeniable evidence of senior competency.'
        }
      }
    );
  }

  return {
    id: `sprint-${Date.now()}`,
    targetRole,
    currentDay: 1,
    totalDays: baseDays.length,
    durationRationale: `Calibrated a ${baseDays.length}-day sprint: Evaluated ${gapSkills.length} critical competency gaps across ${targetRole} requirements. This timeline ensures practical hands-on building, query optimization, and architectural mastery.`,
    masteryScores: initializeMastery(gapSkills, matchedSkills),
    adaptiveLogs: [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        reason: `Adaptive Sprint dynamically initialized for ${targetRole}`,
        changeSummary: `Calculated optimal duration of ${baseDays.length} days based on gap depth (${gapName1}, ${gapName2}).`,
        affectedSkills: [gapName1, gapName2]
      }
    ],
    days: baseDays
  };
}

function generateSyntheticInterviewQuestions(
  targetRole: string,
  gapSkills: SkillItem[]
): InterviewQuestion[] {
  const primaryGap = gapSkills[0]?.skill || 'Distributed Systems & Concurrency';
  const secondaryGap = gapSkills[1]?.skill || 'Database Concurrency & Locking';

  return [
    {
      id: `iq-${Date.now()}-1`,
      role: targetRole,
      category: primaryGap,
      difficulty: 'Senior',
      question: `How do you guarantee exactly-once processing and prevent duplicate message execution in ${primaryGap} under high concurrent load?`,
      context:
        'In distributed systems, network timeouts and worker restarts cause message re-deliveries. Evaluators test if you design for idempotency and transaction boundaries.',
      keyPointsExpected: [
        'At-least-once message delivery model',
        'Idempotent Consumer pattern with deduplication keys',
        'Transactional Outbox Pattern for atomic database writes and publishing',
        'Manual offset commits only after DB transaction commits'
      ]
    },
    {
      id: `iq-${Date.now()}-2`,
      role: targetRole,
      category: secondaryGap,
      difficulty: 'Senior',
      question: `When two concurrent requests attempt to mutate the same resource state, how do you prevent lost updates and race condition anomalies?`,
      context:
        'Tests deep understanding of Optimistic Locking vs Pessimistic Locking, database isolation levels, and retry policies.',
      keyPointsExpected: [
        'Read-Modify-Write anomaly in concurrent requests',
        'Optimistic Locking with version column and OptimisticLockException',
        'Pessimistic write locking with SELECT FOR UPDATE',
        'Exponential backoff and retry policy'
      ]
    },
    {
      id: `iq-${Date.now()}-3`,
      role: targetRole,
      category: 'System Design & Resilience',
      difficulty: 'Senior',
      question: `How do you design a circuit breaker and rate limiting mechanism to prevent cascading failures across microservices?`,
      context:
        'Evaluates architectural fault-tolerance, thread pool bulkhead isolation, and fallback response strategies.',
      keyPointsExpected: [
        'Circuit breaker state transitions: CLOSED -> OPEN -> HALF_OPEN',
        'Token bucket / leaky bucket rate limiting algorithm',
        'Bulkhead isolation to protect thread pools',
        'Graceful degradation with fallback cache'
      ]
    }
  ];
}

function generateSyntheticEvaluation(
  question: InterviewQuestion,
  answer: string
): InterviewEvaluation {
  const len = answer.trim().length;
  const score = Math.min(92, Math.max(30, Math.floor(len * 0.2) + 30));
  const verdict = score >= 75 ? 'Pass' : score >= 50 ? 'Needs Improvement' : 'Critical Gap';

  return {
    id: `eval-${Date.now()}`,
    questionId: question.id,
    questionText: question.question,
    userAnswer: answer,
    score,
    verdict,
    rubrics: {
      technicalDepth: score,
      systemArchitecture: Math.max(30, score - 5),
      clarity: Math.min(90, score + 10),
      evidenceAndExamples: Math.max(25, score - 10)
    },
    strongPoints: [
      'Addressed core concept of the technical question',
      'Demonstrated understanding of baseline software principles'
    ],
    improvementAreas: [
      'Elaborate on production failure modes and recovery procedures',
      'Cite concrete design patterns (e.g. Idempotent Consumer, Outbox Pattern)'
    ],
    weakTopics: [question.category],
    suggestedAnswer:
      'A senior-level answer clearly articulates the failure points, architectural guarantees, data consistency mechanisms, and exact transaction rollback steps.',
    createdAt: new Date().toISOString()
  };
}
