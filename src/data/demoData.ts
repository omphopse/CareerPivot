import {
  CareerDiagnosisResult,
  SprintPlan,
  InterviewQuestion,
  JobApplication,
  InterviewEvaluation
} from '../types';

export const DEMO_RESUME = `ALEX MORGAN
Email: alex.morgan.dev@gmail.com | Phone: +1 (555) 382-9901 | GitHub: github.com/alexm-dev | LinkedIn: linkedin.com/in/alexmorgan-dev
Location: San Francisco, CA (Open to Remote)

PROFESSIONAL SUMMARY:
Full Stack Software Engineer with 3.5 years of experience building scalable web applications and REST APIs. Proficient in TypeScript, Node.js, and SQL databases. Basic academic and side-project background in Java. Looking to pivot into high-scale Java Backend Engineering focusing on distributed systems and enterprise microservices.

PROFESSIONAL EXPERIENCE:
Apex Digital Solutions — Full Stack Engineer (2022 – Present)
- Engineered high-throughput REST APIs using Node.js, Express, and PostgreSQL handling 2M requests/day.
- Integrated Redis caching layer, decreasing p95 database response latency by 42%.
- Built front-end administrative dashboards using React, TypeScript, and Tailwind CSS.
- Automated Docker containerization and GitHub Actions CI/CD deployment pipelines to AWS ECS.
- Contributed to legacy Java 8 maintenance scripts for batch data validation.

DataStream Labs — Junior Software Engineer (2021 – 2022)
- Developed CRUD microservices and asynchronous workers using Node.js and RabbitMQ.
- Designed relational schemas and wrote optimized SQL queries in PostgreSQL.
- Collaborated in Agile sprints, wrote unit and integration tests achieving 85% code coverage.

EDUCATION & SKILLS:
B.S. in Computer Science — University of California, Davis (2017 – 2021)
- Languages: TypeScript, JavaScript, SQL, Java (Java 8 basics, OOP, Data Structures), Python.
- Frameworks & Tools: Express, Node.js, React, Docker, Git, AWS (S3, ECS), PostgreSQL, Redis, RabbitMQ.`;

export const DEMO_JOB_DESCRIPTION = `Role: Senior Java Backend Engineer
Company: Apex Fintech Platforms
Location: Remote / San Francisco, CA
Salary: $155,000 - $185,000 + Equity

ABOUT THE ROLE:
We are seeking an experienced Backend Engineer to architect, build, and optimize our core transaction ledger and banking gateway. You will collaborate on distributed event-driven systems processing hundreds of millions in transactions daily.

RESPONSIBILITIES:
- Architect and develop high-reliability microservices using Java 17/21 and Spring Boot 3.
- Build resilient event-driven architectures with Apache Kafka, guaranteeing idempotency and exactly-once processing semantics.
- Optimize high-volume PostgreSQL databases, query execution plans, and connection pooling (HikariCP).
- Implement fault-tolerance patterns using Resilience4j (circuit breakers, rate limiters, bulkhead).
- Design secure, mission-critical distributed systems handling concurrency and ACID transactions.

REQUIRED QUALIFICATIONS:
- 3+ years of production experience in backend engineering.
- Deep expertise in Java (Java 17+ features, Streams, Concurrency, JVM performance).
- Hands-on mastery of Spring Boot 3, Spring Data JPA, and Hibernate.
- Proven experience with Apache Kafka (partition keys, consumer groups, offset management, idempotency).
- Strong understanding of Distributed Systems, Microservices design patterns, and ACID guarantees.
- Experience with Docker, Kubernetes, and AWS cloud environments.`;

