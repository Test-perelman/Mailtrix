# Mailtrix

Automated recruiter email processing system for H1B consulting firm. Zero-budget, Google Sheets as database, n8n as backend, Anti Gravity frontend.

## System Overview

**Problem**: Manual screening of recruiter emails wastes hours. Matching candidates to jobs is tedious. Email thread management is error-prone.

**Solution**: Automated email classification → job extraction → candidate matching → approval workflow → reply automation.

**Core Principle**: AI classifies and scores. Deterministic logic filters. Humans approve. No hallucination, no auto-send.

---

## Architecture

### Two n8n Workflows

**Workflow 1: Inbound Intelligence Pipeline**
- Trigger: Gmail (new emails)
- Output: Webhook POST to frontend dashboard with matched candidates
- Purpose: Email → structured job → candidate suggestions

**Workflow 2: Approval-Triggered Reply**
- Trigger: Webhook from frontend (manager approval)
- Output: Email sent to recruiter (new or threaded reply)
- Purpose: Manager approval → email send + logging

### Technology Stack
- **Backend**: n8n (self-hosted or cloud)
- **Database**: Google Sheets (candidates, jobs, matches)
- **Frontend**: Anti Gravity dashboard
- **Email**: Gmail API
- **AI**: OpenAI API (classification, extraction, scoring only)

---

## Data Model (Google Sheets)

### Sheet: `candidates`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | string | Unique candidate ID | `CAND001` |
| `name` | string | Full name | `John Smith` |
| `email` | string | Contact email | `john@example.com` |
| `phone` | string | Phone number | `+1-234-567-8900` |
| `visa_status` | string | H1B/GC/USC/EAD | `H1B` |
| `location` | string | Current location | `San Francisco, CA` |
| `willing_to_relocate` | boolean | TRUE/FALSE | `FALSE` |
| `years_experience` | number | Total years | `5` |
| `primary_skills` | string | Comma-separated | `Java,Spring,AWS` |
| `secondary_skills` | string | Comma-separated | `Python,Docker` |
| `availability` | string | Immediate/2weeks/etc | `Immediate` |
| `current_rate` | string | $/hr expectation | `80/hr` |
| `resume_url` | string | Google Drive link | `https://drive.google.com/...` |
| `notes` | string | Internal notes | `` |
| `created_at` | timestamp | Record creation | `2025-01-28T10:00:00Z` |
| `updated_at` | timestamp | Last update | `2025-01-28T10:00:00Z` |

### Sheet: `jobs`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | string | Unique job ID | `JOB001` |
| `recruiter_email` | string | Sender email | `recruiter@vendor.com` |
| `recruiter_name` | string | Extracted name | `Jane Doe` |
| `subject` | string | Email subject | `Urgent: Java Developer - SF` |
| `message_id` | string | Gmail Message-ID | `<abc123@mail.gmail.com>` |
| `thread_id` | string | Gmail Thread-ID | `thread_xyz789` |
| `received_at` | timestamp | Email timestamp | `2025-01-28T09:00:00Z` |
| `job_title` | string | Extracted title | `Senior Java Developer` |
| `location` | string | Job location | `San Francisco, CA` |
| `remote_allowed` | boolean | Remote option | `FALSE` |
| `visa_required` | string | H1B/GC/USC/Any | `H1B` |
| `required_skills` | string | Comma-separated | `Java,Spring Boot,Microservices` |
| `preferred_skills` | string | Comma-separated | `AWS,Kafka` |
| `min_experience` | number | Years required | `5` |
| `duration` | string | Contract length | `6 months` |
| `rate_range` | string | Pay range | `$80-$90/hr` |
| `start_date` | string | Project start | `ASAP` |
| `client_name` | string | End client | `Tech Corp` |
| `raw_email_body` | string | Full email text | `` |
| `classification_confidence` | number | AI confidence (0-100) | `92` |
| `created_at` | timestamp | Record creation | `2025-01-28T09:15:00Z` |
| `status` | string | active/filled/expired | `active` |

### Sheet: `job_candidate_matches`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | string | Unique match ID | `MATCH001` |
| `job_id` | string | FK to jobs | `JOB001` |
| `candidate_id` | string | FK to candidates | `CAND001` |
| `match_score` | number | AI score (0-100) | `87` |
| `match_reason` | string | AI explanation | `Strong Java/Spring experience, local, H1B` |
| `suggested_at` | timestamp | When matched | `2025-01-28T09:20:00Z` |
| `manager_status` | string | pending/approved/rejected | `pending` |
| `manager_reviewed_at` | timestamp | Review time | `` |
| `email_sent` | boolean | Sent to recruiter | `FALSE` |
| `email_sent_at` | timestamp | Send time | `` |
| `notes` | string | Manager notes | `` |

