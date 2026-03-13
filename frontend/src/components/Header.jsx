import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Zap, Clock, Users, CheckCircle, AlertCircle, Send, Settings, X, Save } from 'lucide-react';
import styles from './Header.module.css';
import ThemeToggle from './ThemeToggle';
import { useConfig } from '../store/useStore';

export default function Header({ stats }) {
  const { config, updateConfig } = useConfig();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [approvalUrl, setApprovalUrl]   = useState('');
  const [replyUrl, setReplyUrl]         = useState('');
  const [saving, setSaving]             = useState(false);
  const panelRef = useRef(null);

  // Sync form inputs when config loads or changes
  useEffect(() => {
    setApprovalUrl(config.approval_webhook_url || '');
    setReplyUrl(config.reply_webhook_url || '');
  }, [config.approval_webhook_url, config.reply_webhook_url]);

  // Close panel on outside click
  useEffect(() => {
    if (!settingsOpen) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [settingsOpen]);

  const handleSave = async () => {
    setSaving(true);
    await updateConfig({ approval_webhook_url: approvalUrl, reply_webhook_url: replyUrl });
    setSaving(false);
    setSettingsOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Brand section */}
        <motion.div
          className={styles.brand}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.logoMark}>
            <div className={styles.logoInner}>
              <span className={styles.logoLetter}>M</span>
            </div>
            <div className={styles.logoGlow} />
            <div className={styles.logoRing} />
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.title}>Mailtrix</h1>
            <span className={styles.tagline}>Recruiter Intelligence</span>
          </div>
        </motion.div>

        {/* Stats pills */}
        <motion.div
          className={styles.statsRow}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.statPill}>
            <div className={styles.statIcon}>
              <Mail size={16} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalJobs}</span>
              <span className={styles.statLabel}>Active Jobs</span>
            </div>
          </div>

          <div className={styles.statDivider} />

          <div className={styles.statPill}>
            <div className={styles.statIcon}>
              <Users size={16} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalCandidates || 0}</span>
              <span className={styles.statLabel}>Candidates</span>
            </div>
          </div>

          <div className={styles.statDivider} />

          <div className={`${styles.statPill} ${stats.pendingApprovals > 0 ? styles.statPillActive : ''}`}>
            <div className={`${styles.statIcon} ${styles.statIconPending}`}>
              <AlertCircle size={16} />
            </div>
            <div className={styles.statInfo}>
              <span className={`${styles.statValue} ${stats.pendingApprovals > 0 ? styles.statValueHighlight : ''}`}>
                {stats.pendingApprovals}
              </span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            {stats.pendingApprovals > 0 && (
              <motion.div
                className={styles.pendingBadge}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              />
            )}
          </div>

          <div className={styles.statDivider} />

          <div className={styles.statPill}>
            <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
              <CheckCircle size={16} />
            </div>
            <div className={styles.statInfo}>
              <span className={`${styles.statValue} ${styles.statValueSuccess}`}>
                {stats.approvedCount || 0}
              </span>
              <span className={styles.statLabel}>Approved</span>
            </div>
          </div>

          <div className={styles.statDivider} />

          <div className={styles.statPill}>
            <div className={`${styles.statIcon} ${styles.statIconSent}`}>
              <Send size={16} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {stats.sentJobs || 0}
              </span>
              <span className={styles.statLabel}>Sent</span>
            </div>
          </div>
        </motion.div>

        {/* Status indicator */}
        <motion.div
          className={styles.statusSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.statusCard}>
            <div className={styles.statusDot}>
              <span className={styles.statusDotPulse} />
              <span className={styles.statusDotCore} />
            </div>
            <div className={styles.statusText}>
              <span className={styles.statusLabel}>System</span>
              <span className={styles.statusValue}>Online</span>
            </div>
          </div>
          <div className={styles.timeDisplay}>
            <Clock size={14} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <ThemeToggle />

          {/* Settings */}
          <div className={styles.settingsWrapper} ref={panelRef}>
            <button
              className={styles.settingsBtn}
              onClick={() => setSettingsOpen(s => !s)}
              title="Webhook settings"
            >
              <Settings size={16} />
            </button>

            {settingsOpen && (
              <div className={styles.settingsPanel}>
                <div className={styles.settingsPanelHeader}>
                  <span>Webhook Settings</span>
                  <button className={styles.settingsClose} onClick={() => setSettingsOpen(false)}>
                    <X size={14} />
                  </button>
                </div>

                <div className={styles.settingsField}>
                  <label className={styles.settingsLabel}>Approval Webhook URL</label>
                  <input
                    className={styles.settingsInput}
                    value={approvalUrl}
                    onChange={e => setApprovalUrl(e.target.value)}
                    placeholder="https://n8n.xxx/webhook/mailtrix-approval"
                    spellCheck={false}
                  />
                </div>

                <div className={styles.settingsField}>
                  <label className={styles.settingsLabel}>Reply Webhook URL</label>
                  <input
                    className={styles.settingsInput}
                    value={replyUrl}
                    onChange={e => setReplyUrl(e.target.value)}
                    placeholder="https://n8n.xxx/webhook/mailtrix-reply"
                    spellCheck={false}
                  />
                </div>

                <button className={styles.settingsSaveBtn} onClick={handleSave} disabled={saving}>
                  <Save size={14} />
                  <span>{saving ? 'Saving…' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Decorative bottom border with gradient */}
      <div className={styles.borderGradient} />
    </header>
  );
}
