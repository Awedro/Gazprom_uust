import React, { useState, useEffect } from 'react';
import { TourStepData } from '../types/tour';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Eye,
  EyeOff,
  Activity,
  Award,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface TourHUDProps {
  steps: TourStepData[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  isAutoTour: boolean;
  onToggleAutoTour: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

const STEP_SHORT_LABELS = [
  'Сепарация',
  'Ректификация',
  'Сжижение',
  'Парк СПГ',
  'Терминал'
];

export const TourHUD: React.FC<TourHUDProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
  isAutoTour,
  onToggleAutoTour,
  isZenMode,
  onToggleZenMode
}) => {
  const currentStep = steps[currentStepIndex];
  const [activeTab, setActiveTab] = useState<'metrics' | 'case' | 'specs'>('metrics');
  const [isInspectorExpanded, setIsInspectorExpanded] = useState(true);
  const [hoveredStepIdx, setHoveredStepIdx] = useState<number | null>(null);

  // Keyboard shortcut 'H' for Zen Mode toggle, ArrowLeft / ArrowRight for steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') {
        onToggleZenMode();
      } else if (e.key === 'ArrowLeft') {
        onSelectStep((currentStepIndex - 1 + steps.length) % steps.length);
      } else if (e.key === 'ArrowRight') {
        onSelectStep((currentStepIndex + 1) % steps.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleZenMode, currentStepIndex, steps.length, onSelectStep]);

  const handlePrev = () => {
    const nextIdx = (currentStepIndex - 1 + steps.length) % steps.length;
    onSelectStep(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (currentStepIndex + 1) % steps.length;
    onSelectStep(nextIdx);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none z-10">
      {/* Top spacer (under header) */}
      <div className="h-16" />

      {/* Side Technical Inspector Card */}
      <motion.div
        initial={false}
        animate={{
          x: isZenMode ? 440 : 0,
          opacity: isZenMode ? 0 : 1
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className={`pointer-events-auto self-end mr-0 mb-auto max-w-sm w-full ${
          isZenMode ? 'pointer-events-none' : ''
        }`}
      >
        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-300">
          {/* Card Header with Animated Step Transition */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5 mb-3.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  {currentStep.stepOrder}
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug mt-0.5">
                  {currentStep.title}
                </h2>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-900/60 whitespace-nowrap shadow-xs">
                {currentStep.category}
              </span>
              <button
                onClick={() => setIsInspectorExpanded(!isInspectorExpanded)}
                className="text-[11px] text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 font-semibold transition-colors cursor-pointer"
              >
                {isInspectorExpanded ? 'Свернуть ▲' : 'Развернуть ▼'}
              </button>
            </div>
          </div>

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${currentStep.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4"
            >
              {currentStep.desc}
            </motion.p>
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {isInspectorExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                {/* Tab navigation with animated active pill */}
                <div className="relative flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl mb-3.5 text-xs font-bold">
                  {(
                    [
                      { id: 'metrics', label: 'Телеметрия', icon: Activity },
                      { id: 'case', label: 'Кейс', icon: Award },
                      { id: 'specs', label: 'Параметры', icon: SlidersHorizontal }
                    ] as const
                  ).map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative isolate flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'text-blue-600 dark:text-cyan-400'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="inspectorTabPill"
                            className="absolute inset-0 z-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Icon className="relative z-10 w-3.5 h-3.5" />
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content: Telemetry */}
                <AnimatePresence mode="wait">
                  {activeTab === 'metrics' && (
                    <motion.div
                      key={`metrics-${currentStep.id}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="grid grid-cols-3 gap-2"
                    >
                      {currentStep.metrics.map((m, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -3, scale: 1.02 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                          className="group p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-colors"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">
                            <span className="truncate">{m.name}</span>
                            <span className="px-1 rounded font-mono text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                              {m.trend}
                            </span>
                          </div>
                          <div className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors leading-none">
                            {m.val}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{m.unit}</div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${m.fill}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Tab Content: Case Study */}
                  {activeTab === 'case' && (
                    <motion.div
                      key={`case-${currentStep.id}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      whileHover={{ scale: 1.01 }}
                      className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-cyan-50/40 dark:from-slate-800/90 dark:to-slate-800/50 border border-blue-200/80 dark:border-blue-900/60 space-y-2 shadow-sm"
                    >
                      <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                        <span>{currentStep.caseTitle}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {currentStep.caseDetail}
                      </p>
                      <div className="pt-1 text-xs font-bold text-blue-700 dark:text-cyan-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{currentStep.caseEffect}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Tab Content: Specs */}
                  {activeTab === 'specs' && (
                    <motion.div
                      key={`specs-${currentStep.id}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="grid grid-cols-2 gap-2 text-xs"
                    >
                      {[
                        { label: 'Температура', value: currentStep.specs.temp },
                        { label: 'Давление', value: currentStep.specs.pressure },
                        { label: 'Мощность', value: currentStep.specs.capacity },
                        { label: 'Стандарт', value: currentStep.specs.safetyStandard }
                      ].map((spec, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -2 }}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-cyan-500/40 transition-colors"
                        >
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">
                            {spec.label}
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate block mt-0.5">
                            {spec.value}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bottom Consolidated Dock (All 5 nodes always visible without clipping) */}
      <footer className="pointer-events-auto flex flex-col items-center gap-2.5 w-full max-w-[780px] mx-auto transition-transform duration-300">
        {/* Zen Mode Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onToggleZenMode}
          className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/95 dark:bg-slate-900/95 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {isZenMode ? (
            <>
              <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Показать интерфейс (Клавиша H)</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Дзен-режим (Скрыть UI)</span>
            </>
          )}
        </motion.button>

        {/* Dock Bar */}
        <motion.div
          initial={false}
          animate={{
            y: isZenMode ? 120 : 0,
            opacity: isZenMode ? 0 : 1
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 w-full bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800/90 p-2 rounded-3xl shadow-2xl ${
            isZenMode ? 'pointer-events-none' : ''
          }`}
        >
          {/* Step Timeline Pills (All 5 nodes fit comfortably) */}
          <div className="grid grid-cols-5 sm:flex items-center justify-between flex-1 gap-1 w-full">
            {steps.map((st, idx) => {
              const isActive = idx === currentStepIndex;
              const isHovered = hoveredStepIdx === idx;
              return (
                <motion.button
                  key={st.id}
                  onMouseEnter={() => setHoveredStepIdx(idx)}
                  onMouseLeave={() => setHoveredStepIdx(null)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectStep(idx)}
                  className={`relative isolate flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-2xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex-1 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeStepPill"
                      className="absolute inset-0 z-0 bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl shadow-md shadow-blue-500/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-transform ${
                      isActive
                        ? 'bg-white/25 text-white scale-105'
                        : isHovered
                        ? 'bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-cyan-400 scale-110'
                        : 'bg-slate-200/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="relative z-10 hidden sm:inline tracking-tight">
                    {STEP_SHORT_LABELS[idx] || st.title.split(' ')[0]}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 bg-slate-200 dark:bg-slate-800 mx-0.5" />

          {/* Navigation & Auto-tour controls */}
          <div className="flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.08, x: -1 }}
              whileTap={{ scale: 0.92 }}
              onClick={handlePrev}
              title="Предыдущий узел (←)"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={onToggleAutoTour}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white transition-all shadow-md cursor-pointer ${
                isAutoTour
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-500/25 hover:shadow-blue-500/40'
              }`}
            >
              {isAutoTour ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isAutoTour ? 'Пауза' : 'Авто-тур'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08, x: 1 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleNext}
              title="Следующий узел (→)"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </footer>
    </div>
  );
};