export const INITIAL_DIAGNOSIS: CareerDiagnosisResult = {
  id: 'diag-demo-01',
  createdAt: '2026-10-31T10:00:00Z',
  targetRole: 'Senior Java Backend Engineer',
  targetCompany: 'Apex Fintech Platforms',
  roleFitScore: 68,
  matchPercentage: 65,
  gapPercentage: 35,
  summary:
    'Alex possesses strong foundational engineering principles, production REST API design, relational SQL expertise, and containerization. However, transitioning from Node.js to Senior Java Backend requires closing acute gaps in modern Java 21, Spring Boot 3 architecture, production Apache Kafka event streaming, and distributed ACID idempotency.',
  parityExplanation:
    'While candidate has 3.5 years of general backend experience, the resume lacks concrete evidence of Java in production systems. The candidate relied on Node.js/RabbitMQ, whereas the JD explicitly demands high-concurrency Java 17/21 and production-grade Kafka event stream guarantees.',
  matchedSkills: [
    {
      id: 'm-1',
      skill: 'RESTful API & Microservice Architecture',
      category: 'Framework & Architecture',
      importance: 'Required',
      strengthLevel: 'strong',
      matchCategory: 'match',
      resumeEvidence: 'Engineered high-throughput REST APIs handling 2M requests/day at Apex Digital.',
      jdRequirement: 'Architect and develop high-reliability microservices.'
    },
    {
      id: 'm-2',
      skill: 'Relational Database Optimization & SQL',
      category: 'Data & Messaging',
      importance: 'Required',
      strengthLevel: 'strong',
      matchCategory: 'match',
      resumeEvidence: 'Optimized PostgreSQL schemas and queries, integrated Redis caching reducing latency by 42%.',
      jdRequirement: 'Optimize high-volume PostgreSQL databases, query execution plans, and connection pooling.'
    },
    {
      id: 'm-3',
      skill: 'Docker & Containerization / CI/CD',
      category: 'Cloud & DevOps',
      importance: 'Required',
      strengthLevel: 'strong',
      matchCategory: 'match',
      resumeEvidence: 'Automated Docker containerization and GitHub Actions CI/CD to AWS ECS.',
      jdRequirement: 'Experience with Docker, Kubernetes, and AWS cloud environments.'
    },
    {
      id: 'm-4',
      skill: 'Object-Oriented Design & Testing',
      category: 'Testing & Quality',
      importance: 'Required',
      strengthLevel: 'moderate',
      matchCategory: 'match',
      resumeEvidence: 'CS degree coursework in OOP + 85% test coverage in agile production environments.',
      jdRequirement: 'Deep expertise in Java, OOP, and reliable software engineering practices.'
    }
  ],
  gapSkills: [
    {
      id: 'g-1',
      skill: 'Apache Kafka & Idempotent Consumer Semantics',
      category: 'Data & Messaging',
      importance: 'Required',
      strengthLevel: 'missing',
      matchCategory: 'gap',
      resumeEvidence: 'Only RabbitMQ mentioned; zero Apache Kafka production experience in resume.',
      jdRequirement: 'Build resilient event-driven architectures with Apache Kafka, guaranteeing idempotency and exactly-once semantics.',
      actionItem: 'Build a Spring Boot + Kafka event consumer demo with transaction outbox pattern and deduplication.'
    },
    {
      id: 'g-2',
      skill: 'Modern Java 17/21 & Spring Boot 3 Ecosystem',
      category: 'Core Language',
      importance: 'Required',
      strengthLevel: 'missing',
      matchCategory: 'gap',
      resumeEvidence: 'Only mentions legacy Java 8 batch scripts and academic coursework.',
      jdRequirement: 'Deep expertise in Java 17/21 (Virtual Threads, Records, Pattern Matching) and Spring Boot 3.',
      actionItem: 'Refactor or scaffold a Spring Boot 3 microservice using Java 21 records and virtual threads.'
    },
    {
      id: 'g-3',
      skill: 'Distributed Transactions & Resilience4j',
      category: 'System Design',
      importance: 'Required',
      strengthLevel: 'missing',
      matchCategory: 'gap',
      resumeEvidence: 'No mention of circuit breakers, rate limiting, or distributed transaction patterns.',
      jdRequirement: 'Implement fault-tolerance patterns using Resilience4j (circuit breakers, rate limiters, bulkhead).',
      actionItem: 'Simulate downstream failures using Resilience4j circuit breaker with fallback responses.'
    }
  ],
  weakEvidenceSkills: [
    {
      id: 'w-1',
      skill: 'JVM Concurrency & Performance Tuning',
      category: 'Core Language',
      importance: 'Required',
      strengthLevel: 'weak',
      matchCategory: 'weak_evidence',
      resumeEvidence: 'Mentions Java 8, but no evidence of multi-threading, GC tuning, or thread pool management.',
      jdRequirement: 'Deep expertise in Java concurrency and JVM performance optimization.',
      actionItem: 'Prepare answers illustrating memory leaks detection (VisualVM/JProfiler) and thread safety mechanisms.'
    },
    {
      id: 'w-2',
      skill: 'Enterprise ACID Guarantees at FinTech Scale',
      category: 'System Design',
      importance: 'Preferred',
      strengthLevel: 'weak',
      matchCategory: 'weak_evidence',
      resumeEvidence: 'Handled standard web app traffic (2M req/day), but lacks high-stakes financial ledger constraints.',
      jdRequirement: 'Architect core transaction ledger and banking gateway handling hundreds of millions in transactions.',
      actionItem: 'Highlight dual-entry ledger architecture and idempotent API keys in project portfolio.'
    }
  ],
  interviewFocusAreas: [
    {
      category: 'Kafka Messaging & Exactly-Once Semantics',
      priority: 'Critical',
      description: 'The interviewer will aggressively probe how you prevent duplicate charges when network timeouts occur between Kafka and your consumer.',
      sampleQuestions: [
        'How does Kafka consumer group rebalancing affect message processing?',
        'How do you design an idempotent consumer in Spring Boot using the transactional outbox pattern?'
      ]
    },
    {
      category: 'Spring Boot 3 & Java 21 Modern Features',
      priority: 'High',
      description: 'Expect questions on Java 21 virtual threads vs reactive webflux, Spring Beans lifecycle, and transaction rollback semantics.',
      sampleQuestions: [
        'How do Java 21 Virtual Threads change thread pool sizing in Spring Boot?',
        'What happens when @Transactional is called on a private method or from within the same class?'
      ]
    },
    {
      category: 'Distributed Resilience & Database Contention',
      priority: 'High',
      description: 'Focus on optimistic vs pessimistic locking in PostgreSQL and Resilience4j circuit breakers.',
      sampleQuestions: [
        'How do you handle deadlocks in PostgreSQL under high concurrent write loads?',
        'Explain how Resilience4j state machine transitions from OPEN to HALF_OPEN.'
      ]
    }
  ]
};