---

## Workflow 1: Inbound Email → Dashboard

**Node Sequence:**

```
Gmail Trigger
  ↓
Email Classification (AI)
  ↓
IF confidence < 80 → Exit (ignore)
  ↓
IF type = "reply" → Route to Reply Handler (future)
  ↓
IF type = "ignore" → Exit
  ↓
IF type = "job" → Continue
  ↓
Job Extraction (AI → strict JSON)
  ↓
Validate Required Fields
  ↓
IF missing critical data → Exit (log error)
  ↓
Write to `jobs` Sheet
  ↓
Read All from `candidates` Sheet
  ↓
Deterministic Pre-Filter (Code Node)
  - Visa match
  - Location match (accounting for relocation)
  - Min experience >= required
  ↓
IF no candidates pass → Exit (log: no matches)
  ↓
AI Scoring Loop (per candidate)
  - Input: job requirements + candidate profile
  - Output: {score: 0-100, reason: string}
  ↓
Filter: score >= 70
  ↓
IF no high scores → Exit (log: low quality)
  ↓
Write to `job_candidate_matches` Sheet
  ↓
Webhook POST to Frontend Dashboard
```

### Key Nodes Detail

**1. Gmail Trigger**
- Node: `Gmail Trigger`
- Filter: Unread emails only
- Scope: Specific label or inbox

**2. Email Classification**
- Node: `OpenAI` (Chat Completion)
- System Prompt:
  ```
  Classify email as: job | reply | ignore
  Job = new job requirement from recruiter
  Reply = response to our previous email
  Ignore = spam, marketing, unrelated
  Return JSON: {type: string, confidence: number (0-100)}
  ```
- Input: Email subject + body
- Output: Parse JSON

**3. Job Extraction**
- Node: `OpenAI` (Chat Completion)
- System Prompt:
  ```
  Extract structured job data. Return ONLY valid JSON.
  Schema: {
    job_title: string,
    location: string,
    remote_allowed: boolean,
    visa_required: string (H1B/GC/USC/Any),
    required_skills: string[] (array),
    preferred_skills: string[] (array),
    min_experience: number,
    duration: string,
    rate_range: string,
    start_date: string,
    client_name: string
  }
  If field is unclear, use null. Do not guess.
  ```
- Input: Email body
- Output: Parse JSON + validate schema

**4. Deterministic Pre-Filter (Code Node - JavaScript)**
```javascript
// Input: items (candidates array), $('Job Data').first().json (job object)
const job = $('Job Data').first().json;
const candidates = items;

const filtered = candidates.filter(candidate => {
  // Visa match
  if (job.visa_required !== 'Any' && candidate.json.visa_status !== job.visa_required) {
    return false;
  }

  // Location match (exact or willing to relocate)
  const jobLoc = job.location.toLowerCase();
  const candLoc = candidate.json.location.toLowerCase();
  const locMatch = jobLoc.includes(candLoc) || candLoc.includes(jobLoc) || candidate.json.willing_to_relocate;
  if (!locMatch) return false;

  // Experience
  if (candidate.json.years_experience < job.min_experience) return false;

  return true;
});

return filtered;
```

**5. AI Scoring (Loop)**
- Node: `Loop Over Items` → `OpenAI`
- System Prompt:
  ```
  Score candidate fit for job (0-100). Consider:
  - Skill overlap (required vs possessed)
  - Experience level match
  - Location/visa alignment
  Return JSON: {score: number, reason: string (max 100 chars)}
  ```
- Input: Job JSON + Candidate JSON
- Output: Parse score + reason

**6. Webhook to Frontend**
- Node: `HTTP Request` (POST)
- URL: `{{$env.FRONTEND_WEBHOOK_URL}}/api/matches`
- Method: POST
- Body:
```json
{
  "job_id": "{{$node['Write Job'].json.id}}",
  "job_title": "{{$node['Job Data'].json.job_title}}",
  "recruiter_email": "{{$node['Gmail Trigger'].json.from}}",
  "received_at": "{{$node['Gmail Trigger'].json.date}}",
  "candidates": [
    {
      "match_id": "{{$node['Write Matches'].json.id}}",
      "candidate_id": "{{$json.candidate_id}}",
      "candidate_name": "{{$json.candidate_name}}",
      "match_score": "{{$json.match_score}}",
      "match_reason": "{{$json.match_reason}}"
    }
  ]
}
```

---

## Workflow 2: Approval → Email Send

**Node Sequence:**

