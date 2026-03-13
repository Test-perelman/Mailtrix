import { useState, useCallback, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Module-level state — shared across all hook instances in the same page session
// ─────────────────────────────────────────────────────────────────────────────

let globalMatches = [];
let globalThreads = {};   // { [job_id]: message[] }
let globalConfig  = {};   // { approval_webhook_url, reply_webhook_url, ... }
let lastUpdatedAt = null; // ISO string — bookmark for incremental polling

const matchListeners  = new Set();
const threadListeners = new Set();
const configListeners = new Set();

const notifyMatches  = () => matchListeners.forEach(fn => fn([...globalMatches]));
const notifyThreads  = () => threadListeners.forEach(fn => fn({ ...globalThreads }));
const notifyConfig   = () => configListeners.forEach(fn => fn({ ...globalConfig }));

// ─────────────────────────────────────────────────────────────────────────────
// Debounced batch save
// Pending shape: { [job_id]: { candidates?: Candidate[], sent_at?: string } }
// ─────────────────────────────────────────────────────────────────────────────

let pendingUpdates = {};
let saveTimer = null;

const flushPendingUpdates = async () => {
  if (Object.keys(pendingUpdates).length === 0) return;
  const updates = pendingUpdates;
  pendingUpdates = {};
  saveTimer = null;
  try {
    await fetch('/api/matches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
  } catch (err) {
    console.error('Failed to flush pending match updates:', err.message);
  }
};

const scheduleSave = (jobId, fields) => {
  pendingUpdates[jobId] = { ...(pendingUpdates[jobId] || {}), ...fields };
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flushPendingUpdates, 500);
};

// Flush on page unload via sendBeacon (browser sends POST even during unload)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (Object.keys(pendingUpdates).length === 0) return;
    const payload = JSON.stringify({ _type: 'status_update', updates: pendingUpdates });
    navigator.sendBeacon('/api/matches', new Blob([payload], { type: 'application/json' }));
    pendingUpdates = {};
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalise a DB row — JSONB columns may come back as strings in some drivers
// ─────────────────────────────────────────────────────────────────────────────

const normaliseRow = (row) => ({
  ...row,
  candidates: typeof row.candidates === 'string'
    ? JSON.parse(row.candidates) : (row.candidates || []),
  required_skills: typeof row.required_skills === 'string'
    ? JSON.parse(row.required_skills) : (row.required_skills || []),
});

// ─────────────────────────────────────────────────────────────────────────────
// Merge an incoming match into globalMatches.
// Preserves local candidate.status values for pending saves.
// ─────────────────────────────────────────────────────────────────────────────

const mergeMatch = (incoming) => {
  const idx = globalMatches.findIndex(m => m.job_id === incoming.job_id);
  if (idx >= 0) {
    const pending = pendingUpdates[incoming.job_id];
    globalMatches[idx] = {
      ...incoming,
      candidates: (pending?.candidates ?? incoming.candidates).map(c => {
        const existing = globalMatches[idx].candidates.find(e => e.candidate_id === c.candidate_id);
        return { ...c, status: existing?.status ?? c.status ?? 'pending' };
      }),
    };
  } else {
    globalMatches.unshift({
      ...incoming,
      candidates: incoming.candidates.map(c => ({ ...c, status: c.status || 'pending' })),
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Store initialisation — fetches matches + config once per session
// ─────────────────────────────────────────────────────────────────────────────

let initState = 'idle'; // 'idle' | 'loading' | 'done' | 'error'
let initPromise = null;

const initStore = () => {
  if (initState === 'done' || initState === 'loading') return initPromise ?? Promise.resolve();
  initState = 'loading';
  initPromise = (async () => {
    try {
      const [matchRes, configRes] = await Promise.all([
        fetch('/api/matches'),
        fetch('/api/config'),
      ]);
      if (matchRes.ok) {
        const data = await matchRes.json();
        globalMatches = (data.matches || []).map(normaliseRow);
        lastUpdatedAt = data.last_updated_at || new Date().toISOString();
      }
      if (configRes.ok) {
        globalConfig = await configRes.json();
      }
      initState = 'done';
      notifyMatches();
      notifyConfig();
    } catch (err) {
      console.error('Store initialisation failed:', err.message);
      initState = 'error';
      initPromise = null; // allow retry on next mount
    }
  })();
  return initPromise;
};

// ─────────────────────────────────────────────────────────────────────────────
// Incremental polling — module-level singleton interval
// ─────────────────────────────────────────────────────────────────────────────

let pollInterval = null;

const startPolling = () => {
  if (pollInterval) return;
  pollInterval = setInterval(async () => {
    if (!lastUpdatedAt || initState !== 'done') return;
    try {
      const res = await fetch(
        `/api/matches?since=${encodeURIComponent(lastUpdatedAt)}&limit=50`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (!data.matches?.length) return;
      data.matches.forEach(row => mergeMatch(normaliseRow(row)));
      lastUpdatedAt = data.last_updated_at;
      notifyMatches();
    } catch { /* silently ignore network errors */ }
  }, 3000);
};

// ─────────────────────────────────────────────────────────────────────────────
// Primary hook
// ─────────────────────────────────────────────────────────────────────────────

export const useJobMatches = () => {
  const [matches, setMatches]             = useState([...globalMatches]);
  const [threads, setThreadsState]        = useState({ ...globalThreads });
  const [isInitializing, setInitializing] = useState(initState !== 'done');

  useEffect(() => {
    matchListeners.add(setMatches);
    threadListeners.add(setThreadsState);
    return () => {
      matchListeners.delete(setMatches);
      threadListeners.delete(setThreadsState);
    };
  }, []);

  // Init + start polling once
  useEffect(() => {
    if (initState === 'done') {
      setInitializing(false);
      startPolling();
      return;
    }
    initStore().then(() => {
      setInitializing(false);
      setMatches([...globalMatches]);
      startPolling();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addJobMatch = useCallback((jobMatch) => {
    mergeMatch({
      ...jobMatch,
      candidates: jobMatch.candidates.map(c => ({ ...c, status: c.status || 'pending' })),
    });
    notifyMatches();
  }, []);

  const updateCandidateStatus = useCallback((jobId, candidateId, status) => {
    const jobIdx  = globalMatches.findIndex(m => m.job_id === jobId);
    if (jobIdx < 0) return;
    const candIdx = globalMatches[jobIdx].candidates.findIndex(c => c.candidate_id === candidateId);
    if (candIdx < 0) return;
    globalMatches[jobIdx].candidates[candIdx].status = status;
    scheduleSave(jobId, { candidates: globalMatches[jobIdx].candidates });
    notifyMatches();
  }, []);

  const setJobStatus = useCallback((jobId, status) => {
    const idx = globalMatches.findIndex(m => m.job_id === jobId);
    if (idx >= 0) {
      globalMatches[idx].status = status;
      notifyMatches();
    }
  }, []);

  const markJobSent = useCallback((jobId) => {
    const idx = globalMatches.findIndex(m => m.job_id === jobId);
    if (idx < 0) return;
    const sentAt = new Date().toISOString();
    globalMatches[idx].sent_at = sentAt;
    scheduleSave(jobId, { sent_at: sentAt });
    notifyMatches();
  }, []);

  const getApprovedCandidates = useCallback((jobId) => {
    const job = globalMatches.find(m => m.job_id === jobId);
    return job ? job.candidates.filter(c => c.status === 'approved') : [];
  }, []);

  const clearAll = useCallback(() => {
    globalMatches = [];
    globalThreads = {};
    notifyMatches();
    notifyThreads();
  }, []);

  const removeJob = useCallback((jobId) => {
    globalMatches = globalMatches.filter(m => m.job_id !== jobId);
    delete globalThreads[jobId];
    notifyMatches();
    notifyThreads();
  }, []);

  // ── Thread methods ──────────────────────────────────────────────────────

  const addThreadMessage = useCallback((jobId, message) => {
    if (!globalThreads[jobId]) globalThreads[jobId] = [];
    const exists = globalThreads[jobId].find(
      m => (m.id && m.id === message.id) || (m.message_id && m.message_id === message.message_id)
    );
    if (!exists) {
      globalThreads[jobId].push(message);
      const idx = globalMatches.findIndex(m => m.job_id === jobId);
      if (idx >= 0 && message.direction === 'inbound') {
        globalMatches[idx].unread_count = (globalMatches[idx].unread_count || 0) + 1;
      }
      notifyMatches();
      notifyThreads();
    }
  }, []);

  const setThreads = useCallback((jobId, messages) => {
    globalThreads[jobId] = messages;
    const unread = messages.filter(m => m.direction === 'inbound' && !m.is_read).length;
    const idx = globalMatches.findIndex(m => m.job_id === jobId);
    if (idx >= 0) {
      globalMatches[idx].unread_count = unread;
      globalMatches[idx].thread_count = messages.length;
    }
    notifyMatches();
    notifyThreads();
  }, []);

  const getThreadsByJobId = useCallback((jobId) => {
    return threads[jobId] || [];
  }, [threads]);

  // Fetches threads from API (marks read server-side) and updates local state
  const markThreadsRead = useCallback((jobId) => {
    fetch(`/api/threads?job_id=${encodeURIComponent(jobId)}`)
      .then(r => r.json())
      .then(data => {
        if (data.messages) {
          globalThreads[jobId] = data.messages;
          const idx = globalMatches.findIndex(m => m.job_id === jobId);
          if (idx >= 0) globalMatches[idx].unread_count = 0;
          notifyMatches();
          notifyThreads();
        }
      })
      .catch(err => console.error('markThreadsRead fetch failed:', err.message));
  }, []);

  return {
    matches,
    isInitializing,
    addJobMatch,
    updateCandidateStatus,
    setJobStatus,
    markJobSent,
    getApprovedCandidates,
    clearAll,
    removeJob,
    addThreadMessage,
    setThreads,
    getThreadsByJobId,
    markThreadsRead,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Config hook — reads from globalConfig, writes via API
// ─────────────────────────────────────────────────────────────────────────────

export const useConfig = () => {
  const [config, setConfig] = useState({ ...globalConfig });

  useEffect(() => {
    configListeners.add(setConfig);
    return () => configListeners.delete(setConfig);
  }, []);

  // Ensure config is loaded if store not yet initialised
  useEffect(() => {
    if (initState !== 'done') {
      initStore().then(() => setConfig({ ...globalConfig }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateConfig = useCallback(async (updates) => {
    // Optimistic local update
    globalConfig = { ...globalConfig, ...updates };
    notifyConfig();
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Failed to persist config update:', err.message);
    }
  }, []);

  return { config, updateConfig };
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy exports — used by App.jsx / external callers
// ─────────────────────────────────────────────────────────────────────────────

export const addJobMatchExternal = (jobMatch) => {
  mergeMatch({
    ...jobMatch,
    candidates: jobMatch.candidates.map(c => ({ ...c, status: 'pending' })),
  });
  notifyMatches();
};

export const addThreadMessageExternal = (jobId, message) => {
  if (!globalThreads[jobId]) globalThreads[jobId] = [];
  const exists = globalThreads[jobId].find(m => m.id === message.id);
  if (!exists) {
    globalThreads[jobId].push(message);
    const idx = globalMatches.findIndex(m => m.job_id === jobId);
    if (idx >= 0 && message.direction === 'inbound') {
      globalMatches[idx].unread_count = (globalMatches[idx].unread_count || 0) + 1;
    }
    notifyMatches();
    notifyThreads();
  }
};

export const useThreads = () => {
  const [threads, setThreads] = useState({ ...globalThreads });
  useEffect(() => {
    threadListeners.add(setThreads);
    return () => threadListeners.delete(setThreads);
  }, []);
  return threads;
};
