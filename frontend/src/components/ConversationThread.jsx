import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, RefreshCw, Loader2, Send, Mail } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ReplyComposer from './ReplyComposer';
import styles from './ConversationThread.module.css';

const N8N_REPLY_URL = import.meta.env.VITE_N8N_REPLY_URL || 'https://n8n.352674918.xyz/webhook/mailtrix-reply';
const API_KEY = import.meta.env.VITE_APPROVAL_API_KEY || '';

export default function ConversationThread({ jobId, threads = [], onRefresh }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const messagesEndRef = useRef(null);

  // Sort threads by sent_at ascending (oldest first)
  const sortedThreads = [...threads].sort((a, b) =>
    new Date(a.sent_at) - new Date(b.sent_at)
  );

  // Check if we've sent any outbound emails (conversation only starts when recruiter responds to our email)
  const hasOutboundEmail = sortedThreads.some(msg => msg.direction === 'outbound');
  const hasInboundReply = sortedThreads.some(msg => msg.direction === 'inbound');
  const hasMessages = sortedThreads.length > 0;

  // Conversation is active only if we've sent at least one outbound email
  const conversationStarted = hasOutboundEmail;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && conversationStarted) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [threads.length, conversationStarted]);

  const handleRefresh = async () => {
    if (isLoading || !onRefresh) return;
    setIsLoading(true);
    try {
      await onRefresh(jobId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async (replyBody) => {
    if (isSending || !replyBody.trim()) return;

    setIsSending(true);
    setSendStatus(null);

    try {
      const response = await fetch(N8N_REPLY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'X-API-Key': API_KEY })
        },
        body: JSON.stringify({
          job_id: jobId,
          reply_body: replyBody
        })
      });

      if (response.ok) {
        setSendStatus('success');
        // Refresh threads to show new message
        if (onRefresh) {
          await onRefresh(jobId);
        }
      } else {
        throw new Error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setSendStatus('error');
    } finally {
      setIsSending(false);
      setTimeout(() => setSendStatus(null), 5000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <MessageSquare size={16} />
          <span className={styles.title}>Conversation</span>
          {conversationStarted && (
            <span className={styles.count}>{sortedThreads.length} message{sortedThreads.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        {conversationStarted && (
          <button
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh conversation"
          >
            {isLoading ? (
              <Loader2 size={14} className={styles.spinner} />
            ) : (
              <RefreshCw size={14} />
            )}
          </button>
        )}
      </div>

      <div className={styles.messagesContainer}>
        <AnimatePresence mode="wait">
          {conversationStarted ? (
            <motion.div
              key="messages"
              className={styles.messagesList}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {sortedThreads.map((message, index) => (
                <MessageBubble
                  key={message.id || index}
                  message={message}
                  index={index}
                />
              ))}
              <div ref={messagesEndRef} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className={styles.emptyState}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.emptyIconWrapper}>
                <Mail size={28} className={styles.emptyIcon} />
                <Send size={16} className={styles.emptyIconOverlay} />
              </div>
              <p className={styles.emptyTitle}>No conversation yet</p>
              <span className={styles.emptyDescription}>
                Approve candidates and send to recruiter to start a conversation.
                Replies will appear here once the recruiter responds.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {conversationStarted && (
        <ReplyComposer
          onSend={handleSendReply}
          isSending={isSending}
          sendStatus={sendStatus}
          disabled={false}
        />
      )}
    </div>
  );
}