```
Webhook Trigger (from frontend)
  ↓
Parse Approval Payload
  ↓
Fetch Job Details (Google Sheets)
  ↓
Fetch Candidate Details (Google Sheets) - loop
  ↓
Determine Thread Mode (new vs reply)
  ↓
Fetch Resumes (Google Drive) - loop
  ↓
Generate Email Body
  - IF new thread → Use template + AI polish
  - IF reply → Extract context + generate response
  ↓
Send Email (Gmail API)
  - TO: recruiter_email
  - SUBJECT: original or RE: original
  - ATTACHMENTS: resumes
  - HEADERS: In-Reply-To, References (if threaded)
  ↓
Update `job_candidate_matches` Sheet
  - email_sent = TRUE
  - email_sent_at = NOW()
  ↓
Return Success Response (200 OK)
```

### Key Nodes Detail

**1. Webhook Trigger**
- Node: `Webhook`
- Method: POST
- Path: `/approval`
- Authentication: API Key (header: `X-API-Key`)

**2. Fetch Job**
- Node: `Google Sheets` (Lookup Row)
- Sheet: `jobs`
- Lookup Column: `id`
- Lookup Value: `{{$json.job_id}}`

**3. Fetch Candidates**
- Node: `Loop Over Items` → `Google Sheets` (Lookup Row)
- Sheet: `candidates`
- Lookup Column: `id`
- Lookup Value: `{{$json.candidate_id}}`

**4. Thread Resolution (Code Node)**
```javascript
// Check if job has existing thread_id
const job = $('Fetch Job').first().json;

if (job.thread_id && job.message_id) {
  return [{
    json: {
      mode: 'reply',
      thread_id: job.thread_id,
      in_reply_to: job.message_id,
      subject: `RE: ${job.subject}`
    }
  }];
} else {
  return [{
    json: {
      mode: 'new',
      subject: `Candidates for ${job.job_title}`
    }
  }];
}
```

**5. Email Generation (AI - Optional)**
- Node: `OpenAI` (Chat Completion)
- System Prompt (New Email):
  ```
  Generate professional recruiter email. Tone: friendly, concise, professional.
  Include:
  - Greeting
  - Brief intro (we have candidates)
  - Candidate highlights (name, key skills, experience)
  - Next steps (schedule call, resume attached)
  - Signature
  Keep under 150 words.
  ```
- System Prompt (Reply):
  ```
  Generate reply to recruiter's email. Maintain thread context.
  Include:
  - Reference to their original message
  - Candidate details
  - Next steps
  Keep under 100 words.
  ```

**Alternative: Template-Based (Code Node)**
```javascript
const job = $('Fetch Job').first().json;
const candidates = $('Fetch Candidates').all();

const candidateList = candidates.map(c =>
  `- ${c.json.name} (${c.json.years_experience} yrs, ${c.json.primary_skills})`
).join('\n');

const body = `
Hi ${job.recruiter_name || 'there'},

Thank you for the ${job.job_title} opportunity. We have the following qualified candidates:

${candidateList}

All resumes are attached. Let me know if you'd like to schedule a call.

Best regards,
[Your Name]
[Company]
`;

return [{ json: { body } }];
```

**6. Send Email**
- Node: `Gmail` (Send Email)
- To: `{{$node['Fetch Job'].json.recruiter_email}}`
- Subject: `{{$node['Thread Resolution'].json.subject}}`
- Body: `{{$node['Generate Email'].json.body}}`
- Attachments: `{{$node['Fetch Resumes'].json.attachments}}`
- Headers (if reply):
  - `In-Reply-To`: `{{$node['Thread Resolution'].json.in_reply_to}}`
  - `References`: `{{$node['Thread Resolution'].json.in_reply_to}}`

**7. Update Matches**
- Node: `Google Sheets` (Update Row) - loop
- Sheet: `job_candidate_matches`
- Filter Column: `id`
- Filter Value: `{{$json.match_id}}`
- Update: `email_sent = TRUE, email_sent_at = {{$now}}`

---

## Webhook Contracts

### TO Frontend (Workflow 1 → Dashboard)

**Endpoint**: `POST /api/matches`

**Payload**:
```json
{
  "job_id": "JOB001",
  "job_title": "Senior Java Developer",
  "job_location": "San Francisco, CA",
  "recruiter_email": "recruiter@vendor.com",
  "recruiter_name": "Jane Doe",
  "received_at": "2025-01-28T09:00:00Z",
  "required_skills": ["Java", "Spring Boot", "Microservices"],
  "min_experience": 5,
  "candidates": [
    {
      "match_id": "MATCH001",
      "candidate_id": "CAND001",
      "candidate_name": "John Smith",
      "candidate_email": "john@example.com",
      "candidate_skills": ["Java", "Spring", "AWS"],
      "candidate_experience": 7,
      "match_score": 87,
      "match_reason": "Strong Java/Spring, local, H1B match"
    }
  ]
}
```

