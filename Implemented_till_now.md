# Mailtrix - Implementation Status

## Built

### Frontend (React 19 + Vite)
Manager approval dashboard with light/dark theme.

| Component | Purpose |
|-----------|---------|
| `App.jsx` | Shell, stats, webhook polling |
| `Header.jsx` | Logo, stats, theme toggle |
| `JobCard.jsx` | Job card with Candidates/Conversation tabs, sends approvals |
| `CandidateRow.jsx` | Candidate with score ring, approve/reject |
| `ConversationThread.jsx` | Email thread viewer + reply |
| `MessageBubble.jsx` | Message display with HTML sanitization |
| `ReplyComposer.jsx` | Reply form with formatting |
| `EmptyState.jsx` | Waiting state with webhook info |

**State**: `useStore.js` (jobs + threads, localStorage), `useTheme.jsx` (theme context)

### n8n Workflow: Dashboard Reply Handler (LIVE)

**Endpoint**: `POST /webhook/mailtrix-reply`

```
Webhook → Validate API Key → Fetch Job → Fetch Thread History → Prepare Context → Gmail Reply → Log to Sheets → Respond
```

| Node | Purpose |
|------|---------|
| Webhook Reply Trigger | POST /mailtrix-reply |
| Validate API Key | Check X-API-Key header |
| Fetch Job Details | Get job from `jobs` sheet by job_id |
| Fetch Thread History | Get previous messages from `email_threads` |
| Prepare Reply Context | Build email with thread context, `gmail_message_id` for reply |
| Send Reply via Gmail | **Reply operation** with `messageId` (threads properly) |
| Log Reply to Threads | Create outbound message record |
| Append Reply to Threads | Write to `email_threads` sheet |
| Respond to Webhook | Return success JSON |

### n8n Workflow: Inbound Intelligence Pipeline (LIVE)

**Trigger**: Gmail Trigger (polls for unread emails)

```
Gmail → Classify → Extract Job → Append Job → Log Initial Email → Read Candidates → Pre-filter → Score → Append Matches → POST to Frontend
```

Key features:
- Captures Gmail API `id` and `threadId` (NOT MIME Message-ID headers)
- Logs initial inbound email to `email_threads` for thread continuity
- AI classification with 80% confidence threshold
- AI scoring with 70+ match threshold

### n8n Workflow: Approval Triggered Reply (LIVE)

**Endpoint**: `POST /webhook/mailtrix-approval`

```
Webhook → Validate → Fetch Job → Loop Candidates → AI Generate Email → [Is Reply?] → Gmail Reply/Send → Log to Threads → Update Matches → Respond
```

Key features:
- Conditional branching: uses Gmail `reply` operation if `thread_id`/`message_id` exist
- Falls back to `send` operation for new threads
- Logs outbound emails to `email_threads`

---

## Google Sheets Schema

### jobs
`id`, `recruiter_email`, `recruiter_name`, `subject`, `message_id`, `thread_id`, `job_title`, `location`, `required_skills`, `min_experience`, `status`

### candidates
`id`, `name`, `email`, `visa_status`, `location`, `skills`, `experience`, `resume_url`

### job_candidate_matches
`id`, `job_id`, `candidate_id`, `match_score`, `match_reason`, `email_sent`

### email_threads (CREATE THIS)
| Column | Type | Description |
|--------|------|-------------|
| `id` | string | Unique message ID (e.g., MSG1ABC) |
| `job_id` | string | FK to jobs |
| `thread_id` | string | **Gmail API thread ID** (e.g., `19c18f47be4676cb`) |
| `message_id` | string | **Gmail API message ID** (e.g., `19c1920be357294b`) - NOT MIME Message-ID |
| `direction` | string | inbound / outbound |
| `from_email` | string | Sender email |
| `from_name` | string | Sender name |
| `to_email` | string | Recipient email |
| `subject` | string | Email subject |
| `body` | string | Plain text body |
| `body_html` | string | HTML body (optional) |
| `sent_at` | timestamp | When sent |
| `created_at` | timestamp | Record created |
| `is_read` | boolean | Read status |

**IMPORTANT**: The `message_id` and `thread_id` columns must contain **Gmail API IDs** (alphanumeric strings like `19c1920be357294b`), NOT MIME Message-ID headers (which look like `<abc@domain.com>`). The Gmail reply operation requires these API IDs to properly thread emails.

---

## Issues Found & Fixed

~~**Gmail Node Missing Thread Headers**: The "Send Reply via Gmail" node sends a new email instead of threading.~~

**FIXED** (2026-02-02):
1. Changed Gmail nodes from `send` to `reply` operation with `messageId` parameter
2. Updated all workflows to capture Gmail API IDs (`email.id`, `email.threadId`) instead of MIME headers
3. Added initial email logging to `email_threads` in Inbound Pipeline
4. Added conditional reply/send logic to Approval Handler

---

## What's Next
1. ~~Create `email_threads` sheet with schema above~~ **User to create**
2. ~~Build Workflow 1 (inbound email classification)~~ **DONE**
3. ~~Build Workflow 2 (approval with resume attachments)~~ **DONE**
4. ~~Fix Gmail threading in Reply Handler~~ **DONE**
5. Test end-to-end with real emails
6. Deploy frontend to production
