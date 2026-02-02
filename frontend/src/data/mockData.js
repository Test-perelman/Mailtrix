// Comprehensive mock data for Mailtrix
// Includes 10+ incoming job matches and 10+ conversation threads (incoming + outgoing)

// Utility to create dates relative to now
const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const hoursAgo = (hours) => {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

const minutesAgo = (minutes) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
};

// ============================================
// INCOMING JOB MATCHES (10+)
// ============================================

export const MOCK_JOBS = [
  {
    job_id: 'JOB001',
    job_title: 'Senior Java Developer',
    job_location: 'San Francisco, CA',
    recruiter_email: 'sarah.j@techconsultants.io',
    recruiter_name: 'Sarah Johnson',
    received_at: minutesAgo(15),
    required_skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'Kafka'],
    min_experience: 5,
    unread_count: 2,
    thread_count: 4,
    candidates: [
      {
        match_id: 'MATCH001',
        candidate_id: 'CAND001',
        candidate_name: 'John Smith',
        candidate_email: 'john.smith@email.com',
        candidate_skills: ['Java', 'Spring Boot', 'AWS', 'Docker', 'Kubernetes'],
        candidate_experience: 7,
        match_score: 94,
        match_reason: 'Strong Java/Spring expertise, AWS certified, local to SF',
        status: 'pending'
      },
      {
        match_id: 'MATCH002',
        candidate_id: 'CAND002',
        candidate_name: 'Emily Chen',
        candidate_email: 'emily.chen@email.com',
        candidate_skills: ['Java', 'Microservices', 'Kafka', 'Kubernetes'],
        candidate_experience: 5,
        match_score: 87,
        match_reason: 'Excellent microservices experience, H1B ready',
        status: 'pending'
      },
      {
        match_id: 'MATCH003',
        candidate_id: 'CAND003',
        candidate_name: 'Michael Rodriguez',
        candidate_email: 'michael.r@email.com',
        candidate_skills: ['Java', 'Spring', 'React', 'PostgreSQL'],
        candidate_experience: 6,
        match_score: 74,
        match_reason: 'Good Java skills, willing to relocate',
        status: 'pending'
      }
    ]
  },
  {
    job_id: 'JOB002',
    job_title: 'Full Stack React/Node Developer',
    job_location: 'New York, NY',
    recruiter_email: 'david.k@recruitpro.com',
    recruiter_name: 'David Kim',
    received_at: hoursAgo(2),
    required_skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'GraphQL'],
    min_experience: 4,
    unread_count: 0,
    thread_count: 2,
    candidates: [
      {
        match_id: 'MATCH004',
        candidate_id: 'CAND004',
        candidate_name: 'Priya Sharma',
        candidate_email: 'priya.s@email.com',
        candidate_skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'GraphQL'],
        candidate_experience: 5,
        match_score: 91,
        match_reason: 'Perfect stack match, NYC based, immediate availability',
        status: 'approved'
      },
      {
        match_id: 'MATCH005',
        candidate_id: 'CAND005',
        candidate_name: 'Alex Thompson',
        candidate_email: 'alex.t@email.com',
        candidate_skills: ['React', 'Vue', 'Node.js', 'PostgreSQL'],
        candidate_experience: 4,
        match_score: 82,
        match_reason: 'Strong frontend skills, learning TypeScript',
        status: 'pending'
      }
    ]
  },
  {
    job_id: 'JOB003',
    job_title: 'DevOps Engineer - Kubernetes Specialist',
    job_location: 'Austin, TX',
    recruiter_email: 'maria.g@staffingsolutions.net',
    recruiter_name: 'Maria Garcia',
    received_at: hoursAgo(5),
    required_skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD'],
    min_experience: 6,
    unread_count: 1,
    thread_count: 3,
    candidates: [
      {
        match_id: 'MATCH006',
        candidate_id: 'CAND006',
        candidate_name: 'James Wilson',
        candidate_email: 'james.w@email.com',
        candidate_skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins'],
        candidate_experience: 8,
        match_score: 96,
        match_reason: 'CKA certified, extensive K8s experience, Austin local',
        status: 'pending'
      },
      {
        match_id: 'MATCH007',
        candidate_id: 'CAND007',
        candidate_name: 'Sarah Park',
        candidate_email: 'sarah.p@email.com',
        candidate_skills: ['Kubernetes', 'Docker', 'GCP', 'Ansible'],
        candidate_experience: 5,
        match_score: 78,
        match_reason: 'Good K8s skills, GCP focused but adaptable',
        status: 'rejected'
      }
    ]
  },
  {
    job_id: 'JOB004',
    job_title: 'Python/ML Engineer',
    job_location: 'Seattle, WA',
    recruiter_email: 'ryan.m@talentbridge.co',
    recruiter_name: 'Ryan Miller',
    received_at: hoursAgo(8),
    required_skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'AWS SageMaker'],
    min_experience: 4,
    unread_count: 0,
    thread_count: 0,
    candidates: [
      {
        match_id: 'MATCH008',
        candidate_id: 'CAND008',
        candidate_name: 'Lisa Wang',
        candidate_email: 'lisa.w@email.com',
        candidate_skills: ['Python', 'TensorFlow', 'PyTorch', 'Kubernetes', 'MLflow'],
        candidate_experience: 6,
        match_score: 89,
        match_reason: 'PhD in ML, production ML experience at FAANG',
        status: 'pending'
      },
      {
        match_id: 'MATCH009',
        candidate_id: 'CAND009',
        candidate_name: 'Ahmed Hassan',
        candidate_email: 'ahmed.h@email.com',
        candidate_skills: ['Python', 'TensorFlow', 'Computer Vision', 'AWS'],
        candidate_experience: 4,
        match_score: 84,
        match_reason: 'Strong CV background, transitioning to MLOps',
        status: 'pending'
      },
      {
        match_id: 'MATCH010',
        candidate_id: 'CAND010',
        candidate_name: 'Rachel Green',
        candidate_email: 'rachel.g@email.com',
        candidate_skills: ['Python', 'scikit-learn', 'Pandas', 'SQL'],
        candidate_experience: 3,
        match_score: 71,
        match_reason: 'Strong data science, limited production ML',
        status: 'pending'
      }
    ]
  },
  {
    job_id: 'JOB005',
    job_title: 'Senior .NET Developer',
    job_location: 'Chicago, IL',
    recruiter_email: 'jennifer.l@itresources.com',
    recruiter_name: 'Jennifer Lee',
    received_at: daysAgo(1),
    required_skills: ['C#', '.NET Core', 'Azure', 'SQL Server', 'Microservices'],
    min_experience: 5,
    unread_count: 3,
    thread_count: 5,
    candidates: [
      {
        match_id: 'MATCH011',
        candidate_id: 'CAND011',
        candidate_name: 'Robert Brown',
        candidate_email: 'robert.b@email.com',
        candidate_skills: ['C#', '.NET Core', 'Azure', 'SQL Server', 'RabbitMQ'],
        candidate_experience: 9,
        match_score: 95,
        match_reason: 'Microsoft MVP, 9 years .NET, Chicago native',
        status: 'approved'
      },
      {
        match_id: 'MATCH012',
        candidate_id: 'CAND012',
        candidate_name: 'Diana Martinez',
        candidate_email: 'diana.m@email.com',
        candidate_skills: ['C#', '.NET Framework', 'Azure', 'Entity Framework'],
        candidate_experience: 6,
        match_score: 81,
        match_reason: 'Solid .NET experience, upgrading to .NET Core',
        status: 'approved'
      }
    ]
  },
  {
    job_id: 'JOB006',
    job_title: 'iOS Mobile Developer',
    job_location: 'Remote (US)',
    recruiter_email: 'chris.w@mobilestaffing.io',
    recruiter_name: 'Chris Walker',
    received_at: daysAgo(1),
    required_skills: ['Swift', 'SwiftUI', 'UIKit', 'Core Data', 'Xcode'],
    min_experience: 3,
    unread_count: 0,
    thread_count: 1,
    candidates: [
      {
        match_id: 'MATCH013',
        candidate_id: 'CAND013',
        candidate_name: 'Kevin Nguyen',
        candidate_email: 'kevin.n@email.com',
        candidate_skills: ['Swift', 'SwiftUI', 'Combine', 'Core Data'],
        candidate_experience: 4,
        match_score: 88,
        match_reason: 'Published apps, SwiftUI specialist',
        status: 'pending'
      }
    ]
  },
  {
    job_id: 'JOB007',
    job_title: 'Data Engineer - Spark/Databricks',
    job_location: 'Denver, CO',
    recruiter_email: 'amanda.t@datarecruit.com',
    recruiter_name: 'Amanda Taylor',
    received_at: daysAgo(2),
    required_skills: ['Apache Spark', 'Databricks', 'Python', 'Delta Lake', 'Azure'],
    min_experience: 4,
    unread_count: 0,
    thread_count: 0,
    candidates: [
      {
        match_id: 'MATCH014',
        candidate_id: 'CAND014',
        candidate_name: 'Carlos Rivera',
        candidate_email: 'carlos.r@email.com',
        candidate_skills: ['Apache Spark', 'Databricks', 'Python', 'AWS Glue'],
        candidate_experience: 5,
        match_score: 86,
        match_reason: 'Databricks certified, strong Spark optimization',
        status: 'pending'
      },
      {
        match_id: 'MATCH015',
        candidate_id: 'CAND015',
        candidate_name: 'Michelle Lee',
        candidate_email: 'michelle.l@email.com',
        candidate_skills: ['Apache Spark', 'Scala', 'Kafka', 'Airflow'],
        candidate_experience: 4,
        match_score: 79,
        match_reason: 'Strong Spark, learning Databricks specifically',
        status: 'pending'
      }
    ]
  },
  {
    job_id: 'JOB008',
    job_title: 'Go/Golang Backend Developer',
    job_location: 'Boston, MA',
    recruiter_email: 'mark.s@techtalent.net',
    recruiter_name: 'Mark Stevens',
    received_at: daysAgo(2),
    required_skills: ['Go', 'gRPC', 'PostgreSQL', 'Redis', 'Docker'],
    min_experience: 3,
    unread_count: 1,
    thread_count: 2,
    candidates: [
      {
        match_id: 'MATCH016',
        candidate_id: 'CAND016',
        candidate_name: 'Tom Anderson',
        candidate_email: 'tom.a@email.com',
        candidate_skills: ['Go', 'gRPC', 'PostgreSQL', 'Redis', 'Kubernetes'],
        candidate_experience: 4,
        match_score: 92,
        match_reason: 'Go since 1.8, contributed to open source Go projects',
        status: 'pending'
      }
    ]
  },
  {
    job_id: 'JOB009',
    job_title: 'Security Engineer - Cloud',
    job_location: 'Washington, DC',
    recruiter_email: 'patricia.j@clearedstaffing.com',
    recruiter_name: 'Patricia Jones',
    received_at: daysAgo(3),
    required_skills: ['AWS Security', 'IAM', 'SIEM', 'Compliance', 'Terraform'],
    min_experience: 5,
    unread_count: 0,
    thread_count: 4,
    candidates: [
      {
        match_id: 'MATCH017',
        candidate_id: 'CAND017',
        candidate_name: 'Daniel Clark',
        candidate_email: 'daniel.c@email.com',
        candidate_skills: ['AWS Security', 'IAM', 'GuardDuty', 'Terraform'],
        candidate_experience: 7,
        match_score: 90,
        match_reason: 'CISSP, AWS Security Specialty, clearance eligible',
        status: 'approved'
      },
      {
        match_id: 'MATCH018',
        candidate_id: 'CAND018',
        candidate_name: 'Laura Davis',
        candidate_email: 'laura.d@email.com',
        candidate_skills: ['Azure Security', 'IAM', 'Splunk', 'Python'],
        candidate_experience: 5,
        match_score: 76,
        match_reason: 'Strong security background, transitioning from Azure',
        status: 'pending'
      }
    ]
  },
  {
    job_id: 'JOB010',
    job_title: 'Angular Frontend Developer',
    job_location: 'Miami, FL',
    recruiter_email: 'nicole.b@codingtalent.io',
    recruiter_name: 'Nicole Brown',
    received_at: daysAgo(4),
    required_skills: ['Angular', 'TypeScript', 'RxJS', 'NgRx', 'Jest'],
    min_experience: 3,
    unread_count: 0,
    thread_count: 0,
    candidates: [
      {
        match_id: 'MATCH019',
        candidate_id: 'CAND019',
        candidate_name: 'Maria Santos',
        candidate_email: 'maria.s@email.com',
        candidate_skills: ['Angular', 'TypeScript', 'RxJS', 'NgRx'],
        candidate_experience: 4,
        match_score: 85,
        match_reason: 'Angular specialist since v4, Miami based',
        status: 'pending'
      },
      {
        match_id: 'MATCH020',
        candidate_id: 'CAND020',
        candidate_name: 'Jason White',
        candidate_email: 'jason.w@email.com',
        candidate_skills: ['Angular', 'React', 'TypeScript', 'Node.js'],
        candidate_experience: 3,
        match_score: 77,
        match_reason: 'Good Angular skills, also strong in React',
        status: 'pending'
      }
    ]
  },
  {
    job_id: 'JOB011',
    job_title: 'Salesforce Developer',
    job_location: 'Phoenix, AZ',
    recruiter_email: 'brian.c@crmsolutions.co',
    recruiter_name: 'Brian Carter',
    received_at: daysAgo(5),
    required_skills: ['Apex', 'Lightning', 'SOQL', 'Salesforce DX', 'Integration'],
    min_experience: 4,
    unread_count: 2,
    thread_count: 3,
    candidates: [
      {
        match_id: 'MATCH021',
        candidate_id: 'CAND021',
        candidate_name: 'Ashley Moore',
        candidate_email: 'ashley.m@email.com',
        candidate_skills: ['Apex', 'Lightning', 'SOQL', 'Visualforce'],
        candidate_experience: 5,
        match_score: 88,
        match_reason: 'Salesforce certified x3, strong integrations',
        status: 'pending'
      }
    ]
  },
  {
    job_id: 'JOB012',
    job_title: 'Blockchain/Web3 Developer',
    job_location: 'Remote (Worldwide)',
    recruiter_email: 'tech@web3talent.xyz',
    recruiter_name: 'Anonymous (Web3 Talent)',
    received_at: daysAgo(6),
    required_skills: ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3.js', 'DeFi'],
    min_experience: 2,
    unread_count: 0,
    thread_count: 1,
    candidates: [
      {
        match_id: 'MATCH022',
        candidate_id: 'CAND022',
        candidate_name: 'Satoshi Yamamoto',
        candidate_email: 'satoshi.y@email.com',
        candidate_skills: ['Solidity', 'Ethereum', 'Hardhat', 'React', 'ethers.js'],
        candidate_experience: 3,
        match_score: 93,
        match_reason: 'Built 5 DeFi protocols, security audit experience',
        status: 'pending'
      },
      {
        match_id: 'MATCH023',
        candidate_id: 'CAND023',
        candidate_name: 'Elena Petrova',
        candidate_email: 'elena.p@email.com',
        candidate_skills: ['Solidity', 'Rust', 'Solana', 'Web3.js'],
        candidate_experience: 2,
        match_score: 80,
        match_reason: 'Multi-chain experience, Solana + Ethereum',
        status: 'pending'
      }
    ]
  }
];

