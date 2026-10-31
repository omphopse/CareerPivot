import {
  CareerDiagnosisResult,
  SprintPlan,
  InterviewEvaluation,
  InterviewQuestion,
  AdaptiveLog
} from '../types';
import {
  DEMO_RESUME,
  DEMO_JOB_DESCRIPTION,
  INITIAL_DIAGNOSIS,
  INITIAL_SPRINT_PLAN,
  DEMO_WEAK_EVALUATION
} from '../data/demoData';

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

// Helper to call Gemini REST API
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // Use Gemini 1.5 Flash endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody: any = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json'
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Gemini API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }
  return text;
}

export const aiService = {
  /**
   * AI Career Diagnosis: Resume + JD analysis
   */
  async analyzeRoleFit(resumeText: string, jobDescriptionText: string): Promise<CareerDiagnosisResult> {
    const isAlexDemo =
      (resumeText.toLowerCase().includes('alex morgan') || resumeText.length < 50) &&
      (jobDescriptionText.toLowerCase().includes('apex') ||
        jobDescriptionText.toLowerCase().includes('java') ||
        jobDescriptionText.length < 50);

    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      // Simulate real AI latency for authentic feel
      await new Promise((resolve) => setTimeout(resolve, 1400));
      if (isAlexDemo) {
        return {
          ...INITIAL_DIAGNOSIS,
          id: `diag-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
      }
      // Generate synthetic diagnosis for custom user inputs when no API key
      return generateSyntheticDiagnosis(resumeText, jobDescriptionText);
    }

    try {
      const systemInstruction = `You are an elite Tech Career Coach & Staff Technical Recruiter at top tier Silicon Valley and FinTech firms.
Your job is to thoroughly audit a candidate's resume against a targeted Job Description (JD).
Detect skill parity, missing evidence, exaggerated claims, and critical competency gaps.
Return ONLY valid JSON matching this schema:
{
  "roleFitScore": number (0-100),
  "matchPercentage": number,
  "gapPercentage": number,
  "summary": string,
  "parityExplanation": string,
  "targetRole": string,
  "targetCompany": string,
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
      "resumeEvidence": string (explanation of why missing),
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

      const prompt = `RESUME CONTENT:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jobDescriptionText}\n\nPerform a forensic comparison. Evaluate the candidate's actual demonstrated evidence against the JD requirements.`;
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
        summary: parsed.summary || 'Role fit analysis completed.',
        parityExplanation: parsed.parityExplanation || 'Audit of resume versus JD requirements.',
        matchedSkills: parsed.matchedSkills || [],
        gapSkills: parsed.gapSkills || [],
        weakEvidenceSkills: parsed.weakEvidenceSkills || [],
        interviewFocusAreas: parsed.interviewFocusAreas || []
      };
    } catch (err) {
      console.warn('Gemini analysis failed or rate limited, falling back to heuristic engine:', err);
      return generateSyntheticDiagnosis(resumeText, jobDescriptionText);
    }
  },

  /**
   * AI Interview Coach: Evaluate candidate answer with rubric
   */
  async evaluateInterviewAnswer(
    question: InterviewQuestion,
    userAnswer: string
  ): Promise<InterviewEvaluation> {
    const apiKey = getGeminiApiKey();

    // Check if it's the demo story weak answer
    const isDemoWeak =
      userAnswer.toLowerCase().includes('@kafkalistener') ||
      userAnswer.toLowerCase().includes('kafka drops it') ||
      userAnswer.trim().length < 40;

    if (!apiKey) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (isDemoWeak) {
        return {
          ...DEMO_WEAK_EVALUATION,
          id: `eval-${Date.now()}`,
          questionId: question.id,
          questionText: question.question,
          userAnswer: userAnswer,
          createdAt: new Date().toISOString()
        };
      }
      return generateSyntheticEvaluation(question, userAnswer);
    }

    try {
      const systemInstruction = `You are a Principal Software Engineer evaluating a candidate in a technical interview round for: ${question.role}.
Grade the candidate's answer based on technical accuracy, edge cases, distributed systems guarantees, and senior engineering depth.
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

Evaluate rigorously. If the answer is superficial, suggests anti-patterns (e.g. dropping messages, missing deduplication), or misses distributed system nuances, assign low marks and flag specific weak topics.`;

      const rawJson = await callGemini(prompt, systemInstruction);
      const parsed = JSON.parse(rawJson);

      return {
        id: `eval-${Date.now()}`,
        questionId: question.id,
        questionText: question.question,
        userAnswer,
        score: parsed.score || 50,
        verdict: parsed.verdict || (parsed.score >= 75 ? 'Pass' : parsed.score >= 50 ? 'Needs Improvement' : 'Critical Gap'),
        rubrics: parsed.rubrics || {
          technicalDepth: parsed.score || 50,
          systemArchitecture: parsed.score || 50,
          clarity: 60,
          evidenceAndExamples: 50
        },
        strongPoints: parsed.strongPoints || ['Addressed basic premise of the question'],
        improvementAreas: parsed.improvementAreas || ['Needs deeper architectural specifics'],
        weakTopics: parsed.weakTopics || [question.category],
        suggestedAnswer: parsed.suggestedAnswer || 'A senior answer includes concrete architectural patterns.',
        createdAt: new Date().toISOString()
      };
    } catch (err) {
      console.warn('Gemini evaluation error, using fallback:', err);
      return generateSyntheticEvaluation(question, userAnswer);
    }
  },

  /**
   * Adaptive Learning Engine: Recalibrates 7-Day Sprint Plan based on interview weaknesses
   */
  recalibrateSprintPlan(
    currentPlan: SprintPlan,
    evaluation: InterviewEvaluation
  ): SprintPlan {
    const updatedMastery = { ...currentPlan.masteryScores };
    const affectedSkills: string[] = [];

    // Reduce mastery for weak topics
    evaluation.weakTopics.forEach((topic) => {
      // Find matching mastery key
      for (const key of Object.keys(updatedMastery)) {
        if (
          key.toLowerCase().includes('kafka') &&
          topic.toLowerCase().includes('kafka')
        ) {
          updatedMastery[key] = Math.max(15, updatedMastery[key] - 15);
          if (!affectedSkills.includes(key)) affectedSkills.push(key);
        } else if (
          key.toLowerCase().includes('database') ||
          key.toLowerCase().includes('postgresql') ||
          key.toLowerCase().includes('acid')
        ) {
          if (topic.toLowerCase().includes('deduplication') || topic.toLowerCase().includes('outbox')) {
            updatedMastery[key] = Math.max(25, updatedMastery[key] - 10);
            if (!affectedSkills.includes(key)) affectedSkills.push(key);
          }
        }
      }
    });

    if (affectedSkills.length === 0) {
      affectedSkills.push('Apache Kafka & Event Streaming');
      if (updatedMastery['Apache Kafka & Event Streaming']) {
        updatedMastery['Apache Kafka & Event Streaming'] = Math.max(
          15,
          updatedMastery['Apache Kafka & Event Streaming'] - 15
        );
      }
    }

    // Adaptive modification of Day 4 and Day 5 tasks
    const updatedDays = currentPlan.days.map((day) => {
      if (day.dayNumber === 4) {
        return {
          ...day,
          theme: '⚡ RECALIBRATED: Kafka Idempotent Deduplication & Transactional Outbox',
          goal: 'Priority adjusted from failed mock interview: Deep dive into exactly-once consumer semantics and database deduplication tables.',
          tasks: [
            {
              id: 'd4-adapt-1',
              title: 'CRITICAL REMEDY: Implement Database Deduplication Table for Kafka Consumer',
              description:
                'Resolve the interview gap: Create a `processed_messages` schema with unique transaction_id index and atomic check-before-commit.',
              duration: '60 min',
              type: 'build' as const,
              completed: false,
              deliverable:
                'Spring Boot `@KafkaListener` implementing idempotent insert with duplicate key handling.',
              resource: {
                title: 'Idempotent Consumer Pattern Deep Dive',
                url: 'https://microservices.io/patterns/communication-style/idempotent-consumer.html'
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
      reason: `Mock Interview revealed critical gap in ${evaluation.weakTopics.join(', ')} (Score: ${evaluation.score}/100)`,
      changeSummary:
        'Injected emergency remedial Kafka deduplication build task into Day 4 and lowered Kafka mastery index.',
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

// Fallback synthetic generator for custom prompts when offline or missing API key
function generateSyntheticDiagnosis(resume: string, jd: string): CareerDiagnosisResult {
  const isJava = jd.toLowerCase().includes('java');
  const roleName = isJava ? 'Java Backend Engineer' : 'Full Stack Engineer';
  return {
    id: `diag-${Date.now()}`,
    createdAt: new Date().toISOString(),
    targetRole: roleName,
    targetCompany: 'Enterprise Tech Platform',
    roleFitScore: 71,
    matchPercentage: 68,
    gapPercentage: 32,
    summary:
      'Candidate presents strong core engineering capabilities and web service familiarity, but requires targeted ramp-up on target role system architecture and enterprise data patterns.',
    parityExplanation:
      'The resume shows good transferrable software foundations, but misses demonstrated proof for specific high-concurrency tooling demanded in the job description.',
    matchedSkills: [
      {
        id: 'm-syn-1',
        skill: 'REST API & Microservices',
        category: 'Framework & Architecture',
        importance: 'Required',
        strengthLevel: 'strong',
        matchCategory: 'match',
        resumeEvidence: 'Production backend development experience noted in resume.',
        jdRequirement: 'Proven ability to build scalable backend services.'
      },
      {
        id: 'm-syn-2',
        skill: 'Relational Database & SQL',
        category: 'Data & Messaging',
        importance: 'Required',
        strengthLevel: 'strong',
        matchCategory: 'match',
        resumeEvidence: 'Demonstrated experience writing queries and schema design.',
        jdRequirement: 'Proficiency in relational databases and indexing.'
      }
    ],
    gapSkills: [
      {
        id: 'g-syn-1',
        skill: isJava ? 'Apache Kafka & Distributed Streaming' : 'Distributed Event Streaming',
        category: 'Data & Messaging',
        importance: 'Required',
        strengthLevel: 'missing',
        matchCategory: 'gap',
        resumeEvidence: 'No enterprise message broker experience verified.',
        jdRequirement: 'High-throughput event-driven messaging.',
        actionItem: 'Build a sample event publisher and consumer with transactional guarantees.'
      },
      {
        id: 'g-syn-2',
        skill: 'Distributed Resilience & Circuit Breakers',
        category: 'System Design',
        importance: 'Required',
        strengthLevel: 'missing',
        matchCategory: 'gap',
        resumeEvidence: 'Missing fault tolerance and rate limiting evidence.',
        jdRequirement: 'Implementation of resilient microservices patterns.',
        actionItem: 'Configure circuit breaker and fallback mechanisms.'
      }
    ],
    weakEvidenceSkills: [
      {
        id: 'w-syn-1',
        skill: 'High-Throughput Concurrency',
        category: 'Core Language',
        importance: 'Required',
        strengthLevel: 'weak',
        matchCategory: 'weak_evidence',
        resumeEvidence: 'General programming mentioned without concurrent thread safety proof.',
        jdRequirement: 'High concurrency and thread-safe data structures.',
        actionItem: 'Document multi-threaded benchmark tests.'
      }
    ],
    interviewFocusAreas: [
      {
        category: 'Event-Driven Consistency & Retries',
        priority: 'Critical',
        description: 'Focus on handling network partitions, retry policies, and preventing duplicate actions.',
        sampleQuestions: [
          'How do you design an idempotent consumer in event-driven systems?',
          'What happens during network timeouts between services?'
        ]
      }
    ]
  };
}

function generateSyntheticEvaluation(
  question: InterviewQuestion,
  answer: string
): InterviewEvaluation {
  const len = answer.trim().length;
  const score = Math.min(95, Math.max(35, Math.floor(len * 0.25) + 30));
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
      'Identified core concepts related to the problem statement',
      'Demonstrated understanding of baseline software mechanics'
    ],
    improvementAreas: [
      'Incorporate concrete production metrics and failure recovery patterns',
      'Elaborate on edge cases like network partitions or broker crashes'
    ],
    weakTopics: [question.category],
    suggestedAnswer:
      'A top-scoring answer details the exact architectural flow, error handling, idempotency verification, and transaction rollback mechanics.',
    createdAt: new Date().toISOString()
  };
}
