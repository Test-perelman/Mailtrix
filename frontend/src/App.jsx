import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trash2, Database, Zap, Inbox, Send } from 'lucide-react';
import Header from './components/Header';
import JobCard from './components/JobCard';
import EmptyState from './components/EmptyState';
import { useJobMatches, addJobMatchExternal, useConfig } from './store/useStore';
import { MOCK_JOBS, MOCK_THREADS, loadMockData, clearAllData } from './data/mockData';
import styles from './App.module.css';

function getPageFromHash() {
  return window.location.hash === '#/approved' ? 'approved' : 'dashboard';
}

function App() {
  const { matches, addJobMatch, updateCandidateStatus, clearAll, setThreads, addThreadMessage, isInitializing } = useJobMatches();
  const { config } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(getPageFromHash);

  // Listen to hash changes
  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Split matches into active (unsent) and sent
  const activeMatches = matches.filter(j => !j.sent_at);
  const sentMatches = matches.filter(j => j.sent_at);

  // Calculate stats
  const stats = {
    totalJobs: activeMatches.length,
    pendingApprovals: activeMatches.reduce(
      (acc, job) => acc + job.candidates.filter(c => c.status === 'pending').length,
      0
    ),
    approvedCount: activeMatches.reduce(
      (acc, job) => acc + job.candidates.filter(c => c.status === 'approved').length,
      0
    ),
    totalCandidates: activeMatches.reduce((acc, job) => acc + job.candidates.length, 0),
    sentJobs: sentMatches.length
  };


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

      {isInitializing && (
        <div className={styles.initLoading}>
          <RefreshCw size={20} className={styles.spinning} />
          <span>Loading dashboard…</span>
        </div>
      )}

      {/* Main content */}
      <main className={styles.main}>
        {/* Page navigation */}
        <nav className={styles.pageNav}>
          <a
            href="#/"
            className={`${styles.navTab} ${page === 'dashboard' ? styles.navTabActive : ''}`}
            onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; }}
          >
            <Inbox size={18} />
            <span>Active Jobs</span>
            {activeMatches.length > 0 && (
              <span className={styles.navBadge}>{activeMatches.length}</span>
            )}
          </a>
          <a
            href="#/approved"
            className={`${styles.navTab} ${page === 'approved' ? styles.navTabActive : ''}`}
            onClick={(e) => { e.preventDefault(); window.location.hash = '#/approved'; }}
          >
            <Send size={18} />
            <span>Sent to Recruiter</span>
            {sentMatches.length > 0 && (
              <span className={`${styles.navBadge} ${styles.navBadgeSent}`}>{sentMatches.length}</span>
            )}
          </a>
        </nav>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            {page === 'dashboard' ? (
              <>
                <h2 className={styles.pageTitle}>
                  <span className={styles.titleAccent}>Job</span> Matches
                </h2>
                <span className={styles.pageSubtitle}>Review and approve candidate submissions</span>
              </>
            ) : (
              <>
                <h2 className={styles.pageTitle}>
                  <span className={styles.titleAccent}>Sent</span> Jobs
                </h2>
                <span className={styles.pageSubtitle}>Jobs where candidates were sent to recruiters</span>
              </>
            )}
          </div>

          <div className={styles.toolbarRight}>
            {page === 'dashboard' && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {page === 'dashboard' ? (
              activeMatches.length === 0 ? (
                <EmptyState key="empty" onLoadDemo={handleLoadMockData} />
              ) : (
                <motion.div
                  key="active-jobs"
                  className={styles.jobsList}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeMatches.map((job, index) => (
                    <JobCard
                      key={job.job_id}
                      job={job}
                      index={index}
                      onUpdateCandidate={updateCandidateStatus}
                    />
                  ))}
                </motion.div>
              )
            ) : (
              sentMatches.length === 0 ? (
                <motion.div
                  key="empty-sent"
                  className={styles.emptySent}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Send size={48} className={styles.emptySentIcon} />
                  <h3 className={styles.emptySentTitle}>No sent jobs yet</h3>
                  <p className={styles.emptySentText}>
                    Jobs will appear here after you approve candidates and send them to recruiters.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="sent-jobs"
                  className={styles.jobsList}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {sentMatches.map((job, index) => (
                    <JobCard
                      key={job.job_id}
                      job={job}
                      index={index}
                      onUpdateCandidate={updateCandidateStatus}
                      readOnly
                    />
                  ))}
                </motion.div>
              )
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
            {config.approval_webhook_url || '—'}
          </code>
        </div>
      </footer>
    </div>
  );
}

export default App;