// ============================================
// CONVERSATION THREADS (10+ with mix of inbound/outbound)
// ============================================

export const MOCK_THREADS = {
  'JOB001': [
    {
      id: 'MSG001',
      direction: 'inbound',
      from_name: 'Sarah Johnson',
      from_email: 'sarah.j@techconsultants.io',
      body: 'Hi there,\n\nI have an urgent requirement for a Senior Java Developer position at a Fortune 500 client in San Francisco. Looking for someone with 5+ years of Java/Spring experience.\n\nRate: $80-$90/hr on W2\nStart: ASAP\n\nLet me know if you have any matching candidates!',
      sent_at: minutesAgo(30),
      is_read: true
    },
    {
      id: 'MSG002',
      direction: 'outbound',
      from_name: 'Mailtrix System',
      from_email: 'no-reply@mailtrix.app',
      body: 'Hi Sarah,\n\nThank you for the opportunity! I have 3 strong candidates for this role:\n\n1. John Smith - 7 years Java, AWS certified\n2. Emily Chen - 5 years, microservices specialist\n3. Michael Rodriguez - 6 years, willing to relocate\n\nResumes attached. Let me know who you\'d like to schedule interviews with.',
      sent_at: minutesAgo(25),
      is_read: true
    },
    {
      id: 'MSG003',
      direction: 'inbound',
      from_name: 'Sarah Johnson',
      from_email: 'sarah.j@techconsultants.io',
      body: 'Great, John Smith looks perfect! Can we schedule a call with him tomorrow at 2pm PST?',
      sent_at: minutesAgo(18),
      is_read: false
    },
    {
      id: 'MSG004',
      direction: 'inbound',
      from_name: 'Sarah Johnson',
      from_email: 'sarah.j@techconsultants.io',
      body: 'Also, do you have his latest resume with the AWS certifications listed?',
      sent_at: minutesAgo(15),
      is_read: false
    }
  ],
  'JOB002': [
    {
      id: 'MSG005',
      direction: 'inbound',
      from_name: 'David Kim',
      from_email: 'david.k@recruitpro.com',
      body: 'Looking for a Full Stack developer for a fintech startup in NYC. Must be comfortable with React, Node.js, and GraphQL. Competitive comp package with equity.',
      sent_at: hoursAgo(3),
      is_read: true
    },
    {
      id: 'MSG006',
      direction: 'outbound',
      from_name: 'Mailtrix System',
      from_email: 'no-reply@mailtrix.app',
      body: 'Hi David,\n\nI have submitted Priya Sharma for this role. She has 5 years of experience with exactly the stack you need and is based in NYC.\n\nResume attached.',
      sent_at: hoursAgo(2),
      is_read: true
    }
  ],
  'JOB003': [
    {
      id: 'MSG007',
      direction: 'inbound',
      from_name: 'Maria Garcia',
      from_email: 'maria.g@staffingsolutions.net',
      body: 'Hi team,\n\nUrgent need for a Kubernetes expert in Austin. Client is a major cloud provider. CKA certification strongly preferred.\n\nThis is a 12-month contract with potential extension.',
      sent_at: hoursAgo(6),
      is_read: true
    },
    {
      id: 'MSG008',
      direction: 'outbound',
      from_name: 'Mailtrix System',
      from_email: 'no-reply@mailtrix.app',
      body: 'Maria,\n\nJames Wilson would be perfect for this. He\'s CKA certified with 8 years of DevOps experience and is currently in Austin.\n\nWould you like to schedule a technical interview?',
      sent_at: hoursAgo(5),
      is_read: true
    },
    {
      id: 'MSG009',
      direction: 'inbound',
      from_name: 'Maria Garcia',
      from_email: 'maria.g@staffingsolutions.net',
      body: 'Sounds great! What\'s his rate expectation? Client budget is $95-$105/hr.',
      sent_at: hoursAgo(4),
      is_read: false
    }
  ],
  'JOB005': [
    {
      id: 'MSG010',
      direction: 'inbound',
      from_name: 'Jennifer Lee',
      from_email: 'jennifer.l@itresources.com',
      body: 'Need a .NET expert for a healthcare client in Chicago. Must have Azure experience and understand HIPAA compliance.',
      sent_at: daysAgo(1) + 'T10:00:00Z',
      is_read: true
    },
    {
      id: 'MSG011',
      direction: 'outbound',
      from_name: 'Mailtrix System',
      from_email: 'no-reply@mailtrix.app',
      body: 'Jennifer,\n\nI\'ve submitted Robert Brown and Diana Martinez for this role. Robert is a Microsoft MVP with 9 years of .NET experience, and Diana has 6 years with healthcare sector experience.\n\nBoth are Chicago natives.',
      sent_at: daysAgo(1) + 'T11:30:00Z',
      is_read: true
    },
    {
      id: 'MSG012',
      direction: 'inbound',
      from_name: 'Jennifer Lee',
      from_email: 'jennifer.l@itresources.com',
      body: 'Robert looks amazing! Can he start within 2 weeks?',
      sent_at: daysAgo(1) + 'T14:00:00Z',
      is_read: false
    },
    {
      id: 'MSG013',
      direction: 'inbound',
      from_name: 'Jennifer Lee',
      from_email: 'jennifer.l@itresources.com',
      body: 'Also, the client wants to schedule a technical assessment. Can Robert do a coding test this week?',
      sent_at: daysAgo(1) + 'T15:00:00Z',
      is_read: false
    },
    {
      id: 'MSG014',
      direction: 'inbound',
      from_name: 'Jennifer Lee',
      from_email: 'jennifer.l@itresources.com',
      body: 'One more thing - does Diana have any Azure certifications?',
      sent_at: hoursAgo(3),
      is_read: false
    }
  ],
  'JOB006': [
    {
      id: 'MSG015',
      direction: 'inbound',
      from_name: 'Chris Walker',
      from_email: 'chris.w@mobilestaffing.io',
      body: 'Looking for an iOS developer for a remote position. Must know SwiftUI. This is for a well-funded health tech startup.',
      sent_at: daysAgo(1) + 'T09:00:00Z',
      is_read: true
    }
  ],
  'JOB008': [
    {
      id: 'MSG016',
      direction: 'inbound',
      from_name: 'Mark Stevens',
      from_email: 'mark.s@techtalent.net',
      body: 'Hi,\n\nWe need a Go developer for a high-throughput trading platform. gRPC experience is critical. Boston location preferred but hybrid OK.',
      sent_at: daysAgo(2) + 'T11:00:00Z',
      is_read: true
    },
    {
      id: 'MSG017',
      direction: 'outbound',
      from_name: 'Mailtrix System',
      from_email: 'no-reply@mailtrix.app',
      body: 'Mark,\n\nTom Anderson is exactly what you need - 4 years of Go experience and he\'s contributed to several open-source gRPC projects.\n\nHe\'s currently in Boston area.',
      sent_at: daysAgo(2) + 'T12:00:00Z',
      is_read: true
    }
  ],
  'JOB009': [
    {
      id: 'MSG018',
      direction: 'inbound',
      from_name: 'Patricia Jones',
      from_email: 'patricia.j@clearedstaffing.com',
      body: 'Need a Cloud Security Engineer for a government contractor. Clearance eligibility required. Strong AWS Security background needed.',
      sent_at: daysAgo(3) + 'T08:00:00Z',
      is_read: true
    },
    {
      id: 'MSG019',
      direction: 'outbound',
      from_name: 'Mailtrix System',
      from_email: 'no-reply@mailtrix.app',
      body: 'Patricia,\n\nDaniel Clark is our top candidate for this. He\'s CISSP certified, has the AWS Security Specialty certification, and is clearance eligible.\n\nShould I arrange an interview?',
      sent_at: daysAgo(3) + 'T09:00:00Z',
      is_read: true
    },
    {
      id: 'MSG020',
      direction: 'inbound',
      from_name: 'Patricia Jones',
      from_email: 'patricia.j@clearedstaffing.com',
      body: 'Yes please! Also, what\'s his current clearance status?',
      sent_at: daysAgo(3) + 'T10:00:00Z',
      is_read: true
    },
    {
      id: 'MSG021',
      direction: 'outbound',
      from_name: 'Mailtrix System',
      from_email: 'no-reply@mailtrix.app',
      body: 'He currently holds Secret clearance and is eligible for TS/SCI based on his previous work.',
      sent_at: daysAgo(3) + 'T11:00:00Z',
      is_read: true
    }
  ],
  'JOB011': [
    {
      id: 'MSG022',
      direction: 'inbound',
      from_name: 'Brian Carter',
      from_email: 'brian.c@crmsolutions.co',
      body: 'Looking for a Salesforce developer for a large manufacturing client. Need someone who can handle complex integrations with ERP systems.',
      sent_at: daysAgo(5) + 'T14:00:00Z',
      is_read: true
    },
    {
      id: 'MSG023',
      direction: 'outbound',
      from_name: 'Mailtrix System',
      from_email: 'no-reply@mailtrix.app',
      body: 'Brian,\n\nAshley Moore has extensive experience with Salesforce integrations, including SAP and Oracle ERP systems. She\'s triple-certified.\n\nAvailable for an interview this week.',
      sent_at: daysAgo(5) + 'T15:00:00Z',
      is_read: true
    },
    {
      id: 'MSG024',
      direction: 'inbound',
      from_name: 'Brian Carter',
      from_email: 'brian.c@crmsolutions.co',
      body: 'Perfect! Can you send over her availability for Thursday?',
      sent_at: daysAgo(4) + 'T09:00:00Z',
      is_read: false
    },
    {
      id: 'MSG025',
      direction: 'inbound',
      from_name: 'Brian Carter',
      from_email: 'brian.c@crmsolutions.co',
      body: 'Also, what are her rate expectations?',
      sent_at: daysAgo(4) + 'T09:15:00Z',
      is_read: false
    }
  ],
  'JOB012': [
    {
      id: 'MSG026',
      direction: 'inbound',
      from_name: 'Anonymous (Web3 Talent)',
      from_email: 'tech@web3talent.xyz',
      body: 'gm fren,\n\nLooking for a Solidity dev for a new DeFi protocol. Must have experience with auditing and understand MEV. Remote OK, token compensation available.\n\nngmi without the right person tbh',
      sent_at: daysAgo(6) + 'T20:00:00Z',
      is_read: true
    }
  ]
};

// Function to load mock data into localStorage
export const loadMockData = () => {
  localStorage.setItem('mailtrix_matches', JSON.stringify(MOCK_JOBS));
  localStorage.setItem('mailtrix_threads', JSON.stringify(MOCK_THREADS));
  // Trigger page reload to apply
  window.location.reload();
};

// Function to clear all data
export const clearAllData = () => {
  localStorage.removeItem('mailtrix_matches');
  localStorage.removeItem('mailtrix_threads');
  window.location.reload();
};

export default {
  MOCK_JOBS,
  MOCK_THREADS,
  loadMockData,
  clearAllData
};
