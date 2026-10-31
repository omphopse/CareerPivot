import type {
  CareerDiagnosisResult,
  SprintPlan,
  InterviewEvaluation,
  InterviewQuestion,
  AdaptiveLog,
  SkillItem,
  InterviewFocusArea
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
   * 2. Personalized 7-Day Sprint Plan Generator:
   * Generates a custom day-by-day sprint plan based on the user's specific target role and gap skills!
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
Given a candidate's target role, target company, and their specific identified skill gaps, build a rigorous, realistic, and highly practical 7-Day Sprint Plan.
Day 1 to Day 7 must have themes, specific daily goals, 2 to 3 actionable tasks (with deliverable outputs and learning resources), and an authentic daily conceptual multiple-choice quiz with 4 options, the correctIndex (0-3), and an explanation.
Return ONLY valid JSON matching this schema:
{
  "targetRole": string,
  "masteryScores": { [skillName: string]: number (0-100) },
  "days": [
    {
      "dayNumber": number (1 to 7),
      "theme": string,
      "goal": string,
      "completed": false,
      "tasks": [
        {
          "id": string,
          "title": string,
          "description": string,
          "duration": string (e.g. "45 min"),
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

IDENTIFIED CRITICAL SKILL GAPS:
${gapSkills.map((g) => `- ${g.skill} (${g.category}): ${g.actionItem || g.jdRequirement}`).join('\n')}

VERIFIED CANDIDATE STRENGTHS:
${matchedSkills.map((m) => `- ${m.skill}`).join('\n')}

Generate the custom 7-Day Sprint Plan with daily tasks, code deliverables, and conceptual quizzes.`;

      const rawJson = await callGemini(prompt, systemInstruction);
      const parsed = JSON.parse(rawJson);

      return {
        id: `sprint-${Date.now()}`,
        targetRole: parsed.targetRole || targetRole,
        currentDay: 1,
        masteryScores: parsed.masteryScores || initializeMastery(gapSkills, matchedSkills),
        adaptiveLogs: [
          {
            id: `log-init-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reason: `Sprint initialized for ${targetRole}`,
            changeSummary: `Calibrated 7-day curriculum targeting ${gapSkills.length} identified competency gaps.`,
            affectedSkills: gapSkills.map((g) => g.skill).slice(0, 3)
          }
        ],
        days: parsed.days || generateSyntheticSprintPlan(targetRole, gapSkills, matchedSkills).days
      };
    } catch (err) {
      console.warn('Gemini sprint generation error, falling back:', err);
      return generateSyntheticSprintPlan(targetRole, gapSkills, matchedSkills);
    }
  },

  /**
   * 3. Role-Specific Interview Questions Generator:
   * Generates 3 targeted interview questions matching the user's specific target role and gap skills!
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
   * 5. Adaptive Learning Engine: Recalibrates 7-Day Sprint Plan based on interview weaknesses
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

    // Injects an emergency remedial task into Day 4
    const primaryWeakness = evaluation.weakTopics[0] || 'Target Architecture';
    const updatedDays = currentPlan.days.map((day) => {
      if (day.dayNumber === 4) {
        return {
          ...day,
          theme: `⚡ RECALIBRATED: ${primaryWeakness} Remedial Practice`,
          goal: `Priority adjusted from failed mock interview: Deep dive into ${primaryWeakness} and hands-on implementation.`,
          tasks: [
            {
              id: `adapt-task-${Date.now()}`,
              title: `CRITICAL REMEDY: Hands-on implementation of ${primaryWeakness}`,
              description: `Resolve interview deficit: Build a focused prototype and unit test suite addressing "${evaluation.improvementAreas[0] || primaryWeakness}".`,
              duration: '60 min',
              type: 'build' as const,
              completed: false,
              deliverable: `Working code implementation verifying mastery in ${primaryWeakness}.`,
              resource: {
                title: `${primaryWeakness} Guide & Architecture`,
                url: 'https://github.com'
              }
            },
            ...day.tasks
          ]
        };
      }
      return day;
    });

    const newLog: AdaptiveLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reason: `Mock Interview revealed weak topic: ${evaluation.weakTopics.join(', ')} (Score: ${evaluation.score}/100)`,
      changeSummary: `Injected emergency remedial task for ${primaryWeakness} into Day 4 and updated mastery index.`,
      affectedSkills
    };

    return {
      ...currentPlan,
      masteryScores: updatedMastery,
      days: updatedDays,
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
      }
    ],
    weakEvidenceSkills: [
      {
        id: `w-${Date.now()}-1`,
        skill: 'High Concurrency & JVM Tuning',
        category: 'Core Language',
        importance: 'Required',
        strengthLevel: 'weak',
        matchCategory: 'weak_evidence',
        resumeEvidence: 'Mentioned general programming languages without concrete multi-threading scale metrics.',
        jdRequirement: 'Deep understanding of memory models, thread pools, and concurrency.',
        actionItem: 'Prepare benchmark tests demonstrating thread safety and deadlock prevention.'
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
  const gapName1 = gapSkills[0]?.skill || 'Core Framework & Concurrency';
  const gapName2 = gapSkills[1]?.skill || 'Distributed Messaging & Storage';

  return {
    id: `sprint-${Date.now()}`,
    targetRole,
    currentDay: 1,
    masteryScores: initializeMastery(gapSkills, matchedSkills),
    adaptiveLogs: [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        reason: 'Sprint dynamically initialized from Resume and Job Description analysis',
        changeSummary: `Curriculum calibrated to close gaps in ${gapName1} and ${gapName2}.`,
        affectedSkills: [gapName1, gapName2]
      }
    ],
    days: [
      {
        dayNumber: 1,
        theme: `Modern ${targetRole} Foundations & Core Language Features`,
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
            title: 'Scaffold Core Microservice Project',
            description: 'Initialize clean modular project structure with automated testing pipeline.',
            duration: '60 min',
            type: 'build',
            completed: false,
            deliverable: 'Running baseline service with health checks and unit tests.',
            resource: {
              title: 'Microservices Boilerplate Guide',
              url: 'https://github.com'
            }
          }
        ],
        quiz: {
          id: 'q-d1',
          question: `In modern ${targetRole} systems, what is the primary benefit of immutability and record types?`,
          options: [
            'They eliminate the need for CPU cache',
            'They guarantee thread safety by preventing shared mutable state across concurrent threads',
            'They disable database indexing',
            'They replace all network protocols'
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
        theme: 'High-Availability System Design & Fault Tolerance',
        goal: 'Implement circuit breakers, rate limiting, and graceful degradation.',
        completed: false,
        tasks: [
          {
            id: 'd5-t1',
            title: 'Configure Circuit Breaker with Fallback Logic',
            description: 'Protect upstream services when downstream dependencies become unavailable.',
            duration: '50 min',
            type: 'practice',
            completed: false,
            deliverable: 'Service returning cached or degraded response when downstream fails.',
            resource: {
              title: 'Circuit Breaker Pattern Guide',
              url: 'https://martinfowler.com'
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
        theme: 'End-to-End Enterprise System Design Scenario',
        goal: 'Architect a complete high-throughput distributed system meeting all JD requirements.',
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
            title: 'Complete 3 AI Technical Mock Interviews',
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
    ]
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