export const INITIAL_SPRINT_PLAN: SprintPlan = {
  id: 'sprint-demo-01',
  targetRole: 'Senior Java Backend Engineer',
  currentDay: 1,
  masteryScores: {
    'Modern Java 21 & Spring Boot 3': 40,
    'Apache Kafka & Event Streaming': 25,
    'PostgreSQL & Distributed ACID': 70,
    'Resilience4j & System Design': 35,
    'Docker & Cloud Deployments': 85
  },
  adaptiveLogs: [
    {
      id: 'log-0',
      timestamp: 'Just now',
      reason: 'Sprint initialized from Resume & Job Description Diagnosis',
      changeSummary: 'Prioritized Day 1 Java 21 basics and Day 4 Kafka Deep-Dive to address missing evidence.',
      affectedSkills: ['Modern Java 21 & Spring Boot 3', 'Apache Kafka & Event Streaming']
    }
  ],
  days: [
    {
      dayNumber: 1,
      theme: 'Modern Java 21 & Spring Boot 3 Architecture',
      goal: 'Bridge Java 8 to Java 21 gap: Master Records, Pattern Matching, Virtual Threads, and Spring Boot 3 autoconfiguration.',
      completed: false,
      tasks: [
        {
          id: 'd1-t1',
          title: 'Master Java 21 Modern Syntax (Records, Sealed Classes, Pattern Matching)',
          description: 'Compare Java 8 boilerplate with Java 21 idiomatic syntax. Understand immutability with records.',
          duration: '40 min',
          type: 'concept',
          completed: true,
          deliverable: 'Write 3 Java 21 domain DTOs with sealed interface hierarchy.',
          resource: {
            title: 'Baeldung: Java 21 Features Guide',
            url: 'https://www.baeldung.com/java-21-new-features'
          }
        },
        {
          id: 'd1-t2',
          title: 'Scaffold Spring Boot 3 Microservice with Virtual Threads',
          description: 'Enable `spring.threads.virtual.enabled=true` and benchmark throughput against traditional thread pools.',
          duration: '60 min',
          type: 'build',
          completed: false,
          deliverable: 'Running Spring Boot 3 REST controller with virtual thread benchmark.',
          resource: {
            title: 'Spring Official: Virtual Threads in Spring 3.2+',
            url: 'https://spring.io/blog/2023/09/09/all-together-now-spring-boot-3-2-virtual-threads'
          }
        },
        {
          id: 'd1-t3',
          title: 'Deep Dive: @Transactional Spring Proxy Mechanics',
          description: 'Understand CGLIB proxies, self-invocation gotchas, and rollback conditions (`rollbackFor = Exception.class`).',
          duration: '35 min',
          type: 'practice',
          completed: false,
          deliverable: 'Unit tests verifying transaction rollback behavior on custom checked exceptions.',
          resource: {
            title: 'Spring Transaction Management Masterclass',
            url: 'https://docs.spring.io/spring-framework/reference/data-access/transaction.html'
          }
        }
      ],
      quiz: {
        id: 'q-d1',
        question: 'In Spring Boot, why does calling a `@Transactional` method from another method inside the SAME class fail to start a new transaction?',
        options: [
          'Because private methods are not supported in Spring Boot 3',
          'Because the call bypasses the Spring CGLIB/JDK dynamic proxy wrapper, invoking `this` directly',
          'Because database connections cannot be nested in PostgreSQL',
          'Because Spring requires manual `EntityManager.persist()` calls'
        ],
        correctIndex: 1,
        explanation: 'Spring transaction management is based on proxy patterns. When method A calls method B in the same class, it uses the direct `this` reference, bypassing the proxy and its transaction interceptor.'
      }
    },
    {
      dayNumber: 2,
      theme: 'High-Performance Spring Data JPA & Hibernate Optimizations',
      goal: 'Eliminate N+1 queries, master entity lifecycle states, and configure second-level Redis caching.',
      completed: false,
      tasks: [
        {
          id: 'd2-t1',
          title: 'Solve the N+1 Query Problem with EntityGraphs and JOIN FETCH',
          description: 'Analyze Hibernate SQL logs to identify eager vs lazy loading bottlenecks and apply `@EntityGraph`.',
          duration: '45 min',
          type: 'build',
          completed: false,
          deliverable: 'Repository test verifying single query fetch with JOIN FETCH.',
          resource: {
            title: 'Vlad Mihalcea: The Best Way to Handle N+1 in Spring Data JPA',
            url: 'https://vladmihalcea.com/n-plus-1-query-problem/'
          }
        },
        {
          id: 'd2-t2',
          title: 'Implement Optimistic Locking with `@Version`',
          description: 'Prevent lost updates in concurrent banking transactions using version columns and handling `OptimisticLockException`.',
          duration: '45 min',
          type: 'practice',
          completed: false,
          deliverable: 'Concurrent test simulating two threads updating account balances simultaneously.',
          resource: {
            title: 'Baeldung: Optimistic Locking in JPA',
            url: 'https://www.baeldung.com/jpa-optimistic-locking'
          }
        }
      ],
      quiz: {
        id: 'q-d2',
        question: 'Which Hibernate query strategy prevents the N+1 select problem when fetching an Order and its List of OrderItems?',
        options: [
          'Setting `fetch = FetchType.EAGER` on the relation',
          'Using JPQL `JOIN FETCH o.items` or `@EntityGraph`',
          'Enabling Hibernate auto-flush',
          'Wrapping the repository in `@Async`'
        ],
        correctIndex: 1,
        explanation: '`JOIN FETCH` or `@EntityGraph` forces Hibernate to load associations in a single SQL query using an SQL INNER/LEFT JOIN.'
      }
    },
    {
      dayNumber: 3,
      theme: 'PostgreSQL Deep-Dive: Indexing, ACID & Connection Pooling',
      goal: 'Configure HikariCP, analyze EXPLAIN ANALYZE execution plans, and prevent database deadlocks.',
      completed: false,
      tasks: [
        {
          id: 'd3-t1',
          title: 'Tune HikariCP Connection Pool for Low Latency',
          description: 'Configure pool size, idle timeout, and max lifetime to match database CPU core constraints.',
          duration: '35 min',
          type: 'concept',
          completed: false,
          deliverable: 'HikariCP configuration file with calculated optimal pool size formula.',
          resource: {
            title: 'HikariCP Pool Sizing Guide',
            url: 'https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing'
          }
        },
        {
          id: 'd3-t2',
          title: 'Run EXPLAIN ANALYZE on Heavy Financial Queries',
          description: 'Identify sequential scans, add composite B-Tree indexes, and eliminate temporary disk writes.',
          duration: '50 min',
          type: 'practice',
          completed: false,
          deliverable: 'Query optimization benchmark showing 10x latency drop.',
          resource: {
            title: 'Use The Index, Luke: SQL Indexing Guide',
            url: 'https://use-the-index-luke.com/'
          }
        }
      ],
      quiz: {
        id: 'q-d3',
        question: 'What is the recommended HikariCP connection pool size formula according to PostgreSQL performance guidelines?',
        options: [
          'Connections = (Core_Count * 2) + Effective_Spindle_Count',
          'Connections = Max_Concurrent_HTTP_Requests',
          'Connections = 500 fixed pool',
          'Connections = Total_Active_Spring_Beans'
        ],
        correctIndex: 0,
        explanation: 'PostgreSQL utilizes a process-per-connection model. Excessive connections cause heavy context switching. The proven formula is (Core_Count * 2) + Disk_Spindle_Count.'
      }
    },
    {
      dayNumber: 4,
      theme: 'Apache Kafka: Partitions, Consumer Groups & Exactly-Once Semantics',
      goal: 'Bridge the critical gap! Master Kafka consumer offset commits, idempotency, and transactional outbox.',
      completed: false,
      tasks: [
        {
          id: 'd4-t1',
          title: 'Kafka Architecture: Partition Keys & Consumer Group Rebalancing',
          description: 'Understand how partition key hashing guarantees ordered event processing and how cooperative sticky rebalance works.',
          duration: '50 min',
          type: 'concept',
          completed: false,
          deliverable: 'Architecture diagram showing 3-partition topic distributed across 3 consumers.',
          resource: {
            title: 'Confluent: Kafka Internals & Consumer Groups',
            url: 'https://www.confluent.io/blog/cooperative-rebalancing-in-kafka-streams-consumer-ksqldb/'
          }
        },
        {
          id: 'd4-t2',
          title: 'Implement the Transactional Outbox Pattern in Spring Boot',
          description: 'Eliminate dual-write hazards between PostgreSQL and Kafka by writing events to an `outbox` table in the same DB transaction.',
          duration: '75 min',
          type: 'build',
          completed: false,
          deliverable: 'Working Outbox publisher with Debezium CDC or Scheduled polling worker.',
          resource: {
            title: 'Microservices.io: Transactional Outbox Pattern',
            url: 'https://microservices.io/patterns/data/transactional-outbox.html'
          }
        }
      ],
      quiz: {
        id: 'q-d4',
        question: 'In Apache Kafka, what happens if consumer A crashes while processing a batch before committing offsets to `__consumer_offsets`?',
        options: [
          'The uncommitted messages are permanently deleted from Kafka topic',
          'Kafka reassigns the partition to another consumer in the group, which will re-read from the last committed offset (at-least-once)',
          'Kafka throws a fatal BrokerNotAvailableException and shuts down',
          'The producer is automatically triggered to reissue all messages'
        ],
        correctIndex: 1,
        explanation: 'Because offsets were uncommitted, the rebalanced consumer will read the messages again from the last committed position. This demonstrates why consumers MUST be idempotent.'
      }
    },
    {
      dayNumber: 5,
      theme: 'Distributed Resilience with Resilience4j (Circuit Breaker & Rate Limiting)',
      goal: 'Protect microservices from cascading failures using circuit breakers, fallbacks, and thread pools.',
      completed: false,
      tasks: [
        {
          id: 'd5-t1',
          title: 'Configure Resilience4j CircuitBreaker with Spring Boot Actuator',
          description: 'Set failureRateThreshold, waitDurationInOpenState, and monitor health endpoints.',
          duration: '45 min',
          type: 'build',
          completed: false,
          deliverable: 'Spring Boot service with fallback method and Actuator metrics.',
          resource: {
            title: 'Resilience4j Documentation for Spring Boot',
            url: 'https://resilience4j.readme.io/docs/getting-started-3'
          }
        },
        {
          id: 'd5-t2',
          title: 'Implement Token Bucket Rate Limiting for Public Financial Endpoints',
          description: 'Prevent DDoS and abusive client requests using Bucket4j / Resilience4j RateLimiter.',
          duration: '40 min',
          type: 'practice',
          completed: false,
          deliverable: 'Filter rejecting requests exceeding 100 req/min with HTTP 429 Too Many Requests.',
          resource: {
            title: 'Baeldung: Rate Limiting with Resilience4j',
            url: 'https://www.baeldung.com/spring-bucket4j'
          }
        }
      ],
      quiz: {
        id: 'q-d5',
        question: 'When a Resilience4j Circuit Breaker transitions to the `HALF_OPEN` state, what is its primary behavior?',
        options: [
          'It continues to immediately reject all requests with CallNotPermittedException',
          'It permits a configurable number of trial requests to probe if the downstream service has recovered',
          'It immediately resets all failure metrics and reopens the circuit',
          'It reboots the application JVM container'
        ],
        correctIndex: 1,
        explanation: 'In the HALF_OPEN state, the circuit breaker allows a limited number of requests (e.g., permittedNumberOfCallsInHalfOpenState = 10) through. If they succeed, it returns to CLOSED; if they fail, it trips back to OPEN.'
      }
    },
    {
      dayNumber: 6,
      theme: 'High-Scale System Design: Idempotent Payment & Ledger Gateway',
      goal: 'Design end-to-end distributed transaction architecture with dual-entry ledger and deduplication keys.',
      completed: false,
      tasks: [
        {
          id: 'd6-t1',
          title: 'Design Idempotency Key Handling with Redis & DB Unique Constraints',
          description: 'Store incoming `Idempotency-Key` in Redis with SETNX + PostgreSQL unique index for absolute consistency.',
          duration: '60 min',
          type: 'build',
          completed: false,
          deliverable: 'System design diagram and pseudo-code algorithm for idempotent request handling.',
          resource: {
            title: 'Stripe Engineering: Designing Robust and Idempotent APIs',
            url: 'https://stripe.com/blog/idempotency'
          }
        },
        {
          id: 'd6-t2',
          title: 'Double-Entry Accounting Architecture in Spring Boot',
          description: 'Ensure immutable ledger entries with zero account balance mutation in-place (Credits = Debits).',
          duration: '45 min',
          type: 'concept',
          completed: false,
          deliverable: 'Database DDL and JPA entities for double-entry financial ledger.',
          resource: {
            title: 'Modern Financial Ledger Architecture',
            url: 'https://www.moderntreasury.com/learn/double-entry-accounting'
          }
        }
      ],
      quiz: {
        id: 'q-d6',
        question: 'Why should financial ledger balances be computed as the sum of immutable ledger postings rather than updating a single `account.balance` column directly?',
        options: [
          'Because immutable append-only logs provide a complete audit trail and prevent race condition write-skews',
          'Because PostgreSQL does not allow UPDATE queries on numeric fields',
          'Because immutable tables use zero disk space',
          'Because JPA does not support UPDATE queries'
        ],
        correctIndex: 0,
        explanation: 'Append-only ledger entries eliminate lost update anomalies, enable full point-in-time auditing, and guarantee mathematical verification that total debits equal total credits.'
      }
    },
    {
      dayNumber: 7,
      theme: 'Senior Technical Interview Simulation & Resume Evidence Polishing',
      goal: 'Execute real-time mock interviews, polish portfolio GitHub repos, and finalize application follow-ups.',
      completed: false,
      tasks: [
        {
          id: 'd7-t1',
          title: 'Complete 3 Full AI Mock Technical Rounds',
          description: 'Practice high-pressure questions on Kafka, Spring Boot Virtual Threads, and PostgreSQL deadlock resolution.',
          duration: '60 min',
          type: 'practice',
          completed: false,
          deliverable: 'AI evaluation score exceeding 85% across all rubric categories.',
          resource: {
            title: 'Senior Java Backend Interview Playbook',
            url: 'https://github.com/alexm-dev'
          }
        },
        {
          id: 'd7-t2',
          title: 'Refactor Resume Bullet Points with Concrete Java & Kafka Metrics',
          description: 'Rewrite resume experience to showcase the 7-day sprint deliverables and proof of competency.',
          duration: '45 min',
          type: 'review',
          completed: false,
          deliverable: 'Updated ATS-compliant resume highlighting Spring Boot 3 & Kafka outbox pattern.',
          resource: {
            title: 'Career Pilot Resume Evidence Refactoring Tool',
            url: '#'
          }
        }
      ],
      quiz: {
        id: 'q-d7',
        question: 'What is the most compelling way to describe your newly bridged Java & Kafka project on your resume to pass senior hiring screens?',
        options: [
          'Learned Java and Kafka online in a tutorial course',
          'Architected an idempotent payment ledger using Java 21, Spring Boot 3, and Kafka transactional outbox handling 5,000 events/sec with zero duplicate postings',
          'Wrote some Java code with Spring framework',
          'Read documentation on Apache Kafka'
        ],
        correctIndex: 1,
        explanation: 'High-impact hiring managers look for the Action + Metric + Technical Architecture pattern. Quantifying throughput and naming architectural patterns establishes senior credibility.'
      }
    }
  ]
};

