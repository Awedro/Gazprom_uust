import React from 'react';
import { UserAccount } from '../types/tour';
import { motion } from 'motion/react';
import { Flame, Moon, Sun, LogOut, Database, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentUser: UserAccount | null;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  cacheHitRate: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  isNightMode,
  onToggleNightMode,
  onOpenAuth,
  onLogout,
  cacheHitRate
}) => {
  return (
    <header className="pointer-events-auto flex items-center justify-between w-full max-w-7xl mx-auto px-5 py-3 rounded-2xl border transition-all duration-300 shadow-xl hover:shadow-2xl select-none bg-white/95 border-slate-200/90 text-slate-800 dark:bg-slate-900/95 dark:border-slate-800/90 dark:text-slate-100">
      {/* Brand Section */}
      <div className="flex items-center gap-3.5 group cursor-default">
        <motion.div
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
          transition={{ duration: 0.45 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/25"
        >
          <Flame className="w-5 h-5 fill-current" />
        </motion.div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
              ГАЗПРОМ СПГ
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/70 uppercase tracking-wider">
              3D-ТУР PRO
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            Цифровой двойник арктического завода сжиженного природного газа
          </p>
        </div>
      </div>

      {/* Controls & User Profile */}
      <div className="flex items-center gap-3">
        {/* Cache Telemetry Indicator */}
        <motion.div
          whileHover={{ y: -1, scale: 1.03 }}
          title="Интеллектуальное кеширование 3D-моделей и сессий активно"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:border-cyan-400/60 transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-cyan-500" />
          <span>Кеш: {cacheHitRate}</span>
        </motion.div>

        {/* Day / Night Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.08, rotate: 12 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggleNightMode}
          title={isNightMode ? 'Переключить на дневной режим' : 'Переключить на ночной режим'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
        >
          {isNightMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </motion.button>

        {/* Auth / Profile Area */}
        {currentUser ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2.5 bg-blue-50/80 dark:bg-slate-800/80 pl-3 pr-1.5 py-1 rounded-full border border-blue-200 dark:border-blue-900/60"
          >
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-cyan-400">
                {currentUser.role}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLogout}
              title="Выйти из аккаунта"
              className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 text-slate-500 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-400 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/35 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Вход / Регистрация</span>
          </motion.button>
        )}
      </div>
    </header>
  );
};
