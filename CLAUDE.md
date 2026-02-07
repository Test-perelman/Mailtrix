# Mailtrix

Automated recruiter email processing. AI classifies and scores. Humans approve. No auto-send.

## Architecture

```
Gmail → Workflow 1 → Frontend Dashboard → Workflow 2/3 → Gmail Reply
        (classify)    (manager review)    (send email)
```

**Stack**: n8n, Google Sheets, React frontend, Gmail API, OpenAI API

## Workflows

| Workflow | Status | Trigger | Purpose |
|----------|--------|---------|---------|
| Inbound Pipeline | Planned | Gmail | Classify email → Extract job → Match candidates → POST to frontend |
| Approval Handler | Planned | Webhook | Send candidates to recruiter with resumes |
| Reply Handler | **LIVE** | Webhook | Send follow-up replies from dashboard |

### Reply Handler (Production)
`POST /webhook/mailtrix-reply` → Validate Key → Fetch Job → Fetch Threads → Gmail Send → Log to `email_threads`

## Data Model (Google Sheets)

| Sheet | Key Columns |
|-------|-------------|
| `jobs` | id, recruiter_email, subject, message_id, thread_id, job_title, required_skills |
| `candidates` | id, name, email, visa_status, location, skills, experience, resume_url |
| `job_candidate_matches` | id, job_id, candidate_id, match_score, match_reason, email_sent |
| `email_threads` | id, job_id, thread_id, message_id, direction, from_email, to_email, body, sent_at |

## Webhook Contracts

**Frontend → Reply Handler**:
```json
POST /webhook/mailtrix-reply
{job_id, reply_body, manager_notes}
```

**Workflow 1 → Frontend** (planned):
```json
POST /api/matches
{job_id, job_title, candidates: [{candidate_id, match_score}]}
```

## Rules

1. Never auto-send - manager approval required
2. AI confidence threshold: 80%
3. Match score threshold: 70
4. Preserve email threads via Message-ID headers

## See Also

[Implemented_till_now.md](Implemented_till_now.md) - Full implementation details