export const DEMO_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'iq-1',
    role: 'Senior Java Backend Engineer',
    category: 'Apache Kafka & Distributed Idempotency',
    difficulty: 'Senior',
    question:
      'How do you guarantee exactly-once processing and prevent duplicate message consumption in Apache Kafka when processing financial transactions in a Spring Boot application?',
    context:
      'In distributed fintech systems, network timeouts, consumer crashes, or broker rebalances frequently trigger message redelivery. Interviewers want to see how you prevent duplicate balance deductions.',
    keyPointsExpected: [
      'Kafka default is at-least-once delivery; consumer must be idempotent',
      'Transactional Outbox Pattern or Debezium CDC for atomic DB-to-broker publishing',
      'Idempotent Consumer pattern using unique Transaction ID / Idempotency Key in DB with atomic check-and-insert',
      'Kafka Producer `enable.idempotence=true` and transaction coordinator for producer-side guarantees',
      'Proper manual ack (`AckMode.MANUAL_IMMEDIATE`) after DB transaction commits successfully'
    ]
  },
  {
    id: 'iq-2',
    role: 'Senior Java Backend Engineer',
    category: 'Modern Java 21 & Concurrency',
    difficulty: 'Senior',
    question:
      'How do Java 21 Virtual Threads differ from traditional platform threads, and what common anti-pattern (like thread pinning) must you avoid in a Spring Boot application?',
    context:
      'Java 21 Project Loom introduced lightweight virtual threads. Evaluators test if you understand carrier threads, OS thread mapping, and synchronized block pinning.',
    keyPointsExpected: [
      'Virtual threads are lightweight user-mode threads managed by the JVM, not 1:1 OS threads',
      'Mounted onto Carrier Threads (ForkJoinPool) during CPU work; unmounted during blocking I/O',
      'Pinning happens when executing inside `synchronized` blocks or native code (JNI), blocking carrier thread',
      'Remedy: Replace `synchronized` with `ReentrantLock` for blocking I/O',
      'Thread pooling anti-pattern: do not pool virtual threads (`Executors.newVirtualThreadPerTaskExecutor()`)'
    ]
  },
  {
    id: 'iq-3',
    role: 'Senior Java Backend Engineer',
    category: 'Database Concurrency & Locking',
    difficulty: 'Senior',
    question:
      'When two concurrent requests attempt to decrement an account balance in PostgreSQL, how do you prevent race condition lost updates and handle deadlocks?',
    context:
      'Tests understanding of ACID isolation levels, Optimistic Locking (`@Version`), and Pessimistic Locking (`SELECT FOR UPDATE`).',
    keyPointsExpected: [
      'Read-Modify-Write anomaly in `READ COMMITTED` isolation',
      'Optimistic locking with `@Version` column checking version at commit time',
      'Pessimistic write locking with `SELECT ... FOR UPDATE` or conditional atomic SQL `UPDATE account SET balance = balance - :amount WHERE id = :id AND balance >= :amount`',
      'Deadlock prevention by enforcing consistent lock acquisition ordering across transactions',
      'Exponential backoff and retry policy with Spring `@Retryable`'
    ]
  }
];

