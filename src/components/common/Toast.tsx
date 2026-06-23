import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-xing-panel border border-xing-border/40 rounded-lg shadow-[0_0_32px_rgba(222,255,154,0.06)]"
        >
          <span className="w-2 h-2 rounded-full bg-xing-green animate-pulse" />
          <span className="text-sm text-xing-text font-medium whitespace-nowrap">{message}</span>
          <button
            onClick={onClose}
            className="ml-1 text-xing-text-2/50 hover:text-xing-text-2 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}