### FROM Frontend (Dashboard → Workflow 2)

**Endpoint**: `POST {n8n_webhook_url}/approval`

**Headers**:
```
X-API-Key: {secret_key}
Content-Type: application/json
```

**Payload**:
```json
{
  "job_id": "JOB001",
  "approved_candidates": [
    {
      "match_id": "MATCH001",
      "candidate_id": "CAND001"
    },
    {
      "match_id": "MATCH002",
      "candidate_id": "CAND005"
    }
  ],
  "manager_notes": "Prioritize John for this role"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "email_sent": true,
  "sent_at": "2025-01-28T10:30:00Z",
  "candidates_submitted": 2
}
```

---

## Rules & Guardrails

### Email Safety
1. **Never auto-send emails** - All sends require explicit manager approval via Workflow 2
2. **Always attach resumes** - Verify Google Drive URLs exist before sending
3. **Preserve email threads** - Use Message-ID/Thread-ID to maintain conversation context
4. **One send per approval** - Prevent duplicate sends by checking `email_sent` flag

### Data Integrity
1. **Required field validation** - Exit workflow if critical job fields (title, location, skills) are missing
2. **No hallucination** - AI outputs must be validated against schema; reject malformed JSON
3. **Confidence thresholding** - Ignore classifications below 80% confidence
4. **Score thresholding** - Only surface candidates scoring >= 70

### Matching Logic
1. **Deterministic first** - Filter by visa/location/experience before AI scoring
2. **AI for nuance only** - Use AI to score skill overlap and fit, not for hard requirements
3. **Explicit is better** - Prefer template-based emails over pure AI generation
4. **Deduplication** - Same candidate can match multiple jobs (this is intentional)

### Logging & Auditability
1. **Timestamp everything** - created_at, updated_at, sent_at on all records
2. **Store raw data** - Keep full email body in `jobs.raw_email_body`
3. **Track confidence** - Store AI confidence scores for classification and matching
4. **Manager notes** - Persist approval notes in `job_candidate_matches.notes`

---

## Implementation Notes

### Node Selection Priority
1. **Native n8n nodes first** - Gmail, Google Sheets, HTTP Request, Webhook
2. **Code nodes for logic** - Filtering, transformations, validations
3. **AI nodes sparingly** - Only for classification, extraction, scoring

### Error Handling
- **Gmail Trigger**: If email fetch fails, retry after 5 minutes
- **AI Nodes**: If API error, log to Sheets error tab + alert admin
- **Google Sheets**: If write fails, queue in local JSON file + retry
- **Webhook POST**: If frontend unreachable, log + retry 3x with backoff

### Performance
- **Batch candidate reads** - Fetch all candidates once per job
- **Parallel AI calls** - Score candidates in parallel (rate limit: 10 concurrent)
- **Cache frequent data** - Keep candidate list in memory if < 1000 rows
- **Lazy resume fetch** - Only download resumes after approval

### Testing Strategy
1. **Unit tests** - Code nodes with sample data
2. **Integration tests** - Full workflow with test Gmail account
3. **Manual QA** - Manager validates 10 real emails before production
4. **Monitoring** - Track classification accuracy, match rates, false positives

### Configuration & Secrets
Store in n8n environment variables:
- `OPENAI_API_KEY`
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `FRONTEND_WEBHOOK_URL`
- `APPROVAL_WEBHOOK_SECRET`

### Workflow Optimization
- **Workflow 1**: Runs every 5 minutes (Gmail poll interval)
- **Workflow 2**: Instant trigger (webhook-based)
- **Execution timeout**: 5 minutes (enough for AI calls)
- **Retry policy**: 3 attempts with exponential backoff

---

## Next Steps

### Phase 1: MVP (Week 1)
1. Set up Google Sheets with all 3 sheets
2. Build Workflow 1 (classification → extraction → matching)
3. Manual testing with 20 real recruiter emails
4. Validate match quality

### Phase 2: Frontend Integration (Week 2)
1. Build Workflow 2 (approval → email send)
2. Integrate webhook endpoints
3. End-to-end testing with Anti Gravity dashboard
4. Manager UAT

### Phase 3: Production Hardening (Week 3)
1. Error handling + retry logic
2. Monitoring + alerting
3. Documentation + runbooks
4. Launch

---

## Maintenance

### Weekly
- Review classification accuracy (manual spot checks)
- Audit sent emails for quality
- Update candidate sheet with new hires

### Monthly
- Tune AI prompts based on false positives
- Adjust match score thresholds
- Archive old jobs (status = expired)

### Quarterly
- Review Google Sheets quotas
- Optimize workflow execution times
- Evaluate AI model upgrades (GPT-4 → GPT-5)
