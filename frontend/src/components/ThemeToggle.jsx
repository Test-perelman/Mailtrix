import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme.jsx';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      className={`${styles.toggle} ${isDark ? styles.dark : styles.light}`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className={styles.track}>
        <motion.div
          className={styles.thumb}
          layout
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {isDark ? (
            <Moon size={14} className={styles.icon} />
          ) : (
            <Sun size={14} className={styles.icon} />
          )}
        </motion.div>

        <div className={styles.icons}>
          <Sun size={12} className={`${styles.sunIcon} ${!isDark ? styles.activeIcon : ''}`} />
          <Moon size={12} className={`${styles.moonIcon} ${isDark ? styles.activeIcon : ''}`} />
        </div>
      </div>
    </motion.button>
  );
}
