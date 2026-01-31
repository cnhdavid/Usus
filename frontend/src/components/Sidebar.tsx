import { motion } from 'framer-motion';

interface SidebarProps {
  onAddHabit: () => void;
}

export const Sidebar = ({ onAddHabit }: SidebarProps) => {
  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card-bg border-r border-card-border">
        <div className="flex flex-col flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-accent-cyan">Usus</h1>
            <p className="text-zinc-500 text-sm mt-1">Habit Tracker</p>
          </div>

          <nav className="flex-1 space-y-2">
            <motion.button
              whileHover={{ x: 4 }}
              className="w-full flex items-center gap-3 px-4 py-3 text-white bg-zinc-800/50 rounded-xl font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-xl font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Statistics
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-xl font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Settings
            </motion.button>
          </nav>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onAddHabit}
            className="w-full py-4 bg-accent-cyan hover:shadow-glow-cyan text-black rounded-xl font-bold transition-all"
          >
            + New Habit
          </motion.button>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-card-bg border-t border-card-border z-30">
        <div className="flex items-center justify-around px-4 py-3">
          <button className="flex flex-col items-center gap-1 text-accent-cyan">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-zinc-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">Stats</span>
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onAddHabit}
            className="flex items-center justify-center w-14 h-14 -mt-8 bg-accent-cyan rounded-full shadow-glow-cyan"
          >
            <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>

          <button className="flex flex-col items-center gap-1 text-zinc-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-xs font-medium">Settings</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-zinc-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
};
