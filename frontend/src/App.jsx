import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trash2, Database, Zap } from 'lucide-react';
import Header from './components/Header';
import JobCard from './components/JobCard';
import EmptyState from './components/EmptyState';
import { useJobMatches, addJobMatchExternal } from './store/useStore';
import { MOCK_JOBS, MOCK_THREADS, loadMockData, clearAllData } from './data/mockData';
import styles from './App.module.css';

function App() {
  const { matches, addJobMatch, updateCandidateStatus, clearAll, setThreads, addThreadMessage } = useJobMatches();
  const [isLoading, setIsLoading] = useState(false);

  // Calculate stats
  const stats = {
    totalJobs: matches.length,
    pendingApprovals: matches.reduce(
      (acc, job) => acc + job.candidates.filter(c => c.status === 'pending').length,
      0
    ),
    approvedCount: matches.reduce(
      (acc, job) => acc + job.candidates.filter(c => c.status === 'approved').length,
      0
    ),
    totalCandidates: matches.reduce((acc, job) => acc + job.candidates.length, 0)
  };

  // Set up message listener for webhook data (via Netlify function redirect)
  useEffect(() => {
    // Check URL for incoming data (fallback mechanism)
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      try {
        const jobMatch = JSON.parse(decodeURIComponent(data));
        addJobMatch(jobMatch);
        // Clear the URL params
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        console.error('Failed to parse incoming data:', e);
      }
    }

    // Poll for new matches and thread updates from Netlify Blobs
    const pollInterval = setInterval(async () => {
      try {
        const [matchRes, threadRes] = await Promise.all([
          fetch('/api/pending-matches'),
          fetch('/api/pending-threads')
        ]);
        if (matchRes.ok) {
          const { matches: pending } = await matchRes.json();
          if (pending && pending.length > 0) {
            pending.forEach(job => addJobMatch(job));
          }
        }
        if (threadRes.ok) {
          const { updates } = await threadRes.json();
          if (updates && updates.length > 0) {
            updates.forEach(update => addThreadMessage(update.job_id, update.message));
          }
        }
      } catch (e) {
        // Silently ignore fetch errors (offline, etc.)
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [addJobMatch, addThreadMessage]);

  const handleLoadMockData = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Load mock jobs
      MOCK_JOBS.forEach(job => {
        addJobMatch(job);
      });
      // Load mock threads
      Object.entries(MOCK_THREADS).forEach(([jobId, messages]) => {
        setThreads(jobId, messages);
      });
      setIsLoading(false);
    }, 800);
  };

  const handleClearAll = () => {
    if (confirm('Clear all job matches? This cannot be undone.')) {
      clearAll();
    }
  };

  return (
    <div className={styles.app}>
      {/* Ambient background with cyber grid */}
      <div className="ambient-bg" />

      {/* Extra floating orb */}
      <div className={styles.floatingOrb} />

      {/* Header */}
      <Header stats={stats} />

      {/* Main content */}
      <main className={styles.main}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <h2 className={styles.pageTitle}>
              <span className={styles.titleAccent}>Job</span> Matches
            </h2>
            <span className={styles.pageSubtitle}>Review and approve candidate submissions</span>
          </div>

          <div className={styles.toolbarRight}>
            <motion.button
              className={styles.loadDemoBtn}
              onClick={handleLoadMockData}
              disabled={isLoading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <RefreshCw size={16} className={styles.spinning} />
              ) : (
                <Database size={16} />
              )}
              <span>Load Demo Data</span>
              <span className={styles.btnGlow} />
            </motion.button>

            {matches.length > 0 && (
              <motion.button
                className={styles.clearBtn}
                onClick={handleClearAll}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 size={16} />
                <span>Clear All</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {matches.length === 0 ? (
              <EmptyState key="empty" onLoadDemo={handleLoadMockData} />
            ) : (
              <motion.div
                key="jobs"
                className={styles.jobsList}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {matches.map((job, index) => (
                  <JobCard
                    key={job.job_id}
                    job={job}
                    index={index}
                    onUpdateCandidate={updateCandidateStatus}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <Zap size={14} />
            <span>Mailtrix</span>
          </div>
          <span className={styles.footerDivider} />
          <span className={styles.footerText}>Recruiter Intelligence System</span>
        </div>
        <div className={styles.footerWebhook}>
          <span className={styles.footerLabel}>Webhook:</span>
          <code className={styles.footerCode}>
            {import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.352674918.xyz/webhook/approval'}
          </code>
        </div>
      </footer>
    </div>
  );
}

export default App;