export const DEMO_WEAK_ANSWER = `I just put @KafkaListener on the method and add a try-catch block. If an error occurs, it just retries or Kafka drops it. Also we can increase the thread count in the config file.`;

export const DEMO_WEAK_EVALUATION: InterviewEvaluation = {
  id: 'eval-demo-weak',
  questionId: 'iq-1',
  questionText:
    'How do you guarantee exactly-once processing and prevent duplicate message consumption in Apache Kafka when processing financial transactions in a Spring Boot application?',
  userAnswer: DEMO_WEAK_ANSWER,
  score: 34,
  verdict: 'Critical Gap',
  rubrics: {
    technicalDepth: 25,
    systemArchitecture: 30,
    clarity: 45,
    evidenceAndExamples: 35
  },
  strongPoints: [
    'Recognized `@KafkaListener` annotation in Spring Boot',
    'Aware that exception handling and retries are involved'
  ],
  improvementAreas: [
    'Failed to explain that Kafka inherently provides at-least-once delivery and requires consumer-side idempotency',
    'Missing Idempotent Consumer Pattern (storing transaction IDs in a deduplication database table)',
    'Did not mention the Transactional Outbox Pattern for publishing events atomically with database writes',
    'Did not address consumer offset commits (`AckMode.MANUAL_IMMEDIATE`) or duplicate redelivery on rebalance',
    'Suggesting "Kafka drops it" is unacceptable for a mission-critical financial ledger'
  ],
  weakTopics: [
    'Apache Kafka Exactly-Once & Idempotency Semantics',
    'Transactional Outbox Pattern & Database Deduplication',
    'Kafka Consumer Offset Acknowledgment Mechanics'
  ],
  suggestedAnswer:
    'To guarantee end-to-end idempotency in a financial ledger: 1) On the Producer side, enable Kafka idempotence (`enable.idempotence=true`) and adopt the Transactional Outbox pattern so database updates and outbound events commit atomically. 2) On the Consumer side, treat every event as at-least-once. Extract the unique `transaction_id` from the Kafka payload or header and execute an atomic `INSERT INTO processed_events (transaction_id) VALUES (?)` within the local DB transaction. 3) If a unique constraint violation occurs, cleanly acknowledge the message and discard duplicate processing. 4) Acknowledge Kafka offsets manually (`AckMode.MANUAL_IMMEDIATE`) only AFTER the database transaction successfully commits.',
  createdAt: '2026-10-31T10:45:00Z'
};

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    company: 'Apex Fintech Platforms',
    role: 'Senior Java Backend Engineer',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$165,000 - $185,000',
    status: 'interviewing',
    fitScore: 68,
    jobUrl: 'https://apexfintech.example.com/careers/sr-java-backend',
    nextAction: 'Technical Screen: Kafka & System Design round with VP of Engineering',
    followUpDate: '2026-11-04',
    notes: 'Recruiter highlighted deep focus on Kafka consumer idempotency and Spring Boot 3 microservice resilience. Need to demonstrate outbox pattern demo.',
    dateAdded: '2026-10-28'
  },
  {
    id: 'app-2',
    company: 'Revolut Banking Systems',
    role: 'Java Platform Engineer (Payments)',
    location: 'Remote (US/EU)',
    salary: '$160,000 - $180,000',
    status: 'applied',
    fitScore: 72,
    jobUrl: 'https://revolut.example.com/careers/backend-java',
    nextAction: 'Follow up with recruiter on application status',
    followUpDate: '2026-11-03',
    notes: 'Submitted customized resume with Day 1 & Day 2 project links.',
    dateAdded: '2026-10-29'
  },
  {
    id: 'app-3',
    company: 'Stripe Global Infrastructure',
    role: 'Backend Systems Engineer',
    location: 'San Francisco, CA / Remote',
    salary: '$180,000 - $210,000',
    status: 'wishlist',
    fitScore: 78,
    jobUrl: 'https://stripe.com/jobs/infrastructure-systems',
    nextAction: 'Ask college alumni for warm referral after completing Day 6 payment gateway demo',
    followUpDate: '2026-11-06',
    notes: 'Strict requirements on high-scale distributed systems and idempotency.',
    dateAdded: '2026-10-30'
  },
  {
    id: 'app-4',
    company: 'Monzo Bank Core Team',
    role: 'Senior Backend Engineer',
    location: 'Remote',
    salary: '$150,000 - $175,000',
    status: 'applied',
    fitScore: 65,
    jobUrl: 'https://monzo.example.com/careers/core-backend',
    nextAction: 'Wait for recruiter phone screen invite',
    followUpDate: '2026-11-05',
    notes: 'Microservice architecture with event streams.',
    dateAdded: '2026-10-31'
  }
];
